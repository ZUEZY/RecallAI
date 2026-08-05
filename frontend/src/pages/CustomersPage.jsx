import { useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";

function CustomersPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [customers, setCustomers] = useState([]);

  const fileInputRef = useRef(null);

  const loadCustomers = async () => {
    try {
      const response = await fetch("http://localhost:5000/customers");
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const uploadCSV = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("csv", selectedFile);

    try {
      const response = await fetch(
        "http://localhost:5000/customers/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${data.imported} customers imported.`);
        loadCustomers();
      } else {
        setMessage("❌ Import failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Unable to connect to backend.");
    }

    setUploading(false);
  };

  return (
    <Layout>

      <h1 className="text-5xl font-bold">
        Customer Import
      </h1>

      <p className="mt-3 text-gray-400 text-lg">
        Upload your customer database CSV.
      </p>

      <div className="mt-10 rounded-3xl bg-white/5 border border-white/10 p-10">

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="hidden"
        />

        <div className="flex flex-wrap items-center gap-4">

          <button
            onClick={() => fileInputRef.current?.click()}
            className="
              inline-flex
              items-center
              gap-3
              px-8
              py-3
              rounded-xl
              bg-white/10
              border
              border-white/20
              text-white
              font-bold
              hover:bg-white/20
              transition
            "
          >

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M9 15h1" />
              <path d="M9 18h1" />
              <path d="M13.5 15c.5 0 1 .3 1 1s-.5 1-1 1h-1v-2z" />
              <path d="M17 15v3" />
              <path d="M19 15l-1 3-1-3" />
            </svg>

            Upload CSV

          </button>

          <button
            onClick={uploadCSV}
            disabled={!selectedFile || uploading}
            className="px-8 py-3 rounded-xl bg-[#78A9D6] text-black font-bold disabled:opacity-40"
          >
            {uploading ? "Uploading..." : "Import CSV"}
          </button>

        </div>

        <p className="mt-4 text-[#78A9D6] break-all">
          {selectedFile ? `📄 ${selectedFile.name}` : "No file selected"}
        </p>

        {message && (
          <p className="mt-6 text-lg">
            {message}
          </p>
        )}

      </div>

      <div className="mt-10 rounded-3xl bg-white/5 border border-white/10 overflow-hidden">

        <table className="w-full">

          <thead className="bg-white/10">

            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Vehicle</th>
              <th className="p-4 text-left">VIN</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Phone</th>
            </tr>

          </thead>

          <tbody>

            {customers.map((customer) => (

              <tr
                key={customer.id}
                className="border-t border-white/10"
              >
                <td className="p-4">{customer.customer_name}</td>
                <td className="p-4">{customer.vehicle_model}</td>
                <td className="p-4">{customer.vin}</td>
                <td className="p-4">{customer.email}</td>
                <td className="p-4">{customer.phone}</td>
              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div className="h-20"></div>

    </Layout>
  );
}

export default CustomersPage;