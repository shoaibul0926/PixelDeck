(function () {
  var splash = document.getElementById("splashScreen");
  var hub = document.getElementById("hubScreen");
  var startBtn = document.getElementById("startBtn");

  // The CRT power-on flash only needs to play once on load — remove it once
  // its animation finishes so it isn't just sitting there in the DOM.
  var crtFlash = document.getElementById("crtFlash");
  if (crtFlash) setTimeout(function () { crtFlash.remove(); }, 800);

  // ---------- floating background icons (splash screen + hub grid) ----------
  // A field of the actual game icons drifting around behind the content — a
  // little preview of what's inside, instead of a static empty background.
  // Shared by the splash logo and the hub's game grid so both screens get
  // the same living-background treatment.
  function startIconField(field, count, isVisible) {
    if (!field) return;
    var pool = (window.PIXELDECK_GAMES || []).map(function (g) { return g.icon; }).filter(Boolean);
    if (pool.length === 0) pool = ["🎮", "🕹️", "👾"];

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
      // Staggered fade-in instead of every icon popping in at once — the
      // field visibly populates over the first ~1.3s the page is up.
      (function (el, delay) {
        setTimeout(function () { el.classList.add("in"); }, delay);
      })(el, i * 40 + Math.random() * 60);
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
      // No isVisible callback means "keep going for the life of the page"
      // (used for the hub field, which is inactive at first paint and only
      // flips to active later via enterHub()/the skip=1 redirect — gating on
      // its current state here would let the very first check catch it
      // still inactive and kill the loop before it ever gets a chance).
      if (!isVisible || isVisible()) requestAnimationFrame(stepIcons);
    }
    stepIcons();
  }

  startIconField(document.getElementById("splashIconField"), 32, function () {
    return !splash.classList.contains("hidden");
  });
  startIconField(document.getElementById("hubIconField"), 24);

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
  // A real two-part arcade "attract mode" tune — a driving bassline under a
  // 16-step melody — instead of a bare 4-note arpeggio repeating. Keeps the
  // plucky chiptune character (this is the energetic boot-up screen, not the
  // calm hub) but reads as an actual tune rather than one thin loop.
  var LOOP_BASS = [
    110, 0, 110, 0, 130.81, 0, 110, 0,
    146.83, 0, 130.81, 0, 110, 0, 98, 0
  ];
  var LOOP_MELODY = [
    220, 277, 330, 277, 220, 277, 330, 392,
    330, 277, 220, 196, 220, 277, 330, 277
  ];
  var loopTimer = null;
  var loopStep = 0;

  function playLoopStep() {
    var i = loopStep % LOOP_MELODY.length;
    var bass = LOOP_BASS[i];
    if (bass > 0) beep(bass, 0.24, "triangle", 0.06);
    beep(LOOP_MELODY[i], 0.22, "square", 0.045);
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

  // ---------- hub background music: soothing ambient pad ----------
  // Its own envelope (slow fade in, slow fade out — no sharp attack) instead
  // of reusing the snappy pluck-decay beep() every UI click uses, since that
  // shape reads as percussive no matter how the notes are chosen. Long,
  // overlapping sine tones, a slow tempo, and sparse, spaced-out melody
  // notes (mostly rests) keep it floating and calm instead of feeling like a
  // song with a beat. Plays for as long as the grid is showing (sound is
  // permanent here too, by the same design as the entry loop: no mute
  // control).
  function padTone(freq, duration, gainVal, delay) {
    try {
      ensureAudio();
      var t0 = audioCtx.currentTime + (delay || 0);
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t0);
      var peak = gainVal || 0.05;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(peak, t0 + duration * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t0);
      osc.stop(t0 + duration);
    } catch (e) { /* audio unavailable, ignore */ }
  }

  // 32 steps at a slow tempo; bass changes every 8 steps and each bass note
  // sustains for the full 8-step span so the harmony never has a gap. The
  // melody is sparse (mostly rests) with notes held well past the next step,
  // so they overlap and blend instead of ticking along to a beat.
  var HUB_BASS_NOTES = [
    196.00, 0, 0, 0, 0, 0, 0, 0,
    246.94, 0, 0, 0, 0, 0, 0, 0,
    220.00, 0, 0, 0, 0, 0, 0, 0,
    196.00, 0, 0, 0, 0, 0, 0, 0
  ];
  var HUB_MELODY_NOTES = [
    0, 0, 587.33, 0, 0, 0, 523.25, 0,
    0, 0, 0, 493.88, 0, 0, 0, 0,
    0, 0, 523.25, 0, 0, 0, 440.00, 0,
    0, 0, 0, 392.00, 0, 0, 0, 0
  ];
  var HUB_STEP_MS = 650;
  var hubMusicTimer = null;
  var hubMusicStep = 0;

  function hubMusicStepFn() {
    var i = hubMusicStep % HUB_MELODY_NOTES.length;
    var bass = HUB_BASS_NOTES[i];
    var mel = HUB_MELODY_NOTES[i];
    var stepSec = HUB_STEP_MS / 1000;
    if (bass > 0) {
      padTone(bass, stepSec * 8, 0.04);
      padTone(bass * 1.5, stepSec * 8, 0.016);
    }
    if (mel > 0) padTone(mel, stepSec * 3.2, 0.03);
    hubMusicStep++;
  }

  function startHubMusic() {
    if (hubMusicTimer) return;
    ensureAudio();
    hubMusicStep = 0;
    hubMusicStepFn();
    hubMusicTimer = setInterval(hubMusicStepFn, HUB_STEP_MS);
  }

  // Coming back from a game (play.html's "HUB" button) -> land straight on
  // the game-selection grid instead of replaying the splash/start screen.
  // Must run after startHubMusic (and the HUB_*_NOTES data above it) are
  // defined: calling it any earlier throws (reading .length of an
  // as-yet-unassigned var), which used to abort this whole script before it
  // reached the game-grid-building code further down, leaving the grid empty.
  if (new URLSearchParams(window.location.search).get("skip") === "1") {
    splash.classList.add("hidden");
    hub.classList.add("active");
    hub.style.animation = "none";
    hub.style.opacity = "1";
    startHubMusic();
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
