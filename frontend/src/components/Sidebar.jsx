import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-72 min-h-screen bg-white/5 backdrop-blur-xl border-r border-white/10 p-8 sticky top-0">

      <h1 className="text-4xl font-black tracking-tight">
        <span className="text-[#F6E8DB]">Recall</span>
        <span className="text-[#78A9D6]">AI</span>
      </h1>

      <div className="mt-14 flex flex-col h-[calc(100vh-170px)]">

        <div className="space-y-5">

          <button
            onClick={() => navigate("/dashboard")}
            className={`w-full text-left px-5 py-4 rounded-2xl transition ${
              location.pathname === "/dashboard"
                ? "bg-[#78A9D6]/20 text-white"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            🏠 Dashboard
          </button>

          <button
            onClick={() => navigate("/upload")}
            className={`w-full text-left px-5 py-4 rounded-2xl transition ${
              location.pathname === "/upload"
                ? "bg-[#78A9D6]/20 text-white"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            📄 Recall Upload
          </button>

          <button
            onClick={() => navigate("/customers")}
            className={`w-full text-left px-5 py-4 rounded-2xl transition ${
              location.pathname === "/customers"
                ? "bg-[#78A9D6]/20 text-white"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            👥 Customers
          </button>

          <button
            onClick={() => navigate("/analytics")}
            className={`w-full text-left px-5 py-4 rounded-2xl transition ${
              location.pathname === "/analytics"
                ? "bg-[#78A9D6]/20 text-white"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            📊 Analytics
          </button>

          <button
            onClick={() => navigate("/settings")}
            className={`w-full text-left px-5 py-4 rounded-2xl transition ${
              location.pathname === "/settings"
                ? "bg-[#78A9D6]/20 text-white"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            ⚙️ Settings
          </button>

        </div>

        <button
          onClick={() => navigate("/")}
          className="
            mt-auto
            w-full
            text-left
            px-5
            py-4
            rounded-2xl
            text-red-400
            hover:bg-red-500/10
            hover:text-red-300
            transition
          "
        >
          🚪 Logout
        </button>

      </div>

    </div>
  );
}

export default Sidebar;