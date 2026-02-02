const { Client } = require('node-osc');

const client = new Client('127.0.0.1', 9000);

console.log("Sending Test Message to 127.0.0.1:9000...");

client.send('/layer/time', 123.45, (err) => {
    if (err) console.error("Error sending:", err);
    else console.log("Sent: /layer/time 123.45");

    client.send('/layer/name', 'Test Clip', (err) => {
        if (err) console.error(err);
        else console.log("Sent: /layer/name Test Clip");
        client.close();
    });
});
