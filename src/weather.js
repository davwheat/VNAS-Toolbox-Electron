const ParseMETAR = require("metar");

const MetarBaseURL = "http://metar.vatsim.net/metar.php?id=";

const $WeatherIcaoBox = $("#weatherIcaoTextbox");

const $WeatherButton = $("#icaoWeatherBtn");

const $WeatherDisplayBox = $("#decodedMetarBox");

$WeatherIcaoBox.keypress(e => {
  var keycode = event.keyCode ? event.keyCode : event.which;
  if (keycode == "13") {
    $WeatherButton.click();
  }
});

$WeatherButton.click(() => {
  let icao = $WeatherIcaoBox.val();

  if (icao.length != 4) {
    CreatePopUp({
      title: "Invalid ICAO",
      body: "Your ICAO code is invalid."
    });
    return;
  }

  $WeatherDisplayBox.val("Getting METAR...");

  $.get({ url: `${MetarBaseURL}${icao}` })
    .done(result => {
      $WeatherDisplayBox.val(MetarToHumanString(result));
    })
    .fail(() => {
      $WeatherDisplayBox.val(`Failed to fetch METAR for ${icao.toUpperCase()}`);
    });
});

$("#depWeatherBtn").click(() => {
  if (myFlight == undefined) {
    CreatePopUp({
      title: "Error #50",
      body:
        "You must set up your flight first because I don't know where you're going."
    });
    return;
  }

  let icao = myFlight.DepartureIcao;

  if (icao.length != 4) {
    CreatePopUp({
      title: "Invalid ICAO code",
      body: "Invalid ICAO code. Must be 4 characters exactly."
    });
    return;
  }

  $WeatherIcaoBox.val(icao);
  $WeatherButton.click();
});

$("#arrWeatherBtn").click(() => {
  if (myFlight == undefined) {
    CreatePopUp({
      title: "Error #50",
      body:
        "You must set up your flight first because I don't know where you're going."
    });
    return;
  }

  let icao = myFlight.ArrivalIcao;

  if (icao.length != 4) {
    CreatePopUp({
      title: "Invalid ICAO code",
      body: "Invalid ICAO code. Must be 4 characters exactly."
    });
    return;
  }

  $WeatherIcaoBox.val(icao);
  $WeatherButton.click();
});

function MetarToHumanString(m) {
  let obj = ParseMETAR(m);

  let weather = "";
  let clouds = "";

  if (obj["weather"] != null) {
    obj["weather"].forEach(element => {
      weather += element["meaning"] + " ";
    });
  }

  if (obj["clouds"] != null) {
    obj["clouds"].forEach(c => {
      clouds += `${c["meaning"]} ${c["cumulonimbus"] ? "cumulonimbus " : ""}@ ${
        c["altitude"]
      } ft; `;
    });
  }

  return `RAW: ${m}
Observation info: ${obj["station"]} // ${new Date(obj["time"]).toGMTString()}${
    obj["auto"] ? " // AUTOMATED" : ""
  }
Wind: ${obj["wind"]["direction"]} @ ${obj["wind"]["speed"]}kt${
    obj["wind"]["gust"] != null ? ` gusting ${obj["wind"]["gust"]}kt` : ""
  }${
    obj["wind"]["variation"] != null
      ? ` variable between ${obj["wind"]["variation"]["min"]} and ${
          obj["wind"]["variation"]["max"]
        }`
      : ""
  }
Visibility: ${
    obj["visibility"] == 9999 ? "10 km or more" : `${obj["visibility"]} m`
  }
Temperature: ${obj["temperature"]} degrees
Dew point: ${obj["dewpoint"]} degrees
Altimeter: ${obj["altimeterInHpa"] || obj["altimeterInHg"]} ${
    obj["altimeterInHg"] == undefined ? "hPa" : "inHg"
  }${
    weather == ""
      ? ""
      : `
Weather: ${weather}`
  }
Clouds: ${clouds}`;
}
