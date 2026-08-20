const ACE_GA_MEASUREMENT_ID = "G-NHDMR09JGK";
const ACE_ANALYTICS_CONSENT_KEY = "ace-analytics-consent";

window.dataLayer = window.dataLayer || [];

function gtag() {
  window.dataLayer.push(arguments);
}

(function () {
    const isEmbeddedWebview = /Instagram|TikTok|FBAN|FBAV|Twitter|LinkedIn|Snapchat|Line/i.test(
      navigator.userAgent || navigator.vendor || window.opera
    );

    if (isEmbeddedWebview) {
      const notice = document.getElementById('webview-notice');
      if (notice) {
        notice.style.display = 'block';
      }
    }
  })();


gtag("consent", "default", {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
  wait_for_update: 500,
});
gtag("set", "ads_data_redaction", true);

let analyticsLoaded = false;

function getStoredConsent() {
  try {
    return window.localStorage.getItem(ACE_ANALYTICS_CONSENT_KEY);
  } catch {
    return null;
  }
}

function storeConsent(value) {
  try {
    window.localStorage.setItem(ACE_ANALYTICS_CONSENT_KEY, value);
  } catch {
    // The selection still applies to this page if storage is unavailable.
  }
}

function loadAnalytics() {
  if (analyticsLoaded) return;

  analyticsLoaded = true;
  gtag("consent", "update", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });
  gtag("js", new Date());
  gtag("config", ACE_GA_MEASUREMENT_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const googleTag = document.createElement("script");
  googleTag.async = true;
  googleTag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
    ACE_GA_MEASUREMENT_ID,
  )}`;
  document.head.appendChild(googleTag);
}

function disableAnalytics() {
  gtag("consent", "update", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });

  const analyticsCookies = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0].trim())
    .filter((name) => name === "_ga" || name.startsWith("_ga_"));

  analyticsCookies.forEach((name) => {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.aceitstudios.co.uk; SameSite=Lax`;
    document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.acetmua.aceitstudios.co.uk; SameSite=Lax`;
  });
}

function trackEvent(name, parameters = {}) {
  if (getStoredConsent() !== "granted") return;

  loadAnalytics();
  gtag("event", name, parameters);
}

window.aceAnalytics = {
  track: trackEvent,
};

function createConsentBanner() {
  const banner = document.createElement("section");
  banner.className = "cookie-banner";
  banner.id = "cookie-banner";
  banner.setAttribute("aria-label", "Analytics cookie choices");
  banner.hidden = true;
  banner.innerHTML = `
    <div class="cookie-banner__content">
      <div>
        <p class="cookie-banner__eyebrow">Your privacy</p>
        <h2>Help us improve Ace TMUA?</h2>
        <p>
          We would like to use Google Analytics cookies to understand how people
          find and use this website. They are optional and are off until you
          accept. Read our <a href="privacy.html#website">privacy policy</a>.
        </p>
      </div>
      <div class="cookie-banner__actions">
        <button class="button button--secondary" type="button" data-cookie-reject>
          Reject
        </button>
        <button class="button button--primary" type="button" data-cookie-accept>
          Accept analytics
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);
  return banner;
}

function initialiseAnalyticsConsent() {
  const banner = createConsentBanner();
  const acceptButton = banner.querySelector("[data-cookie-accept]");
  const rejectButton = banner.querySelector("[data-cookie-reject]");
  const settingsButtons = document.querySelectorAll("[data-cookie-settings]");

  function showBanner() {
    banner.hidden = false;
    acceptButton?.focus();
  }

  function hideBanner() {
    banner.hidden = true;
  }

  acceptButton?.addEventListener("click", () => {
    storeConsent("granted");
    loadAnalytics();
    hideBanner();
  });

  rejectButton?.addEventListener("click", () => {
    storeConsent("denied");
    disableAnalytics();
    hideBanner();
  });

  settingsButtons.forEach((button) => {
    button.addEventListener("click", showBanner);
  });

  const storedConsent = getStoredConsent();

  if (storedConsent === "granted") {
    loadAnalytics();
  } else if (storedConsent === "denied") {
    disableAnalytics();
  } else {
    showBanner();
  }

  document.addEventListener("click", (event) => {
    const clickedElement =
      event.target instanceof Element
        ? event.target
        : event.target.parentElement;
    const link = clickedElement?.closest("a[href]");
    if (!link || getStoredConsent() !== "granted") return;

    const destination = new URL(link.href, window.location.href);
    const linkText = link.textContent.trim().replace(/\s+/g, " ").slice(0, 100);

    if (
      destination.origin === window.location.origin &&
      (link.classList.contains("button") ||
        link.classList.contains("hero-explore"))
    ) {
      trackEvent("cta_click", {
        link_text: linkText,
        link_url: destination.href,
      });
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialiseAnalyticsConsent);
} else {
  initialiseAnalyticsConsent();
}
