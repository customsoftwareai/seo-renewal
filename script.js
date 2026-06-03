// SEO Renewal — light front-end behavior

// Affiliate offer (Stan Ventures — managed SEO services).
// All conversions route here. Change in ONE place if the tracking link updates.
var AFFILIATE_URL =
  "https://my.stanventures.com/r/4JH00?p=/managed-seo-services&utm_source=seo-renewal&utm_campaign=affiliate";

document.addEventListener("DOMContentLoaded", function () {
  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Every hyperlink on the page routes to the affiliate offer.
  // This keeps AFFILIATE_URL above as the single source of truth — change it
  // in one place and all links update. Also enforces rel="sponsored".
  Array.prototype.forEach.call(
    document.querySelectorAll("a[href]"),
    function (a) {
      a.setAttribute("href", AFFILIATE_URL);
      a.setAttribute("rel", "sponsored");
    }
  );

  // Intake form: validate, confirm, then forward to the partner offer
  var form = document.getElementById("renewalForm");
  var success = document.getElementById("formSuccess");
  var fallback = document.getElementById("formFallback");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      if (fallback) fallback.setAttribute("href", AFFILIATE_URL);
      form.querySelector('button[type="submit"]').disabled = true;

      // Forward to the Stan Ventures managed-SEO offer
      window.setTimeout(function () {
        window.location.href = AFFILIATE_URL;
      }, 1200);
    });
  }
});
