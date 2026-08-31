(function () {
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
      '<a href="index.html" style="color:#00e5ff">Back to PixelDeck</a></div>';
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
