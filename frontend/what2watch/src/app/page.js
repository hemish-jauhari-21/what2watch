"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {

  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  async function searchMovies() {
    if (!query) return;

    const res = await fetch(
      `http://127.0.0.1:8000/search?query=${query}`
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
      const res1 = await fetch("http://127.0.0.1:8000/watchlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res1.json();

      const existing = Array.isArray(data)
        ? data
        : data.watchlist || [];

      const alreadyExists = existing.some(
        (m) => m.movie_id === movie.id
      );

      if (alreadyExists) {
        setMessage("Already in watchlist ⚠️");
        setTimeout(() => setMessage(""), 2000);
        return;
      }

      await fetch(
        `http://127.0.0.1:8000/watchlist/add?movie_id=${movie.id}&title=${encodeURIComponent(movie.title)}&poster_path=${movie.poster_path}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
    <div className="min-h-screen bg-black text-white px-4 md:px-10 py-6">

      {/* 🔔 Toast */}
      {message && (
        <div className={`fixed top-5 right-5 px-4 py-2 rounded shadow-lg z-50
          ${message.includes("Error") ? "bg-red-600" :
            message.includes("Already") ? "bg-yellow-500 text-black" :
              "bg-green-600 text-white"}
        `}>
          {message}
        </div>
      )}

      {/* 🔝 Navbar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">

        <h1 className="text-2xl md:text-3xl font-bold">
          What2Watch 🎬
        </h1>

        <div className="flex items-center gap-3 flex-wrap justify-center">

          {user ? (
            <>
              <span className="text-sm md:text-base">
                Hi, {user.name} 👋
              </span>

              <Link href="/watchlist">
                <button className="bg-yellow-400 text-black px-3 py-2 rounded text-sm hover:bg-yellow-300">
                  Watchlist
                </button>
              </Link>

              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.reload();
                }}
                className="bg-red-600 px-3 py-2 rounded text-sm hover:bg-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login">
              <button className="bg-white text-black px-4 py-2 rounded text-sm hover:bg-gray-300">
                Login
              </button>
            </Link>
          )}

        </div>
      </div>

      {/* 🔍 Search */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 mb-10">

        <input
          className="border border-gray-600 bg-black p-3 rounded w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          type="text"
          placeholder="Search movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          onClick={searchMovies}
          className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300"
        >
          Search
        </button>

      </div>

      {/* 🎬 Movies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">

        {movies.map((movie) => {

          const poster = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "/no-poster.png";

          return (
            <Link key={movie.id} href={`/movie/${movie.id}`}>

              <div className="group relative cursor-pointer">

                {/* Poster */}
                <img
                  src={poster}
                  alt={movie.title}
                  className="rounded-lg w-full h-[350px] object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-3 rounded-lg">

                  <p className="text-sm font-semibold">
                    {movie.title}
                  </p>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      addToWatchlist(movie);
                    }}
                    className="mt-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded hover:bg-yellow-300"
                  >
                    + Watchlist
                  </button>

                </div>

              </div>

            </Link>
          );
        })}

      </div>

    </div>
  );
}