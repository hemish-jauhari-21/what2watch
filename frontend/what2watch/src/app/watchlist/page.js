"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WatchlistPage() {

  const [movies, setMovies] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const router = useRouter();

  // 🔐 Protect route + load user
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
    } else {
      if (storedUser) setUser(JSON.parse(storedUser));
      fetchWatchlist();
    }
  }, []);

  // 📥 Fetch watchlist
  async function fetchWatchlist() {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://127.0.0.1:8000/watchlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setMovies(data);

    } catch (err) {
      console.error(err);
      setMessage("Failed to load watchlist ❌");
    } finally {
      setLoading(false);
    }
  }

  // ❌ Remove movie
  async function removeFromWatchlist(movieId) {
    const token = localStorage.getItem("token");

    try {
      await fetch(
        `http://127.0.0.1:8000/watchlist/remove?movie_id=${movieId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMovies((prev) => prev.filter(m => m.movie_id !== movieId));

      setMessage("Removed from watchlist ❌");
      setTimeout(() => setMessage(""), 2000);

    } catch (err) {
      console.error(err);
      setMessage("Error removing ❌");
      setTimeout(() => setMessage(""), 2000);
    }
  }

  // ⏳ Loading
  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-10 py-6">

      {/* 🔔 Toast */}
      {message && (
        <div className={`fixed top-5 right-5 px-4 py-2 rounded shadow-lg z-50
          ${message.includes("Error") ? "bg-red-600" :
            message.includes("Removed") ? "bg-yellow-500 text-black" :
              "bg-green-600 text-white"}
        `}>
          {message}
        </div>
      )}

      {/* 🔝 Navbar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">

        <h1 className="text-2xl md:text-3xl font-bold">
          My Watchlist 🎬
        </h1>

        <div className="flex items-center gap-3 flex-wrap">

          {user && (
            <span className="text-sm md:text-base">
              Hi, {user.name} 👋
            </span>
          )}

          <Link href="/">
            <button className="bg-gray-800 px-3 py-2 rounded text-sm hover:bg-gray-700">
              Home
            </button>
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.push("/login");
            }}
            className="bg-red-600 px-3 py-2 rounded text-sm hover:bg-red-500"
          >
            Logout
          </button>

        </div>
      </div>

      {/* 📭 Empty State */}
      {movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center">

          <p className="text-gray-400 text-lg mb-4">
            Your watchlist is empty 🎭
          </p>

          <Link href="/">
            <button className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300">
              Browse Movies
            </button>
          </Link>

        </div>
      ) : (

        /* 🎬 Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">

          {movies.map((movie) => {

            const poster = movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : "/no-poster.png";

            return (
              <div key={movie.movie_id} className="group relative">

                {/* Poster */}
                <Link href={`/movie/${movie.movie_id}`}>
                  <img
                    src={poster}
                    className="rounded-lg w-full h-[350px] object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-3 rounded-lg">

                  <p className="text-sm font-semibold">
                    {movie.movie_title}
                  </p>

                  <button
                    onClick={() => removeFromWatchlist(movie.movie_id)}
                    className="mt-2 bg-red-600 text-xs px-2 py-1 rounded hover:bg-red-500"
                  >
                    Remove
                  </button>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}