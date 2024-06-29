import React, { useEffect, useState } from 'react';
import './index.css';

function App() {
  const [gamesData, setGamesData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [reviewsData, setReviewsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayData, setDisplayData] = useState([]);

  useEffect(() => {
    fetch("/reviews").then(
      response => response.json()
    ).then(
      data => {
        setReviewsData(data);
      }
    );
  }, []);

  useEffect(() => {
    fetch("/users").then(
      response => response.json()
    ).then(
      data => {
        setUsersData(data);
      }
    );
  }, []);

  useEffect(() => {
    fetch("/games").then(
      response => response.json()
    ).then(
      data => {
        setGamesData(data);
      }
    );
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = () => {
    const filteredReviews = reviewsData.filter(review => 
      review.review_id.toString().includes(searchTerm)
    );
    
    // Combina reseñas con sus juegos correspondientes
    const combinedData = filteredReviews.map(review => {
      const gameDetails = gamesData.find(game => game.app_id === review.app_id);
      return {
        ...review,
        game: gameDetails
      };
    });

    setDisplayData(combinedData);
  };

  return (
    <div className="black-text">
      <input 
        type="text" 
        placeholder="Buscar reseña por ID..." 
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
              <h3>Reseña:</h3>
              <p>Reseña Id: {review.review_id}</p>
              <p>Usuario Id: {review.user_id}</p>
              <p>Contenido: {review.content}</p>
              <hr/>
              <h3>Detalles del Juego:</h3>
              {review.game ? (
                <>
                  <p>Id: {review.game.app_id}</p>
                  <p>Title: {review.game.title}</p>
                  <p>Date: {review.game.date_release}</p>
                  {review.game.win === true ? (
                    <p>Dwin: Disponible</p>
                  ) : (
                    <p>Dwin: No disponible</p>
                  )}
                  <p>Rating: {review.game.rating}</p>
                  <p>Price: {review.game.price_final}</p>
                  <hr/>
                </>
              ) : (
                <p>No se encontraron detalles del juego para esta reseña</p>
              )}
            </div>
          ))
        )
      )}
    </div>
  );
}

export default App;
