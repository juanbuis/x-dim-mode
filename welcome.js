const params = new URLSearchParams(location.search);
const reason = params.get("reason");
const version = params.get("v");

const isUpdate = reason === "update";
const msg = chrome.i18n.getMessage;

// Close button
document.getElementById("closeBtn").addEventListener("click", () => window.close());

// Version badge
document.getElementById("version").textContent = version ? `v${version}` : "";

// Title & subtitle
const heading = document.getElementById("heading");
const subtitle = document.getElementById("subtitle");

if (isUpdate) {
  heading.textContent = msg("welcomeHeadingUpdate");
  subtitle.textContent = msg("welcomeSubtitleUpdate");
} else {
  heading.textContent = msg("welcomeHeadingInstall");
  subtitle.textContent = msg("welcomeSubtitleInstall");
}

// Features
const items = (isUpdate
  ? [
      msg("updateFeature1"),
      msg("updateFeature2"),
      msg("updateFeature3"),
      msg("updateFeature4"),
      msg("updateFeature5"),
      msg("updateFeature6"),
    ]
  : [
      msg("installFeature1"),
      msg("installFeature2"),
      msg("installFeature3"),
      msg("installFeature4"),
      msg("installFeature5"),
      msg("installFeature6"),
    ]
).filter(Boolean);

const list = document.getElementById("features");
for (const text of items) {
  const li = document.createElement("li");
  li.textContent = text;
  list.appendChild(li);
}

// Action buttons
const actions = document.getElementById("actions");

// Secondary action. This used to be a primary button directly under the
// subtitle — it won the click, sent people to x.com, and they never came back
// to the email box further down. It now sits below the ask, styled quietly.
const tryBtn = document.createElement("a");
tryBtn.href = "https://x.com";
tryBtn.target = "_blank";
tryBtn.className = "btn-secondary";
tryBtn.textContent = msg("tryNow");
actions.appendChild(tryBtn);


// Tag which surface the signup came from, so MailerLite can tell the install
// welcome apart from the post-update screen (all touchpoints share one form).
document.getElementById("emailSource").value = isUpdate ? "extension-update" : "extension-welcome";

// Email section copy
const emailLabel = document.getElementById("emailLabel");

emailLabel.innerHTML = `<strong>${msg("emailHeading")}</strong> ${msg("emailNoSpam")}`;

// Subscribe button & success message
document.getElementById("subscribeBtn").textContent = msg("subscribe");
document.getElementById("emailSuccess").textContent = msg("emailSuccess");

// Email form
const form = document.getElementById("emailForm");
const success = document.getElementById("emailSuccess");
const error = document.getElementById("emailError");

// Hide the email box if this user already subscribed (from the popup or a
// previous welcome page — state roams via storage.sync)
chrome.storage.sync.get(["emailSubscribed"], (syncVals) => {
  chrome.storage.local.get(["emailSubscribed"], (localVals) => {
    const subscribed = syncVals.emailSubscribed !== undefined ? syncVals.emailSubscribed : localVals.emailSubscribed;
    if (subscribed) document.querySelector(".email-section").style.display = "none";
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = form.querySelector("button");
  btn.disabled = true;
  btn.textContent = "...";
  error.style.display = "none";

  try {
    await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      mode: "no-cors",
    });
    form.style.display = "none";
    success.style.display = "block";
    chrome.storage.local.set({ emailSubscribed: true });
    chrome.storage.sync.set({ emailSubscribed: true }, () => void chrome.runtime.lastError);
  } catch (err) {
    error.textContent = msg("emailNetworkError");
    error.style.display = "block";
    btn.disabled = false;
    btn.textContent = msg("subscribe");
  }
});
