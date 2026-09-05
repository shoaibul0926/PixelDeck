// PixelDeck login gate. Talks to the pixeldeck-auth backend (Node/Express +
// JWT, same pattern as chat-buddy) to give PixelDeck real accounts and a
// persistent, server-side log of every login. Runs before games.js/hub.js so
// the splash/hub stay hidden until the visitor is authenticated.
(function () {
  var API = 'https://pixeldeck-auth-production.up.railway.app';
  var TOKEN_KEY = 'pdToken';
  var NAME_KEY = 'pdUsername';

  var loginScreen = document.getElementById('loginScreen');
  var splash = document.getElementById('splashScreen');
  var hub = document.getElementById('hubScreen');
  var skipSplash = new URLSearchParams(window.location.search).get('skip') === '1';
  var formTitle = document.getElementById('authFormTitle');
  var usernameInput = document.getElementById('authUsername');
  var passwordInput = document.getElementById('authPassword');
  var submitBtn = document.getElementById('authSubmitBtn');
  var switchLink = document.getElementById('authSwitchLink');
  var errorEl = document.getElementById('authError');
  var userBadge = document.getElementById('userBadge');
  var userBadgeName = document.getElementById('userBadgeName');
  var logoutBtn = document.getElementById('logoutBtn');
  var toast = document.getElementById('welcomeBackToast');

  var mode = 'login';

  function setMode(m) {
    mode = m;
    formTitle.textContent = m === 'login' ? 'LOG IN' : 'SIGN UP';
    submitBtn.textContent = m === 'login' ? '▶ LOG IN' : '▶ CREATE ACCOUNT';
    switchLink.textContent = m === 'login'
      ? 'New here? Create an account'
      : 'Already have an account? Log in';
    errorEl.textContent = '';
  }
  switchLink.addEventListener('click', function (e) {
    e.preventDefault();
    setMode(mode === 'login' ? 'signup' : 'login');
  });

  function showLoginGate() {
    loginScreen.classList.add('active');
    splash.classList.add('hidden');
    usernameInput.focus();
  }
  function hideLoginGate() {
    loginScreen.classList.remove('active');
    if (skipSplash) {
      // Coming back from a game: land straight on the hub, same as the
      // normal (already-authenticated) ?skip=1 path in hub.js.
      hub.classList.add('active');
      hub.style.animation = 'none';
      hub.style.opacity = '1';
    } else {
      splash.classList.remove('hidden');
    }
  }

  function showUserBadge(username) {
    userBadgeName.textContent = username;
    userBadge.classList.add('active');
  }

  function formatWhen(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  function showWelcomeToast(lastLogin, loginCount) {
    var msg = lastLogin
      ? 'Welcome back! Last visit: ' + formatWhen(lastLogin)
      : 'Welcome to PixelDeck!';
    toast.textContent = msg + '  ·  Login #' + loginCount;
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 4000);
  }

  function handleAuthSuccess(data) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(NAME_KEY, data.username);
    showUserBadge(data.username);
    showWelcomeToast(data.lastLogin, data.loginCount);
    hideLoginGate();
  }

  function submit() {
    var username = usernameInput.value.trim();
    var password = passwordInput.value;
    if (!username || !password) {
      errorEl.textContent = 'Enter a username and password.';
      return;
    }
    submitBtn.disabled = true;
    errorEl.textContent = '';
    fetch(API + '/api/' + (mode === 'login' ? 'login' : 'register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, password: password })
    })
      .then(function (r) { return r.json().then(function (data) { return { ok: r.ok, data: data }; }); })
      .then(function (res) {
        submitBtn.disabled = false;
        if (!res.ok) { errorEl.textContent = res.data.error || 'Something went wrong.'; return; }
        handleAuthSuccess(res.data);
      })
      .catch(function () {
        submitBtn.disabled = false;
        errorEl.textContent = 'Could not reach the server — check your connection and try again.';
      });
  }
  submitBtn.addEventListener('click', submit);
  passwordInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
  usernameInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') passwordInput.focus(); });

  logoutBtn.addEventListener('click', function () {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(NAME_KEY);
    location.reload();
  });

  // ---------- boot: reuse a stored token, or show the gate ----------
  var token = localStorage.getItem(TOKEN_KEY);
  var storedName = localStorage.getItem(NAME_KEY);

  if (!token) {
    showLoginGate();
    return;
  }

  // Optimistically assume the stored token is still good so returning
  // visitors aren't blocked on a network round trip; the ping below both
  // verifies it and records this visit as a login activity entry.
  showUserBadge(storedName || 'Player');

  fetch(API + '/api/activity/ping', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(function (r) {
      if (!r.ok) throw new Error('token invalid');
      return r.json();
    })
    .then(function (data) {
      showWelcomeToast(data.lastLogin, data.loginCount);
    })
    .catch(function () {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(NAME_KEY);
      userBadge.classList.remove('active');
      showLoginGate();
    });
})();
