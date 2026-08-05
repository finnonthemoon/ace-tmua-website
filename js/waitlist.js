/*
 * Paste the deployed Google Apps Script Web App URL between the quotes below.
 * It must be the URL ending in /exec, not the Apps Script editor URL.
 *
 * Setup instructions: waitlist-backend/SETUP.md
 * Never put Google passwords, API keys or spreadsheet edit links here.
 */
const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyHaK3N8LYjbauIqAhoIB1_dUEvrUjbn3DRwqXDsesjSa5BEVEH1ReFRI92I6kmVlQ/exec";

const waitlistForm = document.querySelector("#waitlist-form");
const emailInput = document.querySelector("#waitlist-email");
const honeypotInput = document.querySelector("#waitlist-website");
const statusMessage = document.querySelector("#waitlist-status");
const responseFrame = document.querySelector("#waitlist-frame");
const submitButton = waitlistForm?.querySelector('button[type="submit"]');

let submissionInProgress = false;
let submissionTimeout;

function showStatus(message, type = "") {
  if (!statusMessage) return;

  statusMessage.textContent = message;
  statusMessage.className = `waitlist-status is-visible${
    type ? ` is-${type}` : ""
  }`;
}

function isValidWebAppUrl(value) {
  if (!value.trim()) return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "script.google.com" &&
      url.pathname.startsWith("/macros/s/") &&
      url.pathname.endsWith("/exec")
    );
  } catch {
    return false;
  }
}

function resetSubmitButton() {
  if (!submitButton) return;

  submitButton.disabled = false;
  submitButton.innerHTML =
    'Reserve my place <span aria-hidden="true">→</span>';
}

function finishSubmission() {
  if (!submissionInProgress || !waitlistForm) return;

  window.clearTimeout(submissionTimeout);
  submissionInProgress = false;
  waitlistForm.reset();
  resetSubmitButton();
  showStatus(
    "You’re on the list. Watch your inbox for Ace TMUA updates.",
    "success",
  );
  window.aceAnalytics?.track("generate_lead", {
    method: "waitlist",
  });
}

responseFrame?.addEventListener("load", finishSubmission);

waitlistForm?.addEventListener("submit", (event) => {
  emailInput?.setAttribute(
    "aria-invalid",
    emailInput.validity.valid ? "false" : "true",
  );

  if (!emailInput?.validity.valid) {
    event.preventDefault();
    emailInput?.focus();
    showStatus("Enter a valid email address to join the list.", "error");
    return;
  }

  if (honeypotInput?.value) {
    event.preventDefault();
    waitlistForm.reset();
    return;
  }

  if (!isValidWebAppUrl(GOOGLE_APPS_SCRIPT_URL)) {
    event.preventDefault();
    showStatus(
      "Early-access signup is being connected. Please try again shortly.",
      "error",
    );
    return;
  }

  submissionInProgress = true;
  waitlistForm.action = GOOGLE_APPS_SCRIPT_URL;
  waitlistForm.target = "waitlist-frame";
  emailInput.name = "email";
  submitButton.disabled = true;
  submitButton.textContent = "Joining…";

  submissionTimeout = window.setTimeout(() => {
    if (!submissionInProgress) return;

    submissionInProgress = false;
    resetSubmitButton();
    showStatus(
      "We couldn’t confirm that signup. Check your connection and try again.",
      "error",
    );
  }, 12000);
});

emailInput?.addEventListener("input", () => {
  emailInput.setAttribute("aria-invalid", "false");
  statusMessage?.classList.remove("is-visible", "is-error", "is-success");
});
