
const scrollAmount = 300;
// For production with direct API calls
const API = {
  apiKey: 'c9155694f84e14b22ad2119ee91077cc',
  apiUrl: 'https://api.themoviedb.org/3/',
};
// For local development with the proxy server
// const API = {
//   apiKey: '',
//   apiUrl: 'http://localhost:5000/api/',
// };
const global = {
  currentPage: window.location.pathname,
};

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
  
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  
  const iconContainer = document.querySelector('.theme-toggle');
  iconContainer.innerHTML = isLight
    ? `<span class="icon"><i class="fas fa-sun"></i></span>`
    : `<span class="icon"><i class="fas fa-moon"></i></span>`;
}

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.classList.add(savedTheme);
  const iconContainer = document.querySelector('.theme-toggle');
  iconContainer.innerHTML = savedTheme === 'light'
    ? `<span class="icon"><i class="fas fa-sun"></i></span>`
    : `<span class="icon"><i class="fas fa-moon"></i></span>`;
});

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
function startHeroSlider(type = 'movie') {
  loadHeroCategory(type);
  setInterval(() => loadHeroCategory(type), 6000);
}

async function loadHeroCategory(type = 'movie') {
  const endpoint = type === 'tv' ? 'tv/top_rated' : 'movie/top_rated';
  const name = 'Top Rated';

  try {
    const res = await fetch(`${API.apiUrl}${endpoint}?api_key=${API.apiKey}&language=en-US`);
    const data = await res.json();
    const item = data.results?.[Math.floor(Math.random() * data.results.length)];

    if (!item) return;

    const heroTextContainer = document.getElementById('hero-textcontainer');
    const heroContainer = document.getElementById('hero');
    if (!heroTextContainer || !heroContainer) return;

    document.getElementById('category-badge').textContent = `> ${name}`;
    heroTextContainer.innerHTML = `
      <div class="hero-text">
        <h1 class="movie-title">${item.title || item.name}</h1>
        <p class="movie-description">${truncate(item.overview, 150)}</p>
      </div>
    `;
    heroContainer.style.background = `url(https://image.tmdb.org/t/p/original/${item.backdrop_path || item.poster_path || 'https://via.placeholder.com/1920x1080?text=No+Image'}) center/cover no-repeat`;

    const seeMoreLink = document.querySelector('.btn-see-more');
    const addBtn = document.querySelector('.btn-add');
if (addBtn) {
  addBtn.onclick = () => {
    addToWatchlist({
      id: item.id,
      type,
      title: item.title || item.name,
      poster_path: item.poster_path || item.backdrop_path,
      vote_average: item.vote_average,
      release_date: item.release_date || item.first_air_date,
      overview: item.overview
    });
  };
}

    if (seeMoreLink) {
      seeMoreLink.href = `./moviedetail.html?id=${item.id}&type=${type}`;
    }
  } catch (err) {
    console.error('Failed to load top-rated hero:', err);
  }
}

