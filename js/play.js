(function () {
  // Cache-bust the "back to hub" link itself (not just its JS/CSS) so a
  // browser/CDN that cached an old index.html document can't serve it
  // stale when coming back from a game — every visit gets a unique URL.
  var backHref = "index.html?skip=1&_=" + Date.now();
  var backBtn = document.querySelector(".back-btn");
  if (backBtn) backBtn.href = backHref;

  var params = new URLSearchParams(window.location.search);
  var slug = params.get("g");
  var games = window.PIXELDECK_GAMES || [];
  var game = games.find(function (g) { return g.slug === slug; });

  var titleEl = document.getElementById("play-title");
  var wrap = document.getElementById("frame-wrap");

  if (!game) {
    document.title = "PixelDeck — Game not found";
    titleEl.textContent = "GAME NOT FOUND";
    wrap.innerHTML = '<div class="play-missing">' +
      "Couldn't find a game for \"" + (slug || "") + "\". " +
      '<a href="' + backHref + '" style="color:#00e5ff">Back to PixelDeck</a></div>';
    return;
  }

  document.title = "PixelDeck — " + game.title;
  titleEl.textContent = game.title;

  var iframe = document.createElement("iframe");
  iframe.src = game.url;
  iframe.title = game.title;
  iframe.allow = "gamepad; fullscreen; autoplay";
  wrap.appendChild(iframe);
})();
