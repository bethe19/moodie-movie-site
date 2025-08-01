// Constants
const scrollAmount = 300;
const API = {
  apiKey: '3fd2be6f0c70a2a598f084ddfb75487c',
  apiUrl: 'https://api.themoviedb.org/3/',
};

// Global State
const global = {
  currentPage: window.location.pathname,
};

// Utility Functions
function print(x) { console.log(x); }

function truncate(str, maxLength = 100) {
  if (!str) return '';
  return str.length > maxLength ? str.slice(0, str.lastIndexOf(' ', maxLength)) + '...' : str;
}

function highlightActiveNavLink() {
  document.querySelectorAll('.nav-links > li a').forEach(link => {
    if (link.getAttribute('href') === global.currentPage) {
      link.classList.add('active');
    }
  });
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  document.body.classList.toggle('dark', !isLight);
  
  const iconContainer = document.querySelector('.toggle-theme');
  iconContainer.innerHTML = isLight
    ? `<span class="icon"><i class="fas fa-sun"></i></span>`
    : `<span class="icon"><i class="fas fa-moon"></i></span>`;
}


function toggleMobileMenu() {
  document.querySelector('.nav-links').classList.toggle('active');
  document.querySelector('.hamburger-menu').classList.toggle('active');
}

function setupMobileMenuClose() {
  const navLinks = document.querySelectorAll('.nav-links a');
  const navMenu = document.querySelector('.nav-links');
  const hamburger = document.querySelector('.hamburger-menu');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      hamburger.classList.remove('active');
    });
  });
}

// Carousel
function setupCarouselButtons() {
  document.querySelectorAll('.carousel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const direction = btn.classList.contains('left') ? -1 : 1;
      const targetId = btn.getAttribute('data-target');
      const carousel = document.getElementById(targetId);
      carousel.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
    });
  });
}

// Hero Slider
const heroCategories = [
  { name: 'Now Playing', endpoint: 'movie/now_playing' },
  { name: 'Upcoming', endpoint: 'movie/upcoming' },
  { name: 'Top Rated', endpoint: 'movie/top_rated' }
];

let currentCategoryIndex = 0;

function startHeroSlider(type = 'movie') {
  loadHeroCategory(type);
  setInterval(() => loadHeroCategory(type), 6000);
}

async function loadHeroCategory(type = 'movie') {
  const categorySet = type === 'tv'
    ? [
        { name: 'Airing Today', endpoint: 'tv/airing_today' },
        { name: 'Top Rated', endpoint: 'tv/top_rated' },
        { name: 'On The Air', endpoint: 'tv/on_the_air' }
      ]
    : [
        { name: 'Now Playing', endpoint: 'movie/now_playing' },
        { name: 'Upcoming', endpoint: 'movie/upcoming' },
        { name: 'Top Rated', endpoint: 'movie/top_rated' }
      ];

  const { name, endpoint } = categorySet[currentCategoryIndex];

  try {
    const res = await fetch(`${API.apiUrl}${endpoint}?api_key=${API.apiKey}&language=en-US`);
    const data = await res.json();
    const item = data.results?.[0];

    if (!item) return;

    document.getElementById('category-badge').textContent = `> ${name}`;
    const container = document.getElementById('hero-textcontainer');
    container.innerHTML = `
      <div class="hero-text">
        <h1 class="movie-title">${item.title || item.name}</h1>
        <p class="movie-description">${truncate(item.overview, 150)}</p>
      </div>
    `;
    document.getElementById('hero').style.background = `url(https://image.tmdb.org/t/p/original/${item.backdrop_path}) center/cover no-repeat`;
  } catch (err) {
    console.error('Failed to load hero category:', err);
  }

  currentCategoryIndex = (currentCategoryIndex + 1) % categorySet.length;
}


// Data Fetching and Rendering
async function getPopular(type = 'movie') {
  try {
    const res = await fetch(`${API.apiUrl}${type}/popular?api_key=${API.apiKey}&language=en-US`);
    const data = await res.json();

    const title = type === 'movie' ? 'Popular Movies' : 'Popular TV Shows';
    const container = document.getElementById('movie-grid');
    document.querySelector('#popular-movies h2').textContent = title;

    container.innerHTML = ''; // clear previous
    data.results.forEach(item => {
      container.innerHTML += createCard(item, type);
    });
  } catch (err) {
    console.error(`Error fetching popular ${type}s:`, err);
  }
}


