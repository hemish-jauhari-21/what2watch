"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  async function handleLogin() {
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setMessage("Login successful ✅");

        setTimeout(() => {
          router.push("/");
        }, 1000);

      } else {
        setMessage(data.detail || "Login failed ❌");
      }

    } catch (err) {
      console.error(err);
      setMessage("Server error ❌");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">

      {/* 🔔 Toast */}
      {message && (
        <div className={`fixed top-5 right-5 px-4 py-2 rounded shadow-lg z-50
          ${message.includes("failed") || message.includes("error")
            ? "bg-red-600"
            : "bg-green-600"}
        `}>
          {message}
        </div>
      )}

      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-sm shadow-lg">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Welcome Back 🎬
        </h1>

        {/* Email */}
        <input
          className="w-full mb-4 p-3 bg-black border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full p-3 bg-black border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-sm text-gray-400"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-yellow-400 text-black p-3 rounded font-semibold hover:bg-yellow-300 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Optional future */}
        <p className="text-center text-gray-400 text-sm mt-4">
          Don’t have an account?{" "}
          <span className="text-yellow-400 cursor-pointer">
            Signup
          </span>
        </p>

      </div>

    </div>
  );
}