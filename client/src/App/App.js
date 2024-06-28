import React, { useEffect, useState } from 'react';
import './index.css';
function App() {
  const [backendData, setBackendData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayData, setDisplayData] = useState([]);

  useEffect(() => {
    fetch("/api").then(
      response => response.json()
    ).then(
      data => {
        setBackendData(data);
      }
    );
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = () => {
    const filteredData = backendData.filter(games => {
      const gameTitle = games.title || ""; // Asegúrate de que games.title es una cadena de texto
      return gameTitle.toLowerCase().includes((searchTerm || "").toLowerCase());
    });
    setDisplayData(filteredData);
  };

  return (
    <div className="black-text">
      <input 
        type="text" 
        placeholder="Buscar juego..." 
        value={searchTerm} 
        onChange={handleSearchChange} 
      />
      <button onClick={handleSearchClick}>Buscar</button>
      {searchTerm === "" ? (
        <p>Por favor, ingrese un término de búsqueda para ver los resultados</p>
      ) : (
        displayData.length === 0 ? (
          <p>No hay resultados</p>
        ) : (
          displayData.map((games, i) => (
            <div key={i}>
              <p>Id: {games.app_id}</p>
              <p>Title: {games.title}</p>
              <p>Date: {games.date_release}</p>
              {games.win === true ? (
                  <p>Dwin: Disponible</p>
              ) : (
                  <p>Dwin: No disponible</p>
              )
            }
              <p>Rating: {games.rating}</p>
              <p>Price: {games.price_final}</p>
              <hr/>
            </div>
          ))
        )
      )}
    </div>
  );
}

export default App;
