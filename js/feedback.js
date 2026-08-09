const FEEDBACK_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyHaK3N8LYjbauIqAhoIB1_dUEvrUjbn3DRwqXDsesjSa5BEVEH1ReFRI92I6kmVlQ/exec";

const feedbackForm = document.querySelector("#feedback-form");
const categoryInput = document.querySelector("#feedback-category");
const messageInput = document.querySelector("#feedback-message");
const emailInput = document.querySelector("#feedback-email");
const honeypotInput = document.querySelector("#feedback-website");
const statusMessage = document.querySelector("#feedback-status");
const responseFrame = document.querySelector("#feedback-frame");
const successPanel = document.querySelector("#feedback-success");
const sendAgainButton = document.querySelector("#feedback-again");
const count = document.querySelector("#feedback-count");
const submitButton = feedbackForm?.querySelector('button[type="submit"]');

let submissionInProgress = false;
let submissionTimeout;

function safeContextValue(value, maximumLength) {
  return String(value || "").trim().slice(0, maximumLength);
}

function setAppContext() {
  const query = new URLSearchParams(window.location.search);
  const source = query.get("source") === "app" ? "app" : "website";

  document.querySelector("#feedback-source").value = source;
  document.querySelector("#feedback-platform").value = safeContextValue(
    query.get("platform"),
    30,
  );
  document.querySelector("#feedback-version").value = safeContextValue(
    query.get("app_version"),
    30,
  );
}

function isValidWebAppUrl(value) {
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

function setError(input, errorId, message) {
  input.setAttribute("aria-invalid", message ? "true" : "false");
  document.querySelector(`#${errorId}`).textContent = message;
}

function validateForm() {
  const message = messageInput.value.trim();
  const email = emailInput.value.trim();
  let valid = true;

  if (!categoryInput.value) {
    setError(
      categoryInput,
      "category-error",
      "Choose what your feedback is about.",
    );
    valid = false;
  } else {
    setError(categoryInput, "category-error", "");
  }

  if (message.length < 10) {
    setError(
      messageInput,
      "message-error",
      "Add at least 10 characters so we have enough detail.",
    );
    valid = false;
  } else {
    setError(messageInput, "message-error", "");
  }

  if (email && !emailInput.validity.valid) {
    setError(
      emailInput,
      "email-error",
      "Enter a valid email address or leave this blank.",
    );
    valid = false;
  } else {
    setError(emailInput, "email-error", "");
  }

  return valid;
}

function resetSubmitButton() {
  if (!submitButton) return;

  submitButton.disabled = false;
  submitButton.innerHTML =
    'Send feedback <span aria-hidden="true">→</span>';
}

function finishSubmission() {
  if (!submissionInProgress) return;

  window.clearTimeout(submissionTimeout);
  submissionInProgress = false;
  resetSubmitButton();

  window.aceAnalytics?.track("feedback_submitted", {
    category: categoryInput.value,
    source: document.querySelector("#feedback-source").value,
  });

  feedbackForm.hidden = true;
  successPanel.hidden = false;
  successPanel.focus();
}

responseFrame?.addEventListener("load", finishSubmission);

feedbackForm?.addEventListener("submit", (event) => {
  if (!validateForm()) {
    event.preventDefault();
    feedbackForm.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  if (honeypotInput.value) {
    event.preventDefault();
    feedbackForm.reset();
    setAppContext();
    return;
  }

  if (!isValidWebAppUrl(FEEDBACK_APPS_SCRIPT_URL)) {
    event.preventDefault();
    statusMessage.textContent =
      "Feedback is temporarily unavailable. Please try again shortly.";
    statusMessage.className = "feedback-status is-visible is-error";
    return;
  }

  submissionInProgress = true;
  feedbackForm.action = FEEDBACK_APPS_SCRIPT_URL;
  feedbackForm.target = "feedback-frame";
  submitButton.disabled = true;
  submitButton.textContent = "Sending…";
  statusMessage.textContent = "Sending your feedback…";
  statusMessage.className = "feedback-status is-visible";

  submissionTimeout = window.setTimeout(() => {
    if (!submissionInProgress) return;

    submissionInProgress = false;
    resetSubmitButton();
    statusMessage.textContent =
      "We couldn’t confirm that submission. Check your connection and try again.";
    statusMessage.className = "feedback-status is-visible is-error";
  }, 12000);
});

[categoryInput, messageInput, emailInput].forEach((input) => {
  input?.addEventListener("input", () => {
    input.setAttribute("aria-invalid", "false");
    statusMessage.className = "feedback-status";
  });
});

messageInput?.addEventListener("input", () => {
  count.textContent = `${messageInput.value.length} / 4000`;
});

sendAgainButton?.addEventListener("click", () => {
  feedbackForm.reset();
  setAppContext();
  count.textContent = "0 / 4000";
  successPanel.hidden = true;
  feedbackForm.hidden = false;
  categoryInput.focus();
});

setAppContext();
