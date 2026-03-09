"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function MoviePage() {

  const params = useParams();
  const id = params.id;

  const [movie, setMovie] = useState(null);

  useEffect(() => {
    async function fetchMovie() {
      const res = await fetch(
        `http://127.0.0.1:8000/movie/${id}`
      );

      const data = await res.json();
      setMovie(data);
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

        </div>

      </div>

    </div>
  );
}