async function getPopular(type = 'movie') {
  try {
    const res = await fetch(`${API.apiUrl}${type}/popular?api_key=${API.apiKey}&language=en-US`);
    const data = await res.json();

    const title = type === 'movie' ? 'Popular Movies' : 'Popular TV Shows';
    const container = document.getElementById('movie-grid');
    document.querySelector('#popular-movies h2').textContent = title;

    container.innerHTML = '';
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
        <div class="actor-card" onclick="window.location.href='./actordetail.html?id=${actor.id}'">
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
  const year = (item.release_date || item.first_air_date || '').split('-')[0] || 'N/A';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
  const overview = truncate(item.overview || 'No description.');
  const poster = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Image';

  return `
    <div class="movie-card" onclick="window.location.href='./moviedetail.html?id=${item.id}&type=${type}'">
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

function initSearch() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q') || '';
  const initialType = urlParams.get('type') || 'movie';

  const movieRadio = document.getElementById('movie');
  const tvRadio = document.getElementById('tv');
  const grid = document.getElementById('movie-grid');

  if (movieRadio && tvRadio) {
    movieRadio.checked = initialType === 'movie';
    tvRadio.checked = initialType === 'tv';
  }

  if (query) {
    fetchSearchResults(query, initialType, 1);
  }

  if (movieRadio && tvRadio && grid) {
    [movieRadio, tvRadio].forEach(radio => {
      radio.addEventListener('change', () => {
        const selectedType = movieRadio.checked ? 'movie' : 'tv';
        const currentQuery = grid.dataset.query || query;
        if (currentQuery) {
          fetchSearchResults(currentQuery, selectedType, 1);
        }
      });
    });
  }

  handlePagination();
}

async function fetchSearchResults(query, type = 'movie', page = 1) {
  const grid = document.getElementById('movie-grid');
  const headline = document.querySelector('.headline');
  const pageIndicator = document.querySelector('.carousel-controls h3');

  if (!grid || !headline || !pageIndicator) return;

  try {
    const url = `${API.apiUrl}search/${type}?api_key=${API.apiKey}&query=${encodeURIComponent(query)}&page=${page}&language=en-US`;
    const res = await fetch(url);
    const data = await res.json();

    grid.innerHTML = '';
    if (data.results.length === 0) {
      grid.innerHTML = `<p>No results found for "${query}" in ${type === 'movie' ? 'movies' : 'TV shows'}.</p>`;
    } else {
      data.results.forEach(item => {
        grid.innerHTML += createCard(item, type);
      });
    }

    headline.textContent = `Search Results for "${query}"`;
    const totalPages = data.total_pages > 1000 ? 1000 : data.total_pages;
    pageIndicator.textContent = `Page ${page} of ${totalPages}`;

    grid.dataset.query = query;
    grid.dataset.type = type;
    grid.dataset.page = page;
    grid.dataset.totalPages = totalPages;
  } catch (err) {
    console.error('Search error:', err);
    grid.innerHTML = `<p>Error fetching results. Please try again.</p>`;
  }
}

function handlePagination() {
  document.querySelectorAll('.carousel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const grid = document.getElementById('movie-grid');
      if (!grid) return;

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
    document.querySelector('.btn-add').addEventListener('click', () => {
      addToWatchlist({
        id: details.id,
        type,
        title: details.title || details.name,
        poster_path: details.poster_path || details.backdrop_path,
        vote_average: details.vote_average,
        release_date: details.release_date || details.first_air_date,
        overview: details.overview
      });
    });
    
  } catch (err) {
    console.error('Error loading media detail:', err);
  }
}
function showCustomAlert(message = 'Added to Watchlist ✅') {
  const alertBox = document.getElementById('custom-alert');
  if (!alertBox) return;
  alertBox.textContent = message;
  alertBox.classList.add('show');
  setTimeout(() => {
    alertBox.classList.remove('show');
  }, 2000);
}

// Mood-based Search
const stopWords = new Set([
  "i", "me", "my", "myself", "feel", "am", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "but", "and", "or", "a", "an", "the", "in", "on",
  "at", "for", "to", "so", "very", "today", "really", "just"
]);

async function fetchSmartMatches(page = 1) {
  const grid = document.getElementById('movie-grid');
  const headline = document.querySelector('.headline');
  const pageIndicator = document.querySelector('.carousel-controls h3');
  const urlParams = new URLSearchParams(window.location.search);
  const mood = urlParams.get('q') || document.getElementById('mood-input')?.value.trim();

  grid.innerHTML = "finding the best match your mood ... ";

  if (!mood) {
    grid.innerHTML = "Give me a feeling.";
    return;
  }

  const words = mood
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  let keywordMap = new Map();
  let actorId = null;
  let actorName = null;

  for (let word of words) {
    try {
      const kwRes = await fetch(`${API.apiUrl}search/keyword?api_key=${API.apiKey}&query=${encodeURIComponent(word)}`);
      const kwData = await kwRes.json();
      if (kwData.results?.length) {
        keywordMap.set(word, kwData.results[0].id);
        continue;
      }

      const personRes = await fetch(`${API.apiUrl}search/person?api_key=${API.apiKey}&query=${encodeURIComponent(word)}`);
      const personData = await personRes.json();
      if (personData.results?.length) {
        actorId = personData.results[0].id;
        actorName = personData.results[0].name;
      }
    } catch (err) {
      console.error(`Error searching for ${word}:`, err);
    }
  }

  if (!keywordMap.size && !actorId) {
    grid.innerHTML = "Nothing matched your feelings or actors 😭";
    return;
  }

  const contentMap = new Map();
  let totalPages = 1;

  for (let [word, kid] of keywordMap) {
    const endpoints = [`discover/movie`, `discover/tv`];
    for (let type of endpoints) {
      try {
        const res = await fetch(`${API.apiUrl}${type}?api_key=${API.apiKey}&with_keywords=${kid}&sort_by=popularity.desc&page=${page}&language=en-US`);
        const data = await res.json();
        totalPages = Math.max(totalPages, data.total_pages > 1000 ? 1000 : data.total_pages);
        for (let item of data.results.slice(0, 10)) {
          const id = `${type}-${item.id}`;
          if (!contentMap.has(id)) {
            contentMap.set(id, { ...item, media_type: type.includes('movie') ? 'movie' : 'tv', matchCount: 1, matchedWords: new Set([word]) });
          } else {
            const existing = contentMap.get(id);
            existing.matchCount++;
            existing.matchedWords.add(word);
          }
        }
      } catch (err) {
        console.error(`Error fetching ${type} for keyword ${word}:`, err);
      }
    }
  }

  if (actorId) {
    try {
      const actorRes = await fetch(`${API.apiUrl}person/${actorId}/combined_credits?api_key=${API.apiKey}&language=en-US`);
      const actorData = await actorRes.json();
      for (let item of actorData.cast.slice(0, 10)) {
        const id = `${item.media_type}-${item.id}`;
        if (!contentMap.has(id)) {
          contentMap.set(id, { ...item, media_type: item.media_type, matchCount: 1, matchedWords: new Set([actorName]) });
        } else {
          const existing = contentMap.get(id);
          existing.matchCount++;
          existing.matchedWords.add(actorName);
        }
      }
    } catch (err) {
      console.error(`Error fetching credits for actor ${actorName}:`, err);
    }
  }

  const finalList = Array.from(contentMap.values());
  finalList.sort((a, b) => b.matchCount - a.matchCount);

  grid.innerHTML = '';
  if (finalList.length === 0) {
    grid.innerHTML = "No matches found for your mood or actors 😭";
    return;
  }

  finalList.slice(0, 12).forEach(item => {
    grid.innerHTML += createCard(item, item.media_type);
  });

  headline.textContent = `Best Match Your Mood "${mood}"`;
  pageIndicator.textContent = `Page ${page} of ${totalPages}`;

  grid.dataset.query = mood;
  grid.dataset.type = 'multi';
  grid.dataset.page = page;
  grid.dataset.totalPages = totalPages;
}

function handleMoodPagination() {
  document.querySelectorAll('.carousel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const grid = document.getElementById('movie-grid');
      const query = grid.dataset.query;
      let page = Number(grid.dataset.page);
      const totalPages = Number(grid.dataset.totalPages);

      if (btn.classList.contains('right') && page < totalPages) {
        page++;
        fetchSmartMatches(page);
      } else if (btn.classList.contains('left') && page > 1) {
        page--;
        fetchSmartMatches(page);
      }
    });
  });
}

function initMoodSearch() {
  const heroMoodSubmit = document.getElementById('mood-submit');
  const heroMoodInput = document.getElementById('mood-input');
  if (heroMoodSubmit && heroMoodInput) {
    heroMoodSubmit.addEventListener('click', () => {
      const mood = heroMoodInput.value.trim();
      if (mood) {
        window.location.href = `./mood.html?q=${encodeURIComponent(mood)}`;
      }
    });
    heroMoodInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const mood = heroMoodInput.value.trim();
        if (mood) {
          window.location.href = `./mood.html?q=${encodeURIComponent(mood)}`;
        }
      }
    });
  }

  const moodSubmit = document.getElementById('mood-submit');
  const moodInput = document.getElementById('mood-input');
  if (moodSubmit && moodInput) {
    moodSubmit.addEventListener('click', () => fetchSmartMatches(1));
    moodInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') fetchSmartMatches(1);
    });
  }

  // Check for query parameter on mood.html
  if (window.location.pathname.includes('mood.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
      const moodInput = document.getElementById('mood-input');
      if (moodInput) {
        moodInput.value = query;
        fetchSmartMatches(1);
      }
    }
    handleMoodPagination();
  }
}
function loadWatchlist(page = 1) {
  const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
  const container = document.getElementById('movie-grid');
  const headline = document.querySelector('.headline');
  const pageIndicator = document.querySelector('.carousel-controls h3');

  if (!container) return;

  const perPage = 12;
  const totalPages = Math.ceil(watchlist.length / perPage);

  if (watchlist.length === 0) {
    container.innerHTML = "<p>Your Watchlist is empty 😢</p>";
    if (headline) headline.textContent = `Your Watch List`;
    if (pageIndicator) pageIndicator.textContent = ``;
    return;
  }

  // Save current page to dataset for navigation
  container.dataset.page = page;
  container.dataset.totalPages = totalPages;

  // Clear and show paginated items
  container.innerHTML = '';
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const currentItems = watchlist.slice(start, end);

  currentItems.forEach(item => {
    container.innerHTML += createCard(item, item.type);
  });

  if (headline) headline.textContent = `Your Watch List (${watchlist.length})`;
  if (pageIndicator) pageIndicator.textContent = `Page ${page} of ${totalPages}`;
}

function addToWatchlist(item) {
  const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
  const exists = watchlist.some(w => w.id === item.id && w.type === item.type);
  if (!exists) {
    watchlist.push(item);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    showCustomAlert(`${item.title || item.name} added to Watchlist ✅`);
  } else {
    showCustomAlert(`${item.title || item.name} is already in your Watchlist!`);
  }
}

function setupWatchlistPagination() {
  const container = document.getElementById('movie-grid');
  const leftBtn = document.querySelector('.carousel-btn.left');
  const rightBtn = document.querySelector('.carousel-btn.right');

  if (!container || !leftBtn || !rightBtn) return;

  leftBtn.addEventListener('click', () => {
    let page = Number(container.dataset.page);
    if (page > 1) loadWatchlist(page - 1);
  });

  rightBtn.addEventListener('click', () => {
    let page = Number(container.dataset.page);
    const total = Number(container.dataset.totalPages);
    if (page < total) loadWatchlist(page + 1);
  });
}

function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type') || 'movie';

  setupCarouselButtons();
  setupMobileMenuClose();
  highlightActiveNavLink();
  startHeroSlider(type);
  getPopular(type);
  getPopularActors();
  initMoodSearch();
}

document.addEventListener('DOMContentLoaded', () => {
  init();
  if (window.location.pathname.includes('search.html')) initSearch();
  if (window.location.pathname.includes('actordetail.html')) loadActorDetail();
  if (window.location.pathname.includes('moviedetail.html')) loadMediaDetail();
  if (window.location.pathname.includes('list.html')){
     loadWatchlist();
     setupWatchlistPagination();
  }
});
