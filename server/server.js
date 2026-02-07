// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (HTML, CSS, JS)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/sendMsg.html'));
});

let users = {};
// Handle socket connections
// API endpoint to get a session token
app.get("/get-token", (req, res) => {
    const token = Math.random().toString(36).substring(2, 10).toUpperCase(); // simple token
    res.json({ token });
});

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Register token with socket
    socket.on("registerToken", (token) => {
        users[token] = socket.id;
        console.log(`Token registered: ${token} (${socket.id})`);
    });

    // Private message: { toToken, text }
    socket.on("privateMessage", (data) => {
        const recipientSocketId = users[data.toToken];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("chatMessage", `(Recieved) ${data.fromToken}: ${data.text}`);
        } else {
            socket.emit("chatMessage", `User ID: "${data.toToken}" is not online.`);
        }
    });

    socket.on("disconnect", () => {
        for (let token in users) {
            if (users[token] === socket.id) {
                delete users[token];
                break;
            }
        }
        console.log("A user disconnected:", socket.id);
    });
});

app.use('/scripts', express.static(path.join(__dirname,'..', 'scripts')));
app.use('/images', express.static(path.join(__dirname,'..', 'images')));

server.listen(4000, () => {
    console.log('Server running on http://localhost:4000');
});
