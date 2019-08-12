const DiscordRPC = require("discord-rpc");
const clientId = "432593601747222538";
const rpcInstance = new DiscordRPC.Client({ transport: "ipc" });

const fsuipc = require("fsuipc");
const FsuipcGetter = new fsuipc.FSUIPC();

const $FromIcaoBox = $("#FromIcaoTextbox");
const $ToIcaoBox = $("#ToIcaoTextbox");
const $CruiseBox = $("#CruiseLevelBox");
const $AircraftBox = $("#AircraftSelect");

let FSConnected = false;

let FSObj;

class Flight {
  FlightState;

  DepartureIcao;
  ArrivalIcao;

  get CruiseFL() {
    return "FL" + this.CruiseLevel;
  }
  get CruiseAlt() {
    return this.CruiseLevel * 100;
  }
  CruiseLevel;

  get FeetUntilCruise() {
    return Math.abs(this.CruiseAlt - this.AltitudeASL);
  }

  AircraftType;
  AircraftName = this.GetAircraftName();

  SpeedGS;
  SpeedKIAS;

  AltitudeASL;
  AltitudeAGL;

  VerticalSpeed;

  Pitch;
  Bank;
  Heading;

  ParkingBrakeSet;
  OnGround;
  get Stationary() {
    return this.OnGround && this.SpeedGS <= 1;
  }

  Latitude;
  Longitude;

  DistanceFlown;

  DepartureTimestamp;
  LandedTimestamp;

  States = {
    BrowsingFlights: "searchingforflight",
    Preflight: "cockpit",
    Taxi: "b738taxi",
    Takeoff: "takingoff",
    Climb: "climb",
    Cruise: "cruise",
    Descending: "descend",
    Approach: "land",
    LandedAndTaxi: "b738taxi2",
    ArrivedAtGate: "atgate"
  };

  FlightStates = this.States;

  StateToString(state) {
    if (state == this.States.BrowsingFlights) {
      return "Browsing flights";
    } else if (state == this.States.Preflight) {
      return "Preflight checks";
    } else if (state == this.States.Taxi) {
      return "Taxi to rwy";
    } else if (state == this.States.Takeoff) {
      return "Takeoff";
    } else if (state == this.States.Climb) {
      return "Climb";
    } else if (state == this.States.Cruise) {
      return "Cruise";
    } else if (state == this.States.Descending) {
      return "Descent";
    } else if (state == this.States.Approach) {
      return "On approach";
    } else if (state == this.States.LandedAndTaxi) {
      return "Taxi";
    } else if (state == this.States.ArrivedAtGate) {
      return "Baggage in hall.";
    } else {
      return "Flight status unknown";
    }
  }

  constructor(from, to, cruise, aircraftType, startTimestamp) {
    this.DepartureIcao = from;
    this.ArrivalIcao = to;
    this.CruiseLevel = cruise;
    this.AircraftType = aircraftType;
    this.DepartureTimestamp = startTimestamp;
    this.FlightState = this.FlightStates.BrowsingFlights;
  }

  SetState(state) {
    this.FlightState = state;
  }

  UpdateData() {
    if (!FSConnected || FSObj == undefined) return;

    FSObj.process()
      .then(result => {
        const {
          airspeed,
          groundSpeed,
          altitudeAsl,
          altitudeAgl,
          onGround,
          parkingBrake,
          bank,
          pitch,
          heading,
          latitude,
          longitude,
          vspeed
        } = result;

        myFlight.SpeedKIAS = airspeed / 128;
        myFlight.SpeedGS = (groundSpeed / 65536) * 1.4384;
        myFlight.AltitudeASL = (altitudeAsl * 3.28084) / (65536.0 * 65536.0);
        myFlight.AltitudeAGL = (altitudeAgl * 3.28084) / 65536.0;
        myFlight.OnGround = onGround != 0;
        myFlight.ParkingBrakeSet = parkingBrake != 0;
        myFlight.Latitude = Number(
          ((latitude * 90.0) / (10001750.0 * 65536.0 * 65536.0)).toFixed(6)
        );
        myFlight.Longitude = Number(
          (
            (longitude * 360.0) /
            (65536.0 * 65536.0 * 65536.0 * 65536.0)
          ).toFixed(6)
        );
        myFlight.VerticalSpeed = (vspeed * 60.0 * 3.28084) / 256.0;
        myFlight.Pitch = -Number(
          ((pitch * 360.0) / (65536.0 * 65536.0)).toFixed(1)
        );
        myFlight.Bank = Number(
          ((bank * 360.0) / (65536.0 * 65536.0)).toFixed(1)
        );
        myFlight.Heading = Number(
          ((heading * 360.0) / (65536.0 * 65536.0)).toFixed(1)
        );

        if (document.title == "VNAS Toolbox | NOT CONNECTED TO FS") {
          document.title = "VNAS Toolbox | Connected to FS";
          titlebar.updateTitle();
        }

        UpdateLiveInfo();
      })
      .catch(() => {
        FsuipcGetter.close();
      });
  }

