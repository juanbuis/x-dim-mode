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
const items = isUpdate
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
    ];

const list = document.getElementById("features");
for (const text of items) {
  const li = document.createElement("li");
  li.textContent = text;
  list.appendChild(li);
}

// Action buttons
const actions = document.getElementById("actions");

const tryBtn = document.createElement("a");
tryBtn.href = "https://x.com";
tryBtn.target = "_blank";
tryBtn.className = "btn-primary";
tryBtn.textContent = msg("tryNow");
actions.appendChild(tryBtn);

const shareBtn = document.createElement("a");
const shareText = encodeURIComponent("I've been using X Dim Mode \u2014 it brings back the dark blue theme on X and adds color themes. Check it out:");
const shareUrl = encodeURIComponent("https://xdim.app");
shareBtn.href = `https://x.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
shareBtn.target = "_blank";
shareBtn.className = "btn-secondary";
shareBtn.textContent = msg("shareOnX");
actions.appendChild(shareBtn);


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
  } catch (err) {
    error.textContent = msg("emailNetworkError");
    error.style.display = "block";
    btn.disabled = false;
    btn.textContent = msg("subscribe");
  }
});
