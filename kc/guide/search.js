// Search over page titles and headings. Pages read fine without this; it only adds the search box.
// The data comes from search-index.js, which the build writes beside the pages.
(function () {
  var box = document.querySelector("[data-search]");
  var index = window.guideSearchIndex;
  if (!box || !Array.isArray(index)) return;

  var input = box.querySelector("input");
  var list = box.querySelector(".search-results");
  var MAX = 8;

  // Every word typed must appear in the page title or the heading.
  function find(query) {
    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return index
      .filter(function (entry) {
        var text = (entry.title + " " + entry.heading).toLowerCase();
        return words.every(function (word) {
          return text.indexOf(word) !== -1;
        });
      })
      .slice(0, MAX);
  }

  function show(query) {
    list.textContent = "";
    var hits = find(query);
    if (!hits.length && query.trim()) {
      var none = document.createElement("li");
      none.className = "search-none";
      none.textContent = "Nothing found.";
      list.appendChild(none);
      return;
    }
    hits.forEach(function (entry) {
      var item = document.createElement("li");
      var link = document.createElement("a");
      link.href = entry.url;
      link.textContent = entry.heading ? entry.heading : entry.title;
      if (entry.heading) {
        var where = document.createElement("span");
        where.className = "search-where";
        where.textContent = entry.title;
        link.appendChild(where);
      }
      item.appendChild(link);
      list.appendChild(item);
    });
  }

  box.hidden = false;
  input.addEventListener("input", function () {
    show(input.value);
  });
  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      var first = list.querySelector("a");
      if (first) first.click();
    } else if (event.key === "Escape") {
      input.value = "";
      show("");
    }
  });
  // "/" jumps to the box, the way most documentation sites do. It does nothing while typing in a field.
  document.addEventListener("keydown", function (event) {
    var tag = (event.target && event.target.tagName) || "";
    if (event.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
      event.preventDefault();
      input.focus();
    }
  });
})();
