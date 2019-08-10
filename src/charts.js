{
  const { ChartFoxInterface, ChartFoxPrivate } = require("./api_keys");

  const ApiBaseUrl = "https://chartfox.org/api";

  const InterfaceBaseUrl = `${ApiBaseUrl}/interface/charts/`;
  const InterfaceQueryString = "?token=" + ChartFoxInterface;

  const $Frame = $("#chartsFrame");
  const $ChartsIcaoBox = $("#chartsIcaoTextbox");

  const $ChartsButton = $("#icaoChartsBtn");

  $ChartsIcaoBox.keydown(e => {
    var key = event.key;
    if (key == "Enter") {
      $ChartsButton.click();
    }
  });

  $ChartsButton.click(() => {
    let icao = $ChartsIcaoBox.val();

    if (icao == "") {
      CreatePopUp({
        title: "Error #52",
        body: "Please enter an ICAO code"
      });
      return;
    }

    if (icao.length != 4) {
      CreatePopUp({
        title: "Error #51",
        body: "Your ICAO code is invalid."
      });
      return;
    }

    $Frame.attr("src", `${InterfaceBaseUrl}${icao}${InterfaceQueryString}`);
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
        title: "Error #51",
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
        title: "Error #51",
        body: "Invalid ICAO code. Must be 4 characters exactly."
      });
      return;
    }

    $ChartsIcaoBox.val(icao);
    $ChartsButton.click();
  });
}
