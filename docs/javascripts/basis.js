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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mark);
  } else {
    mark();
  }
})();
