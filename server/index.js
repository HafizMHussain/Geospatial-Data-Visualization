const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const dataRoutes = require('./routes/data');

// API Routes
app.use('/api/data', dataRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'SDSS Geospatial Visualization Server Running' });
});

app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║   SDSS Geospatial Visualization Server                    ║
    ║   Running on http://localhost:${PORT}                        ║
    ║   API endpoints available at /api/data                    ║
    ╚═══════════════════════════════════════════════════════════╝
    `);
});
