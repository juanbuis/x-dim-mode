# Ship checklist — 1.7.0

When submitting this version:

- [ ] **Update the Chrome Web Store listing description** — it still only sells
      themes; the draft covering Extras/Following/image grid is in the session
      notes (or ask Claude for it). This was explicitly requested as a reminder.
- [ ] Paste release notes into AMO's "release notes" field on upload
- [ ] Upload `x-dim-mode-1.7.0.zip` (Chrome) and `x-dim-mode-firefox-1.7.0.zip` (AMO)
- [ ] Quick manual test first: image grid on a 4-image post, quote-tweet with
      images, and the photo lightbox (the three cases not covered in testing)
- [ ] After shipping: delete test subscribers from MailerLite (search `+xdm-`)
- [ ] After shipping: check MailerLite for `signup_source` values arriving
      (extension-welcome / extension-update / extension-popup / website)

Done already: site deployed with /api/subscribe proxy; `signup_source` field
created in MailerLite and verified end-to-end; update screen enabled for 1.7.0.
