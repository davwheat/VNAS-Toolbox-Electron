{
  const { ChartFoxInterface, ChartFoxPrivate } = require("./api_keys");
  const ApiBaseUrl = "https://chartfox.org/api";

  $(() => {
    $(".icaoAutocompleteInput").each(function() {
      let inputId = $(this)[0].id;
      $(this)
        .next()
        .attr("data-autocompletes", inputId);
    });

    $(".icaoAutocompleteInput").blur(function() {
      if (
        !$(this)
          .next()
          .is(":hover") ||
        $(this)
          .next()
          .children(":focus").length === 0
      ) {
        $(this)
          .next()
          .css("display", "");
      }
    });

    $(".icaoAutocompleteInput").blur(function() {
      if (
        $(this)
          .next()
          .is(":hover") ||
        $(this)
          .next()
          .children(":focus").length > 0
      ) {
        $(this)
          .next()
          .css("display", "block");
      } else {
        $(this)
          .next()
          .css("display", "");
      }
    });

    $(".icaoAutocompleteInput").keydown(function(e) {
      var key = event.key;
      if (key == "ArrowDown") {
        $(this).blur();
        setTimeout(
          () =>
            $(this)
              .next()
              .children()
              .first()[0]
              .focus(),
          25
        );
        console.warn(
          $(this)
            .next()
            .children()
            .first()[0]
        );
        $(this)
          .next()
          .css("display", "block");
      } else if (key === "`") {
        // This char breaks the input boxes somehow
        e.preventDefault();
      }
    });

    $(".icaoAutocompleteInput").on("input", function() {
      let customMax = Number($(this).data("max-suggestions"));
      if (isNaN(customMax)) customMax = 7;

      GetAirports($(this).value(), customMax).then(val => {
        SetAutoComplete(val, this);
        $(this)
          .next()
          .css("display", "block");
      });
    });
  });

  function GetAirports(particalIcao = "", maxCount = 5) {
    // Initialise the airport array
    let a;

    // If no partial ICAO given, return first N hubs
    if (particalIcao === "") a = NaxAirports.bases.slice(0, maxCount);
    // Otherwise, return up to N hubs that begin with partial ICAO
    else
      a = NaxAirports.bases
        .filter(k => k.startsWith(particalIcao.toUpperCase()))
        .slice(0, maxCount);

    // If we've got all the airports we need, return the array
    if (a.length === maxCount) {
      return Promise.resolve({ airports: a });
    }

    // Otherwise, add any NAX airport that matches the partial ICAO
    a = [
      ...new Set(
        a.concat(
          NaxAirports.bases.filter(k =>
            k.startsWith(particalIcao.toUpperCase())
          )
        )
      )
    ].slice(0, maxCount);

    // If we've got all the airports we need, return the array
    if (a.length === maxCount) {
      return Promise.resolve({ airports: a });
    }

    // Otherwise, get the rest of the ICAOs from ChartFox's supported airports list
    return Promise.resolve(
      $.post(
        `${ApiBaseUrl}/airports/fullsupport/${particalIcao}`,
        { token: ChartFoxPrivate },
        null,
        "json"
      )
    ).then(data => {
      return Promise.resolve({
        airports: [...new Set(a.concat(data.airports))].slice(0, maxCount)
      });
    });
  }

  function SetAutoComplete(val, input) {
    console.log(val);
    let airports = val.airports;

    if (airports == undefined) return;

    let h = "";

    airports.forEach((val, i) => {
      h += `<li tabindex="${1000 + i}" data-value="${val}">${val}</li>`;
    });

    $(input)
      .next()
      .html(h);

    $(".icaoAutocompleteContainer").focusin(function() {
      $(this).css("display", "block");
    });

    $(".icaoAutocompleteContainer").focusout(function() {
      if ($(this).children(":focus").length == 0) {
        //$(this).hide();
      }
    });

    $(".icaoAutocompleteContainer li").on("keydown", function(e) {
      let tabi = Number($(this).attr("tabindex"));
      var key = event.key;
      if (key === "ArrowDown") {
        $(this)
          .parent()
          .find(`li[tabindex=${tabi + 1}]`)
          .focus();
      } else if (key === "ArrowUp") {
        $(this)
          .parent()
          .find(`li[tabindex=${tabi - 1}]`)
          .focus();
      } else if (key === "Enter") {
        $(this).click();
      } else if (key === "Escape") {
        $(this)
          .parent()
          .prev()
          .focus();
      }
    });

    $(".icaoAutocompleteContainer li").click(function(e) {
      let $input = $(
        `#${$(this)
          .parent()
          .attr("data-autocompletes")}`
      );
      $input.val($(this).data("value"));
      $(this)
        .parent()
        .css("display", "");
      $input.focus();
    });
  }
}
