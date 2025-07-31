const scrollAmount = 300;

// Scroll carousel on button click
document.querySelectorAll('.carousel-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const direction = btn.classList.contains('left') ? -1 : 1;
    const targetId = btn.getAttribute('data-target');
    const carousel = document.getElementById(targetId);

    carousel.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
  });
});

// Theme toggler
function toggleTheme() {
  document.body.classList.toggle('light');
  document.body.classList.toggle('dark');
}

// Debug print shortcut
function print(x) {
  console.log(x);
}

// Global state
const global = {
  currentPage: window.location.pathname,
};

// Highlight nav link based on current page
function highlightActiveNavLink() {
  const navLinks = document.querySelectorAll('.nav-links > li');
  navLinks.forEach(link => {
    const anchor = link.firstElementChild;
    if (anchor.getAttribute('href') === global.currentPage) {
      anchor.classList.add('active');
    }
  });
}

// Initialize all data fetching
function init() {
  getPopularMovies('movie/popular');
  getPopularActors();
  startHeroSlider(); // changed from loadNowPlaying()
  highlightActiveNavLink();
}


// API setup
const API = {
  apiKey: '3fd2be6f0c70a2a598f084ddfb75487c',
  apiUrl: 'https://api.themoviedb.org/3/',
};

// Truncate text helper
function truncate(text, limit = 100) {
  if (!text) return '';
  return text.length > limit
    ? text.slice(0, text.lastIndexOf(' ', limit)) + '...'
    : text;
}

// Fetch now playing movie for hero section
const heroCategories = [
  { name: 'Now Playing', endpoint: 'movie/now_playing' },
  { name: 'Upcoming', endpoint: 'movie/upcoming' },
  { name: 'Top Rated', endpoint: 'movie/top_rated' }
];

let currentCategoryIndex = 0;

async function loadHeroCategory() {
  const { name, endpoint } = heroCategories[currentCategoryIndex];
  const badge = document.getElementById('category-badge');
  const container = document.getElementById('hero-textcontainer');

  try {
    const res = await fetch(`${API.apiUrl}${endpoint}?api_key=${API.apiKey}&language=en-US`);
    const data = await res.json();
    const movie = data.results?.[0];

    if (!movie || !container) return;

    // Update badge text
    badge.textContent = `> ${name}`;

    // Clear existing text
    container.innerHTML = '';

    // Build new hero text
    const card = document.createElement('div');
    card.className = 'hero-text';
    card.innerHTML = `
      <h1 class="movie-title">${movie.title}</h1>
      <p class="movie-description">${truncate(movie.overview, 150)}</p>
    `;
    container.appendChild(card);

    // Update hero background
    const hero = document.getElementById('hero');
    hero.style.background = `url(https://image.tmdb.org/t/p/original/${movie.backdrop_path}) center/cover no-repeat`;

  } catch (err) {
    console.error('Failed to load hero category:', err);
  }

  // Rotate to next category
  currentCategoryIndex = (currentCategoryIndex + 1) % heroCategories.length;
}

// Call immediately and then every 6 seconds
function startHeroSlider() {
  loadHeroCategory();
  setInterval(loadHeroCategory, 6000); // 6 seconds interval
}

