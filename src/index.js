document.addEventListener('DOMContentLoaded', () => {
    // Get all the references to the HTML elements
    const filmsList = document.getElementById('films');
    const filmDetails = document.getElementById('showing');
    const posterImage = document.getElementById('poster');

    let currentMovieId;

    // Function to fetch and display the details of a movie by its ID
    function displayMovieDetails(movieId) {
        // Fetch the details of the movie
        fetch(`http://localhost:3000/films/${movieId}`)
            .then(response => response.json())
            .then(movie => {
                // Display the details of the movie
                filmDetails.innerHTML = `
                    <div class="card">
                        <div class="content">
                            <div class="header">${movie.title}</div>
                            <div class="meta">${movie.runtime} minutes</div>
                            <div class="description">${movie.description}</div>
                            <div class="extra">
                            <span class="ui label">${movie.showtime}</span>
                            <span id="ticket-num">${movie.capacity}</span> remaining tickets
                        </div>
                    </div>
                    <div class="extra content">
                        <button class="ui orange button buy-ticket" data-id="${movie.id}" ${movie.capacity === 0 ? 'disabled' : ''}>
                            Buy Ticket
                        </button>
                    </div>
                `;

                // Update the poster image
                posterImage.src = movie.poster;
                posterImage.alt = movie.title;

                // Update the current movie ID
                currentMovieId = movieId;
            })
    }

    // Function to display all the movies 
    function displayAllMovies() {
        // Fetch the details of the movie
        fetch('http://localhost:3000/films')
            .then(response => response.json())
            .then(movies => {
                // Clear the movies list section
                filmsList.innerHTML = '';
                // Iterate through the list of movies 
                movies.forEach(movie => {
                    // Create a list item for each movie
                    const listItem = document.createElement('li');
                    listItem.className = 'film item';
                    listItem.textContent = movie.title;
                    // Event listener to display movie details 
                    listItem.addEventListener('click', () => {
                        displayMovieDetails(movie.id);
                    });
                    filmsList.appendChild(listItem);
                });

                // Display details of the first movie
                if (movies.length > 0) {
                    displayMovieDetails(movies[0].id);
                }
            })
    }

    // Event listener for the buy ticket button
    filmDetails.addEventListener('click', e => {
        if (e.target.classList.contains('buy-ticket')) {
            const filmId = e.target.dataset.id;
            fetch(`http://localhost:3000/films/${filmId}`)
                .then(response => response.json())
                .then(movie => {
                    // Calculate the remaining capacity and tickets sold
                    const updatedTicketsSold = movie.tickets_sold + 1;
                    const updatedAvailableTickets = movie.capacity - 1;

                    // Update the value of capacity and tickets sold in the database
                    fetch(`http://localhost:3000/films/${filmId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            tickets_sold: updatedTicketsSold,
                            capacity: updatedAvailableTickets
                        })
                    })
                        .then(() => {
                            // Update UI after buying ticket
                            displayMovieDetails(filmId);
                        })
                })
        }
    });

    // Initial function call to display all movies
    displayAllMovies();
});

