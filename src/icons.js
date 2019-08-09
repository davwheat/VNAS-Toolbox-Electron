const SVGInject = require("@iconfu/svg-inject");

$(() => {
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
