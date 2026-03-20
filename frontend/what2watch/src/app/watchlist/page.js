"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function WatchlistPage() {

  const [movies, setMovies] = useState([]);
  const [message, setMessage] = useState("");

  async function fetchWatchlist() {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first ⚠️");
      return;
    }

    const res = await fetch("http://127.0.0.1:8000/watchlist", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setMovies(data);
  }

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

  useEffect(() => {
    fetchWatchlist();
  }, []);

  return (
    <div className="bg-black text-white min-h-screen p-10">

      {/* Message */}
      {message && (
        <div className={`fixed top-5 right-5 px-4 py-2 rounded shadow-lg z-50
          ${message.includes("Error") ? "bg-red-600" :
            message.includes("Removed") ? "bg-yellow-500 text-black" :
              "bg-green-600 text-white"}
        `}>
          {message}
        </div>
      )}

      <h1 className="text-4xl font-bold mb-10 text-center">
        My Watchlist 🎬
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">

        {movies.map((movie) => {

          const poster = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "/no-poster.png";

          return (
            <div key={movie.id} className="text-center">

              <Link href={`/movie/${movie.movie_id}`}>
                <img
                  src={poster}
                  className="rounded-lg cursor-pointer hover:scale-105 transition"
                />
              </Link>

              <p className="mt-2 text-sm">
                {movie.movie_title}
              </p>

              <button
                onClick={() => removeFromWatchlist(movie.movie_id)}
                className="mt-2 bg-red-600 px-2 py-1 text-xs rounded"
              >
                Remove
              </button>

            </div>
          );
        })}

      </div>

    </div>
  );
}