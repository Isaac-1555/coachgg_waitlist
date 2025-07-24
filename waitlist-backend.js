// CoachGG Waitlist Backend (Node.js/Express)
// This file shows how to implement a proper backend for the waitlist
// Run with: node waitlist-backend.js

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Database Setup ---
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Render connections
    }
});

// Function to create the waitlist table if it doesn't exist
async function initializeDatabase() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS waitlist (
                id UUID PRIMARY KEY,
                email_hash VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) NOT NULL,
                gamertag VARCHAR(255),
                primary_game VARCHAR(255),
                ip_address VARCHAR(45),
                user_agent TEXT,
                referrer TEXT,
                consent_given BOOLEAN NOT NULL,
                consent_timestamp TIMESTAMPTZ NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('Database initialized, table "waitlist" is ready.');
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        client.release();
    }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files

// Rate limiting (simple implementation)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5; // 5 requests per window

function rateLimit(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return next();
    }
    
    const limit = rateLimitMap.get(ip);
    
    if (now > limit.resetTime) {
        limit.count = 1;
        limit.resetTime = now + RATE_LIMIT_WINDOW;
        return next();
    }
    
    if (limit.count >= RATE_LIMIT_MAX) {
        return res.status(429).json({
            error: 'Too many requests. Please try again later.',
            retryAfter: Math.ceil((limit.resetTime - now) / 1000)
        });
    }
    
    limit.count++;
    next();
}

// Hash email for duplicate checking while preserving privacy
function hashEmail(email) {
    return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Sanitize input
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/[<>]/g, '');
}

// --- Routes ---

// Get waitlist count (public)
app.get('/api/waitlist/count', async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM waitlist;');
        res.json({ count: parseInt(result.rows[0].count, 10) });
    } catch (error) {
        console.error('Error getting waitlist count:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Join waitlist
app.post('/api/waitlist/join', rateLimit, async (req, res) => {
    try {
        const { email, gamertag, primaryGame, consent } = req.body;
        
        // Validation
        if (!email || !consent) {
            return res.status(400).json({ error: 'Email and consent are required' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        if (consent !== true) {
            return res.status(400).json({ error: 'Consent must be explicitly given' });
        }
        
        const emailHash = hashEmail(email);
        
        // Check for duplicates
        const existing = await pool.query('SELECT id FROM waitlist WHERE email_hash = $1', [emailHash]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        
        // Create new entry
        const newEntry = {
            id: crypto.randomUUID(),
            emailHash: emailHash,
            email: email,
            gamertag: sanitizeInput(gamertag || ''),
            primaryGame: sanitizeInput(primaryGame || ''),
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent') || '',
            referrer: req.get('Referer') || 'direct',
            consentGiven: true,
            consentTimestamp: new Date()
        };
        
        // Insert into database
        await pool.query(
            `INSERT INTO waitlist (id, email_hash, email, gamertag, primary_game, ip_address, user_agent, referrer, consent_given, consent_timestamp)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [newEntry.id, newEntry.emailHash, newEntry.email, newEntry.gamertag, newEntry.primaryGame, newEntry.ipAddress, newEntry.userAgent, newEntry.referrer, newEntry.consentGiven, newEntry.consentTimestamp]
        );
        
        console.log(`New waitlist signup: ${emailHash.substring(0, 8)}... at ${newEntry.consentTimestamp}`);
        
        res.status(201).json({
            success: true,
            message: 'Successfully joined waitlist',
            id: newEntry.id,
            timestamp: newEntry.consentTimestamp
        });
        
    } catch (error) {
        console.error('Error joining waitlist:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin endpoint to export data (password protected)
app.get('/api/admin/export', async (req, res) => {
    try {
        const { password } = req.query;
        if (password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const result = await pool.query('SELECT id, email, gamertag, primary_game, created_at, referrer FROM waitlist ORDER BY created_at DESC');
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin endpoint to get statistics
app.get('/api/admin/stats', async (req, res) => {
    try {
        const { password } = req.query;
        if (password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const totalSignupsQuery = pool.query('SELECT COUNT(*) FROM waitlist');
        const signupsTodayQuery = pool.query("SELECT COUNT(*) FROM waitlist WHERE created_at >= current_date");
        const gameBreakdownQuery = pool.query("SELECT primary_game, COUNT(*) FROM waitlist GROUP BY primary_game");
        const referrerBreakdownQuery = pool.query("SELECT referrer, COUNT(*) FROM waitlist GROUP BY referrer");
        const signupsByDayQuery = pool.query("SELECT date_trunc('day', created_at) AS day, COUNT(*) FROM waitlist GROUP BY day ORDER BY day");

        const [
            totalSignupsResult,
            signupsTodayResult,
            gameBreakdownResult,
            referrerBreakdownResult,
            signupsByDayResult
        ] = await Promise.all([
            totalSignupsQuery,
            signupsTodayQuery,
            gameBreakdownQuery,
            referrerBreakdownQuery,
            signupsByDayQuery
        ]);

        const stats = {
            totalSignups: parseInt(totalSignupsResult.rows[0].count, 10),
            signupsToday: parseInt(signupsTodayResult.rows[0].count, 10),
            gameBreakdown: gameBreakdownResult.rows.reduce((acc, row) => {
                acc[row.primary_game || 'Not specified'] = parseInt(row.count, 10);
                return acc;
            }, {}),
            referrerBreakdown: referrerBreakdownResult.rows.reduce((acc, row) => {
                acc[row.referrer || 'direct'] = parseInt(row.count, 10);
                return acc;
            }, {}),
            signupsByDay: signupsByDayResult.rows.reduce((acc, row) => {
                acc[new Date(row.day).toDateString()] = parseInt(row.count, 10);
                return acc;
            }, {})
        };
        
        res.json(stats);
        
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        const client = await pool.connect();
        client.release();
        res.json({ status: 'OK', timestamp: new Date().toISOString(), database: 'Connected' });
    } catch (error) {
        res.status(500).json({ status: 'Error', timestamp: new Date().toISOString(), database: 'Disconnected', error: error.message });
    }
});

// Serve the landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎮 CoachGG Waitlist Server running on port ${PORT}`);
    initializeDatabase();
});

module.exports = app;
