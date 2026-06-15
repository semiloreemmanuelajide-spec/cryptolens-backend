// 1. Core Environmental Settings Always Load First
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io'); 

// 2. Database and Route Dependencies (Cleanly Destructured Pair Model Here)
const { sequelize, Pair } = require('./models');
const cryptoRoutes = require('./routes/cryptoRoutes');
const { startListener } = require('./blockchainListener'); 

// 3. Initialize App and HTTP Server Instantly
const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// 4. Initialize Socket.io Stream Layer
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// 5. Global Middlewares
app.use(cors());
app.use(express.json());

// 6. API Route Handlers
app.use('/api/crypto', cryptoRoutes);

app.get('/api/health', (req, res) => {
    return res.json({ status: 'OK', message: 'CryptoLens Real-Time Backend Running!' });
});

// ✨ FIXED & LOCKED: Cache Hydration Endpoint with Return Protection
app.get('/api/pairs/recent', async (req, res) => {
    try {
        // Fetch the last 30 newly created tokens from your MySQL database
        const recentPairs = await Pair.findAll({
            limit: 30,
            order: [['createdAt', 'DESC']]
        });
        
        // Explicit return to ensure the response stream closes cleanly immediately
        return res.status(200).json(recentPairs);
    } catch (error) {
        console.error('Error fetching recent pairs from database:', error);
        return res.status(500).json({ error: 'Failed to hydrate token cache' });
    }
});

// 7. Client Connection Socket Handlers
io.on('connection', (socket) => {
    console.log(`🔌 New User Connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
        console.log(`❌ User Disconnected: ${socket.id}`);
    });
});

// 8. Database Synchronization and Execution Server Start
sequelize.sync({ force: false })
    .then(() => {
        console.log('Database connected successfully via MySQL/Sequelize.');
        server.listen(PORT, () => {
            console.log(`🚀 Server & WebSockets running on port ${PORT}`);
            
            // Fire up the listener inside the clean execution frame
            startListener(io); 
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// 9. Clean Export Handling
module.exports = { app, server, io };