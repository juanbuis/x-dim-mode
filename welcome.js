const params = new URLSearchParams(location.search);
const reason = params.get("reason");
const version = params.get("v");

const isUpdate = reason === "update";
const msg = chrome.i18n.getMessage;

// Arabic is the one RTL locale we ship; Chrome does not set direction on
// extension pages automatically, so do it from the locale.
document.documentElement.dir = chrome.i18n.getMessage("@@bidi_dir");

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

// Pin hint — install only. On an update the extension is already there, and
// most people have long since decided whether to pin it.
if (!isUpdate) {
  document.getElementById("pinHintTitle").textContent = msg("pinHintTitle");
  document.getElementById("pinHintText").textContent = msg("pinHintText");
  document.getElementById("pinHint").classList.add("show");
}

// Features
const items = (isUpdate
  ? [
      msg("updateFeature1"),
      msg("updateFeature2"),
      msg("updateFeature3"),
      msg("updateFeature4"),
      msg("updateFeature5"),
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

// Layout order.
//
// The update screen reads "Here's what's new:" and then, before any news,
// showed the email box and a stray "Try it now" — the page promised a list and
// delivered an ask. On update the subtitle now sits directly above the bullets
// it introduces, and the action button moves to the end as the closing step,
// so nothing floats mid-page. The email box keeps its slot under the heading.
// Install is untouched: there the subtitle describes the product, not a list.
{
  const featuresEl = document.getElementById("features");
  const actionsEl = document.getElementById("actions");
  if (isUpdate) {
    featuresEl.before(subtitle);
    subtitle.classList.add("leads-list");
  }
  featuresEl.after(actionsEl);
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

// Install and update are different moments: a new user needs to know what
// they'd be signing up for; an existing user already has it working and
// cares that it keeps working when X moves things.
emailLabel.innerHTML = isUpdate
  ? `<strong>${msg("emailHeadingUpdate")}</strong> ${msg("emailSubUpdate")}`
  : `<strong>${msg("emailHeading")}</strong> ${msg("emailSubInstall")}`;

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

  const succeed = () => {
    form.style.display = "none";
    success.style.display = "block";
    // Post-subscribe is peak goodwill, and this audience is on X by
    // definition — the follow ask lives here, not in another prompt.
    const follow = document.getElementById("followCta");
    follow.textContent = msg("followCta");
    follow.style.display = "block";
    chrome.storage.local.set({ emailSubscribed: true });
    chrome.storage.sync.set({ emailSubscribed: true }, () => void chrome.runtime.lastError);
  };

  try {
    // The xdim.app proxy returns MailerLite's real verdict (the form endpoint
    // itself has no CORS headers, so it can only be read server-side).
    const res = await fetch("https://xdim.app/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: document.getElementById("emailInput").value.trim(),
        source: document.getElementById("emailSource").value,
      }),
    });
    const data = await res.json();
    if (data.success) {
      succeed();
      return;
    }
    // Proxy reachable and MailerLite said no — almost always a bad address.
    error.textContent = msg("emailInvalid");
    error.style.display = "block";
    btn.disabled = false;
    btn.textContent = msg("subscribe");
  } catch (err) {
    // Proxy unreachable (offline, or xdim.app down): fall back to the direct
    // no-cors post so the signup is never dropped. Opaque response, so assume
    // success — exactly what every version before the proxy did.
    try {
      await fetch(form.action, { method: "POST", body: new FormData(form), mode: "no-cors" });
      succeed();
      return;
    } catch {}
    error.textContent = msg("emailNetworkError");
    error.style.display = "block";
    btn.disabled = false;
    btn.textContent = msg("subscribe");
  }
});
