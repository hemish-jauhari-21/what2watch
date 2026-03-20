"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {

  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");

  async function searchMovies() {
    if (!query) return;

    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://127.0.0.1:8000/search?query=${query}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    const data = await res.json();
    setMovies(data.results);
  }

  async function addToWatchlist(movie) {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first ⚠️");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    try {
      // 🔥 First check existing watchlist
      const res1 = await fetch("http://127.0.0.1:8000/watchlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const existing = await res1.json();

      const alreadyExists = existing.some(
        (m) => m.movie_id === movie.id
      );

      if (alreadyExists) {
        setMessage("Already in watchlist ⚠️");
        setTimeout(() => setMessage(""), 2000);
        return;
      }

      // 🔥 Add movie
      const res = await fetch(
        `http://127.0.0.1:8000/watchlist/add?movie_id=${movie.id}&title=${encodeURIComponent(movie.title)}&poster_path=${movie.poster_path}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed");
      }

      setMessage("Added to watchlist ✅");
      setTimeout(() => setMessage(""), 2000);

    } catch (err) {
      console.error(err);
      setMessage("Error adding to watchlist ❌");
      setTimeout(() => setMessage(""), 2000);
    }
  }

  async function loadPopularMovies() {

    const res = await fetch(
      `http://127.0.0.1:8000/movies/popular?page=${page}`
    );

    const data = await res.json();

    setMovies((prev) => {

      const combined = [...prev, ...data.results];

      // Remove duplicates using movie.id
      const unique = Array.from(
        new Map(combined.map(movie => [movie.id, movie])).values()
      );

      return unique;
    });

  }

  useEffect(() => {
    loadPopularMovies();
  }, [page]);

  useEffect(() => {

    function handleScroll() {

      if (
        window.innerHeight + document.documentElement.scrollTop + 1 >=
        document.documentElement.scrollHeight
      ) {
        setPage((prev) => prev + 1);
      }

    }

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);

  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-10">
      {message && (
        <div className={`fixed top-5 right-5 px-4 py-2 rounded shadow-lg z-50
    ${message.includes("Error") ? "bg-red-600" :
            message.includes("Already") ? "bg-yellow-500 text-black" :
              "bg-green-600 text-white"}
  `}>
          {message}
        </div>
      )}

      <div className="flex justify-end p-4">
        <Link href="/login">
          <button className="bg-white text-black px-4 py-2 rounded">
            Login
          </button>
        </Link>

        <Link href="/watchlist">
          <button className="bg-red-600 px-4 py-2 rounded ml-2">
            Watchlist
          </button>
        </Link>
      </div>

      <h1 className="text-4xl font-bold text-center mb-8">
        What2Watch 🎬
      </h1>

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

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">

        {movies.map((movie) => {

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

                <p className="mt-2 text-sm">
                  {movie.title}
                </p>

                <button
                  onClick={(e) => {
                    e.preventDefault(); // prevents link navigation
                    addToWatchlist(movie);
                  }}
                  className="mt-2 bg-white text-black text-xs px-2 py-1 rounded"
                >
                  + Watchlist
                </button>

              </div>

            </Link>
          );
        })}

      </div>

    </div>
  );
}