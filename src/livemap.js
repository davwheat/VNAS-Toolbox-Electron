const L = require("leaflet/dist/leaflet");
require("leaflet-rotatedmarker");
require("leaflet-arc");

var BingLayer = L.TileLayer.extend({
  getTileUrl: function (tilePoint) {
    //this._adjustTilePoint(tilePoint);
    return L.Util.template(this._url, {
      s: this._getSubdomain(tilePoint),
      q: this._quadKey(tilePoint.x, tilePoint.y, this._getZoomForUrl())
    });
  },
  _quadKey: function (x, y, z) {
    var quadKey = [];
    for (var i = z; i > 0; i--) {
      var digit = "0";
      var mask = 1 << (i - 1);
      if ((x & mask) != 0) {
        digit++;
      }
      if ((y & mask) != 0) {
        digit++;
        digit++;
      }
      quadKey.push(digit);
    }
    return quadKey.join("");
  }
});

function GenerateFlightPopup(
  flightNum,
  from,
  to,
  alt,
  gs,
  hdg,
  userId,
  name = undefined,
  percent = undefined
) {
  return `<b>${flightNum} | ${from} → ${to}${
    name == undefined ? "" : ` (${percent})`
  }</b><br/>${alt}ft ASL | ${gs}kt | HDG ${hdg}°<br/>${userId}${
    name == undefined ? "" : ` - ${name}`
  }`;
}

let mapItems = [];
let ownFlight;

$("#liveMapToggleVnas").value(GetSetting("show_all_vnas_flights_on_map"));

settings.watch("show_all_vnas_flights_on_map", val => {
  $("#liveMapToggleVnas").value(val);
});

$("#liveMapToggleVnas").click(() => {
  $("#Settings input[data-setting=show_all_vnas_flights_on_map]").click();
});

const osm = new L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Map data & imagery: <a href=\"#\" onclick=\"require('electron').shell.openExternal('https://openstreetmap.org')\">© OpenStreetMap contributors</a>",
    minZoom: 1,
    maxZoom: 19
  }
);

const openTopo = new L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution: "Map Data: <a href=\"#\" onclick=\"require('electron').shell.openExternal('https://openstreetmap.org/copyright')\">© OpenStreetMap contributors</a> | Imagery: <a href=\"#\" onclick=\"require('electron').shell.openExternal('http://opentopomap.org/')\">© OpenTopoMap</a> (<a href=\"#\" onclick=\"require('electron').shell.openExternal('https://creativecommons.org/licenses/by-sa/3.0/')\">CC-BY-SA</a>)",
    minZoom: 1,
    maxZoom: 17
  }
);

const satellite = new L.tileLayer(
  "https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}{r}.jpg?key=FCxcrAwhY1uAsPwUr6r3", {
    attribution: 'Map Data: <a href="#" onclick="require(\'electron\').shell.openExternal(\'https://www.openstreetmap.org/copyright\')">© OpenStreetMap contributors</a> | Imagery: <a href="#" onclick="require(\'electron\').shell.openExternal(\'https://www.maptiler.com/copyright/\')" target="_blank">© MapTiler</a>',
    tileSize: 512,
    minZoom: 1,
    maxZoom: 19,
    zoomOffset: -1
  }
);

const bingSatellite = new BingLayer(
  "http://r{s}.ortho.tiles.virtualearth.net/tiles/a{q}.jpeg?g=136", {
    minZoom: 1,
    maxZoom: 19,
    subdomains: [0, 1, 2, 3],
    attribution: "<a href=\"#\" onclick=\"require('electron').shell.openExternal('http://bing.com/maps')\">© Bing Maps</a>"
  }
);

const mapLayers = {
  OpenStreetMap: osm,
  OpenTopography: openTopo,
  Satellite: satellite,
  "HD Satellite (no labels)": bingSatellite
};

