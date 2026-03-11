"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function MoviePage() {

  const params = useParams();
  const id = params.id;

  const [movie, setMovie] = useState(null);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    async function fetchMovie() {

      // Fetch movie details
      const res = await fetch(
        `http://127.0.0.1:8000/movie/${id}`
      );

      const data = await res.json();
      setMovie(data);

      // Fetch streaming providers
      const res2 = await fetch(
        `http://127.0.0.1:8000/movie/${id}/providers`
      );

      const providerData = await res2.json();
      setProviders(providerData.providers);
    }

    if (id) fetchMovie();
  }, [id]);

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
    <div className="bg-black text-white min-h-screen p-10">

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10">

        <img
          src={poster}
          alt={movie.title}
          className="rounded-lg"
        />

        <div>

          <h1 className="text-4xl font-bold mb-4">
            {movie.title}
          </h1>

          <p className="text-gray-400 mb-4">
            Release Date: {movie.release_date}
          </p>

          <p className="mb-6">
            {movie.overview}
          </p>

          <p>⭐ Rating: {movie.rating}</p>
          <p>⏱ Runtime: {movie.runtime} min</p>
          <p>🎭 Genres: {movie.genres?.join(", ")}</p>
          <div className="mt-8">

            <h2 className="text-2xl font-semibold mb-4">
              Where to Watch
            </h2>

            {providers.length === 0 && (
              <p className="text-gray-400">
                Streaming info unavailable
              </p>
            )}

            <div className="flex gap-4">

              {providers.map((p) => {

                const logo = `https://image.tmdb.org/t/p/w200${p.logo}`;

                return (
                  <div key={p.name} className="text-center">

                    <img
                      src={logo}
                      alt={p.name}
                      className="w-16 rounded"
                    />

                    <p className="text-sm mt-2">
                      {p.name}
                    </p>

                  </div>
                );

              })}

            </div>

          </div>

          <button
            onClick={async () => {
              await fetch("http://127.0.0.1:8000/watchlist/add?movie_id=" + movie.id + "&title=" + movie.title, {
                method: "POST"
              });
              alert("Added to Watchlist");
            }}
            className="mt-6 bg-red-600 px-4 py-2 rounded"
          >
            Add to Watchlist
          </button>

        </div>

      </div>

    </div>
  );
}