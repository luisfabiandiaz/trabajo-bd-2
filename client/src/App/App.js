import React, { useState, useEffect } from 'react';

import './index.css';

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [topAnimes, setTopAnimes] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);

  useEffect(() => {
    fetchTopAnimes();
  }, []);

  const fetchTopAnimes = async () => {
    try {
      const response = await fetch("/top_animes");
      if (!response.ok) {
        throw new Error('Error al obtener los mejores animes');
      }
      const data = await response.json();
      setTopAnimes(data);
    } catch (error) {
      console.error('Error al obtener los mejores animes:', error);
    }
  };

  const fetchAnimesNinos = async () => {
    try {
      const response = await fetch("/animes_ninos");
      if (!response.ok) {
        throw new Error('Error al obtener los mejores animes');
      }
      const data = await response.json();
      setTopAnimes(data);
    } catch (error) {
      console.error('Error al obtener los mejores animes:', error);
    }
  };


  const fetchTopPeores = async () => {
    try {
      const response = await fetch("/top_peores");
      if (!response.ok) {
        throw new Error('Error al obtener los peores animes');
      }
      const data = await response.json();
      setTopAnimes(data);
    } catch (error) {
      console.error('Error al obtener los peores animes:', error);
    }
  };

  const handleTopAnimes = () => {
    setSearchTerm("");
    fetchTopAnimes();
  };

  const handleAnimesNinos = () => {
    setSearchTerm("");
    fetchAnimesNinos();
  };

  const handleTopPeores = () => {
    setSearchTerm("");
    fetchTopPeores();
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ searchTerm })
      });

      if (!response.ok) {
        throw new Error('No se encontraron resultados');
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error al realizar la búsqueda:', error);
      setSearchResults([]);
    }
  };

  const handleMoreInfo = (anime) => {
    setSelectedAnime(anime);
  };

  const handleCloseInfo = () => {
    setSelectedAnime(null);
  };

  return (
    <html lang="en" className="overflow-x-auto">
      <header>
        <nav className="header p-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-5">
              <div className="col-span-10 flex flex-row content-center items-center md:justify-center justify-end">
                <div className="flex space-x-5 justify-center gap-5">
                  <button type="button" className="black-text" onClick={handleTopAnimes}>
                    Top animes
                  </button>
                  <button type="button" className="black-text" onClick={handleTopPeores}>
                    Top peores
                  </button>
                  <button type="button" className="black-text" onClick={handleAnimesNinos}>
                    Para niños
                  </button>
                  <form onSubmit={handleSearch} className="black-text">
                    <input
                      type="text"
                      placeholder="Buscar anime..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="black-text">Buscar</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
      <section className="container mx-auto p-7">
        <div className="black-text">
          {selectedAnime ? (
            <div className="mx-auto rectangularinfo-card content-center items-center justify-center text-center m-1 my-10">
              <h2>{selectedAnime.Name}</h2>
              <p>Studios: {selectedAnime.Studios}</p>
              <p>Género: {selectedAnime.Genres}</p>
              <p>Episodios: {selectedAnime.Episodes}</p>
              <p>Salio: {selectedAnime.Aired}</p>
              <p>Tiempo: {selectedAnime.timeOnAir}</p>
              <p className="black-text-mini">Synopsis: {selectedAnime.sypnopsis}</p>
              <button type="button" onClick={handleCloseInfo}>Cerrar</button>
            </div>
          ) : searchResults.length === 0 ? (
            <>
              <p>Tus 10 animes:</p>
              {topAnimes.map((anime, index) => (
                <div key={index} className="mx-auto rectangular-card content-center items-center justify-center text-center m-1 my-10">
                  <h2>{anime.Name}</h2>
                  <p>{anime.Popularity}</p>
                  <button type="button" onClick={() => handleMoreInfo(anime)}>Más Info</button>
                </div>
              ))}
            </>
          ) : (
            searchResults.map((result, index) => (
              <div key={index} className="mx-auto rectangular-card content-center items-center justify-center text-center m-1 my-10">
                <h2>{result.Name}</h2>
                <p>{result.Score}</p>
                <button type="button" onClick={() => handleMoreInfo(result)}>Más Info</button>
              </div>
            ))
          )}
        </div>
      </section>
    </html>
  );
}

export default App;
