# Millumin Web Timer - Deployment Guide

This guide explains how to deploy the Web Timer on a new machine (Mac/Windows).

## 1. Prerequisites
You must have **Node.js** installed on the machine that will run the timer script.
1. Download Node.js (LTS Version) from [nodejs.org](https://nodejs.org/).
2. Install it with default settings.
3. Verify installation by opening Terminal (Mac) or Command Prompt (Windows) and running:
   ```bash
   node -v
   ```
   (It should verify a version number like `v18.x.x` or higher).

## 2. Installation (Option A: Standalone Binary - Recommended)
1.  Download the executable `web_timer-macos` (Mac) or `web_timer-win.exe` (Windows).
2.  Place it in a folder on your Desktop (e.g., `WebTimer`).
3.  **Done!** No other installation is needed.

## 2. Installation (Option B: Source Code)
1.  Install **Node.js** (LTS) from [nodejs.org](https://nodejs.org/).
2.  Copy the project files (`server.js`, `package.json`, `public/`) to a folder.
3.  Open Terminal/Command Prompt in that folder.
4.  Run `npm install`.

## 3. Network Configuration
To ensure Millumin can talk to the Timer, and other devices can view the Timer:
1. **Connect both machines** (Millumin Mac & Timer Machine) to the same network/router.
2. **Find the Timer Machine's IP Address**:
   - **Mac**: System Settings > Network > Wi-Fi/Ethernet > Details.
   - **Windows**: Settings > Network & Internet > Properties.
   - *Example IP: `192.168.1.50`*

## 4. Running the Timer
1. In the Terminal/Command Prompt (inside the folder), run:
   ```bash
   node server.js
   ```
2. You should see:
   ```
   Millumin Web Timer running...
   Web Interface: http://localhost:3000
   Listening for OSC on UDP Port 8002
   ```
   *Note: If Windows Firewall pops up, allow access for Private Networks.*

## 5. Millumin Configuration (On the Show Machine)
1. Open **Millumin**.
2. Go to **Device/Interactions** > **OSC**.
3. Enable **OSC Output** (Sender).
4. Set the **IP Address** to the Timer Machine's IP (from Step 3).
5. Set the **Port** to `8002`.

## 6. Using the Timer
- **On the Timer Machine**: Open Chrome/Safari and go to `http://localhost:3000`.
- **On other devices (Tablets/Phones)**: Go to `http://[Timer-IP]:3000` (e.g., `http://192.168.1.50:3000`).

## Troubleshooting
- **Timer not moving?** Check that Millumin is sending to the correct IP and Port `8002`.
- **"Address in use" error?** Another program is using port 3000 or 8002. Close conflicting apps or restart the machine.
- **Firewall?** Ensure UDP Port 8002 (Inbound) and TCP Port 3000 (Inbound) are allowed.