  GetAircraftName() {
    switch (this.AircraftType) {
      case "B738":
        return "Boeing 737-800";
      case "B733":
        return "Boeing 737-300";
      case "B734":
        return "Boeing 737-400";
      case "B38M":
        return "Boeing 737 MAX 8";
      case "B788":
        return "Boeing 787-800";
      case "B789":
        return "Boeing 787-900";
      case "A321":
        return "Airbus A321";
      case "A320":
        return "Airbus A320";
      case "MD80":
        return "McDonnell Douglas MD80";
      case "F80":
        return "Fokker 80";
      default:
        return "Unknown";
    }
  }

  get IsTaxiing() {
    return (
      (this.FlightState == this.States.Taxi &&
        !this.IsTakingOff &&
        !this.IsClimbing &&
        !this.IsCruising &&
        !this.IsDescending &&
        !this.IsOnApproach) ||
      ((this.FlightState == this.States.BrowsingFlights ||
        this.FlightState == this.States.Preflight) &&
        !this.Stationary)
    );
  }

  get IsTakingOff() {
    return (
      (this.FlightState == this.States.Takeoff &&
        !this.IsClimbing &&
        !this.IsCruising &&
        !this.IsDescending &&
        !this.IsOnApproach) ||
      (this.CurrentStateIsOnGroundAtDepartureAirport &&
        this.SpeedGS >= 50 &&
        this.FlightState == this.States.Taxi)
    );
  }

  get IsClimbing() {
    return (
      (this.FlightState == this.FlightStates.Climb &&
        !this.IsCruising &&
        !this.IsDescending &&
        !this.IsOnApproach) ||
      (this.AltitudeAGL >= 400 &&
        this.FeetUntilCruise > 500 &&
        this.VerticalSpeed >= 100)
    );
  }

  get IsCruising() {
    return (
      (this.FlightState == this.FlightStates.Cruise &&
        !this.IsDescending &&
        !this.IsOnApproach) ||
      this.FeetUntilCruise <= 500
    );
  }

  get IsDescending() {
    return (
      (this.FlightState == this.FlightStates.Descending &&
        !this.IsOnApproach) ||
      (this.FlightState == this.FlightStates.Cruise &&
        this.FeetUntilCruise >= 1000) ||
      (this.VerticalSpeed <= -1000 &&
        this.FeetUntilCruise >= 1000 &&
        this.FlightState != this.States.Approach)
    );
  }

  get IsOnApproach() {
    return (
      (this.FlightState == this.FlightStates.Approach &&
        this.AltitudeAGL > 100) ||
      (this.VerticalSpeed <= -500 &&
        this.AltitudeAGL <= 8000 &&
        this.AltitudeAGL > 100)
    );
  }

  get IsLanded() {
    return (
      (this.FlightState == this.FlightStates.LandedAndTaxi &&
        !this.IsArrivedAtGate) ||
      (this.FlightState == this.FlightStates.Approach && this.OnGround)
    );
  }

  get IsArrivedAtGate() {
    return (
      this.FlightState == this.FlightStates.ArrivedAtGate ||
      (this.FlightState == this.FlightStates.LandedAndTaxi &&
        this.ParkingBrakeSet)
    );
  }

  get CurrentStateIsOnGroundAtDepartureAirport() {
    return [
      this.FlightStates.BrowsingFlights,
      this.FlightStates.Preflight,
      this.FlightStates.Taxi,
      this.FlightStates.Takeoff
    ].includes(this.FlightState);
  }

  get CurrentStateIsOnGroundAtArrivalAirport() {
    return [
      this.FlightStates.LandedAndTaxi,
      this.FlightStates.ArrivedAtGate
    ].includes(this.FlightState);
  }

