import React, { useEffect, useState } from 'react';

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
    const filteredData = backendData.filter(review => 
      review.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setDisplayData(filteredData);
  };

  return (
    <div>
      <p>hola papus</p>
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
          displayData.map((review, i) => (
            <div key={i}>
              <p>Id: {review.id}</p>
              <p>Title: {review.title}</p>
              <p>Date: {review.date}</p>
              <p>Es wind: {review.win}</p>
              <p>Rating: {review.rating}</p>
              <p>Price: {review.price}</p>
              <hr/>
            </div>
          ))
        )
      )}
    </div>
  );
}

export default App;