// Fetch and render popular actors
async function getPopularActors() {
  try {
    const res = await fetch(`${API.apiUrl}person/popular?api_key=${API.apiKey}&language=en-US`);
    if (!res.ok) throw new Error('Failed to fetch actors');

    const data = await res.json();
    const container = document.querySelector('.popular-actors');

    data.results.forEach(actor => {
      const knownFor = actor.known_for.map(work => work.title || work.name).join(', ');

      const card = document.createElement('div');
      card.className = 'actor-card';
      card.innerHTML = `
        <div class="poster">
          <img src="https://image.tmdb.org/t/p/w500${actor.profile_path}" alt="${actor.name}" />
          <div class="description-overlay">
            <div class="actor-info">
              <div class="actor-name">${actor.name}</div>
              <div class="meta"><span class="year">Active</span></div>
              <div class="description">Known for: ${truncate(knownFor)}</div>
<a href="./actordetail.html?id=${actor.id}" class="see-more">See More <span class="arrow">→</span></a>
            </div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error fetching actors:', err);
  }
}

// Fetch and display popular movies
async function getPopularMovies(endpoint) {
  try {
    const res = await fetch(`${API.apiUrl}${endpoint}?api_key=${API.apiKey}&language=en-US`);
    if (!res.ok) throw new Error('Failed to fetch movies');

    const data = await res.json();
    const container = document.querySelector('.popular');

    data.results.forEach(movie => {
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.innerHTML = `
        <div class="poster">
          <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
          <div class="description-overlay">
            <div class="movie-info">
              <div class="movie-title">${movie.title}</div>
              <div class="meta">
                <span class="year">${movie.release_date}</span>
                <span class="rating">⭐${movie.vote_average.toFixed(2)}</span>
              </div>
              <div class="description">
                ${truncate(movie.overview, 150)}
              </div>
              <a href="./moviedetail.html?id=${movie.id}&type=movie" class="see-more">
See More <span class="arrow">→</span></a>
            </div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error fetching popular movies:', err);
  }
}

// Init after DOM is ready
document.addEventListener('DOMContentLoaded', init);

async function loadActorDetail() {
  const params = new URLSearchParams(window.location.search);
  const actorId = params.get("id");

  if (!actorId) {
    console.error("No actor ID in URL.");
    return;
  }

  try {
    const res = await fetch(`${API.apiUrl}person/${actorId}?api_key=${API.apiKey}&language=en-US`);
    if (!res.ok) throw new Error("Failed to fetch actor");
    const actor = await res.json();

    const creditsRes = await fetch(`${API.apiUrl}person/${actorId}/movie_credits?api_key=${API.apiKey}&language=en-US`);
    const creditsData = await creditsRes.json();

    const detailSection = document.querySelector('.detail');
    if (!detailSection) return;

    const topMovies = creditsData.cast.slice(0, 4);
    let topMoviesHTML = '';
    topMovies.forEach((movie, i) => {
      topMoviesHTML += `<li>${movie.title || movie.name}</li>`;
      if (i !== topMovies.length - 1) topMoviesHTML += `<span>| </span>`;
    });

    const allMoviesHTML = creditsData.cast.map(movie =>
      `<li>${movie.title || movie.name} (${(movie.release_date || '').slice(0,4) || 'N/A'})</li>`
    ).join('');

    let backdropPath = creditsData.cast?.[0]?.backdrop_path || actor.profile_path;

    detailSection.innerHTML = `
      <div class="detail-bg"></div>
      <div class="containerr">
        <div class="img">
          <img src="https://image.tmdb.org/t/p/w500${actor.profile_path}" alt="${actor.name}" />
        </div>
        <div class="texts">
          <h1 class="rate">Active</h1>
          <p class="typeofmovie">Actor</p>
          <h1 class="title">${actor.name}</h1>
          <ul class="casts">
            ${topMoviesHTML}
            <li id="toggle-full-cast">See full cast →</li>
          </ul>
          <ul id="full-cast-list">
            ${allMoviesHTML}
          </ul>
          <p class="description">${actor.biography || 'No biography available.'}</p>
          <div class="movieslide">
            <a href="./index.html" class="btn-see-more">&lt;- Back to Home</a>
          </div>
        </div>
      </div>
    `;

    // Set background
    const bg = detailSection.querySelector('.detail-bg');
    if (bg && backdropPath) {
      bg.style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${backdropPath})`;
    }

    // Toggle cast list
    const toggle = document.getElementById('toggle-full-cast');
    const fullList = document.getElementById('full-cast-list');
    toggle.addEventListener('click', () => {
      if (fullList.style.display === 'none') {
        fullList.style.display = 'block';
        toggle.textContent = 'Hide full cast ↑';
      } else {
        fullList.style.display = 'none';
        toggle.textContent = 'See full cast →';
      }
    });

  } catch (err) {
    console.error('Error loading actor details:', err);
  }
}

// Call it only on actor detail page
if (window.location.pathname.includes('actordetail.html')) {
  loadActorDetail();
}

async function loadMediaDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const type = params.get("type") || "movie"; // movie or tv

  if (!id) return console.error("No media ID provided");

  try {
    const [detailsRes, creditsRes] = await Promise.all([
      fetch(`${API.apiUrl}${type}/${id}?api_key=${API.apiKey}&language=en-US`),
      fetch(`${API.apiUrl}${type}/${id}/credits?api_key=${API.apiKey}&language=en-US`)
    ]);

    const details = await detailsRes.json();
    const credits = await creditsRes.json();

    const detailSection = document.querySelector('.detail');
    if (!detailSection) return;

    const topCast = credits.cast.slice(0, 5).map(person => `<li>${person.name}</li>`).join('<span>|</span>');
    const fullCast = credits.cast.map(p => `<li>${p.name} as ${p.character}</li>`).join('');

    const tags = details.genres.map(genre => `<li class="taglist">${genre.name}</li>`).join('');
    const rating = details.vote_average.toFixed(1);
    const title = details.title || details.name;
    const subtitle = details.tagline || '';
    const description = details.overview;
    const imagePath = details.poster_path || details.backdrop_path;
    const backdrop = details.backdrop_path || imagePath;

    detailSection.innerHTML = `
      <div class="detail-bg"></div>
      <div class="containerr">
        <div class="img">
          <img src="https://image.tmdb.org/t/p/w500${imagePath}" alt="${title}" />
        </div>
        <div class="texts">
          <h1 class="rate">Rating : ⭐${rating}</h1>
          <p class="typeofmovie">${type === "movie" ? "Movie" : "TV Series"}</p>
          <h1 class="title">${title}</h1>
          <h2 class="subtitle">${subtitle}</h2>
          <ul class="casts">
            ${topCast}
            <li id="toggle-full-cast">See full cast →</li>
          </ul>
          <ul id="full-cast-list">
            ${fullCast}
          </ul>
          <p class="description">${description}</p>
          <div class="info">
            <ul class="tags">${tags}</ul>
            <div class="movieslide details">
              <a href="./index.html" class="btn-see-more">&larr; Back to Home</a>
              <button class="btn-add">+</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const bg = detailSection.querySelector('.detail-bg');
    bg.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${backdrop})`;

    const toggle = document.getElementById("toggle-full-cast");
    const fullCastList = document.getElementById("full-cast-list");
    toggle.addEventListener("click", () => {
      const isVisible = fullCastList.style.display === "block";
      fullCastList.style.display = isVisible ? "none" : "block";
      toggle.textContent = isVisible ? "See full cast →" : "Hide full cast ↑";
    });

  } catch (err) {
    console.error("Error loading media detail:", err);
  }
}

// Only run on movie/tv detail pages
if (window.location.pathname.includes("moviedetail.html")) {
  loadMediaDetail();
}

