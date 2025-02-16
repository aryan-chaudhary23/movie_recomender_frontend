import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import { motion } from "framer-motion";

const API_KEY = "e0d250a1a18441aa63911482f67a2e28"; // Your TMDB API Key

const App = () => {
  const [movies, setMovies] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get("https://movie-recomender-backend-1.onrender.com/api/movies");
        setMovies(response.data.movies_list);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, []);

  const fetchRecommendations = async (movie) => {
    setSelectedMovie(movie);
    try {
      const response = await axios.post("https://movie-recomender-backend-1.onrender.com/api/recomend", { movie });
      const { movie_list, id_list } = response.data;

      const posterRequests = id_list.map(async (id, index) => {
        try {
          const tmdbResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`
          );
          return {
            title: movie_list[index],
            poster_path: tmdbResponse.data.poster_path,
          };
        } catch (error) {
          console.error(`Error fetching poster for ${movie_list[index]}`, error);
          return { title: movie_list[index], poster_path: null };
        }
      });

      const moviesWithPosters = await Promise.all(posterRequests);
      setRecommended(moviesWithPosters);
    } catch (e) {
      console.log("Error fetching recommendations:", e);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-900 text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
          Select a Movie to Get Recommendations 🎬
        </h1>

        <div className="bg-black/50 p-4 sm:p-6 rounded-lg w-full sm:w-[80%] md:w-[60%] max-h-96 overflow-y-auto">
          {movies?.map((movie, index) => (
            <motion.div
              key={index}
              className="cursor-pointer p-2 sm:p-3 hover:bg-gray-700 rounded-lg text-base sm:text-lg text-center"
              whileHover={{ scale: 1.05 }}
              onClick={() => fetchRecommendations(movie)}
            >
              {movie}
            </motion.div>
          ))}
        </div>

        {selectedMovie && (
          <div className="mt-8 text-center w-full sm:w-[80%] md:w-[60%]">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">
              Recommended Movies for <span className="text-yellow-400">{selectedMovie}</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-4 p-4 bg-black/40 rounded-lg">
              {recommended.map((rec, index) => (
                <motion.div
                  key={index}
                  className="w-[120px] sm:w-[150px] h-[180px] sm:h-[220px] rounded-lg shadow-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  {rec.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${rec.poster_path}`}
                      alt={rec.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white rounded-lg">
                      No Image
                    </div>
                  )}
                  <div className="text-center text-white mt-2 text-sm sm:text-base">
                    {rec.title}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
