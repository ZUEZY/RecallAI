import { useState } from "react";
import Layout from "../components/Layout";

function UploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [recallData, setRecallData] = useState(null);
  const [alreadyExists, setAlreadyExists] = useState(false);

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setMessage("");
      setErrorMessage("");
      setRecallData(null);
      setAlreadyExists(false);
    }
  };

  const handleAnalyse = async () => {
    if (!selectedFile) return;

    setIsAnalysing(true);
    setMessage("");
    setErrorMessage("");
    setRecallData(null);
    setAlreadyExists(false);

    const formData = new FormData();
    formData.append("pdf", selectedFile);

    try {
      const response = await fetch("http://localhost:5000/analyse", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        if (data.alreadyExists) {
          setMessage("✅ Analysis completed.");
          setAlreadyExists(true);
        } else {
          setMessage("✅ Analysis completed.");
          setAlreadyExists(false);
        }
        setRecallData(data.recall);
      } else {
        if (
          data.message ===
          "This document is not an official automotive vehicle recall notice. Please upload a valid vehicle recall PDF."
        ) {
          setErrorMessage(data.message);
        } else {
          setMessage("❌ Analysis failed.");
        }
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Unable to connect to backend.");
    }

    setIsAnalysing(false);
  };

  return (
    <Layout>

      <h1 className="text-5xl font-bold">
        Upload Recall Document
      </h1>

      <p className="mt-3 text-gray-400 text-lg">
        Upload the manufacturer's recall PDF to begin AI analysis.
      </p>

      <div
        className="
          mt-10
          w-full
          max-w-4xl
          rounded-3xl
          border-2
          border-dashed
          border-[#78A9D6]/40
          bg-white/5
          backdrop-blur-xl
          p-16
          text-center
          transition-all
          hover:border-[#78A9D6]
          hover:bg-white/10
        "
      >
        <div className="text-8xl">📄</div>

        <h2 className="mt-6 text-3xl font-semibold">
          Drag & Drop Recall PDF Here
        </h2>

        <p className="mt-4 text-lg text-gray-400">
          or click below to browse
        </p>

        <label
          className="
            inline-block
            mt-10
            px-10
            py-4
            rounded-2xl
            bg-[#78A9D6]
            text-black
            font-bold
            cursor-pointer
            hover:brightness-110
            transition
          "
        >
          Browse PDF

          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      <div className="mt-10">

        <h3 className="text-2xl font-semibold">
          Selected File
        </h3>

        <div className="mt-4 max-w-4xl rounded-2xl bg-white/5 border border-white/10 p-5">

          <p className="text-[#78A9D6] text-lg break-all">
            {selectedFile ? `📄 ${selectedFile.name}` : "No file selected"}
          </p>

        </div>

      </div>

      <button
        onClick={handleAnalyse}
        disabled={!selectedFile || isAnalysing}
        className="
          mt-10
          px-12
          py-4
          rounded-2xl
          bg-[#78A9D6]
          text-black
          font-bold
          text-lg
          disabled:opacity-40
          disabled:cursor-not-allowed
          hover:brightness-110
          transition
        "
      >
        {isAnalysing ? "⏳ Analysing..." : "🤖 Analyse with AI"}
      </button>

      {message && (
        <p className="mt-6 text-lg text-[#78A9D6]">
          {message}
        </p>
      )}

      {errorMessage && (
        <div
          className="
            mt-6
            max-w-4xl
            rounded-2xl
            bg-red-500/20
            border
            border-red-500
            p-5
          "
        >
          <p className="text-red-300 text-lg">
            ❌ {errorMessage}
          </p>
        </div>
      )}

      {recallData && (

        <div className="mt-14 max-w-5xl rounded-3xl bg-white/5 border border-white/10 p-8">

          <div className="flex items-center justify-between mb-8">

            <h2 className="text-3xl font-bold">
              AI Recall Analysis
            </h2>

            {alreadyExists && (
              <span
                className="
                  inline-flex
                  items-center
                  px-4
                  py-2
                  rounded-full
                  bg-blue-500/20
                  border
                  border-blue-400/40
                  text-blue-300
                  text-sm
                  font-semibold
                "
              >
                Already analysed • Loaded from database
              </span>
            )}

          </div>

          <div className="grid grid-cols-2 gap-6">

            <div>
              <p className="text-gray-400">Manufacturer</p>
              <p>{recallData.manufacturer}</p>
            </div>

            <div>
              <p className="text-gray-400">Brand</p>
              <p>{recallData.brand}</p>
            </div>

            <div>
              <p className="text-gray-400">Model</p>
              <p>{recallData.model}</p>
            </div>

            <div>
              <p className="text-gray-400">Model Year</p>
              <p>{recallData.model_year}</p>
            </div>

            <div>
              <p className="text-gray-400">Recall Number</p>
              <p>{recallData.recall_number}</p>
            </div>

            <div>
              <p className="text-gray-400">Recall Date</p>
              <p>{recallData.recall_date}</p>
            </div>

            <div>
              <p className="text-gray-400">Severity</p>
              <p>{recallData.severity}</p>
            </div>
            <div>
              <p className="text-gray-400">Severity Reason</p>
              <p>{recallData.severity_reason}</p>
            </div>

            <div>
              <p className="text-gray-400">VIN Range</p>
              <p>{recallData.vin_range}</p>
            </div>

          </div>

          <div className="mt-8">

            <p className="text-gray-400">Issue</p>
            <p className="mt-2">{recallData.issue}</p>

          </div>

          <div className="mt-6">

            <p className="text-gray-400">Risk</p>
            <p className="mt-2">{recallData.risk}</p>

          </div>

          <div className="mt-6">

            <p className="text-gray-400">Remedy</p>
            <p className="mt-2">{recallData.remedy}</p>

          </div>

          <div className="mt-6">

            <p className="text-gray-400">Estimated Repair Time</p>
            <p className="mt-2">{recallData.repair_time}</p>

          </div>

          <div className="mt-6">

            <p className="text-gray-400">Customer Support</p>
            <p className="mt-2">{recallData.customer_support}</p>

          </div>

        </div>

      )}

      <div className="h-20"></div>

    </Layout>
  );
}

export default UploadPage;