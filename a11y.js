/* ===========================================================
   SEO Renewal — Accessibility menu
   Vanilla JS. No dependencies, no tracking. Settings persist in
   localStorage under "a11y_prefs_v1" and are applied to <html> on load.
   Implements WCAG 2.2 AA support patterns: keyboard operable, focus
   trap, ESC to close, focus returned to launcher, ARIA dialog.
   =========================================================== */
(function () {
  "use strict";

  var STORE_KEY = "a11y_prefs_v1";
  var html = document.documentElement;

  var TEXT_STEPS = ["", "a11y-text-110", "a11y-text-125", "a11y-text-150", "a11y-text-175", "a11y-text-200"];
  var LINE_STEPS = ["", "a11y-line-120", "a11y-line-140"]; /* Normal / +20% / +40% */

  var defaults = {
    textStep: 0,
    lineStep: 0,
    theme: "light",          // light | high | dark
    underlineLinks: false,
    highlightLinks: false,
    dyslexia: false,
    bigCursor: false,
    focusRing: false,
    reduceMotion: false,
    readingGuide: false
  };

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      return raw ? Object.assign({}, defaults, JSON.parse(raw)) : Object.assign({}, defaults);
    } catch (e) { return Object.assign({}, defaults); }
  }
  function save(p) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch (e) {}
  }

  var prefs = load();

  function ensureDyslexiaFont() {
    if (document.getElementById("a11y-dys-font")) return;
    var l = document.createElement("link");
    l.id = "a11y-dys-font";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap";
    document.head.appendChild(l);
  }

  function apply() {
    // text size
    TEXT_STEPS.forEach(function (c) { if (c) html.classList.remove(c); });
    if (prefs.textStep > 0) html.classList.add(TEXT_STEPS[prefs.textStep]);
    // line spacing
    LINE_STEPS.forEach(function (c) { if (c) html.classList.remove(c); });
    if (prefs.lineStep > 0) html.classList.add(LINE_STEPS[prefs.lineStep]);
    // theme
    html.classList.remove("a11y-contrast-high", "a11y-dark");
    if (prefs.theme === "high") html.classList.add("a11y-contrast-high");
    else if (prefs.theme === "dark") html.classList.add("a11y-dark");
    // toggles
    html.classList.toggle("a11y-underline-links", prefs.underlineLinks);
    html.classList.toggle("a11y-highlight-links", prefs.highlightLinks);
    html.classList.toggle("a11y-dyslexia", prefs.dyslexia);
    if (prefs.dyslexia) ensureDyslexiaFont();
    html.classList.toggle("a11y-big-cursor", prefs.bigCursor);
    html.classList.toggle("a11y-focus-ring", prefs.focusRing);
    html.classList.toggle("a11y-reduce-motion", prefs.reduceMotion);
    html.classList.toggle("a11y-motion-allow", !prefs.reduceMotion);
    html.classList.toggle("a11y-reading-guide-on", prefs.readingGuide);
    syncControls();
  }

  // Apply persisted prefs ASAP (before menu is built) to avoid flash
  apply();

  /* ---------- Build skip links (first tabbable elements) ---------- */
  function buildSkipLinks() {
    if (document.querySelector(".a11y-skip-links")) return;
    var nav = document.createElement("nav");
    nav.className = "a11y-skip-links";
    nav.setAttribute("aria-label", "Skip links");
    nav.innerHTML =
      '<a href="#main">Skip to main content</a>' +
      '<a href="#primary-nav">Skip to navigation</a>' +
      '<a href="#site-footer">Skip to footer</a>';
    document.body.insertBefore(nav, document.body.firstChild);
  }

  /* ---------- Reading guide overlay ---------- */
  var guideEl, guideY = Math.round(window.innerHeight / 2);
  function buildGuide() {
    guideEl = document.createElement("div");
    guideEl.className = "a11y-reading-guide";
    guideEl.setAttribute("aria-hidden", "true");
    document.body.appendChild(guideEl);
    positionGuide();
    document.addEventListener("mousemove", function (e) {
      if (prefs.readingGuide) { guideY = e.clientY; positionGuide(); }
    });
    document.addEventListener("keydown", function (e) {
      if (!prefs.readingGuide) return;
      if (e.key === "ArrowDown") { guideY = Math.min(window.innerHeight, guideY + 20); positionGuide(); e.preventDefault(); }
      if (e.key === "ArrowUp") { guideY = Math.max(0, guideY - 20); positionGuide(); e.preventDefault(); }
    });
  }
  function positionGuide() { if (guideEl) guideEl.style.top = (guideY - 20) + "px"; }

  /* ---------- Launcher + panel ---------- */
  var launcher, panel, lastFocused;

  function buildUI() {
    // Container is a complementary landmark so all content stays inside a region.
    var region = document.createElement("aside");
    region.setAttribute("aria-label", "Accessibility tools");

    launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "a11y-launcher";
    launcher.setAttribute("aria-label", "Accessibility options");
    launcher.setAttribute("aria-haspopup", "dialog");
    launcher.setAttribute("aria-expanded", "false");
    launcher.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">' +
      '<circle cx="12" cy="4" r="2"/>' +
      '<path d="M21 8.5c0 .6-.4 1-1 1.1l-4 .6v3.3l1.7 5.6c.2.6-.2 1.2-.8 1.4-.6.2-1.2-.2-1.4-.8L13.8 15h-.6l-1.5 4.7c-.2.6-.8 1-1.4.8-.6-.2-1-.8-.8-1.4L11 13.5v-3.3l-4-.6C6.4 9.5 6 9 6 8.5c0-.6.5-1.1 1.1-1L12 8l4.9-.5c.6-.1 1.1.4 1.1 1z"/>' +
      '</svg>';
    region.appendChild(launcher);

    panel = document.createElement("div");
    panel.className = "a11y-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", "Accessibility options");
    panel.hidden = true;
    panel.innerHTML = panelHTML();
    region.appendChild(panel);
    document.body.appendChild(region);

    launcher.addEventListener("click", toggle);
    panel.addEventListener("click", onPanelClick);
    document.addEventListener("keydown", onKeydown);
  }

  function panelHTML() {
    return '' +
      '<div class="a11y-panel__head">' +
        '<h2 class="a11y-panel__title">Accessibility options</h2>' +
        '<button type="button" class="a11y-panel__close" data-act="close" aria-label="Close accessibility options">✕</button>' +
      '</div>' +

      '<div class="a11y-group">' +
        '<p class="a11y-group__label">Text size</p>' +
        '<div class="a11y-row"><span>Adjust text size</span>' +
          '<span class="a11y-btns">' +
            '<button type="button" class="a11y-btn" data-act="text-dec" aria-label="Decrease text size">−</button>' +
            '<button type="button" class="a11y-btn" data-act="text-inc" aria-label="Increase text size">+</button>' +
          '</span>' +
        '</div>' +
        '<div class="a11y-row"><span>Line spacing</span>' +
          '<span class="a11y-btns">' +
            '<button type="button" class="a11y-btn" data-act="line" data-val="0" aria-pressed="false">Normal</button>' +
            '<button type="button" class="a11y-btn" data-act="line" data-val="1" aria-pressed="false">+20%</button>' +
            '<button type="button" class="a11y-btn" data-act="line" data-val="2" aria-pressed="false">+40%</button>' +
          '</span>' +
        '</div>' +
      '</div>' +

      '<div class="a11y-group">' +
        '<p class="a11y-group__label">Contrast</p>' +
        '<div class="a11y-row"><span>Theme</span>' +
          '<span class="a11y-btns">' +
            '<button type="button" class="a11y-btn" data-act="theme" data-val="light" aria-pressed="false">Light</button>' +
            '<button type="button" class="a11y-btn" data-act="theme" data-val="dark" aria-pressed="false">Dark</button>' +
            '<button type="button" class="a11y-btn" data-act="theme" data-val="high" aria-pressed="false">High</button>' +
          '</span>' +
        '</div>' +
      '</div>' +

      '<div class="a11y-group">' +
        '<p class="a11y-group__label">Reading aids</p>' +
        toggleRow("Always underline links", "underlineLinks") +
        toggleRow("Highlight links", "highlightLinks") +
        toggleRow("Dyslexia-friendly font", "dyslexia") +
        toggleRow("Reading guide ruler", "readingGuide") +
      '</div>' +

      '<div class="a11y-group">' +
        '<p class="a11y-group__label">Cursor &amp; focus</p>' +
        toggleRow("Big cursor", "bigCursor") +
        toggleRow("High-contrast focus ring", "focusRing") +
      '</div>' +

      '<div class="a11y-group">' +
        '<p class="a11y-group__label">Motion</p>' +
        toggleRow("Reduce motion", "reduceMotion") +
      '</div>' +

      '<button type="button" class="a11y-reset" data-act="reset">Reset all settings</button>' +
      '<p class="a11y-note">Settings are saved on this device only (no cookies, no tracking). This menu aids access but does not replace the site’s built-in accessibility. See our <a href="accessibility.html">Accessibility Statement</a>.</p>';
  }

  function toggleRow(label, key) {
    return '<div class="a11y-row"><span id="lbl-' + key + '">' + label + '</span>' +
      '<button type="button" class="a11y-btn" data-act="toggle" data-key="' + key + '" ' +
      'aria-pressed="false" aria-labelledby="lbl-' + key + '">Off</button></div>';
  }

  function syncControls() {
    if (!panel) return;
    // line
    panel.querySelectorAll('[data-act="line"]').forEach(function (b) {
      b.setAttribute("aria-pressed", String(Number(b.dataset.val) === prefs.lineStep));
    });
    // theme
    panel.querySelectorAll('[data-act="theme"]').forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.val === prefs.theme));
    });
    // toggles
    panel.querySelectorAll('[data-act="toggle"]').forEach(function (b) {
      var on = !!prefs[b.dataset.key];
      b.setAttribute("aria-pressed", String(on));
      b.textContent = on ? "On" : "Off";
    });
  }

  function onPanelClick(e) {
    var t = e.target.closest("button");
    if (!t) return;
    var act = t.dataset.act;
    if (act === "close") return close();
    if (act === "reset") { prefs = Object.assign({}, defaults); save(prefs); apply(); return; }
    if (act === "text-inc") { prefs.textStep = Math.min(TEXT_STEPS.length - 1, prefs.textStep + 1); }
    else if (act === "text-dec") { prefs.textStep = Math.max(0, prefs.textStep - 1); }
    else if (act === "line") { prefs.lineStep = Number(t.dataset.val); }
    else if (act === "theme") { prefs.theme = t.dataset.val; }
    else if (act === "toggle") { prefs[t.dataset.key] = !prefs[t.dataset.key]; }
    save(prefs);
    apply();
  }

  /* ---------- open / close with focus trap ---------- */
  function open() {
    lastFocused = document.activeElement;
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    syncControls();
    var first = panel.querySelector("button, a, input");
    if (first) first.focus();
  }
  function close() {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
    else launcher.focus();
  }
  function toggle() { panel.hidden ? open() : close(); }

  function focusables() {
    return Array.prototype.slice.call(
      panel.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
  }

  function onKeydown(e) {
    if (panel.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); return close(); }
    if (e.key === "Tab") {
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  /* ---------- init ---------- */
  function init() {
    buildSkipLinks();
    buildGuide();
    buildUI();
    apply(); // re-sync now that controls exist
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
