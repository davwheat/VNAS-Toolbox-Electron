{
  const { ChartFoxInterface, ChartFoxPrivate } = require("./api_keys");

  const ApiBaseUrl = "https://chartfox.org/api";

  const InterfaceBaseUrl = `${ApiBaseUrl}/interface/charts/`;
  const InterfaceQueryString = "?token=" + ChartFoxInterface;

  const $Frame = $("#chartsFrame");
  const $ChartsIcaoBox = $("#chartsIcaoTextbox");

  const $ChartsButton = $("#icaoChartsBtn");

  $ChartsIcaoBox.keydown(e => {
    var keycode = event.keyCode ? event.keyCode : event.which;
    if (keycode == "13") { // enter
      $ChartsButton.click();
      return true;
    } else if (keycode == "40") {
      $("#chartsIcaoTextboxAutocomplete li:first-child")[0].focus();
      return true;
    }
  });

  $ChartsIcaoBox.on("input", () => {
    $("#chartsIcaoTextboxAutocomplete").html("<li>Loading...</li>");
    GetSupportedAirports($ChartsIcaoBox.value()).then(val => {
      SetAutoComplete(val.airports);
    });
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

  function GetSupportedAirports(particalIcao = "") {
    return Promise.resolve(
      $.post(
        `${ApiBaseUrl}/airports/fullsupport/${particalIcao}`,
        { token: ChartFoxPrivate },
        null,
        "json"
      )
    );
  }

  function SetAutoComplete(airports) {
    console.log(airports);

    let h = "";

    airports.every((val, i) => {
      h += `<li tabindex="0" data-value="${val}">${val}</li>`;
      return i != 4;
    });

    $("#chartsIcaoTextboxAutocomplete").html(h);
  }
}
