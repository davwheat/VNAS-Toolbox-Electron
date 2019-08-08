// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const customTitlebar = require('custom-electron-titlebar');
const SVGInject = require('@iconfu/svg-inject')
const OverlayScrollbars = require('overlayscrollbars')
 
const titlebar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#d81939'),
    menu: null
});

window.addEventListener("DOMContentLoaded", () => {
  OverlayScrollbars(document.querySelectorAll('.container-after-titlebar'), { });

  document.querySelectorAll("i.iicon").forEach(element => {
    let name = "";
    let type = "";

    let a = element.className.split(" ");
    let b = [];
    a.forEach(c => {
      if (c.startsWith("ii-")) name = c.substr(3);
      else if (c == "iib") type = "brands";
      else if (c == "iir") type = "regular";
      else if (c == "iis") type = "solid";
      else if (c == "iic") type = "custom";
      else b.push(c);
    });

    let newEl = new Image();
    newEl.src = `img/icons/${type}/${name}.svg`;
    newEl.className = "ex-iicon svg " + b.join(" ");
    element.replaceWith(newEl);
  });

  SVGInject(document.querySelectorAll("img.svg"));
});
