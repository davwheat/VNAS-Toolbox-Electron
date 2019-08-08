function UpdateLiveInfo() {
  if (myFlight == undefined) return;

  $("#pfd").css("display", "block");
  $("#infoBeforeSetupWarn").css("display", "none");

  $("#horizon").attr(
    "style",
    `transform: translateY(-405.5px) rotate(${
      myFlight.Bank
    }deg);transform-origin:center ${650 -
      Math.round(myFlight.Pitch * 5.2, 1)}px;top:${Math.round(
      myFlight.Pitch * 52
    ) / 10.0}px`
  );

  $("#hdg").attr(
    "style",
    `transform:rotate(${-myFlight.Heading}deg) scale(1.05)`
  );

  $("#altTape").attr(
    "style",
    `transform: translateY(${-21851 + myFlight.AltitudeASL * 0.439}px);`
  );

  $("#speedTape").attr(
    "style",
    `transform: translateY(${
      myFlight.SpeedKIAS <= 40 ? -1059 : -1059 + (myFlight.SpeedKIAS - 40) * 3
    }px);`
  );

  let bigAlt = Math.floor(myFlight.AltitudeASL / 1000);
  let smallAlt = Math.floor((myFlight.AltitudeASL % 1000) / 10) * 10;
  if (smallAlt == 1000) {
    smallAlt = 0;
    bigAlt += 1;
  }
  let smallAltStr = ("00" + smallAlt).slice(-3);

  let vSpeedYValue = 125.0;
  let hideVSpeed = false;
  let absVSpeed = Math.abs(myFlight.VerticalSpeed);

  let VerticalSpeed = myFlight.VerticalSpeed;

  if (absVSpeed < 400) {
    hideVSpeed = true;
  } else {
    if (VerticalSpeed > 0) {
      if (VerticalSpeed <= 1000) vSpeedYValue = 125.0 - VerticalSpeed * 0.05;
      else if (VerticalSpeed <= 2000)
        vSpeedYValue = 75.0 - (VerticalSpeed - 1000) * 0.037;
      else if (VerticalSpeed <= 6000)
        vSpeedYValue = 38.0 - ((VerticalSpeed - 2000) * 0.026) / 3.0;
      else vSpeedYValue = 12.0;
    } else {
      if (VerticalSpeed >= -1000) vSpeedYValue = 125.0 + VerticalSpeed * -0.05;
      else if (VerticalSpeed >= -2000)
        vSpeedYValue = 175.0 + (VerticalSpeed + 1000) * -0.037;
      else if (VerticalSpeed >= -6000)
        vSpeedYValue = 212.0 + ((VerticalSpeed + 2000) * -0.026) / 3.0;
      else vSpeedYValue = 238.0;
    }
  }

  let verticalSpeedText = Math.round(absVSpeed / 50.0) * 50.0;

  $("#pfdAlt").html(
    `${
      bigAlt < 10
        ? '<svg height="24" width="15" style="position: absolute;stroke:#0f0;stroke-width: 2.5;overflow: overlay;display: inline-block;top: -1px;left: -16px;transform: scale(0.75);"><line x1="0" y1="0" x2="15" y2="24"></line><line x1="5" y1="0" x2="15" y2="16"></line><line x1="10" y1="0" x2="15" y2="8"></line><line x1="0" y1="8" x2="10" y2="24"></line><line x1="0" y1="16" x2="5" y2="24"></line></svg>'
        : ""
    }<span class="big">${bigAlt}</span><span class="small">${smallAltStr}</span>`
  );

  $("#pfdSpeed").html(
    myFlight.SpeedKIAS > 40 ? Math.floor(myFlight.SpeedKIAS) : 40
  );

  $("#pfdGsSpeed").html(
    `GS <span class="nums"> ${Math.floor(myFlight.SpeedGS)}</span>`
  );

  $("#vSpeedLine line").attr("y2", vSpeedYValue);

  if (hideVSpeed) $("#vSpeedText").css("display", "none");
  else {
    $("#vSpeedText").attr("class", VerticalSpeed > 0 ? "pos" : "neg");
    $("#vSpeedText").html(verticalSpeedText);
  }
}

function UpdateMap() {
  let lat =
    myFlight.Latitude > 0 ? "N" + myFlight.Latitude : "S" + myFlight.Latitude;
  let lon =
    myFlight.Longitude > 0
      ? "E" + myFlight.Longitude
      : "W" + myFlight.Longitude;

  let GCMapUrl = `http://www.gcmap.com/map?P=${
    myFlight.DepartureIcao
  }-${lat}+${lon}-${myFlight.ArrivalIcao}%2C+\"${Math.round(myFlight.AltitudeASL)}+ft%5Cn${
    Math.round(myFlight.SpeedGS)
  }+kts\"%2B%40${lat}+${lon}%0d%0a&MS=wls&MR=120&MX=500x500&PM=b:disc7%2b"%25U%25+%28N"`;

  $("#gcmap").attr("src", GCMapUrl);
}
