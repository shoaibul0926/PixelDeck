(function () {
  var grid = document.getElementById("game-grid");
  var games = window.PIXELDECK_GAMES || [];

  games.forEach(function (game) {
    var card = document.createElement("a");
    card.className = "game-card";
    card.href = "play.html?g=" + encodeURIComponent(game.slug);
    card.style.setProperty("--card-accent", game.accent || "#00e5ff");
    card.setAttribute("aria-label", "Play " + game.title);

    var iconHtml = game.thumb
      ? '<img src="' + game.thumb + '" alt="">'
      : (game.icon || "🎮");

    card.innerHTML =
      '<div class="icon">' + iconHtml + "</div>" +
      "<h2>" + game.title + "</h2>" +
      "<p>" + (game.desc || "") + "</p>" +
      '<div class="play-hint">PRESS START ▶</div>';

    grid.appendChild(card);
  });
})();
