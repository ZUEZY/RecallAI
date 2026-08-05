import { useState } from "react";
import Layout from "../components/Layout";
const API_URL = import.meta.env.VITE_API_URL;
function SettingsPage() {

  const [isResetting, setIsResetting] = useState(false);

  const handleResetDemo = async () => {

    const confirmed = window.confirm(
      "Are you sure you want to reset the demo database? This will permanently delete all recalls, customers, and matches."
    );

    if (!confirmed) return;

    setIsResetting(true);

    try {

      const response = await fetch(`${API_URL}/reset-demo`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        alert("Demo database reset successfully.");
      } else {
        alert("❌ Failed to reset demo database.");
      }

    } catch (error) {
      console.error(error);
      alert("❌ Unable to connect to backend.");
    }

    setIsResetting(false);
  };

  return (
    <Layout>

      <h1 className="text-5xl font-bold">
        Settings
      </h1>

      <p className="mt-3 text-gray-400 text-lg">
        Application settings.
      </p>

      <div className="mt-12 rounded-3xl bg-white/5 border border-white/10 p-8">

        <h2 className="text-2xl font-semibold">
          System Configuration
        </h2>

        <p className="mt-3 text-gray-400">
          Configure AI model, notification services, and application preferences here.
        </p>

      </div>

      <div className="mt-8 rounded-3xl bg-white/5 border border-white/10 p-8">

        <h2 className="text-2xl font-semibold">
          Danger Zone
        </h2>

        <p className="mt-3 text-gray-400">
          Permanently reset the demo database, clearing all recalls, customers, and matches.
        </p>

        <button
          onClick={handleResetDemo}
          disabled={isResetting}
          className="
            mt-6
            px-8
            py-3
            rounded-2xl
            bg-red-600
            text-white
            font-bold
            hover:brightness-110
            disabled:opacity-40
            disabled:cursor-not-allowed
            transition
          "
        >
          {isResetting ? "Resetting..." : "Reset Demo Database"}
        </button>

      </div>

      <div className="h-20"></div>

    </Layout>
  );
}

export default SettingsPage;