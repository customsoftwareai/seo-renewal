/* ===========================================================
   SEO Renewal — conversational lead wizard (vanilla JS)
   Auto-advance single-selects; Continue for multi/text; contact step.
   On completion: writes answers to the hidden Zoho Web-to-Lead form and
   submits it into a hidden iframe (lead created, visitor stays on-site),
   then shows a completion screen. No tracking; Lead Source = SEORenewal.com.
   =========================================================== */
(function () {
  "use strict";

  var QUESTIONS = [
    { key: "provider", type: "single", prompt: "Are you currently working with an SEO provider?",
      options: ["Yes, currently", "Yes, but the contract is ending soon", "No — looking for my first one", "We do SEO in-house"] },
    { key: "renewal", type: "single", prompt: "When does your current contract come up for renewal?",
      options: ["Within 30 days", "1–3 months", "3–6 months", "Not under contract"] },
    { key: "frustration", type: "multi", prompt: "What's frustrating you most right now?", hint: "Select all that apply.",
      options: ["Not ranking", "Rankings dropped", "Poor or no backlinks", "Technical site issues", "No reporting or transparency", "Too expensive for the results", "Don't understand what they're doing"] },
    { key: "need", type: "single", prompt: "What do you need help with most?",
      options: ["Local visibility", "Higher organic rankings", "E-commerce / online store", "Backlinks & authority", "Technical / site health", "International expansion", "Not sure yet"] },
    { key: "website", type: "text", prompt: "What's your website?", placeholder: "yourbusiness.com" },
    { key: "industry", type: "text", prompt: "What industry are you in?", placeholder: "e.g. dental, e-commerce, legal…" },
    { key: "budget", type: "single", prompt: "Roughly, what's your monthly SEO budget?",
      options: ["Under $500", "$500–1,500", "$1,500–5,000", "$5,000+", "Not sure yet"] },
    { key: "focus", type: "single", prompt: "What's your main focus?", options: ["Local", "National", "E-commerce"] },
    { key: "contact", type: "contact", prompt: "Where should we send your matches?" }
  ];

  var TOTAL = QUESTIONS.length;
  var state = { step: 0, answers: {}, done: false, lastFocus: null };
  var root = document.getElementById("wizardRoot");
  var advanceTimer = null;

  /* ---------- open / close ---------- */
  function openFresh() { state.step = 0; state.done = false; render(); show(); }
  function openFromHero(value) { state.answers.provider = value; state.step = 1; state.done = false; render(); show(); }
  function show() {
    state.lastFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    var el = root.querySelector(".wz"); if (el) el.hidden = false;
    focusFirst();
  }
  function close() {
    var el = root.querySelector(".wz"); if (el) el.hidden = true;
    document.body.style.overflow = "";
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
  }

  /* ---------- navigation ---------- */
  function goNext() { if (state.step + 1 >= TOTAL) { state.done = true; submitLead(); } else { state.step++; } render(); focusFirst(); }
  function goBack() { if (state.done) { state.done = false; } else if (state.step > 0) { state.step--; } render(); focusFirst(); }

  function pickSingle(key, val) {
    state.answers[key] = val; render();
    clearTimeout(advanceTimer); advanceTimer = setTimeout(goNext, 240);
  }
  function toggleMulti(key, val) {
    var cur = state.answers[key] || [];
    state.answers[key] = cur.indexOf(val) >= 0 ? cur.filter(function (v) { return v !== val; }) : cur.concat([val]);
    render();
  }

  /* ---------- Zoho submission ---------- */
  function submitLead() {
    var a = state.answers;
    var c = a.contact || {};
    var set = function (id, v) { var el = document.getElementById(id); if (el) el.value = v || ""; };
    set("z_lastname", (c.name || "Website Lead").slice(0, 80));
    set("z_email", c.email || "");
    set("z_company", c.business || "");
    var site = (a.website || "").replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    set("z_website", site);
    // Full structured summary into Description (best-effort field mapping)
    var lines = [
      "Provider status: " + (a.provider || "—"),
      "Contract renewal: " + (a.renewal || "—"),
      "Frustrations: " + ((a.frustration || []).join(", ") || "—"),
      "Primary need: " + (a.need || "—"),
      "Industry: " + (a.industry || "—"),
      "Monthly budget: " + (a.budget || "—"),
      "Focus: " + (a.focus || "—"),
      "Source: SEORenewal.com matching wizard"
    ];
    set("z_description", lines.join("\n"));
    try { document.getElementById("zohoLeadForm").submit(); } catch (e) {}
  }

  /* ---------- render ---------- */
  function render() {
    var q = QUESTIONS[state.step];
    var progress = state.done ? 100 : Math.round((state.step / TOTAL) * 100);
    var html = '' +
      '<div class="wz" role="dialog" aria-modal="true" aria-label="Find my SEO match" hidden>' +
        '<div class="wz__bar">' +
          '<button type="button" class="wz__back" data-act="back"' + ((state.step === 0 && !state.done) ? " disabled" : "") + '>&larr; Back</button>' +
          '<span class="wz__brand">SEO<span class="gold">Renewal</span></span>' +
          '<button type="button" class="wz__close" data-act="close" aria-label="Close">✕</button>' +
        '</div>' +
        '<div class="wz__progress"><i style="width:' + progress + '%"></i></div>' +
        '<div class="wz__body">' + (state.done ? doneHTML() : stepHTML(q)) + '</div>' +
      '</div>';
    root.innerHTML = html;
    var wz = root.querySelector(".wz");
    wz.hidden = false;
    wz.addEventListener("click", onClick);
    // keep open state across re-render
  }

  function stepHTML(q) {
    var a = state.answers;
    var body = '';
    if (q.type === "single") {
      body = '<div class="wz__opts">' + q.options.map(function (o) {
        var active = a[q.key] === o;
        return '<button type="button" class="wz__opt' + (active ? " is-active" : "") + '" data-single="' + esc(o) + '">' + esc(o) + (active ? ' <span class="gold">✓</span>' : '') + '</button>';
      }).join("") + '</div>';
    } else if (q.type === "multi") {
      var sel = a[q.key] || [];
      body = '<div class="wz__opts">' + q.options.map(function (o) {
        var on = sel.indexOf(o) >= 0;
        return '<button type="button" class="wz__opt" data-multi="' + esc(o) + '" aria-pressed="' + on + '">' + esc(o) + '<span class="wz__check">' + (on ? "✓" : "") + '</span></button>';
      }).join("") + '</div>' +
      '<button type="button" class="btn btn--gold wz__continue" data-act="next"' + (sel.length ? "" : " disabled") + '>Continue &rarr;</button>';
    } else if (q.type === "text") {
      body = '<input class="wz__input" id="wzText" type="text" value="' + esc(a[q.key] || "") + '" placeholder="' + esc(q.placeholder || "") + '" />' +
      '<button type="button" class="btn btn--gold wz__continue" data-act="next"' + (a[q.key] ? "" : " disabled") + '>Continue &rarr;</button>';
    } else if (q.type === "contact") {
      var c = a.contact || {};
      body = '<div class="wz__fields">' +
        '<input class="wz__input" data-c="name" placeholder="Your name" value="' + esc(c.name || "") + '" />' +
        '<input class="wz__input" data-c="business" placeholder="Business name" value="' + esc(c.business || "") + '" />' +
        '<input class="wz__input" data-c="email" type="email" placeholder="Email address" value="' + esc(c.email || "") + '" />' +
      '</div>' +
      '<button type="button" class="btn btn--gold wz__continue" data-act="submit"' + (ready(c) ? "" : " disabled") + '>See my matches &rarr;</button>' +
      '<p class="wz__legal">Free · No obligation · We never sell your details</p>';
    }
    return '<div class="wz__card">' +
      '<p class="wz__step">Step ' + (state.step + 1) + ' of ' + TOTAL + '</p>' +
      '<h2 class="wz__q">' + esc(q.prompt) + '</h2>' +
      (q.hint ? '<p class="wz__hint">' + esc(q.hint) + '</p>' : '') +
      body + '</div>';
  }

  function doneHTML() {
    return '<div class="wz__done">' +
      '<div class="wz__doneicon">✓</div>' +
      '<h2 class="wz__donetitle">You\'re all set.</h2>' +
      '<p class="wz__donetext">We\'re reviewing your answers and matching you with a vetted specialist that fits your priorities. You\'ll hear from us shortly — no obligation, no cost.</p>' +
      '<button type="button" class="btn btn--ghost" data-act="close">Close</button>' +
    '</div>';
  }

  function ready(c) { return c && c.name && c.email && /\S+@\S+\.\S+/.test(c.email); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  /* ---------- events ---------- */
  function onClick(e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.act === "close") return close();
    if (b.dataset.act === "back") return goBack();
    if (b.dataset.act === "next") return goNext();
    if (b.dataset.act === "submit") return goNext();
    if (b.dataset.single) return pickSingle(QUESTIONS[state.step].key, b.dataset.single);
    if (b.dataset.multi) return toggleMulti(QUESTIONS[state.step].key, b.dataset.multi);
  }

  // capture text/contact input live
  root.addEventListener("input", function (e) {
    var t = e.target;
    if (t.id === "wzText") {
      state.answers[QUESTIONS[state.step].key] = t.value;
      var btn = root.querySelector('[data-act="next"]'); if (btn) btn.disabled = !t.value;
    } else if (t.dataset && t.dataset.c) {
      state.answers.contact = state.answers.contact || {};
      state.answers.contact[t.dataset.c] = t.value;
      var sb = root.querySelector('[data-act="submit"]'); if (sb) sb.disabled = !ready(state.answers.contact);
    }
  });
  root.addEventListener("keydown", function (e) {
    if (e.target.id === "wzText" && e.key === "Enter" && e.target.value) { e.preventDefault(); goNext(); }
  });
  document.addEventListener("keydown", function (e) {
    var wz = root.querySelector(".wz"); if (!wz || wz.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    if (e.key === "Tab") { trap(e, wz); }
  });

  function focusFirst() {
    var wz = root.querySelector(".wz"); if (!wz || wz.hidden) return;
    var el = wz.querySelector(".wz__input, .wz__opt, .wz__continue, .btn");
    if (el) el.focus();
  }
  function trap(e, wz) {
    var f = wz.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])');
    f = Array.prototype.filter.call(f, function (el) { return !el.disabled && el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- init ---------- */
  function init() {
    // footer year
    var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
    // build (hidden) wizard
    render(); var el = root.querySelector(".wz"); if (el) el.hidden = true;
    // hero options
    Array.prototype.forEach.call(document.querySelectorAll("[data-hero]"), function (b) {
      b.addEventListener("click", function () { openFromHero(b.dataset.hero); });
    });
    // open buttons
    Array.prototype.forEach.call(document.querySelectorAll("[data-open-wizard]"), function (b) {
      b.addEventListener("click", openFresh);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
