{
  const { ChartFoxInterface, ChartFoxPrivate } = require("./api_keys");

  const ApiBaseUrl = "https://chartfox.org/api";

  // const InterfaceBaseUrl = `${ApiBaseUrl}/interface/charts/`;
  // const InterfaceQueryString = "?token=" + ChartFoxInterface;

  // const $Frame = $("#chartsFrame");
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

    // $Frame.attr("src", `${InterfaceBaseUrl}${icao}${InterfaceQueryString}`);
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

  function GetAllCharts(icao) {
    return Promise.resolve(
      $.post(
        `${ApiBaseUrl}/charts/grouped/${icao}`,
        { token: ChartFoxPrivate },
        null,
        "json"
      )
    );
  }

  function GetUkChartUrl(pseudoUrl) {
    $.ajax({
      url: pseudoUrl,
      async: false
    });
  }

  function ProcessCharts(input) {
    const charts = input.charts;

    let AllCharts = {
      "Unknown/General": [],
      "Textual Data": [],
      "Ground Layout": [],
      SID: [],
      STAR: [],
      Approach: [],
      Transition: [],
      "Pilot Briefing": []
    };

    console.log(charts);

    for (const i in charts) {
      if (charts.hasOwnProperty(i)) {
        const chartGroup = charts[i];

        console.log("group");
        console.log(chartGroup);

        for (const chart of chartGroup.charts) {
          console.log("chart");
          console.log(chart);

          let goodUrl = charts.url;
          if (goodUrl == null) {
            $.get({
              url: "https://immense-tor-37206.herokuapp.com/" + chart.pseudo_url
            }).then(_, __, response => {
              AllCharts[chart.type].push({
                name: chart.name,
                id: chart.identifier,
                type: chart.type,
                runway: chart.runway,
                url: response.url
              });
            });
          } else {
            AllCharts[chart.type].push({
              name: chart.name,
              id: chart.identifier,
              type: chart.type,
              runway: chart.runway,
              url: charts.url || GetUkChartUrl(chart.pseudo_url)
            });
          }
        }
      }
    }
  }
}
