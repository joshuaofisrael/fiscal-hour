(function () {
  var STORAGE_KEY = "fiscalhour-analytics-consent";
  var ACCEPTED = "accepted";
  var DECLINED = "declined";
  var DENIED = {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  };

  function measurementId() {
    var node = document.querySelector("script[data-ga-measurement-id]");
    var id = node ? String(node.getAttribute("data-ga-measurement-id") || "") : "";
    return /^G-[A-Z0-9]+$/.test(id) ? id : "";
  }

  function ensureGtag() {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== "function") {
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag("consent", "default", DENIED);
    }
  }

  function storedChoice() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function storeChoice(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      /* Storage can be blocked. The visit still follows the click. */
    }
  }

  function banner() {
    return document.getElementById("consent-banner");
  }

  function hideBanner() {
    var node = banner();
    if (!node) return;
    if (document.activeElement && node.contains && node.contains(document.activeElement)) {
      var main = document.getElementById("main");
      if (main && main.focus) main.focus();
    }
    node.hidden = true;
  }

  function showBanner() {
    var node = banner();
    if (node) node.hidden = false;
  }

  var loaded = false;

  function loadAnalytics() {
    var id = measurementId();
    if (!id) return;
    ensureGtag();
    window.gtag("consent", "update", { analytics_storage: "granted" });
    if (loaded) return;
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(script);
    window.gtag("js", new Date());
    window.gtag("config", id);
    loaded = true;
  }

  function accept() {
    storeChoice(ACCEPTED);
    hideBanner();
    loadAnalytics();
  }

  function decline() {
    storeChoice(DECLINED);
    hideBanner();
  }

  function withdraw() {
    storeChoice(DECLINED);
    hideBanner();
    ensureGtag();
    window.gtag("consent", "update", DENIED);
  }

  ensureGtag();
  var choice = storedChoice();
  if (choice === ACCEPTED) {
    hideBanner();
    loadAnalytics();
  } else if (choice === DECLINED) {
    hideBanner();
  } else {
    showBanner();
  }

  document.addEventListener("click", function (event) {
    var node = event.target;
    var action = "";
    while (node) {
      if (node.id === "consent-accept" || node.id === "consent-allow") {
        action = "accept";
        break;
      }
      if (node.id === "consent-decline") {
        action = "decline";
        break;
      }
      if (node.id === "consent-withdraw") {
        action = "withdraw";
        break;
      }
      node = node.parentNode;
    }
    if (action === "accept") accept();
    else if (action === "decline") decline();
    else if (action === "withdraw") withdraw();
  });
})();
