"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  async function searchMovies() {
    if (!query) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/search?query=${query}`
      );

      const data = await res.json();
      setResults(data.results);
    } catch (error) {
      console.error("Search error:", error);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <h1 className="text-4xl font-bold text-center mb-8">
        What2Watch 🎬
      </h1>

      {/* Search */}
      <div className="flex justify-center gap-3 mb-10">
        <input
          className="border border-gray-600 bg-black p-2 rounded w-80"
          type="text"
          placeholder="Search movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          onClick={searchMovies}
          className="bg-gray-800 px-4 py-2 rounded hover:bg-gray-700"
        >
          Search
        </button>
      </div>

      {/* Movie Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">

        {results.map((movie) => {

          const poster = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "/no-poster.png";

          return (
            <Link key={movie.id} href={`/movie/${movie.id}`}>

              <div className="cursor-pointer hover:scale-105 transition">

                <img
                  src={poster}
                  alt={movie.title}
                  className="rounded-lg"
                />

                <h2 className="mt-2 text-sm font-semibold">
                  {movie.title}
                </h2>

                <p className="text-gray-400 text-xs">
                  {movie.release_date}
                </p>

              </div>

            </Link>
          );
        })}

      </div>

    </div>
  );
}