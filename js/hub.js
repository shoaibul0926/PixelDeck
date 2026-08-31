(function () {
  var splash = document.getElementById("splashScreen");
  var hub = document.getElementById("hubScreen");
  var startBtn = document.getElementById("startBtn");

  function enterHub() {
    splash.classList.add("hidden");
    hub.classList.add("active");
  }

  startBtn.addEventListener("click", enterHub);
  window.addEventListener("keydown", function (e) {
    if (!splash.classList.contains("hidden") && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      enterHub();
    }
  });

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
