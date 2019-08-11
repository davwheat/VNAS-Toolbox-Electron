const L = require("leaflet/dist/leaflet");
require("leaflet-rotatedmarker");

let markers = [];

$("#liveMapToggleVnas").value(GetSetting("show_all_vnas_flights_on_map"));

settings.watch("show_all_vnas_flights_on_map", val => {
  $("#liveMapToggleVnas").value(val);
});

$("#liveMapToggleVnas").click(() => {
  $("#Settings input[data-setting=show_all_vnas_flights_on_map]").click();
});

let osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
let osmAttribution = '<a href="https://openstreetmap.org">OpenStreetMap</a>';

let osm = new L.TileLayer(osmUrl, {
  attribution: osmAttribution,
  minZoom: 0,
  maxZoom: 19
});

// Start at Gatwick Lat/Lon
const mymap = L.map("leafletMap", {
  attributionControl: false,
  minZoom: 0,
  maxZoom: 19,
  center: [51.148056, -0.190278],
  zoom: 11,
  layers: [osm]
});

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
    console.log("Updated live map!");

    let temp;

    if (typeof myFlight != "undefined") {
      if (!GetSetting("show_all_vnas_flights_on_map")) {
        markers.forEach(marker => {
          if (marker == undefined) return;
          mymap.removeLayer(marker);
        });
        markers = [];
      }

      temp = L.marker([myFlight.Latitude, myFlight.Longitude], {
        icon: myFlight.AircraftType.startsWith("B78") ? b788 : b738,
        rotationAngle: myFlight.Heading
      }).bindPopup(
        `You! // ${myFlight.ArrivalIcao} → ${
          myFlight.DepartureIcao
        }<br/>${Math.floor(myFlight.AltitudeASL)}ft | ${Math.floor(
          myFlight.SpeedGS
        )}kts | ${Math.round(myFlight.Heading)}°`
      );

      if (!GetSetting("show_all_vnas_flights_on_map")) {
        temp.addTo(mymap);
        return;
      }
    }

    GetAllNorwegianFlightsP().then(f => {
      const flights = JSON.parse(f);

      markers.forEach(marker => {
        if (marker == undefined) return;
        mymap.removeLayer(marker);
      });
      markers = [temp];

      Array.from(flights).forEach(flight => {
        // Skip user's own VNAS flight to prevent duplicate markers
        if (flight.userId.endsWith(GetSetting("vnas_username"))) return;

        markers.push(
          L.marker([flight.aircraft.lat, flight.aircraft.lng], {
            icon: flight.aircraft.aircraft.startsWith("B78") ? b788 : b738,
            rotationAngle: flight.aircraft.heading
          }).bindPopup(
            `${flight.flightNum} // ${flight.dep.icao} → ${
              flight.arr.icao
            }<br/>${flight.aircraft.altitude}ft | ${
              flight.aircraft.gndSpeed
            }kts | ${flight.aircraft.heading}°`
          )
        );
      });

      markers.forEach(marker => {
        if (marker == undefined) return;
        marker.addTo(mymap);
      });
    });
  }
}

PopulateMap();
setInterval(PopulateMap, 45 * 1000);
