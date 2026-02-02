# Millumin Web Timer (Portable)

This is a standalone web timer for Millumin.
It reads Millumin's Native OSC feedback and displays a countdown timer on any device in the network.

## FLIGHT CHECKLIST
1.  **Millumin Settings**:
    -   Go to **Device Manager** (Cmd+K) -> **OSC**.
    -   Set **Input Port** to `5000` (Default).
    -   Set **Output Port** to `9001` (Important!). (Or 9000 if you prefer, but edit server.js).
    -   Check **API Feedback** (Required).

2.  **Layer Names**:
    -   Name your timeline layers clearly (e.g. `16x9`, `Fill`).
    -   These names MUST match what you enter in the Web Timer settings.

## HOW TO RUN
1.  Double-click `start_portable.command`.
2.  A Terminal window will open. Wait for "OSC Listener running...".
3.  Open a browser (Chrome/Safari) on any device.
4.  Go to the URL shown in the Terminal (e.g. `http://192.168.1.5:3000`).

## CONFIGURATION
1.  Right-click anywhere on the web page to open **Settings**.
2.  Enter your **Primary Layer Name** (e.g. `16x9`).
3.  Enter your **Fallback Layer Name** (e.g. `Fill`).
4.  Click **Save**.

## EXTRAS
-   `Millumin_Script_V3.js`: A script for Millumin boards if you want internal visuals (Optional).
