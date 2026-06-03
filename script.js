// SEO Renewal — light front-end behavior

// Affiliate offer (Stan Ventures — managed SEO services).
// Standalone links route here. The lead form posts to Zoho first, and Zoho
// then redirects to this same URL via its returnURL field (see index.html).
var AFFILIATE_URL =
  "https://my.stanventures.com/r/4JH00?p=/managed-seo-services&utm_source=seo-renewal&utm_campaign=affiliate";

document.addEventListener("DOMContentLoaded", function () {
  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Every standalone hyperlink routes to the affiliate offer (rel="sponsored").
  // NOTE: this intentionally skips the lead form's submit button (a <button>),
  // so the form still posts to Zoho.
  Array.prototype.forEach.call(
    document.querySelectorAll("a[href]"),
    function (a) {
      var href = a.getAttribute("href") || "";
      // Leave accessibility/skip/in-page links alone so they keep working.
      if (a.hasAttribute("data-keep-href")) return;
      if (href.charAt(0) === "#") return;                 // skip links, in-page anchors
      if (/accessibility\.html(\?|#|$)/i.test(href)) return; // statement page
      if (a.closest(".a11y-skip-links, .a11y-panel")) return; // a11y UI
      a.setAttribute("href", AFFILIATE_URL);
      a.setAttribute("rel", "sponsored");
    }
  );

  // Lead form -> Zoho Web-to-Lead.
  // Zoho's Leads module requires "Last Name", but we don't ask visitors for it.
  // Derive it from the submitted website (fallback to email) so the lead is
  // labelled and never rejected. We do NOT preventDefault — the native POST to
  // Zoho proceeds, Zoho creates the lead, then redirects to the affiliate URL.
  var form = document.getElementById("renewalForm");
  if (form) {
    form.addEventListener("submit", function () {
      var website = (document.getElementById("Website") || {}).value || "";
      var email = (document.getElementById("Email") || {}).value || "";
      var label = (website.trim() || email.trim() || "Website Lead")
        .replace(/^https?:\/\//i, "")
        .replace(/\/+$/, "");
      var lastName = document.getElementById("Last_Name");
      if (lastName) lastName.value = label.slice(0, 80);
      // allow native submit to Zoho
    });
  }
});
