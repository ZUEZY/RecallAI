import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function DashboardPage() {

  const navigate = useNavigate();

  const [stats, setStats] = useState({
    recallCount: 0,
    customerCount: 0,
    notificationCount: 0,
  });

  useEffect(() => {
    fetch("http://localhost:5000/dashboard")
      .then((response) => response.json())
      .then((data) => {
        setStats(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <Layout>

      <h1 className="text-5xl font-bold">
        Welcome back
      </h1>

      <p className="mt-3 text-gray-400 text-lg">
        Recall Management Dashboard
      </p>

      <div className="mt-12 grid grid-cols-3 gap-8">

        <div
          onClick={() => navigate("/analytics")}
          className="rounded-3xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition cursor-pointer"
        >

          <h2 className="text-gray-400 text-lg">
            Recall PDFs
          </h2>

          <p className="mt-4 text-5xl font-bold text-[#78A9D6]">
            {stats.recallCount}
          </p>

        </div>

        <div
          onClick={() => navigate("/customers")}
          className="rounded-3xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition cursor-pointer"
        >

          <h2 className="text-gray-400 text-lg">
            Customers
          </h2>

          <p className="mt-4 text-5xl font-bold text-[#78A9D6]">
            {stats.customerCount}
          </p>

        </div>

        <div
          onClick={() => navigate("/analytics?section=history")}
          className="rounded-3xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition cursor-pointer"
        >

          <h2 className="text-gray-400 text-lg">
            Notifications Sent
          </h2>

          <p className="mt-4 text-5xl font-bold text-[#78A9D6]">
            {stats.notificationCount}
          </p>

        </div>
        
      </div>
      
      <div className="h-20"></div>

    </Layout>
  );
}

export default DashboardPage;