# Millumin Network Timer

A real-time web-based countdown timer for Millumin V4/V5, designed for network deployment.

## Features
- **Real-time Countdown**: Syncs perfectly with Millumin via OSC.
- **Next Column Display**: Shows the name of the next column in the board.
- **Auto-Switching**: Automatically switches between a Primary Layer (e.g., 16x9 Content) and a Fallback Layer (e.g., Fill/Logo) when playback stops.
- **Zero Configuration**: Auto-discovers Millumin on the network (Port 8002).

## Quick Start (Pre-Built)
1.  Download the executable for your OS (`web_timer-macos` or `web_timer-win.exe`).
2.  Double-click to run.
3.  Open `http://localhost:3000`.

## Quick Start (Source)
1.  **Install Node.js**.
2.  Run `npm install`.
3.  Run `node server.js`.
4.  Open `http://localhost:3000`.

## Configuration in Millumin
To make this work, Millumin must broadcast OSC data.
1.  Open **Device Manager** > **OSC**.
2.  Enable **Tablets/TouchOSC** (This usually enables the API feedback).
3.  Ensure **OSC Output** is ON.
4.  Target IP: The machine running this timer.
5.  **Target Port**: `8002` (Crucial).

## Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed installation instructions on new machines.

## Usage
- **Right-Click** on the page to open Settings.
- Set your **Primary Layer Name** (must match Millumin layer name exactly).
- Set your **Secondary Layer Name** (fallback).
