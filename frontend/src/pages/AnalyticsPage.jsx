import { useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
const API_URL = import.meta.env.VITE_API_URL;
function formatDateTime(value) {

  if (!value) return null;

  const date = new Date(value);

  if (isNaN(date.getTime())) return null;

  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

}

function Spinner() {

  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      ></path>
    </svg>
  );

}

function AnalyticsPage() {

  const [recalls, setRecalls] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [matched, setMatched] = useState(null);
  const [matches, setMatches] = useState([]);
  const [message, setMessage] = useState("");
  const [reportRecall, setReportRecall] = useState(null);

  const [loadingMatchId, setLoadingMatchId] = useState(null);
  const [sendingKey, setSendingKey] = useState(null);
  const [sendingAll, setSendingAll] = useState(false);

  const matchHistoryRef = useRef(null);

  useEffect(() => {

    loadData();

  }, []);

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);

    if (params.get("section") === "history") {

      matchHistoryRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    }

  }, []);

  const loadData = () => {

    fetch(`${API_URL}/recalls`)
      .then(res => res.json())
      .then(setRecalls);

      fetch(`${API_URL}/customers`)
      .then(res => res.json())
      .then(setCustomers);

      fetch(`${API_URL}/matches`)
      .then(res => res.json())
      .then(setMatches);

  };

  const findMatches = async (id) => {

    setLoadingMatchId(id);

    try {

      const response = await fetch(
        `${API_URL}/match/${id}`
      );

      const data = await response.json();
      const matchesResponse = await fetch(
        `${API_URL}/matches`
      );
      
      const latestMatches = await matchesResponse.json();
      
      setMatches(latestMatches);

      let customerList = customers;

      if (!customerList || customerList.length === 0) {

        const customersResponse = await fetch(
          `${API_URL}/customers`
        );

        customerList = await customersResponse.json();

        setCustomers(customerList);

      }

      const affectedCustomersWithIds = (
        data.affectedCustomers || []
      ).map((customer) => {

        const dbCustomer = customerList.find(
          (c) => c.vin === customer.vin
        );

        const dbMatch = latestMatches.find(
          (m) =>
            m.recall_id === id &&
            m.customer_id === (dbCustomer ? dbCustomer.id : null)
        );
        
        return {
          ...customer,
          recall_id: id,
          customer_id: dbCustomer ? dbCustomer.id : null,
          status: dbMatch?.status || "Pending",
          sent_at: dbMatch?.sent_at || null,
        };
      });

      setMatched({
        recallId: id,
        ...data,
        affectedCustomers: affectedCustomersWithIds,
      });

      loadData();

    } catch (err) {

      console.error(err);

    } finally {

      setLoadingMatchId(null);

    }

  };

  const sendNotification = async (customer) => {

    const key = `${customer.recall_id}-${customer.customer_id}`;

    setSendingKey(key);

    try {

      const response = await fetch(
        `${API_URL}/notify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer: {
              ...customer,
              recall_id: customer.recall_id,
              customer_id: customer.customer_id,
            },
          }),
        }
      );

      const data = await response.json();

      if (data.success) {

        setMessage(
          `✅ Notification sent to ${customer.customer_name}`
        );

        await findMatches(customer.recall_id);
        loadData();

      }

    } catch (err) {

      console.error(err);

    } finally {

      setSendingKey(null);

    }

  };

  const sendAllNotifications = async () => {

    if (!matched) return;

    setSendingAll(true);

    try {

      const response = await fetch(
        `${API_URL}/notify/all/${matched.recallId}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (data.success) {

        setMessage(
          `✅ ${data.notified} notifications sent successfully.`
        );

        await findMatches(matched.recallId);
        loadData();

      }

    } catch (err) {

      console.error(err);

    } finally {

      setSendingAll(false);

    }

  };

  return (
    <Layout>

      <h1 className="text-5xl font-bold">
        Recall History
      </h1>

      <p className="mt-3 text-gray-400 text-lg">
        Previously analysed recall documents.
      </p>

      <div className="mt-10 rounded-3xl bg-white/5 border border-white/10 overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-white/10">

            <tr>

              <th className="p-5">Manufacturer</th>
              <th className="p-5">Model</th>
              <th className="p-5">Recall No.</th>
              <th className="p-5">Severity</th>
              <th className="p-5">Action</th>

            </tr>

          </thead>

          <tbody>

            {recalls.map((recall) => (

              <tr
                key={recall.id}
                className="border-t border-white/10"
              >

                <td className="p-5">
                  {recall.manufacturer}
                </td>

                <td className="p-5">
                  {recall.model}
                </td>

                <td className="p-5">
                  {recall.recall_number}
                </td>

                <td className="p-5">
                  {recall.severity}
                </td>

                <td className="p-5 space-x-3">

                  <button
                    onClick={() => findMatches(recall.id)}
                    disabled={loadingMatchId === recall.id}
                    className="px-4 py-2 rounded-lg bg-[#78A9D6] text-black font-bold hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    {loadingMatchId === recall.id && <Spinner />}
                    {loadingMatchId === recall.id
                      ? "Finding Customers..."
                      : "Find Affected Customers"}
                  </button>

                  <button
                    onClick={() => setReportRecall(recall)}
                    className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20"
                  >
                    View Report
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {matched && (

        <div className="mt-10 rounded-3xl bg-white/5 border border-white/10 p-8">

          <div className="flex justify-between items-center">

            <div>

              <h2 className="text-2xl font-bold">
                AI Matched Customers
              </h2>

              <p className="mt-2 text-gray-400">
                Total Affected: {matched.affectedCustomers?.length || 0}
              </p>

            </div>

            <button
              onClick={sendAllNotifications}
              disabled={sendingAll}
              className="px-6 py-3 rounded-xl bg-green-500 text-white font-bold hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {sendingAll && <Spinner />}
              {sendingAll ? "Sending Notifications..." : "📢 Send All Notifications"}
            </button>

          </div>

          <div className="mt-8 space-y-4">

            {matched.affectedCustomers?.map((customer, index) => {

              const key = `${customer.recall_id}-${customer.customer_id}`;
              const isSending = sendingKey === key;

              return (

                <div
                  key={index}
                  className="rounded-xl bg-white/5 p-5"
                >

                  <p><b>{customer.customer_name}</b></p>

                  <p>🚗 {customer.vehicle_model}</p>

                  <p>🔖 VIN: {customer.vin}</p>

                  <p>📧 {customer.email}</p>

                  <p>📱 {customer.phone}</p>

                  <p className="mt-2 text-[#78A9D6] font-semibold">
                    🔔 {customer.notification}
                  </p>

                  <button
                    onClick={() => sendNotification(customer)}
                    disabled={isSending}
                    className="mt-4 px-5 py-2 rounded-lg bg-[#78A9D6] text-black font-bold hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    {isSending && <Spinner />}
                    {isSending
                      ? "Sending..."
                      : customer.status === "Sent"
                        ? "Send Again"
                        : "Send Notification"}
                  </button>

                </div>

              );

            })}

          </div>

        </div>

      )}

      {message && (

        <div className="mt-8 rounded-xl bg-green-500/20 border border-green-500 p-4">

          {message}

        </div>

      )}

      <div
        ref={matchHistoryRef}
        className="mt-12 rounded-3xl bg-white/5 border border-white/10 p-8"
      >

        <h2 className="text-2xl font-bold mb-6">
          Match History
        </h2>

        <div className="space-y-4">

          {matches.map(match => (

            <div
              key={match.id}
              className="rounded-xl bg-white/5 p-5"
            >

              <p><b>{match.customer_name}</b></p>

              <p>Recall: {match.recall_number}</p>

              <p>Model: {match.model}</p>

              <p>Notification: {match.notification}</p>

              <p>Status: {match.status}</p>

              <p className="mt-2 text-gray-400">
                Matched: {formatDateTime(match.matched_at) || "—"}
              </p>

              {match.history && match.history.length > 0 && (

                <div className="mt-4">

                  <p className="text-gray-400 font-semibold mb-2">
                    Notification History
                  </p>

                  <div className="space-y-1">

                    {match.history.map((log) => (

                      <div
                        key={log.id}
                        className="flex items-center gap-2 text-sm"
                      >

                        <span>{log.channel}</span>

                        <span className="text-green-400">✓</span>

                        <span className="text-gray-400">
                          {formatDateTime(log.sent_at) || "—"}
                        </span>

                      </div>

                    ))}

                  </div>

                </div>

              )}

            </div>

          ))}

        </div>

      </div>

      {reportRecall && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={() => setReportRecall(null)}
        >

          <div
            className="max-w-3xl w-full max-h-[85vh] overflow-y-auto rounded-3xl bg-[#0f0f0f] border border-white/10 p-8"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex justify-between items-center mb-8">

              <h2 className="text-3xl font-bold">
                Recall Report
              </h2>

              <button
                onClick={() => setReportRecall(null)}
                className="px-5 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20"
              >
                Close
              </button>

            </div>

            <div className="grid grid-cols-2 gap-6">

              <div>
                <p className="text-gray-400">Manufacturer</p>
                <p>{reportRecall.manufacturer}</p>
              </div>

              <div>
                <p className="text-gray-400">Brand</p>
                <p>{reportRecall.brand}</p>
              </div>

              <div>
                <p className="text-gray-400">Model</p>
                <p>{reportRecall.model}</p>
              </div>

              <div>
                <p className="text-gray-400">Model Year</p>
                <p>{reportRecall.model_year}</p>
              </div>

              <div>
                <p className="text-gray-400">Recall Number</p>
                <p>{reportRecall.recall_number}</p>
              </div>

              <div>
                <p className="text-gray-400">Recall Date</p>
                <p>{reportRecall.recall_date}</p>
              </div>

              <div>
                <p className="text-gray-400">Severity</p>
                <p>{reportRecall.severity}</p>
              </div>

              <div>
                <p className="text-gray-400">VIN Range</p>
                <p>{reportRecall.vin_range}</p>
              </div>

            </div>

            <div className="mt-8">
              <p className="text-gray-400">Issue</p>
              <p className="mt-2">{reportRecall.issue}</p>
            </div>

            <div className="mt-6">
              <p className="text-gray-400">Risk</p>
              <p className="mt-2">{reportRecall.risk}</p>
            </div>

            <div className="mt-6">
              <p className="text-gray-400">Remedy</p>
              <p className="mt-2">{reportRecall.remedy}</p>
            </div>

            <div className="mt-6">
              <p className="text-gray-400">Repair Time</p>
              <p className="mt-2">{reportRecall.repair_time}</p>
            </div>

            <div className="mt-6">
              <p className="text-gray-400">Customer Support</p>
              <p className="mt-2">{reportRecall.customer_support}</p>
            </div>

          </div>

        </div>

      )}

      <div className="h-20"></div>

    </Layout>
  );

}

export default AnalyticsPage;