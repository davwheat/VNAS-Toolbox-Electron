const L = require("leaflet/dist/leaflet");

// Start at Gatwick Lat/Lon
let mymap = L.map("leafletMap", { attributionControl: false }).setView(
  [51.148056, -0.190278],
  8
);

const icon = L.Icon.extend({
  options: {
    iconSize: [48, 48], // size of the icon
    iconAnchor: [24, 24], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -12] // point from which the popup should open relative to the iconAnchor
  }
});

const b738 = new icon({ iconUrl: "img/planes/737-icon.svg" }),
  b788 = new icon({ iconUrl: "img/planes/787-icon.svg" });

{
  const VnasLiveMapApiUrl =
    "https://www.virtualnorwegian.net/inc/api_livemap.php";

  // P = Promise
  function GetAllNorwegianFlightsP() {
    return Promise.resolve($.get({ url: VnasLiveMapApiUrl }));
  }
  function PopulateMap() {
    if (!GetSetting("show_all_vnas_flights_on_map")) {
      return;
    }

    GetAllNorwegianFlightsP().then(flights => {
      if (myFlight != undefined) {
        L.marker([myFlight.Latitude, myFlight.Longitude], {
          icon: myFlight.AircraftType.startsWith("B78") ? b788 : b738
        })
          .addTo(mymap)
          .bindPopup(
            `You! // ${myFlight.ArrivalIcao} → ${myFlight.DepartureIcao}<br/>${
              myFlight.AltitudeASL
            }ft | ${myFlight.SpeedGS}kts | ${myFlight.Heading}°`
          );
      }

      flights.fromEach(flight => {
        // Skip user's own VNAS flight to prevent duplicate markers
        if (flight.userId.endsWith(GetSetting("vnas_username"))) return;

        L.marker([flight.aircraft.lat, flight.aircraft.lng], {
          icon: flight.aircraft.aircraft.startsWith("B78") ? b788 : b738
        })
          .addTo(mymap)
          .bindPopup(
            `${flight.flightNum} // ${flight.dep.icao} → ${
              flight.dep.icao
            }<br/>${flight.aircraft.altitude}ft | ${
              flight.aircraft.gndSpeed
            }kts | ${flight.aircraft.heading}°`
          );
      });
    });
  }
}
