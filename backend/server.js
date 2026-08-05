const csv = require("csv-parser");
const path = require("path");
require("dotenv").config();
const {
  notifyCustomer,
} = require("./services/notificationService");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");

const db = require("./database/database");
const { getDocument } = require("pdfjs-dist/legacy/build/pdf.mjs");
const {
  extractRecallInformation,
  matchAffectedCustomers,
} = require("./services/aiService");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
  dest: "uploads/",
});

app.get("/", (req, res) => {
  res.json({
    status: "RecallAI Backend Running 🚗",
  });
});

app.get("/analyse", (req, res) => {
  res.json({
    status: "Analyse API Ready ✅",
  });
});

app.post("/analyse", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No PDF uploaded",
      });
    }

    console.log("\n📄 File received:");
    console.log(req.file.originalname);

    const pdfBuffer = new Uint8Array(
      fs.readFileSync(req.file.path)
    );

    const pdf = await getDocument({
      data: pdfBuffer,
    }).promise;

    let fullText = "";

    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
      const page = await pdf.getPage(pageNo);

      const content = await page.getTextContent();

      fullText +=
        content.items.map((item) => item.str).join(" ") + "\n\n";
    }

    const recallData = await extractRecallInformation(fullText);

    const cleanupFile = () => {
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkErr) {
          console.error("Failed to delete uploaded file:", unlinkErr);
        }
      }
    };

    if (recallData && recallData.isRecall === false) {
      cleanupFile();

      return res.status(400).json({
        success: false,
        message:
          "This document is not an official automotive vehicle recall notice. Please upload a valid vehicle recall PDF.",
      });
    }

    if (recallData && typeof recallData.recall_number === "string") {
      recallData.recall_number = recallData.recall_number.trim();
    }

    db.get(
      "SELECT * FROM recalls WHERE recall_number = ?",
      [recallData.recall_number],
      (err, row) => {
        if (err) {
          console.error(err);
          cleanupFile();

          return res.status(500).json({
            success: false,
            message: "Database error.",
          });
        }

        if (row) {
          cleanupFile();

          return res.json({
            success: true,
            alreadyExists: true,
            recall: row,
          });
        }

        db.run(
          `
          INSERT INTO recalls (
            manufacturer,
            brand,
            model,
            model_year,
            recall_number,
            recall_date,
            severity,
            severity_reason,
            vin_range,
            issue,
            risk,
            remedy,
            repair_time,
            customer_support
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
          `,
          [
            recallData.manufacturer,
            recallData.brand,
            recallData.model,
            recallData.model_year,
            recallData.recall_number,
            recallData.recall_date,
            recallData.severity,
            recallData.severity_reason,
            recallData.vin_range,
            recallData.issue,
            recallData.risk,
            recallData.remedy,
            recallData.repair_time,
            recallData.customer_support,
          ],
          (err) => {
            cleanupFile();

            if (err) {
              console.error(err);

              if (
                err.code === "SQLITE_CONSTRAINT" ||
                (err.message && err.message.includes("UNIQUE constraint failed"))
              ) {
                db.get(
                  "SELECT * FROM recalls WHERE recall_number = ?",
                  [recallData.recall_number],
                  (err2, existingRow) => {
                    if (err2) {
                      console.error(err2);

                      return res.status(500).json({
                        success: false,
                        message: "Database error.",
                      });
                    }

                    return res.json({
                      success: true,
                      alreadyExists: true,
                      recall: existingRow,
                    });
                  }
                );

                return;
              }

              return res.status(500).json({
                success: false,
                message: "Failed to save recall.",
              });
            }

            res.json({
              success: true,
              recall: recallData,
            });
          }
        );
      }
    );

  } catch (error) {
    console.error(error);

    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error("Failed to delete uploaded file:", unlinkErr);
      }
    }

    res.status(500).json({
      success: false,
      message: "Unable to analyse PDF.",
    });
  }
});

app.get("/recalls", (req, res) => {
  db.all(
    "SELECT * FROM recalls ORDER BY id DESC",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          success: false,
        });
      }

      res.json(rows);
    }
  );
});