  SetLandTime() {
    this.LandedTimestamp = `${new Date().getUTCHours()}:${new Date().getUTCMinutes()}`;
  }
}

let myFlight;

$("#InitialiseDiscordRPCButton").click(() => {
  let from = $FromIcaoBox.val().toUpperCase();
  let to = $ToIcaoBox.val().toUpperCase();
  let cruise = $CruiseBox.val();
  let aircraft = $AircraftBox.val();

  if (from.length != 4 || to.length != 4) {
    CreatePopUp({
      title: "Error #1: Invalid flight details",
      body: "Your departure or arrival ICAO code is invalid."
    });
    return;
  }

  if (cruise % 5 != 0 || cruise < 10) {
    CreatePopUp({
      title: "Error #2: Invalid flight details",
      body: "Incorrect cruise altitude"
    });
    return;
  }

  //#region Cruise Ceiling Checks

  switch (aircraft) {
    // BOEING
    case "B738" || "B737" || "B739" || "B38M":
      if (cruise > 410) {
        CreatePopUp({
          title: "Error #3: Invalid flight details",
          body:
            "Cruise is above the selected aircraft's flight ceiling. (FL410)"
        });
        return;
      }
      break;
    case "B734" || "B733":
      if (cruise > 370) {
        CreatePopUp({
          title: "Error #3: Invalid flight details",
          body:
            "Cruise is above the selected aircraft's flight ceiling. (FL370)"
        });
        return;
      }
      break;
    case "B788" || "B789":
      if (cruise > 430) {
        CreatePopUp({
          title: "Error #3: Invalid flight details",
          body:
            "Cruise is above the selected aircraft's flight ceiling. (FL430)"
        });
        return;
      }
      break;
    case "B763" || "B772":
      if (cruise > 432) {
        CreatePopUp({
          title: "Error #3: Invalid flight details",
          body:
            "Cruise is above the selected aircraft's flight ceiling. (FL431)"
        });
        return;
      }
      break;
    // AIRBUS
    case "A321" || "A320":
      if (cruise > 398) {
        CreatePopUp({
          title: "Error #3: Invalid flight details",
          body:
            "Cruise is above the selected aircraft's flight ceiling. (FL398)"
        });
        return;
      }
      break;
    case "A319" || "A342":
      if (cruise > 410) {
        CreatePopUp({
          title: "Error #3: Invalid flight details",
          body:
            "Cruise is above the selected aircraft's flight ceiling. (FL410)"
        });
        return;
      }
      break;
    case "A333":
      if (cruise > 411) {
        CreatePopUp({
          title: "Error #3: Invalid flight details",
          body:
            "Cruise is above the selected aircraft's flight ceiling. (FL411)"
        });
        return;
      }
      break;
    // OTHER
    case "F50":
      if (cruise > 250) {
        CreatePopUp({
          title: "Error #3: Invalid flight details",
          body:
            "Cruise is above the selected aircraft's flight ceiling. (FL250)"
        });
        return;
      }
      break;
    case "MD80":
      if (cruise > 370) {
        CreatePopUp({
          title: "Error #3: Invalid flight details",
          body:
            "Cruise is above the selected aircraft's flight ceiling. (FL370)"
        });
        return;
      }
      break;
  }
  //#endregion

  if (!FSConnected) {
    CreatePopUp({
      title: "Error #4: FS not connected",
      body:
        "No simulator found. Please make sure you are loaded into a flight and you have FSUIPC/XPUIPC installed."
    });
    return;
  }

  myFlight = new Flight(from, to, cruise, aircraft, new Date().getTime());

  if (GetSetting("enable_discord_presence")) {
    rpcInstance.on("ready", () => {
      rpcInstance.setActivity({
        state: "By David Wheatley",
        details: myFlight.DepartureIcao + " → " + myFlight.ArrivalIcao,
        largeImageKey: myFlight.FlightState,
        largeImageText: "Setting up...",
        smallImageKey: "vnas",
        smallImageText: "www.virtualnorwegian.net",
        instance: false
      });

      // activity can only be set every 15 seconds
      setInterval(UpdatePresence, 15 * 1000);
    });

    RPCLogin();
  }

  setInterval(myFlight.UpdateData, 5000);

  //setInterval(UpdateMap, 60000);

  $("#InitialiseDiscordRPCButton").attr("disabled", "");
});

