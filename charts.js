const BaseChartsUrl = "https://chartfox.org/api/interface/charts/";
const ChartsUrlAppend = "?token=4E22356DC791F9416F8C21B48A99C";

const $Frame = $("#chartsFrame");
const $ChartsIcaoBox = $("#chartsIcaoTextbox");

const $ChartsButton = $("#icaoChartsBtn");

$ChartsIcaoBox.keypress(e => {
  var keycode = event.keyCode ? event.keyCode : event.which;
  if (keycode == "13") {
    $ChartsButton.click();
  }
});

$ChartsButton.click(() => {
  let icao = $ChartsIcaoBox.val();

  if (icao == "") {
    CreatePopUp({
      title: "No ICAO entered",
      body: "Please enter an ICAO code"
    });
    return;
  }

  if (icao.length != 4) {
    CreatePopUp({
      title: "Invalid ICAO",
      body: "Your ICAO code is invalid."
    });
    return;
  }

  $Frame.attr("src", `${BaseChartsUrl}${icao}${ChartsUrlAppend}`);
});

$("#depChartsBtn").click(() => {
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

  $ChartsIcaoBox.val(icao);
  $ChartsButton.click();
});

$("#arrChartsBtn").click(() => {
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

  $ChartsIcaoBox.val(icao);
  $ChartsButton.click();
});
