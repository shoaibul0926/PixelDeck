(function () {
  var splash = document.getElementById("splashScreen");
  var hub = document.getElementById("hubScreen");
  var startBtn = document.getElementById("startBtn");

  // Coming back from a game (play.html's "HUB" button) -> land straight on
  // the game-selection grid instead of replaying the splash/start screen.
  if (new URLSearchParams(window.location.search).get("skip") === "1") {
    splash.classList.add("hidden");
    hub.classList.add("active");
    hub.style.animation = "none";
    hub.style.opacity = "1";
    startHubMusic();
  }

  // ---------- floating background icons on the splash screen ----------
  // A field of the actual game icons drifting around behind the logo — a
  // little preview of what's inside, instead of a static empty background.
  (function () {
    var field = document.getElementById("splashIconField");
    if (!field) return;
    var pool = (window.PIXELDECK_GAMES || []).map(function (g) { return g.icon; }).filter(Boolean);
    if (pool.length === 0) pool = ["🎮", "🕹️", "👾"];

    var count = 32;
    var particles = [];
    for (var i = 0; i < count; i++) {
      var el = document.createElement("span");
      el.className = "floating-icon";
      el.textContent = pool[i % pool.length];
      field.appendChild(el);
      particles.push({
        el: el,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.045,
        vy: (Math.random() - 0.5) * 0.045,
        rot: Math.random() * 360,
        vr: (Math.random() - 0.5) * 0.35,
        scale: 0.7 + Math.random() * 0.9
      });
    }

    function stepIcons() {
      for (var j = 0; j < particles.length; j++) {
        var p = particles[j];
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.x < -8) p.x = 108; else if (p.x > 108) p.x = -8;
        if (p.y < -8) p.y = 108; else if (p.y > 108) p.y = -8;
        p.el.style.transform =
          "translate(-50%, -50%) translate(" + p.x + "vw, " + p.y + "vh) " +
          "rotate(" + p.rot + "deg) scale(" + p.scale + ")";
      }
      if (!splash.classList.contains("hidden")) requestAnimationFrame(stepIcons);
    }
    stepIcons();
  })();

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

  // Not { once: true } on purpose: while the login gate is up, the splash is
  // kept hidden, so the *first* interaction (e.g. clicking the login form)
  // must not consume this listener before the splash ever gets a chance to
  // play its boot loop. It keeps checking on every interaction until the
  // splash is actually visible, then latches via loopStarted.
  var loopStarted = false;
  function unlockAndStartLoop() {
    if (loopStarted || splash.classList.contains("hidden")) return;
    loopStarted = true;
    startEntryLoop();
  }
  ["pointerdown", "keydown", "touchstart"].forEach(function (evt) {
    window.addEventListener(evt, unlockAndStartLoop, { passive: true });
  });

  // ---------- hub background music: warm welcoming loop ----------
  // A real two-part arrangement — a slow sustained bass (with a soft fifth
  // on top for a fuller chord) under a brighter stepped melody — instead of
  // a single monophonic tone repeating. No pitch-bend on any note here
  // (that's what made the first version read as a "ding dong" doorbell chime
  // rather than music). Plays for as long as the grid is showing (sound is
  // permanent here too, by the same design as the entry loop: no mute
  // control).
  var HUB_BASS_NOTES = [
    196.00, 0, 0, 0, 246.94, 0, 0, 0,
    220.00, 0, 0, 0, 196.00, 0, 0, 0
  ];
  var HUB_MELODY_NOTES = [
    392.00, 440.00, 493.88, 440.00, 523.25, 493.88, 440.00, 392.00,
    349.23, 392.00, 440.00, 493.88, 440.00, 392.00, 349.23, 0
  ];
  var hubMusicTimer = null;
  var hubMusicStep = 0;

  function hubMusicStepFn() {
    var i = hubMusicStep % HUB_MELODY_NOTES.length;
    var bass = HUB_BASS_NOTES[i];
    var mel = HUB_MELODY_NOTES[i];
    if (bass > 0) {
      beep(bass, 1.1, "triangle", 0.05);
      beep(bass * 1.5, 1.1, "sine", 0.025);
    }
    if (mel > 0) beep(mel, 0.34, "sine", 0.05);
    hubMusicStep++;
  }

  function startHubMusic() {
    if (hubMusicTimer) return;
    ensureAudio();
    hubMusicStep = 0;
    hubMusicStepFn();
    hubMusicTimer = setInterval(hubMusicStepFn, 300);
  }

  // ---------- splash -> hub ----------
  function enterHub() {
    stopEntryLoop();
    splash.classList.add("hidden");
    hub.classList.add("active");
    startHubMusic();
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
    // Cache-bust this too: if a browser cached an old play.html for this
    // game before a fix shipped, a stale unversioned URL would keep
    // serving that old copy forever regardless of what's now on the server.
    card.href = "play.html?g=" + encodeURIComponent(game.slug) + "&_=" + Date.now();
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
