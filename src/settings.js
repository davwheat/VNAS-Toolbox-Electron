const settings = require("electron-settings");

const $AllSettingInputs = $(
  "#Settings select[data-setting], #Settings input[data-setting], #Settings textarea[data-setting]"
);

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

$AllSettingInputs.on("input", () => {
  $AllSettingInputs.each((_, el) => {
    SetSetting($(el).data("setting"), $(el).value());
  });

  ApplySettings();
});

function PropagateSettings() {
  let isFirstRun = ipcRenderer.send("getIsFirstRun");
  if (isFirstRun) {
    ResetSettingsToDefaults();
  }

  $AllSettingInputs.each((_, e) => {
    $(e).value(GetSetting($(e).data("setting")));
  });
}

PropagateSettings();

function ApplySettings() {
  $AllSettingInputs.each((_, el) => {
    let val = $(el).value();
    let setting = $(el).data("setting");

    switch (setting) {
      case "always_on_top":
        ipcRenderer.send("setOnTop", val);
        console.info("Always on top: " + val);
        break;

      default:
        break;
    }
  });
}

function ResetSettingsToDefaults() {
  $AllSettingInputs.each((_, el) => {
    if ($(el).is([(type = checkbox)])) {
      SetSetting(
        $(el).data("setting"),
        $(el).data("default-value") == "true" ? true : false
      );
    } else {
      SetSetting($(el).data("setting"), $(el).data("default-value"));
    }
  });
}

$("#resetSettingsBtn").click(() => {
  let r = CreatePopUp({
    title: "Reset settings?",
    body: "Are you sure you want to reset your settings to default?",
    closeButtonText: "No",
    secondaryButtonText: "Yes"
  }).then(notConfirmed => {
    if (notConfirmed) return;

    ResetSettingsToDefaults();
  });
});
