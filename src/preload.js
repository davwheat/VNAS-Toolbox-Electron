// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const customTitlebar = require("custom-electron-titlebar");
const OverlayScrollbars = require("overlayscrollbars");

let titlebar;

$(() => {
  titlebar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex("#d81939"),
    menu: null
  });
  OverlayScrollbars(document.querySelectorAll(".container-after-titlebar,.need-scrollbar"), {});
});
