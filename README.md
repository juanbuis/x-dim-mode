# X Dim Mode

Chrome extension that restores the Dim (dark blue) background option to X/Twitter display settings.

![X Dim Mode icon](icons/icon128.png)

## What it does

X removed the Dim background option from Display settings. This extension brings it back.

- Adds a **Dim** button to Settings → Display → Background
- Quick toggle from the extension popup
- Pure CSS — lightweight and fast

## Install

### Chrome Web Store
Coming soon.

### Manual install
1. Download or clone this repo
2. Open `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select this folder
5. Set X to **Lights Out** mode, then select **Dim** from Settings → Display

## How it works

The extension layers the original Dim theme colors on top of Lights Out mode using CSS overrides. It also injects a "Dim" radio button into X's Display settings page so you can switch themes natively.

## Credits

Made by [@juanbuis](https://x.com/juanbuis)
