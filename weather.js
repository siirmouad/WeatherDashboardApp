// var displayWeatherDiv = $("#displayWeather");
// //declare KEY as serchHistory to avoid error of mispronunction
// var KEY = "searchHistory";
// //Get item from the local storage
// var searchHistory = localStorage.getItem(KEY);
// //Convert the data to An Array so we can use it
// searchHistory = JSON.parse(searchHistory);
// //If No data exists return an Empty Array
// if (!searchHistory) {
//   searchHistory = [];
// }
// console.log(searchHistory);
$(document).ready(function () {
  $("#search-button").on("click", function () {
    //event.preventDefault();
    var searchValue = $("#search-value").val();
    searchWeather(searchValue);
    //clear input box
    $("#search-value").val("");
  });
  $(".history").on("click", "li", function () {
    searchWeather($(this).text());
  });

  function makeRow(text) {
    var li = $("<li>")
      .addClass("list-group-item list-group-item-action")
      .text(text);
    $(".history").append(li);
  }
  //example api get requset
  //display forecast weather
  //api.openweathermap.org/data/2.5/find?q=London&units=imperial
  function searchWeather(searchValue) {
    $.ajax({
      type: "GET",
      url:
        "https://api.openweathermap.org/data/2.5/weather?q=" +
        searchValue +
        "&units=imperial&appid=9ceda99e55e14abcb246a0165e87a029",
      dataType: "json",
      success: function (data) {
        //create history link for this search
        if (history.indexOf(searchValue) === -1) {
          //push the data from searchValue into the array searchHistory
          history.push(searchValue);
          //store the searchHistory Array after switch to a string in the  local storage
          window.localStorage.setItem("history", JSON.stringify(history));
          makeRow(searchValue);
        }
        //clear any old content
        $("#today").empty();
        //create html content dynamically with jquery for current weather to display
        var title = $("<h3>")
          .addClass("card-title")
          .text(data.name + " (" + new Date().toLocaleDateString() + ")");
        var card = $("<div>").addClass("card");
        var temp = $("<p>")
          .addClass("card-text")
          .text("Temperature: " + data.main.temp + " F");
        var humid = $("<p>")
          .addClass("card-text")
          .text("Humidity: " + data.main.humidity + "%");
        var wind = $("<p>")
          .addClass("card-text")
          .text("Wind Speed: " + data.wind.speed + " MPH");
        var cardBody = $("<div>").addClass("card-body");
        var img = $("<img>").attr(
          "src",
          "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png"
        );

        // merge and add to the page
        title.append(img);
        cardBody.append(title, temp, humid, wind);
        card.append(cardBody);
        $("#today").append(card);

        // call follow up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      },
    });
  }

  //changed the getForcast url ajax call to the correct format 1900 thur jun 11 2020

  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url:
        "https://api.openweathermap.org/data/2.5/forecast?q=" +
        searchValue +
        "&units=imperial&appid=9ceda99e55e14abcb246a0165e87a029",
      dataType: "json",
      //change from a .then promise to a success method function
      success: function (data) {
        // don't need this for now - var results = response.list;

        //we need to overwrite any existing content with title and empty row
        $("#forecast")
          .html('<h4 class="mt-3">5-Day Forecast:</h4>')
          .append('<div class="row">');

        //now this is where you loop over all the forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          //only look at forecasts around 3:00pm:
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            var col = $("<div>").addClass("col-md-2");
            var card = $("<div>").addClass("card bg-primary text-white");
            var body = $("<div>").addClass("card-body p-2");

            var title = $("<h5>")
              .addClass("card-title")
              .text(new Date(data.list[i].dt_txt).toLocaleDateString());

            var img = $("<img>").attr(
              "src",
              "http://openweathermap.org/img/w/" +
                data.list[i].weather[0].icon +
                ".png"
            );

            var p1 = $("<p>")
              .addClass("card-text")
              .text("Temp: " + data.list[i].main.temp_max + " F");
            var p2 = $("<p>")
              .addClass("card-text")
              .text("Humidity: " + data.list[i].main.humidity + "%");

            // merge together and put on page
            col.append(card.append(body.append(title, img, p1, p2)));
            $("#forecast .row").append(col);
          }
        }
      },
    });
  }

  // function displayDate() {
  //     document.getElementById("#today").innerHTML = Date();
  //     // Date = moment().format("LL");
  //     // var #todayEl = $('.date[data-day="0"]');
  //     // #todayEl.text(#today);
  // }
  // displayDate();
  // // display current date next to city
  // //Creating the forecast weather cards using jQuery
  // function forecastWeatherTile(data) {}

  //removed the getForecast ajax here and added it to line 84

  function getUVIndex(lat, lon) {
    //ajax call here for the lat and lon - similar to the last two ajax calls, but the
    //url is /uvi endpoint instead of /weather and /forecast
    $.ajax({
      type: "GET",
      url:
        "http://api.openweathermap.org/data/2.5/uvi?appid=9ceda99e55e14abcb246a0165e87a029&lat=" +
        lat +
        "&lon=" +
        lon,
      dataType: "json",
      success: function (data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        //change color depending on uv value
        if (data.value < 3) {
          btn.addClass("btn-success");
        } else if (data.value < 7) {
          btn.addClass("btn-warning");
        } else {
          btn.addClass("btn-danger");
        }
        $("#today .card-body").append(uv.append(btn));
      },
    });
  }

  //}make sure to close ajax call here
  // //get the current history if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length - 1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
