import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../App.css";
import "../background.css";
import recallCar from "../assets/RecallCar.png";

function Landing() {
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (password === "123") {
      setPassword("");
      setPasswordError("");
      setShowLogin(false);

      navigate("/dashboard");
    } else {
      setPasswordError("Invalid Administrator Access Key");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#05070D] text-white flex items-center justify-center px-12 overflow-hidden">

      <div className="max-w-7xl w-full flex items-center justify-between gap-12">

        {/* LEFT SIDE */}

        <div className="w-[45%] -mt-12">

          <h1 className="-mt-8 text-8xl xl:text-9xl font-black leading-none tracking-tight">
            <span className="text-[#F6E8DB]">Recall</span>
            <span className="text-[#78A9D6]">AI</span>
          </h1>

          <h2 className="mt-8 text-5xl font-semibold leading-tight text-[#F2DDD0]">
            AI-Powered
            <br />
            Automotive Recall
            <br />
            Management
          </h2>

          <p className="mt-8 text-lg text-[#78A9D6] leading-8">
            Smarter recall campaigns. Faster customer communication.
          </p>

          <button
            onClick={() => {
              setPassword("");
              setPasswordError("");
              setShowLogin(true);
            }}
            className="
              mt-12
              px-8
              py-4
              rounded-2xl
              bg-white/5
              backdrop-blur-xl
              border
              border-gray-700
              text-white
              font-semibold
              transition-all
              duration-300
              hover:scale-105
              hover:border-[#7CB7F0]
              hover:shadow-[0_0_35px_rgba(124,183,240,0.35)]
            "
          >
            Secure Admin Portal →
          </button>

        </div>

        {/* RIGHT SIDE */}

        <div className="w-1/2 flex justify-center">

          <img
            src={recallCar}
            alt="Recall Vehicle"
            className="
              w-[850px]
              max-w-none
              object-contain
              float-car
              transition-all
              duration-500
              hover:scale-105
            "
          />

        </div>

      </div>

      {/* CENTER BOTTOM FOOTER */}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        <p className="text-gray-400 text-sm">
          RecallAI v1.0
        </p>

        <p className="text-gray-500 text-xs mt-1">
          Developed by Hariharan • NVIDIA Agentic AI Project • RTD 2026
        </p>
      </div>

      {showLogin && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="relative glass w-[420px] rounded-3xl p-8">

            <button
              onClick={() => {
                setShowLogin(false);
                setPassword("");
                setPasswordError("");
              }}
              className="
                absolute
                top-4
                right-4
                w-10
                h-10
                rounded-full
                flex
                items-center
                justify-center
                text-gray-400
                hover:text-white
                hover:bg-white/10
                transition-all
                duration-200
              "
            >
              ✕
            </button>

            <h2 className="text-3xl font-bold text-[#F6E8DB]">
              Administrator Login
            </h2>

            <p className="mt-2 text-gray-400">
              Enter Administrator Access Key
            </p>

            <input
              type="password"
              placeholder="Access Key"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              className="
                mt-8
                w-full
                p-4
                rounded-xl
                bg-black/30
                border
                border-gray-700
                text-white
                outline-none
              "
            />

            {passwordError && (
              <p className="mt-3 text-sm text-red-400">
                {passwordError}
              </p>
            )}

            <button
              onClick={handleLogin}
              className="
                mt-6
                w-full
                p-4
                rounded-xl
                bg-[#7CB7F0]
                text-black
                font-bold
                hover:brightness-110
                transition
              "
            >
              Login →
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default Landing;