async function getPopularActors() {
  try {
    const res = await fetch(`${API.apiUrl}person/popular?api_key=${API.apiKey}&language=en-US`);
    const data = await res.json();
    const container = document.querySelector('.popular-actors');
    data.results.forEach(actor => {
      const knownFor = actor.known_for.map(work => work.title || work.name).join(', ');
      container.innerHTML += `
        <div class="actor-card">
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
        </div>
      `;
    });
  } catch (err) {
    console.error('Error fetching actors:', err);
  }
}

function createCard(item, type) {
  const title = item.title || item.name || 'Untitled';
  const year = (item.release_date || item.first_air_date || '').split('-')[0];
  const rating = item.vote_average || 'N/A';
  const overview = truncate(item.overview || 'No description.');
  const poster = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : './assets/placeholder.jpg';

  return `
    <div class="movie-card">
      <div class="poster">
        <img src="${poster}" alt="${title} Poster" />
        <div class="description-overlay">
          <div class="movie-info">
            <div class="movie-title">${title}</div>
            <div class="meta">
              <span class="year">${year}</span>
              <span class="rating">⭐ ${rating}</span>
            </div>
            <div class="description">${overview}</div>
            <a href="./moviedetail.html?id=${item.id}&type=${type}" class="see-more">See More <span class="arrow">→</span></a>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function fetchSearchResults(query, type = 'movie', page = 1) {
  const grid = document.getElementById('movie-grid');
  const headline = document.querySelector('.headline');
  const pageIndicator = document.querySelector('.carousel-controls h3');

  try {
    const url = `${API.apiUrl}search/${type}?api_key=${API.apiKey}&query=${encodeURIComponent(query)}&page=${page}&language=en-US`;
    const res = await fetch(url);
    const data = await res.json();

    grid.innerHTML = '';
    data.results.forEach(item => {
      grid.innerHTML += createCard(item, type);
    });

    headline.textContent = `Search Results for "${query}"`;
    const totalPages = data.total_pages > 1000 ? 1000 : data.total_pages;
    pageIndicator.textContent = `Page ${page} of ${totalPages}`;

    grid.dataset.query = query;
    grid.dataset.type = type;
    grid.dataset.page = page;
    grid.dataset.totalPages = totalPages;
  } catch (err) {
    console.error('Search error:', err);
  }
}

function handlePagination() {
  document.querySelectorAll('.carousel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const grid = document.getElementById('movie-grid');
      const query = grid.dataset.query;
      const type = grid.dataset.type;
      let page = Number(grid.dataset.page);
      const totalPages = Number(grid.dataset.totalPages);

      if (btn.classList.contains('right') && page < totalPages) {
        page++;
        fetchSearchResults(query, type, page);
      } else if (btn.classList.contains('left') && page > 1) {
        page--;
        fetchSearchResults(query, type, page);
      }
    });
  });
}

function initSearch() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q') || '';
  const type = urlParams.get('type') || 'movie';
  if (!query) return;

  fetchSearchResults(query, type, 1);
  handlePagination();

  const movieRadio = document.getElementById('movie');
  const tvRadio = document.getElementById('tv');
  if (type === 'movie') movieRadio.checked = true;
  if (type === 'tv') tvRadio.checked = true;
}

async function loadActorDetail() {
  const params = new URLSearchParams(window.location.search);
  const actorId = params.get('id');
  if (!actorId) return;

  try {
    const res = await fetch(`${API.apiUrl}person/${actorId}?api_key=${API.apiKey}&language=en-US`);
    const actor = await res.json();
    const creditsRes = await fetch(`${API.apiUrl}person/${actorId}/movie_credits?api_key=${API.apiKey}&language=en-US`);
    const creditsData = await creditsRes.json();

    const detailSection = document.querySelector('.detail');
    if (!detailSection) return;

    const topMovies = creditsData.cast.slice(0, 4).map(m => `<li>${m.title || m.name}</li>`).join('<span>| </span>');
    const allMovies = creditsData.cast.map(m => `<li>${m.title || m.name} (${(m.release_date || '').slice(0, 4) || 'N/A'})</li>`).join('');
    const backdropPath = creditsData.cast?.[0]?.backdrop_path || actor.profile_path;

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
          <ul class="casts">${topMovies}<li id="toggle-full-cast">See full cast →</li></ul>
          <ul id="full-cast-list">${allMovies}</ul>
          <p class="description">${actor.biography || 'No biography available.'}</p>
          <div class="movieslide">
            <a href="./index.html" class="btn-see-more">&lt;- Back to Home</a>
          </div>
        </div>
      </div>
    `;

    const bg = detailSection.querySelector('.detail-bg');
    if (bg && backdropPath) bg.style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${backdropPath})`;

    document.getElementById('toggle-full-cast').addEventListener('click', () => {
      const fullList = document.getElementById('full-cast-list');
      const toggle = document.getElementById('toggle-full-cast');
      const isVisible = fullList.style.display === 'block';
      fullList.style.display = isVisible ? 'none' : 'block';
      toggle.textContent = isVisible ? 'See full cast →' : 'Hide full cast ↑';
    });
  } catch (err) {
    console.error('Error loading actor details:', err);
  }
}

async function loadMediaDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const type = params.get('type') || 'movie';
  if (!id) return;

  try {
    const [detailsRes, creditsRes] = await Promise.all([
      fetch(`${API.apiUrl}${type}/${id}?api_key=${API.apiKey}&language=en-US`),
      fetch(`${API.apiUrl}${type}/${id}/credits?api_key=${API.apiKey}&language=en-US`)
    ]);

    const details = await detailsRes.json();
    const credits = await creditsRes.json();
    const detailSection = document.querySelector('.detail');
    if (!detailSection) return;

    const topCast = credits.cast.slice(0, 5).map(p => `<li>${p.name}</li>`).join('<span>|</span>');
    const fullCast = credits.cast.map(p => `<li>${p.name} as ${p.character}</li>`).join('');
    const tags = details.genres.map(g => `<li class="taglist">${g.name}</li>`).join('');

    detailSection.innerHTML = `
      <div class="detail-bg"></div>
      <div class="containerr">
        <div class="img">
          <img src="https://image.tmdb.org/t/p/w500${details.poster_path || details.backdrop_path}" alt="${details.title || details.name}" />
        </div>
        <div class="texts">
          <h1 class="rate">Rating : ⭐${details.vote_average.toFixed(1)}</h1>
          <p class="typeofmovie">${type === 'movie' ? 'Movie' : 'TV Series'}</p>
          <h1 class="title">${details.title || details.name}</h1>
          <h2 class="subtitle">${details.tagline || ''}</h2>
          <ul class="casts">${topCast}<li id="toggle-full-cast">See full cast →</li></ul>
          <ul id="full-cast-list">${fullCast}</ul>
          <p class="description">${details.overview}</p>
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

    document.querySelector('.detail-bg').style.backgroundImage = `url(https://image.tmdb.org/t/p/original${details.backdrop_path || details.poster_path})`;

    document.getElementById('toggle-full-cast').addEventListener('click', () => {
      const fullList = document.getElementById('full-cast-list');
      const toggle = document.getElementById('toggle-full-cast');
      const isVisible = fullList.style.display === 'block';
      fullList.style.display = isVisible ? 'none' : 'block';
      toggle.textContent = isVisible ? 'See full cast →' : 'Hide full cast ↑';
    });
  } catch (err) {
    console.error('Error loading media detail:', err);
  }
}
const moodKeywords = ['sad', 'angry', 'heartbroken', 'happy', 'uplifting', 'melancholic']; // Add more moods if needed

function extractMood(input) {
  const trashWords = ['i', 'feel', 'am', 'like', 'so', 'very', 'today', 'really', 'just', 'a', 'the', 'and'];
  const words = input
    .toLowerCase()
    .split(/\W+/)
    .filter(word => word && !trashWords.includes(word));

  const foundMood = words.find(word => moodKeywords.includes(word));
  return foundMood || null;
}

function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type') || 'movie'; // default to movies

  setupCarouselButtons();
  setupMobileMenuClose();
  highlightActiveNavLink();
  startHeroSlider(type);
  getPopular(type);
  getPopularActors();
}


document.addEventListener('DOMContentLoaded', () => {
  init();
  if (window.location.pathname.includes('search.html')) initSearch();
  if (window.location.pathname.includes('actordetail.html')) loadActorDetail();
  if (window.location.pathname.includes('moviedetail.html')) loadMediaDetail();
});