app.get("/dashboard", (req, res) => {

  db.get(
    `
    SELECT
      (SELECT COUNT(*) FROM recalls) AS recallCount,
      (SELECT COUNT(*) FROM customers) AS customerCount,
      (SELECT COUNT(*) FROM matches WHERE status='Sent') AS notificationCount
    `,
    [],
    (err, row) => {

      if (err) {
        return res.status(500).json({
          success: false,
        });
      }

      res.json({
        recallCount: row.recallCount,
        customerCount: row.customerCount,
        notificationCount: row.notificationCount,
      });

    }
  );

});
app.post("/customers/upload", upload.single("csv"), (req, res) => {

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No CSV uploaded",
    });
  }

  const customers = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {

      customers.push(row);

      db.run(
        `
        INSERT OR IGNORE INTO customers
        (customer_name, vehicle_model, vin, email, phone)
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          row.customer_name,
          row.vehicle_model,
          row.vin,
          row.email,
          row.phone,
        ]
      );

    })
    .on("end", () => {

      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        imported: customers.length,
      });

    });

});
app.get("/customers", (req, res) => {

  db.all(
    "SELECT * FROM customers ORDER BY id DESC",
    [],
    (err, rows) => {

      if (err) {
        return res.status(500).json({
          success: false,
        });
      }

      res.json(rows);

    }
  );

});
app.get("/match/:recallId", (req, res) => {

  const recallId = req.params.recallId;

  db.get(
    "SELECT * FROM recalls WHERE id = ?",
    [recallId],
    async (err, recall) => {

      if (err || !recall) {
        return res.status(404).json({
          success: false,
        });
      }

      db.all(
        "SELECT * FROM customers",
        [],
        async (err, customers) => {

          if (err) {
            return res.status(500).json({
              success: false,
            });
          }

          try {

            const result = await matchAffectedCustomers(
              recall,
              customers
            );

            // Save AI matches
            const insertPromises = [];

            for (const customer of result.affectedCustomers) {

              const dbCustomer = customers.find(
                c => c.vin === customer.vin
              );

              if (!dbCustomer) continue;

              insertPromises.push(
                new Promise((resolve) => {

                  db.run(
                    `
                    INSERT OR IGNORE INTO matches
                    (recall_id, customer_id, notification, status)
                    VALUES (?, ?, ?, ?)
                    `,
                    [
                      recall.id,
                      dbCustomer.id,
                      customer.notification || null,
                      "Pending",
                    ],
                    (err) => {
                      if (err) {
                        console.error(err);
                      }

                      resolve();
                    }
                  );

                })
              );

            }

            await Promise.all(insertPromises);

            // Fetch current status/sent_at for every match belonging to this recall
            const matchRows = await new Promise((resolve, reject) => {

              db.all(
                `
                SELECT
                  matches.customer_id,
                  matches.status,
                  matches.sent_at,
                  customers.vin
                FROM matches
                JOIN customers
                  ON matches.customer_id = customers.id
                WHERE matches.recall_id = ?
                `,
                [recall.id],
                (err, rows) => {
                  if (err) {
                    return reject(err);
                  }

                  resolve(rows);
                }
              );

            });

            const matchByVin = {};

            for (const row of matchRows) {
              matchByVin[row.vin] = {
                status: row.status,
                sent_at: row.sent_at,
              };
            }

            const affectedCustomersWithStatus = result.affectedCustomers.map(
              (customer) => {

                const matchInfo = matchByVin[customer.vin];

                return {
                  ...customer,
                  status: matchInfo ? matchInfo.status : "Pending",
                  sent_at: matchInfo ? matchInfo.sent_at : null,
                };

              }
            );

            res.json({
              ...result,
              affectedCustomers: affectedCustomersWithStatus,
            });

          } catch (error) {

            console.error(error);

            res.status(500).json({
              success: false,
            });

          }

        }
      );

    }
  );

});
app.get("/matches", (req, res) => {

  db.all(
    `
    SELECT
      matches.id,
      matches.recall_id,
      matches.customer_id,
      recalls.recall_number,
      recalls.model,
      customers.customer_name,
      customers.email,
      customers.phone,
      matches.notification,
      matches.status,
      matches.matched_at,
      matches.sent_at
    FROM matches
    JOIN recalls
      ON matches.recall_id = recalls.id
    JOIN customers
      ON matches.customer_id = customers.id
    ORDER BY matches.id DESC
    `,
    [],
    (err, rows) => {

      if (err) {
        console.error(err);

        return res.status(500).json({
          success: false,
        });
      }

      // Attach the full notification_logs history to each match so the
      // frontend can render every send, not just the last one.
      db.all(
        `
        SELECT
          id,
          recall_id,
          customer_id,
          channel,
          status,
          sent_at
        FROM notification_logs
        ORDER BY sent_at DESC
        `,
        [],
        (err2, logs) => {

          if (err2) {
            console.error(err2);

            return res.status(500).json({
              success: false,
            });
          }

          const rowsWithHistory = rows.map((row) => ({
            ...row,
            history: logs.filter(
              (log) =>
                log.recall_id === row.recall_id &&
                log.customer_id === row.customer_id
            ),
          }));

          res.json(rowsWithHistory);

        }
      );

    }
  );

});
app.post("/notify", async (req, res) => {

  const { customer } = req.body;

  try {

    const recall = await new Promise((resolve, reject) => {

      db.get(
        "SELECT * FROM recalls WHERE id = ?",
        [customer.recall_id],
        (err, row) => {
          if (err) {
            return reject(err);
          }

          resolve(row);
        }
      );

    });

    if (!recall) {
      return res.status(404).json({
        success: false,
        message: "Recall not found.",
      });
    }

    // Generates the Email/SMS/Voice content via AI once, then sends the
    // relevant channels concurrently and logs each one.
    await notifyCustomer(customer, recall);

    console.log("Recall ID:", customer.recall_id);
    console.log("Customer ID:", customer.customer_id);
    console.log("Customer Object:", customer);

    await new Promise((resolve, reject) => {

      db.run(
        `
        UPDATE matches
        SET
          status='Sent',
          sent_at=CURRENT_TIMESTAMP
        WHERE recall_id=? AND customer_id=?
        `,
        [customer.recall_id, customer.customer_id],
        function (err) {
          if (err) {
            console.error(err);
            return reject(err);
          }

          console.log("Rows updated:", this.changes);
          resolve();
        }
      );

    });

    res.json({
      success: true,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
    });

  }

});
app.post("/notify/all/:recallId", (req, res) => {

  const recallId = req.params.recallId;

  db.get(
    "SELECT * FROM recalls WHERE id = ?",
    [recallId],
    (err, recall) => {

      if (err || !recall) {
        console.error(err);

        return res.status(404).json({
          success: false,
        });
      }

      db.all(
        `
        SELECT
          customers.id AS customer_id,
          customers.customer_name,
          customers.vehicle_model,
          customers.vin,
          customers.email,
          customers.phone,
          matches.notification
        FROM matches
        JOIN customers
          ON matches.customer_id = customers.id
        WHERE matches.recall_id = ?
        `,
        [recallId],
        async (err, customers) => {

          if (err) {
            console.error(err);

            return res.status(500).json({
              success: false,
            });
          }

          try {

            for (const customer of customers) {

              // Generates the Email/SMS/Voice content via AI once, then
              // sends the relevant channels concurrently and logs each one.
              await notifyCustomer(customer, recall);

            }

            await new Promise((resolve, reject) => {

              db.run(
                `
                UPDATE matches
                SET
                  status='Sent',
                  sent_at=CURRENT_TIMESTAMP
                WHERE recall_id=?
                `,
                [recallId],
                function (err) {
                  if (err) {
                    console.error(err);
                    return reject(err);
                  }

                  console.log("Rows updated:", this.changes);
                  resolve();
                }
              );

            });

            res.json({
              success: true,
              notified: customers.length,
            });

          } catch (error) {

            console.error(error);

            res.status(500).json({
              success: false,
            });

          }

        }
      );

    }
  );

});

app.post("/reset-demo", (req, res) => {

  db.serialize(() => {

    db.run("DELETE FROM matches", (err) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          success: false,
          message: "Failed to reset demo database.",
        });
      }

      db.run("DELETE FROM recalls", (err) => {
        if (err) {
          console.error(err);

          return res.status(500).json({
            success: false,
            message: "Failed to reset demo database.",
          });
        }

        db.run("DELETE FROM customers", (err) => {
          if (err) {
            console.error(err);

            return res.status(500).json({
              success: false,
              message: "Failed to reset demo database.",
            });
          }

          db.run("DELETE FROM notification_logs", (err) => {
            if (err) {
              console.error(err);

              return res.status(500).json({
                success: false,
                message: "Failed to reset demo database.",
              });
            }

            db.run(
              `
              DELETE FROM sqlite_sequence
              WHERE name IN ('matches', 'recalls', 'customers', 'notification_logs')
              `,
              (err) => {
                if (err) {
                  console.error(err);

                  return res.status(500).json({
                    success: false,
                    message: "Failed to reset demo database.",
                  });
                }

                res.json({
                  success: true,
                  message: "Demo database reset successfully.",
                });

              }
            );

          });

        });

      });

    });

  });

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});