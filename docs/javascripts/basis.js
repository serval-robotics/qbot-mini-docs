/* Tag the Basis column so it can be read at a glance.
 *
 * Specification tables state how each figure was obtained, and which of the
 * five values a row carries changes what a reader may do with the number: a
 * measured mass can be designed against, a simulated speed cannot. As plain
 * text that distinction has to be read row by row. Marked, it can be scanned.
 *
 * The column is found by its heading rather than by position, so a table with
 * a different shape is left alone. */

(function () {
  var BASIS = [
    ["not yet characterized", "unknown"],
    ["vendor specification", "vendor"],
    ["design target", "target"],
    ["simulated", "simulated"],
    ["measured", "measured"],
  ];

  function mark() {
    document.querySelectorAll(".md-typeset table").forEach(function (table) {
      var headings = Array.prototype.slice.call(table.querySelectorAll("thead th"));
      var column = headings.findIndex(function (th) {
        return th.textContent.trim() === "Basis";
      });
      if (column < 0) return;

      table.setAttribute("data-basis-table", "");
      table.querySelectorAll("tbody tr").forEach(function (row) {
        var cell = row.cells[column];
        if (!cell) return;
        var text = cell.textContent.trim().toLowerCase();
        var match = BASIS.find(function (pair) {
          return text.indexOf(pair[0]) === 0;
        });
        if (match) cell.setAttribute("data-basis", match[1]);
      });
    });
  }

  /* Keep a quantity and its unit on one line.
   *
   * A column narrow enough will break "0.085 m/s" after the number, and the
   * figure then reads as the whole answer with the unit stranded underneath.
   * A non-breaking space fixes it, but written into the Markdown by hand it is
   * invisible to the next person editing the table and survives exactly as
   * long as nobody touches the row. Doing it here means it cannot be lost.
   *
   * The units are listed rather than pattern-matched, so an ordinary word
   * after a number — "12 legs", "3 seconds" — is left alone. */
  var UNITS = "m|mm|cm|s|ms|kg|g|N|N·m|Nm|m/s|rad|rad/s|deg|deg/s|Hz|kHz|V|A|W|°|%";
  var QUANTITY = new RegExp("(\\d)[\\u0020\\u202f](" + UNITS + ")(?![\\w/\\u00b7])", "g");

  function glue() {
    document.querySelectorAll(".md-typeset table td, .md-typeset table th")
      .forEach(function (cell) {
        cell.childNodes.forEach(function (node) {
          if (node.nodeType !== Node.TEXT_NODE) return;
          var glued = node.nodeValue.replace(QUANTITY, "$1\u00a0$2");
          if (glued !== node.nodeValue) node.nodeValue = glued;
        });
      });
  }

  function run() {
    mark();
    glue();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
