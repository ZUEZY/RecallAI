const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./recallai.db", (err) => {
  if (err) {
    console.error("❌ Failed to connect to SQLite database.");
    console.error(err);
  } else {
    console.log("✅ Connected to SQLite database.");
  }
});

db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS recalls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      manufacturer TEXT,
      brand TEXT,
      model TEXT,
      model_year TEXT,
      recall_number TEXT UNIQUE,
      recall_date TEXT,
      severity TEXT,
      severity_reason TEXT,
      vin_range TEXT,
      issue TEXT,
      risk TEXT,
      remedy TEXT,
      repair_time TEXT,
      customer_support TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT,
      vehicle_model TEXT,
      vin TEXT UNIQUE,
      email TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recall_id INTEGER,
      customer_id INTEGER,
      notification TEXT,
      status TEXT DEFAULT 'Pending',
      matched_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      UNIQUE(recall_id, customer_id),

      FOREIGN KEY(recall_id) REFERENCES recalls(id),
      FOREIGN KEY(customer_id) REFERENCES customers(id)
    )
  `, (err) => {

    if (err) {
      console.error("❌ Failed to create/verify matches table.");
      console.error(err);
      return;
    }
    db.all(
      "PRAGMA table_info(recalls)",
      [],
      (err, columns) => {
    
        if (err) {
          console.error(err);
          return;
        }
    
        const hasSeverityReason = columns.some(
          column => column.name === "severity_reason"
        );
    
        if (!hasSeverityReason) {
    
          db.run(
            "ALTER TABLE recalls ADD COLUMN severity_reason TEXT",
            (alterErr) => {
    
              if (alterErr) {
                console.error(alterErr);
              } else {
                console.log("✅ Added severity_reason column.");
              }
    
            }
          );
    
        }
    
      }
    );

    db.all(
      "PRAGMA table_info(matches)",
      [],
      (err, columns) => {

        if (err) {
          console.error("❌ Failed to read matches table schema.");
          console.error(err);
          return;
        }

        const hasSentAt = columns.some(
          (column) => column.name === "sent_at"
        );

        if (!hasSentAt) {

          db.run(
            "ALTER TABLE matches ADD COLUMN sent_at DATETIME",
            (alterErr) => {

              if (alterErr) {
                console.error("❌ Failed to add sent_at column to matches table.");
                console.error(alterErr);
              } else {
                console.log("✅ Added sent_at column to matches table.");
              }

            }
          );

        }

      }
    );

  });

  db.run(`
    CREATE TABLE IF NOT EXISTS notification_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recall_id INTEGER,
      customer_id INTEGER,
      channel TEXT,
      status TEXT,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY(recall_id) REFERENCES recalls(id),
      FOREIGN KEY(customer_id) REFERENCES customers(id)
    )
  `, (err) => {

    if (err) {
      console.error("❌ Failed to create/verify notification_logs table.");
      console.error(err);
    } else {
      console.log("✅ Verified notification_logs table.");
    }

  });

});

module.exports = db;