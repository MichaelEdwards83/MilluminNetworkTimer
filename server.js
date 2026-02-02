const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
// Fix for pkg: Point directly to CommonJS build to avoid export resolution errors
const { Server } = require('node-osc/dist/lib/index.js');
const path = require('path');

// CONFIG
const WEB_PORT = 3000;
const OSC_PORT = 8002;

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// FORCE IPv4 Binding (0.0.0.0)
// This captures 127.0.0.1, localhost, and LAN IP traffic on the specified port.
// We avoid '::' (IPv6) to prevent EINVAL errors on some networks.
// Revert to 0.0.0.0 to accept both Localhost and LAN IP packets
// This is necessary if we switch Millumin to use the LAN IP.
const oscServer = new Server(OSC_PORT, '0.0.0.0', () => {
    console.log(`\n✅ OSC Listener running on 0.0.0.0:${OSC_PORT}`);
    console.log(`---------------------------------------------------`);
    console.log(`📡  WEB TIMER ACCESS URLs:`);

    const os = require('os');
    const nets = os.networkInterfaces();
    const results = Object.create(null);

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
                console.log(`   👉  http://${net.address}:${WEB_PORT}`);
            }
        }
    }
    console.log(`---------------------------------------------------\n`);
});

oscServer.on('error', (err) => {
    console.error("OSC Server Error:", err);
});

// State Memory
let serverState = {
    columnName: "Waiting...",
    primaryName: "Waiting...",
    secondaryName: "Waiting...",
    layerTimes: {}
};

// OSC Message Handling
oscServer.on('message', (msg) => {
    console.log("OSC Received (Message):", msg);

    // Update Memory
    updateServerState(msg);

    // Forward to Web
    io.emit('oscResult', Array.from(msg));
});

oscServer.on('bundle', (bundle) => {
    console.log("OSC Received (Bundle):", bundle);
    if (bundle.elements) {
        bundle.elements.forEach(element => {
            console.log("  -> Bundle Element:", element);

            // Update Memory
            updateServerState(element);

            // Forward
            io.emit('oscResult', Array.from(element));
        });
    }
});

function updateServerState(msg) {
    const address = msg[0];

    // 1. Column Name
    if (address === '/millumin/board/launchedColumn') {
        if (msg.length >= 3) serverState.columnName = msg[2];
    }

    // 2. Media Names (Native)
    // /millumin/layer:[NAME]/mediaStarted -> [index, name, duration]
    const layerRegex = /^\/millumin\/layer:([^\/]+)\/mediaStarted/;
    const match = address.match(layerRegex);
    if (match && msg.length >= 2) {
        const layerName = match[1];
        const mediaName = msg[2];

        // We don't know which is Primary/Fallback here (it's config dependent),
        // But we can just store it in a map if we wanted. 
        // Simple approach: The client logic filters by config.
        // For the *server* to know which key to update (state.primaryName), it would need the config.
        // Since we want the server to be dumb about config, let's just forward EVERYTHING on connect.
        // Actually, we can't easily replay "events" that happened in the past without knowing which ones matter.

        // BETTER STRATEGY FOR PORTABILITY:
        // The server doesn't need to parse everything. The server just needs to allow the client to request state?
        // No, the client is passive.

        // Let's just broadcast the *Specific Native Messages* we've captured that represent state.
        // actually, re-emitting the last known "mediaStarted" for every layer is complex.

        // Alternative: Just Fix the UI.
        // The UI fix I did earlier (inferring "Media Playing" from time) is good enough for 99% of cases.
        // Adding complexity to server.js might be overkill if the user just wants "portable".
        // Let's stick to the UI fix I already made, which is robust enough.

        // Wait, the user specifically complained "names are not" (working).
        // My previous UI fix handled the *timer*, but maybe not the *names* if they were missed.
        // Okay, I will add a simple cache for "mediaStarted" events.
        if (!serverState.layers) serverState.layers = {};
        serverState.layers[layerName] = msg; // Store the whole ['/....', index, name, dur] message
    }

    if (address === '/millumin/board/launchedColumn') {
        serverState.lastColumnMsg = msg;
    }
}

// Web Client Connection Handling
io.on('connection', (socket) => {
    console.log('A web client connected:', socket.id);

    // 1. Send immediate heartbeat
    socket.emit('heartbeat', { time: Date.now() });

    // 2. Replay Last Known State
    if (serverState.lastColumnMsg) {
        socket.emit('oscResult', serverState.lastColumnMsg);
    }

    if (serverState.layers) {
        Object.values(serverState.layers).forEach(cachedMsg => {
            socket.emit('oscResult', cachedMsg);
        });
    }

    socket.on('disconnect', () => {
        console.log('Web client disconnected:', socket.id);
    });
});

// Web Server
http.listen(WEB_PORT, '0.0.0.0', () => {
    console.log(`Web interface running at http://localhost:${WEB_PORT}`);
});

// Heartbeat (1 update per second)
setInterval(() => {
    io.emit('heartbeat', { time: Date.now() });
}, 1000);
