(function () {
  var splash = document.getElementById("splashScreen");
  var hub = document.getElementById("hubScreen");
  var startBtn = document.getElementById("startBtn");
  var muteBtn = document.getElementById("pdMuteBtn");

  // ---------- audio ----------
  var audioCtx = null;
  var muted = localStorage.getItem("pdMuted") === "1";
  var bootPlayed = false;
  if (muteBtn) muteBtn.textContent = muted ? "🔇" : "🔊";

  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
  }

  function beep(freq, duration, type, gainVal, glideTo, delay) {
    if (muted) return;
    try {
      ensureAudio();
      var t0 = audioCtx.currentTime + (delay || 0);
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || "square";
      osc.frequency.setValueAtTime(freq, t0);
      if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + duration);
      gain.gain.setValueAtTime(gainVal || 0.12, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t0);
      osc.stop(t0 + duration);
    } catch (e) { /* audio unavailable, ignore */ }
  }

  function sfxBoot() {
    beep(330, 0.12, "square", 0.07, null, 0);
    beep(440, 0.12, "square", 0.07, null, 0.11);
    beep(660, 0.2, "square", 0.08, 880, 0.22);
  }
  function sfxConfirm() { beep(320, 0.16, "square", 0.1, 920); }
  function sfxSelect() { beep(700, 0.09, "sine", 0.1, 1100); }
  function sfxHover() { beep(520, 0.035, "sine", 0.025); }

  function unlockAndBoot() {
    if (bootPlayed) return;
    bootPlayed = true;
    ensureAudio();
    if (!splash.classList.contains("hidden")) sfxBoot();
  }
  ["pointerdown", "keydown", "touchstart"].forEach(function (evt) {
    window.addEventListener(evt, unlockAndBoot, { once: true, passive: true });
  });

  if (muteBtn) {
    muteBtn.addEventListener("click", function () {
      muted = !muted;
      localStorage.setItem("pdMuted", muted ? "1" : "0");
      muteBtn.textContent = muted ? "🔇" : "🔊";
    });
  }

  // ---------- splash -> hub ----------
  function enterHub() {
    splash.classList.add("hidden");
    hub.classList.add("active");
  }

  startBtn.addEventListener("click", function () {
    sfxConfirm();
    enterHub();
  });
  window.addEventListener("keydown", function (e) {
    if (!splash.classList.contains("hidden") && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      sfxConfirm();
      enterHub();
    }
  });

  // ---------- game grid ----------
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

    card.addEventListener("mouseenter", sfxHover);

    card.addEventListener("click", function (e) {
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      sfxSelect();
      var href = card.href;
      setTimeout(function () { window.location.href = href; }, 150);
    });

    grid.appendChild(card);
  });
})();
