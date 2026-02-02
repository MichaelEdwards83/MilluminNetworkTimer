// Millumin Creative Coding: PRODUCTION V3 (Standalone + Web Sender)
// Purpose: 
// 1. Visually displays a Countdown & Info directly in Millumin (Standalone Mode).
// 2. Sends data to the Web Timer via OSC.

// CONFIGURATION
Parameter.createParameter("OSC Host", "127.0.0.1");
Parameter.createParameter("OSC Port", 9001);
Parameter.createParameter("Primary Layer", "16x9");
Parameter.createParameter("Fallback Layer", "Fill");

// HELPER: Format Seconds to MM:SS
function formatTime(s) {
    if (s < 0 || isNaN(s)) return "00:00";
    var m = Math.floor(s / 60);
    var sec = Math.floor(s % 60);
    if (m < 10) m = "0" + m;
    if (sec < 10) sec = "0" + sec;
    return m + ":" + sec;
}

// HELPER: Get Name
function getLayerName(layerName) {
    if (!layerName) return "Waiting...";
    try {
        var name = Millumin.getLayerMediaName(layerName);
        return name ? name : "Waiting...";
    } catch (e) { return "Waiting..."; }
}

// HELPER: Sanitize Name
function sanitize(str) {
    if (!str) return "";
    return str.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

// MAIN LOOP
var frameCounter = 0;

function draw() {
    // 1. SETUP CANVAS
    Graphics.setSize(1920, 1080);
    Graphics.fillBackground("rgba(0, 0, 0, 0.8)"); // Darker background

    // 2. GET DATA
    var host = Parameter.get("OSC Host");
    var port = Parameter.get("OSC Port");
    var dest = host + ":" + port;

    var priLayer = Parameter.get("Primary Layer");
    var secLayer = Parameter.get("Fallback Layer");

    // Names
    var priName = getLayerName(priLayer);
    var secName = getLayerName(secLayer);

    // Column
    var colName = "Waiting...";
    try {
        var c = Millumin.getLaunchedColumnName();
        if (c) colName = c;
    } catch (e) { }

    // Time Logic (Standalone)
    var activeLayer = priName !== "Waiting..." ? priLayer : secLayer;
    var activeName = priName !== "Waiting..." ? priName : secName;

    var curTime = 0;
    var totTime = 0;
    try {
        curTime = Millumin.getLayerMediaTime(activeLayer);
        totTime = Millumin.getLayerMediaDuration(activeLayer);
    } catch (e) { }

    var remaining = Math.max(0, totTime - curTime);
    var timeStr = formatTime(remaining);

    // 3. DRAW VISUALS (Standalone Mode)

    // Column (Top Center)
    // Manual Centering ( Approx )
    Graphics.drawText("COLUMN", 860, 100, 30, "#888888");
    Graphics.drawText(colName, 660, 150, 60, "#FFFF00");

    // Countdown (Center Large)
    var color = "#4CAF50"; // Green
    if (remaining <= 30) color = "#FF9800"; // Orange
    if (remaining <= 10) color = "#FF5252"; // Red
    if (activeName === "Waiting...") color = "#444444";

    // 00:00 is approx 800px wide at size 300?
    // Let's guess X=500 for the huge countdown
    Graphics.drawText(timeStr, 560, 400, 300, color);

    // Info (Bottom)
    Graphics.drawText("CURRENT MEDIA", 860, 700, 30, "#888888");
    Graphics.drawText(activeName, 460, 750, 40, "#FFFFFF");

    // Progress Bar (Text Based Fallback)
    // Since fillRectangle is missing, we use a string of pipe characters or similar.
    if (totTime > 0) {
        var pct = curTime / totTime; // 0.0 to 1.0
        var totalChars = 80; // Total length of bar in chars
        var fillChars = Math.floor(totalChars * pct);

        var barStr = "[";
        for (var i = 0; i < totalChars; i++) {
            if (i < fillChars) barStr += "|";
            else barStr += ".";
        }
        barStr += "]";

        // Center text approx
        Graphics.drawText(barStr, 180, 850, 60, color);
    }

    // --- NEXT COLUMN LOGIC ---
    // Broadcast Next Column Name for Web Timer

    var currentIndex = -1;
    var nextName = "-";
    var debugStr = "Init...";

    try {
        if (typeof Millumin.getLaunchedColumnIndex === 'function') {
            currentIndex = Millumin.getLaunchedColumnIndex();
            // 1-based index (e.g. 4)

            var nextIndex = currentIndex + 1;
            debugStr = "Idx:" + currentIndex;

            // STRATEGY: Array Access via getColumns()
            if (typeof Millumin.getColumns === 'function') {
                var cols = Millumin.getColumns();
                if (cols) {
                    debugStr += " Cols:" + cols.length;

                    // Arrays are 0-based.
                    // UI Index 1 = Array[0]
                    // UI Index 4 = Array[3]
                    // Next Column (UI 5) = Array[4]
                    // So we want Array[currentIndex] ?
                    // If current is 4. Array[4] is the 5th element. Yes.

                    var targetIdx = currentIndex; // If current=4, this gets 5th item.

                    if (targetIdx < cols.length) {
                        var c = cols[targetIdx];
                        if (c && typeof c.getName === 'function') {
                            nextName = c.getName();
                        } else {
                            debugStr += " NoNameFn";
                        }
                    } else {
                        nextName = "(End)";
                    }
                } else {
                    debugStr += " ColsNull";
                }
            } else {
                debugStr += " NoGetCols";

                // Fallback to getColumn(index) just in case
                if (typeof Millumin.getColumn === 'function') {
                    // ... unlikely if NoAPI before, but leave as backup
                }
            }
        } else {
            debugStr = "NoGetIdx";
        }
    } catch (err) { debugStr = "Err:" + err; }

    if (!nextName) nextName = "-";

    // DEBUG result
    Graphics.drawText("NEXT: " + nextName, 20, 20, 30, "#00FF00");
    Graphics.drawText("DEBUG: " + debugStr, 20, 60, 20, "#FFFF00");

    // Force "Address Hack" sending which we know works (server logs confirm it arrives)
    // Server log showed: /millumin/board/nextColumnName/-
    // So if we send /millumin/board/nextColumnName/MyColumn, web processing can regex capture it.
    Millumin.sendOSC(dest, "/millumin/board/nextColumnName/" + sanitize(nextName));

    // 4. NETWORK SENDER (Approx 4fps)
    frameCounter++;
    if (frameCounter % 15 === 0) {
        var safePri = sanitize(priName);
        Millumin.sendOSC(dest, "/media/v2/primary/" + safePri);

        // Define safeCol here!
        var safeCol = sanitize(colName);

        var safeSec = sanitize(secName);
        Millumin.sendOSC(dest, "/media/v2/fallback/" + safeSec);

        Millumin.sendOSC(dest, "/media/v2/column/" + safeCol);
    }
}