// Start at Gatwick Lat/Lon
const leafletLiveMap = L.map("leafletMap", {
  center: [51.148056, -0.190278],
  zoom: 8,
  layers: [osm],
  maxBoundsViscosity: 0.5,
  zoomAnimationThreshold: 19
});
leafletLiveMap.setMaxBounds([
  [-90, -180],
  [90, 180]
]);

leafletLiveMap.attributionControl.setPrefix(false);

L.control.layers(mapLayers).addTo(leafletLiveMap);

const icon = L.Icon.extend({
  options: {
    iconSize: [48, 48], // size of the icon
    iconAnchor: [24, 24], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -12] // point from which the popup should open relative to the iconAnchor
  }
});

const b738 = new icon({
    iconUrl: "img/planes/737-icon.svg"
  }),
  b788 = new icon({
    iconUrl: "img/planes/787-icon.svg"
  });

{
  const VnasLiveMapApiUrl =
    "https://www.virtualnorwegian.net/inc/api_livemap.php";

  // P = Promise
  function GetAllNorwegianFlightsP() {
    return Promise.resolve($.get({
      url: VnasLiveMapApiUrl
    }));
  }

  function AddOwnFlightToMap() {
    if (typeof myFlight != "undefined") {
      if (ownFlight != undefined) leafletLiveMap.removeLayer(ownFlight);
      ownFlight = undefined;

      ownFlight = L.marker([myFlight.Latitude, myFlight.Longitude], {
        icon: myFlight.AircraftType.startsWith("B78") ? b788 : b738,
        rotationAngle: myFlight.Heading
      }).bindPopup(
        GenerateFlightPopup(
          "You!",
          myFlight.DepartureIcao,
          myFlight.ArrivalIcao,
          Math.floor(myFlight.AltitudeASL),
          Math.floor(myFlight.SpeedGS),
          Math.round(myFlight.Heading),
          GetSetting("vnas_username")
        )
      );

      ownFlight.addTo(leafletLiveMap);
    }
  }

  function PopulateMap() {
    console.log("Updated live map!");

    GetAllNorwegianFlightsP().then(f => {
      const flights = JSON.parse(f);

      mapItems.forEach((marker, i) => {
        if (marker == undefined) return;
        leafletLiveMap.removeLayer(marker[0]);
      });

      mapItems = [];

      Array.from(flights).forEach(flight => {
        // Skip user's own VNAS flight to prevent duplicate markers
        if (flight.userId == GetSetting("vnas_username").substr(3)) return;

        mapItems.push([
          L.marker([flight.aircraft.lat, flight.aircraft.lng], {
            icon: flight.aircraft.aircraft.startsWith("B78") ? b788 : b738,
            rotationAngle: flight.aircraft.heading
          }).bindPopup(
            GenerateFlightPopup(
              flight.flightNum,
              flight.dep.icao,
              flight.arr.icao,
              flight.aircraft.altitude,
              flight.aircraft.gndSpeed,
              flight.aircraft.heading,
              "NAX" + flight.userId,
              flight.userName,
              flight.progress
            )
          ),
          L.Polyline.Arc(
            [flight.dep.lat, flight.dep.lng],
            [flight.aircraft.lat, flight.aircraft.lng], {
              color: "#d81939",
              vertices: 250
            }
          ),
          L.Polyline.Arc(
            [flight.aircraft.lat, flight.aircraft.lng],
            [flight.arr.lat, flight.arr.lng], {
              color: "#d81939",
              vertices: 250
            }
          )
        ]);
      });

      mapItems.forEach(marker => {
        if (marker[0] == undefined) return;
        marker[0].on("mouseover", () => {
          marker[1].addTo(leafletLiveMap);
          marker[2].addTo(leafletLiveMap);
        });
        marker[0].on("mouseout", () => {
          leafletLiveMap.removeLayer(marker[1]);
          leafletLiveMap.removeLayer(marker[2]);
        });
        marker[0].addTo(leafletLiveMap);
      });
    });
  }
}

PopulateMap();
setInterval(PopulateMap, 45 * 1000);
setInterval(AddOwnFlightToMap, 5 * 1000);