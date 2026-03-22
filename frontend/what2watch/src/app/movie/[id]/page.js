"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function MoviePage() {

  const params = useParams();
  const id = params.id;

  const [movie, setMovie] = useState(null);
  const [providers, setProviders] = useState([]);
  const [watchLink, setWatchLink] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchMovie() {

      // 🎬 Movie details
      const res = await fetch(
        `http://127.0.0.1:8000/movie/${id}`
      );
      const data = await res.json();
      setMovie(data);

      // 📺 Providers
      const res2 = await fetch(
        `http://127.0.0.1:8000/movie/${id}/providers`
      );
      const providerData = await res2.json();

      setProviders(providerData.providers || []);
      setWatchLink(providerData.link || ""); // ✅ NEW
    }

    if (id) fetchMovie();
  }, [id]);

  // ➕ Add to watchlist
  async function addToWatchlist() {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first ⚠️");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    try {
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
      setMessage("Error adding ❌");
      setTimeout(() => setMessage(""), 2000);
    }
  }

  if (!movie) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/no-poster.png";

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-10 py-6">

      {/* 🔔 Toast */}
      {message && (
        <div className="fixed top-5 right-5 bg-green-600 px-4 py-2 rounded shadow">
          {message}
        </div>
      )}

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">

        {/* 🎬 Poster */}
        <img
          src={poster}
          alt={movie.title}
          className="rounded-xl w-full max-h-[720px] object-cover"
        />

        {/* 📄 Details */}
        <div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {movie.title}
          </h1>

          <p className="text-gray-400 mb-4">
            Release: {movie.release_date}
          </p>

          <p className="mb-6 text-gray-200 leading-relaxed">
            {movie.overview}
          </p>

          <div className="space-y-2 text-sm md:text-base">
            <p>⭐ Rating: {movie.rating}</p>
            <p>⏱ Runtime: {movie.runtime} min</p>
            <p>🎭 Genres: {movie.genres?.join(", ")}</p>
          </div>

          {/* 🎬 Providers */}
          <div className="mt-8">

            <h2 className="text-xl font-semibold mb-4">
              Where to Watch
            </h2>

            {providers.length === 0 ? (
              <p className="text-gray-400">
                Not available on streaming platforms
              </p>
            ) : (
              <div className="flex flex-wrap gap-4">

                {providers.map((p) => {
                  const logo = `https://image.tmdb.org/t/p/w200${p.logo}`;

                  return (
                    <div key={p.name} className="text-center">

                      <img
                        src={logo}
                        alt={p.name}
                        className="w-16 rounded cursor-pointer hover:scale-110 transition"
                        onClick={() => {
                          if (watchLink) {
                            window.open(watchLink, "_blank"); // 🔥 OPEN LINK
                          }
                        }}
                      />

                      <p className="text-sm mt-2">
                        {p.name}
                      </p>

                    </div>
                  );
                })}

              </div>
            )}

          </div>

          {/* ➕ Watchlist */}
          <button
            onClick={addToWatchlist}
            className="mt-6 bg-yellow-400 text-black px-6 py-2 rounded font-semibold hover:bg-yellow-300"
          >
            + Watchlist
          </button>

        </div>

      </div>

    </div>
  );
}