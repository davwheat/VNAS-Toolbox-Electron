const settings = require("electron-settings");

const airportData = require("./airports.json");
const NaxAirports = require("./nax_airports.json");

const ipcRenderer = require("electron").ipcRenderer;

$.fn.value = function(set = undefined) {
  if (set != undefined) {
    if (this.is("input:not([type=checkbox]),textarea,select")) {
      this.val(set);
    } else if (this.is("input[type=checkbox]")) {
      this.prop("checked", !!set);
    }
    return this;
  }

  if (this.is("input:not([type=checkbox]),textarea,select")) {
    return this.val();
  } else if (this.is("input[type=checkbox]")) {
    return this.is(":checked");
  }
};

function GetAirportInfo(icao) {
  // data["name"]
  // data["iata"]
  return airportData[icao];
}

function IcaoEntryHints(elem, id) {
  $elem = $(elem);
  if ($elem.val().length < 4) return;

  $hintElem = $(`#${id}`);

  let data = GetAirportInfo($elem.val().toUpperCase());
  if (data == undefined) $hintElem.html("No airport found in database");
  else $hintElem.html(`${data["iata"]} // ${data["name"]}`);
}

function CreatePopUp({
  title,
  htmlBody = null,
  body = null,
  closeButtonText = "Close",
  secondaryButtonText = null
}) {
  return new Promise((resolve, fail) => {
    let bodytype = "html";

    if (body != null && htmlBody != null) {
      console.warn(
        "HTML Body and plain text body both set in pop-up. Defaulting to HTML."
      );
    } else if (body == null && htmlBody == null) {
      console.error("No body set in pop-up. Cancelling...");
      return;
    } else if (body != null) {
      bodytype = "plain";
    }

    let dimmer = document.createElement("div");
    dimmer.id = "modal-dimmer-overlay";
    dimmer.style.position = "fixed";
    dimmer.style.top = "0";
    dimmer.style.left = "0";
    dimmer.style.right = "0";
    dimmer.style.bottom = "0";
    dimmer.style.backgroundColor = "#000b";
    dimmer.style.zIndex = "99998";
    dimmer.style.display = "none";

    let modal = document.createElement("div");
    modal.id = "modal-dialog";
    modal.style.padding = "16px 32px 32px 32px";
    modal.style.maxWidth = "50vw";
    modal.style.minWidth = "400px";
    modal.style.display = "none";
    modal.style.lineHeight = "1.5em";
    modal.innerHTML = `
    <h2>${title}</h2>
    <section>${bodytype == "html" ? htmlBody : `<p>${body}</p>`}</section>
    <footer style="margin-top: 32px">
        <button tabindex="0" id="modalCloseButton" style="float:right;">${closeButtonText}</button>
        ${
          secondaryButtonText != null
            ? `<button tabindex="1" id="modalSecondaryButton" style="float:left";>${secondaryButtonText}</button>`
            : ""
        }
    </footer>`;

    document.body.append(dimmer);
    document.body.append(modal);

    $("#modal-dialog")
      .add("#modal-dimmer-overlay")
      .fadeIn({ duration: 150 });

    $("button#modalCloseButton").focus();

    $("button#modalSecondaryButton").click(() => {
      $("#modal-dialog")
        .add("#modal-dimmer-overlay")
        .fadeOut({
          duration: 75,
          always: () => {
            $("#modal-dialog")
              .add("#modal-dimmer-overlay")
              .remove();
          }
        });
      resolve(false);
    });

    $("button#modalCloseButton").click(() => {
      $("#modal-dialog")
        .add("#modal-dimmer-overlay")
        .fadeOut({
          duration: 75,
          always: () => {
            $("#modal-dialog")
              .add("#modal-dimmer-overlay")
              .remove();
          }
        });
      resolve(true);
    });
  });
}

function GetSetting(name = "") {
  // return value, or undefined if it's not set
  return settings.get(name);
}

function SetSetting(name, obj) {
  settings.set(name, obj);
}
