document.addEventListener('DOMContentLoaded', () => {
	const loginForm = document.getElementById('login-form');
	const errorMessage = document.getElementById('error-message');
	const loginButton = document.getElementById("login-button");
	const reviewForm = document.getElementById('review-form');
	const token = checkAuthentication();
	const placeId = getPlaceFromURL();

	if (loginForm) {
			// Gestion de la soumission du formulaire de connexion
			loginForm.addEventListener('submit', async (event) => {
					event.preventDefault();

					const email = document.getElementById('email').value;
					const password = document.getElementById('password').value;

					try {
							const response = await fetch('http://127.0.0.1:5000/login', {
									method: 'POST',
									headers: {
											'Content-Type': 'application/json'
									},
									body: JSON.stringify({ email, password })
							});

							if (response.ok) {
									const data = await response.json();
									document.cookie = `token=${data.access_token}; path=/`;
									window.location.href = 'index.html';
							} else {
									errorMessage.textContent = "Échec de la connexion. Vérifiez vos identifiants.";
									errorMessage.style.display = 'block';
							}
					} catch (error) {
							errorMessage.textContent = "Une erreur est survenue. Veuillez réessayer.";
							errorMessage.style.display = 'block';
					}
			});
	} else {
			// Si on n'est pas sur la page de connexion, vérifier l'authentification
			const button = document.getElementById("login-button");
			const reviewButton = document.getElementById("submit-button");

			if (token) {
					console.log("Utilisateur connecté");
					if(button)
						button.style.display = "none";
					if(reviewButton) {
						reviewButton.style.display = "block";
						reviewButton.innerHTML = `<button id="review-button" class="add-review-button" onclick="location.href='add_review.html?id=${placeId}';">Add Review</button>`
					}

					fetchPlaceDetails(token, placeId);
			} else {
					const placesList = document.getElementById('place-list');
					if(placesList)
						placesList.innerHTML = '';
					console.log("Utilisateur non connecté");
					if(button)
						button.style.display = "block";
					if(reviewButton)
						reviewButton.style.display = "none";
			}
			fetchAllPlaces();
	}

	if (reviewForm) {
		console.log("Page review");
		document.getElementById("back-button").href = `place.html?id=${placeId}`;
		reviewForm.addEventListener('submit', async (event) => {
				event.preventDefault();
				

				const reviewTextForm = document.getElementById('review-text');

				if(reviewTextForm && placeId && token) {
					const reviewText = reviewTextForm.value;
					submitReview(token, placeId, reviewText);
				}
		});
}

});

function checkAuthentication() {
	const token = getCookie("token");
	return token;
}

function getCookie(name) {
	const cookies = document.cookie.split("; ");
	for (const cookie of cookies) {
			const [key, value] = cookie.split("=");
			if (key === name) return value;
	}
	return null;
}

function generateStars(rating) {
	const maxRating = 5;
	let stars = '';
	for (let i = 0; i < maxRating; i++) {
			if (i < rating) {
					stars += '★';
			} else {
					stars += '☆';
			}
	}
	return stars;
}

async function submitReview(token, placeId, reviewText) {
		const rating = document.getElementById('rating').value;
	
		try {
			const response = await fetch(`http://127.0.0.1:5000/places/${placeId}/reviews`, {
				method: 'POST',
				headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					rating: rating,
					review: reviewText
				})
			});

			handleResponse(response);
		} catch (error) {
				console.error("Erreur réseau lors de l'envoie de la review :", error);
		}
}

function handleResponse(response) {
	if (response.ok) {
			alert('Review submitted successfully!');
			const rating = document.getElementById('rating');
			const reviewText = document.getElementById('review-text');

			if(reviewText) {
				reviewText.value = '';
			}
	} else {
			alert('Failed to submit review');
	}
}

// Fonction pour récupérer toutes les places
async function fetchAllPlaces() {
	const token = getCookie("token");

	if (!token) {
			console.error("Aucun token trouvé. L'utilisateur n'est pas authentifié.");
			return;
	}

	try {
			const response = await fetch('http://127.0.0.1:5000/places', {
					method: 'GET',
					headers: {
							'Authorization': `Bearer ${token}`,
							'Content-Type': 'application/json'
					}
			});

			if (response.ok) {
					const places = await response.json();
					console.log("Liste des places :", places);
					displayPlaces(places);
			} else {
					console.error("Erreur lors de la récupération des places :", response.status);
			}
	} catch (error) {
			console.error("Erreur réseau lors de la récupération des places :", error);
	}
}

// Fonction pour afficher les places dans la page
function displayPlaces(places) {
	const placesList = document.getElementById('place-list');
	if(placesList){
		placesList.innerHTML = ''; // Vider la liste avant d'afficher les nouvelles données

		places.forEach(place => {
				const placeElement = document.createElement('div');
				placeElement.classList.add('place-card');
				placeElement.innerHTML = `
									<h2>${place.description}</h2>
									<p>Price per night: $${place.price_per_night}</p>
									<button class="details-button" onclick="location.href='place.html?id=${place.id}';">View Details</button>
				`;
				placesList.appendChild(placeElement);
		});
	}
}

function getPlaceFromURL() {
	let queryParams = window.location.search;
	let parameters = new URLSearchParams(queryParams);
	let id = parameters.get("id");
	return id;   
}

async function fetchPlaceDetails(token, placeId) {
		if(placeId === null || !placeId) return;
		try {
			const response = await fetch('http://127.0.0.1:5000/places/' + placeId, {
					method: 'GET',
					headers: {
							'Authorization': `Bearer ${token}`,
							'Content-Type': 'application/json'
					}
			});

			if (response.ok) {
					const place = await response.json();
					displayPlaceDetails(place);
			} else {
					console.error("Erreur lors de la récupération de la place:", response.status);
			}
	} catch (error) {
			console.error("Erreur réseau lors de la récupération de la place :", error);
	}
}

function displayPlaceDetails(place)  {
		const info = document.getElementById('place-details');
		const title = document.getElementById('place-title');
		const reviews = document.getElementById('reviews');

		console.log("Affichage de la place " + place.description);

		if(title) {
			title.innerHTML = `${place.description}`;
		}

		if(info) {
			info.innerHTML = `
						<p><strong>Host:</strong> ${place.host_name}</p>
						<p><strong>Price per night:</strong> $${place.price_per_night}</p>
						<p><strong>Description:</strong> ${place.description}</p>
						<p><strong>Amenities:</strong> ${place.amenities}</p>
			`;
		}

		if(reviews) {
			reviews.innerHTML = '';
			place.reviews.forEach(review => {
				const placeElement = document.createElement('div');
				placeElement.classList.add('review-card');
				placeElement.innerHTML = `
									<p><strong>${review.user_name}:</strong> ${review.comment}</p>
								<p>Rating: ${generateStars(review.rating)}</p>
								`;
				reviews.appendChild(placeElement);
			});
		}
}


