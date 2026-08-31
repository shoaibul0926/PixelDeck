(function () {
  var splash = document.getElementById("splashScreen");
  var hub = document.getElementById("hubScreen");
  var startBtn = document.getElementById("startBtn");

  // ---------- audio (always on — no mute control by design) ----------
  var audioCtx = null;

  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
  }

  function beep(freq, duration, type, gainVal, glideTo, delay) {
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

  function sfxConfirm() { beep(320, 0.16, "square", 0.1, 920); }
  function sfxSelect() { beep(700, 0.09, "sine", 0.1, 1100); }
  function sfxHover() { beep(520, 0.035, "sine", 0.025); }

  // ---------- continuous entry-screen loop ----------
  // A short retro arpeggio that keeps repeating for as long as the splash
  // screen is showing, instead of a single one-shot beep.
  var LOOP_NOTES = [220, 277, 330, 277];
  var loopTimer = null;
  var loopStep = 0;

  function playLoopStep() {
    beep(LOOP_NOTES[loopStep % LOOP_NOTES.length], 0.22, "triangle", 0.05);
    loopStep++;
  }

  function startEntryLoop() {
    if (loopTimer) return;
    ensureAudio();
    playLoopStep();
    loopTimer = setInterval(playLoopStep, 260);
  }

  function stopEntryLoop() {
    if (loopTimer) {
      clearInterval(loopTimer);
      loopTimer = null;
    }
  }

  var loopStarted = false;
  function unlockAndStartLoop() {
    if (loopStarted) return;
    loopStarted = true;
    if (!splash.classList.contains("hidden")) startEntryLoop();
  }
  ["pointerdown", "keydown", "touchstart"].forEach(function (evt) {
    window.addEventListener(evt, unlockAndStartLoop, { once: true, passive: true });
  });

  // ---------- splash -> hub ----------
  function enterHub() {
    stopEntryLoop();
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
