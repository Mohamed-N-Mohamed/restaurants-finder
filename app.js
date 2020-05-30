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
    const 

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

    return {
      categories,
      cityID
    };
  }
}
//UI class
class UI {
  constructor() {
    this.loader = document.querySelector(".loader");
    this.restaurantsList = document.getElementById("restaurant-list ");
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
            console.log(data)
          })
        }
      })
    }
  });
})();
