// axios to get API data
const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = `${BASE_URL}/api/v1/movies/`;
const POSTER_URL = `${BASE_URL}/posters/`;
const MOVIES_PER_PAGE = 12;

// Data array
const movies = [];
let filteredMovies = [];
let cardMode = true;
let onPageIndex = 1

// DOM
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const listModeButton = document.querySelector("#list-mode");
const cardModeButton = document.querySelector("#card-mode");

//Processing
axios.get(INDEX_URL).then((response) => {
  //Array(80)
  movies.push(...response.data.results);
  renderPaginator(movies.length);
  renderMovieList(getMoviesByPage(1), cardMode);
});

dataPanel.addEventListener("click", function onPanelClicked(event) {
  let target = event.target;
  if (target.matches(".btn-show-movie")) {
    showMovieModal(Number(target.dataset.id));
  } else if (target.matches(".btn-add-favorite")) {
    addToFavorite(Number(target.dataset.id));
  }
});

paginator.addEventListener("click", (event) => {
  const target = event.target
  const movie = getMoviesByPage(target.dataset.page)
  onPageIndex = target.dataset.page
  console.log(onPageIndex)
  if (target.tagName !== "A") return
  renderMovieList(movie, cardMode)
})

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  if (!keyword.length) {
    return alert("Please enter a valid string !");
  }

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (filteredMovies.length === 0) {
    return alert(`Cannot find movies with keyword : ${keyword}`);
  }
  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage(onPageIndex), cardMode);
  console.log(cardMode)
  console.log(onPageIndex)
});

listModeButton.addEventListener("click", function onListButtonClicked(event) {
  console.log("switch to list mode.");
  cardMode = false;
  console.log(cardMode);
  renderMovieList(getMoviesByPage(onPageIndex), cardMode)
});

cardModeButton.addEventListener("click", function onCardButtonClicked(event) {
  console.log("switch to card mode.");
  cardMode = true;
  console.log(cardMode);
  renderMovieList(getMoviesByPage(onPageIndex), cardMode)
});

//Encapsulation function part
function renderMovieList(data, status) {
  let rawHTML = ""
  //processing
  if (cardMode === true) {
    data.forEach((item) => {
      rawHTML += `
        <div class="col-sm-3"> <!--Use bootstrap grid system to build layout--> <div class="mb-2"> <!--cards--> <div class="card"> <img src=${POSTER_URL + item.image} class="card-img-top" alt="Movie Poster"> <div class="card-body"> <h5 class="card-title">${item.title}</h5> </div> <div class="card-footer"> <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id=${item.id}>More</button> <button class="btn btn-primary btn-add-favorite" data-id=${item.id}>+</button> </div> </div> </div> </div>
      `
    })
  } else {
    data.forEach((item) => {
      rawHTML += `
        <div class="col-12 d-flex align-items-center justify-content-center pl-4 pr-0 m-2"> <p class="card-title col-6 m-0">${item.title}</p> <button class="btn btn-primary btn-show-movie col-4 btn-show-movie-list" data-toggle="modal" data-target="#movie-modal" data-id=${item.id}>More</button> <button class="btn btn-primary btn-add-favorite col-2 btn-add-favorite-list" data-id=${item.id}>+</button> </div>
      `
    })
  }

  //rendering
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(number) {
  const numberOfPages = Math.ceil(number / MOVIES_PER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>
    `;
  }
  paginator.innerHTML = rawHTML;
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  const endIndex = startIndex + MOVIES_PER_PAGE;
  return data.slice(startIndex, endIndex);
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerHTML = data.title;
    modalDate.innerHTML = `Release date =${data.release_date}`;
    modalDescription.innerHTML = data.description;
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster"
                class="img-fluid">`;
  });
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    alert("It's already in the favorite list");
  } else {
    list.push(movie);
  }
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}