function RPCLogin() {
  rpcInstance.login({ clientId }).catch(() => {
    console.error;
    RPCLogin();
  });
}

async function UpdatePresence() {
  if (!GetSetting("enable_discord_presence")) return;

  let state = myFlight.FlightState;

  console.log(myFlight);

  if (myFlight.IsTaxiing) state = myFlight.States.Taxi;
  else if (myFlight.IsTakingOff) state = myFlight.States.Takeoff;
  else if (myFlight.IsClimbing) state = myFlight.States.Climb;
  else if (myFlight.IsCruising) state = myFlight.States.Cruise;
  else if (myFlight.IsDescending) state = myFlight.States.Descending;
  else if (myFlight.IsOnApproach) state = myFlight.States.Approach;
  else if (myFlight.IsLanded) state = myFlight.States.LandedAndTaxi;
  else if (myFlight.IsArrivedAtGate) state = myFlight.States.ArrivedAtGate;

  if (
    state == myFlight.States.LandedAndTaxi &&
    myFlight.FlightState != myFlight.States.LandedAndTaxi
  )
    myFlight.SetLandTime();

  let stateText = myFlight.StateToString(state);

  if (state == myFlight.States.Taxi)
    stateText += ` @ ${Math.round(myFlight.SpeedGS)} kts`;
  else if (state == myFlight.States.Climb)
    stateText += ` (${Math.round(myFlight.AltitudeASL)}ft for ${
      myFlight.CruiseFL
    })`;
  else if (state == myFlight.States.Cruise)
    stateText += ` @ ${Math.round(myFlight.SpeedGS)} kts`;
  else if (state == myFlight.States.Descending)
    stateText = `Descending (${Math.round(myFlight.AltitudeASL)}ft)`;
  else if (state == myFlight.States.Approach)
    stateText += ` (${Math.round(myFlight.AltitudeAGL)}ft AGL)`;
  else if (state == myFlight.States.LandedAndTaxi)
    stateText += `Landed at ${myFlight.LandedTimestamp}`;

  if (state != myFlight.state) {
    myFlight.SetState(state);
    new window.Notification("Flight state updated", {
      body: `Now: ${stateText}`
    });
  }

  myFlight.state = state;

  console.log(`${state} // ${stateText}`);

  $("#currentStateHeading").html(stateText);

  rpcInstance.setActivity({
    state: stateText,
    details: myFlight.DepartureIcao + " → " + myFlight.ArrivalIcao,
    largeImageKey: state,
    largeImageText: `Aircraft: ${myFlight.AircraftName}`,
    smallImageKey: "vnas",
    smallImageText: "www.virtualnorwegian.net",
    startTimestamp: myFlight.DepartureTimestamp,
    instance: false
  });
}

let attemptConnection = setInterval(() => {
  if (FSConnected) return;

  FsuipcGetter.open()
    .then(obj => {
      obj.add("airspeed", 0x02bc, fsuipc.Type.UInt32);
      obj.add("groundSpeed", 0x02b4, fsuipc.Type.UInt32);

      obj.add("altitudeAsl", 0x0570, fsuipc.Type.Int64);
      obj.add("altitudeAgl", 0x31e4, fsuipc.Type.Int64);

      obj.add("parkingBrake", 0x0bc8, fsuipc.Type.UInt16);
      obj.add("onGround", 0x0366, fsuipc.Type.UInt16);

      obj.add("pitch", 0x0578, fsuipc.Type.Int32);
      obj.add("bank", 0x057c, fsuipc.Type.Int32);
      obj.add("heading", 0x0580, fsuipc.Type.UInt32);
      obj.add("vspeed", 0x02c8, fsuipc.Type.Int32);

      obj.add("latitude", 0x0560, fsuipc.Type.Int64);
      obj.add("longitude", 0x0568, fsuipc.Type.Int64);
      FSObj = obj;
    })
    .catch(err => {
      if (err.code == fsuipc.ErrorCode.NOFS) {
        document.title = "VNAS Toolbox | NOT CONNECTED TO FS";
        FSConnected = false;
        titlebar.updateTitle();
      } else if (err.code == fsuipc.ErrorCode.OPEN) {
        console.warn(
          "Attempted to open FSUIPC connection while it was already open!"
        );
        FSConnected = true;
      } else {
        console.error(err);
        FSConnected = false;
      }
    });
}, 5000);
