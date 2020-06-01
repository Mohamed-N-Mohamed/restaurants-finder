class ZOMATO {
  constructor() {
    this.api = "757d88d07b0faa7bce787721dae7e969";
    this.header = {
      method: "GET",
      headers: {
        "user-key": this.api,
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
    };
  }

  async searchApi(location, categoryID) {
    const categoryURL = `https://developers.zomato.com/api/v2.1/categories`;
    const city = `https://developers.zomato.com/api/v2.1/cities?q=${location}`;
    

    const categoryInfo = await fetch(categoryURL, this.header);
    const data = await categoryInfo.json();
    const categories = data.categories;

    const cityInfo = await fetch(city, this.header);
    const cityJSON = await cityInfo.json();
    const cityLocation = cityJSON.location_suggestions;

    let cityID = 0;
    if(cityLocation.length > 0){
      cityID = cityLocation[0].id

    }

    const restaurantURL = `https://developers.zomato.com/api/v2.1/search?entity_id=280&entity_type=${cityID}&category=${categoryID}&sort=rating`

    const restaurantInfo = await fetch(restaurantURL, this.header);
    const restaurantJSON = await restaurantInfo.json();
    const restaurants = restaurantJSON.restaurants;

    return {
      categories,
      cityID,
      restaurants
    };
  }
}
//UI class
class UI {
  constructor() {
    this.loader = document.querySelector(".loader");
    this.restaurantsList = document.getElementById("restaurant-list");
  }

  addSelectOption(categories) {
    const search = document.getElementById("searchCategory");
    let output = `<option value='0'> selected category</option>`;

    categories.forEach((element) => {
      output += `<option value="${element.categories.id}">${element.categories.name}</option>`;
    });

    search.innerHTML = output;
  }

  showFeedback(msg) {
    const feedback = document.querySelector(".feedback");
    feedback.classList.add("showItem");
    feedback.innerHTML = `<p>${msg}</p>`;
    setTimeout(() => {
      feedback.classList.remove("showItem");
    }, 2000);
  }

  showLoader(){
    this.loader.classList.add('showItem')
  }
  hideLoader(){
    this.loader.classList.remove('showItem')
  }

  getRestaurants(restaurants){
    this.hideLoader();
    if(restaurants.length === 0){
      this.showFeedback('no such categoris exit in the selected city');
    } else {
      this.restaurantsList.innerHTML = '';
      restaurants.forEach((restaurant) => {
        const {thumb:img, name, location:{address}, user_rating:{aggregate_rating},cuisines, average_cost_for_two:cost, menu_url, url } = restaurant.restaurant;
        

      if(img !== ''){
        this.showRestaurant(img, name, address, aggregate_rating, cuisines, cost, menu_url, url)
      }

      })
    }

  }

  showRestaurant(img, name, address, aggregate_rating, cuisines, cost, menu_url, url){
    const div = document.createElement('div');
    div.classList.add('col-11', 'mx-auto', 'my-3', 'col-md-4');
    div.innerHTML = ` <div class="card">
    <div class="card">
      <div class="row p-3">
        <div class="col-5">
          <img src="${img}" class="img-fluid img-thumbnail" alt="">
        </div>
        <div class="col-5 text-capitalize">
          <h6 class="text-uppercase pt-2 redText">${name}</h6>
          <p>${address}</p>
        </div>
        <div class="col-1">
          <div class="badge badge-success">
            ${aggregate_rating}
          </div>
        </div>
      </div>
      <hr>
      <div class="row py-3 ml-1">
        <div class="col-5 text-uppercase ">
          <p>cousines :</p>
          <p>cost for two :</p>
        </div>
        <div class="col-7 text-uppercase">
        <p>${cuisines}</p>
        <p>${cost}</p>
        </div>
      </div>
      <hr>
      <div class="row text-center no-gutters pb-3">
        <div class="col-6">
          <a href="${menu_url}" target="_blank" class="btn redBtn  text-uppercase"><i class="fas fa-book"></i> menu</a>
        </div>
        <div class="col-6">
          <a href="${url}" target="_blank" class="btn redBtn  text-uppercase"><i class="fas fa-book"></i> website</a>
        </div>
      </div>
    </div>
  </div>`;
  this.restaurantsList.appendChild(div)
   

  }
}

(function () {
  const searchForm = document.getElementById("searchForm");
  const searchCity = document.getElementById("searchCity");
  const searchCategory = document.getElementById("searchCategory");

  const zomato = new ZOMATO();
  const ui = new UI();

  document.addEventListener("DOMContentLoaded", () => {
    zomato.searchApi().then((data) => ui.addSelectOption(data.categories));
  });

  //submit search form
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const city = searchCity.value.toLowerCase();
    const categoryID = parseInt(searchCategory.value);

    if (city === "" || categoryID === 0) {
      ui.showFeedback("please enter a city and select category");
    } else {
      zomato.searchApi(city).then(cityData => {
        if(cityData.cityID === 0){
          ui.showFeedback('please enter a valid city')
        } else {
          ui.showLoader();
          zomato.searchApi(city, categoryID).then(data => {
            ui.getRestaurants(data.restaurants)
          })
        }
      })
    }
  });
})();
