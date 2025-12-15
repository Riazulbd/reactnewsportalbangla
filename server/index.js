require('dotenv').config();
console.log('----------------------------------------');
console.log('🚀 BACKEND SERVICE STARTING - v1.0');
console.log('----------------------------------------');

const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool, initDB, isDbAvailable } = require('./db');
const articlesRoutes = require('./routes/articles');
const categoriesRoutes = require('./routes/categories');
const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');
const webhookRoutes = require('./routes/webhook');
const uploadRoutes = require('./routes/upload');
const databaseRoutes = require('./routes/database');

const app = express();
// Use BACKEND_PORT to avoid conflict with platform-injected PORT (usually 80 or 8080)
// which should be used by Nginx, not the backend in this all-in-one setup.
const PORT = process.env.BACKEND_PORT || 3001;

// Global error handlers
process.on('uncaughtException', (err) => {
    console.error('❌ UNCAUGHT EXCEPTION:', err);
    // Keep running if possible
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ UNHANDLED REJECTION:', reason);
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// SSR for Social Media Crawlers
app.get('/article/:id', async (req, res, next) => {
    // ... existing SSR code ...
    const userAgent = req.headers['user-agent'] || '';
    const isCrawler = /facebookexternalhit|Twitterbot|WhatsApp|LinkedInBot|Slackbot|TelegramBot|Pinterest|Googlebot/i.test(userAgent);

    if (!isCrawler) {
        return next();
    }

    if (!isDbAvailable()) {
        return next();
    }

    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM articles WHERE id = $1 OR slug = $1', [id]);
        const article = result.rows[0];

        if (!article) {
            return res.status(404).send('Article not found');
        }

        const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
        const articleUrl = `${baseUrl}/article/${article.slug || article.id}`;
        const imageUrl = article.image || `${baseUrl}/default-og.jpg`;
        const description = article.excerpt || article.content?.substring(0, 200) || '';

        const html = `<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} - বাংলা সংবাদ পোর্টাল</title>
    <meta name="description" content="${description}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${articleUrl}">
    <meta property="og:title" content="${article.title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:url" content="${imageUrl}">
    <meta property="og:image:secure_url" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    </head>
    <body>
        <h1>${article.title}</h1>
        <p>${description}</p>
        <img src="${imageUrl}" alt="${article.title}">
    </body>
    </html>`;

        res.send(html);
    } catch (error) {
        console.error('SSR Error:', error);
        next();
    }
});

// API Routes
app.use('/api/articles', articlesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/database', databaseRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route
app.get('/', (req, res) => {
    res.send('📰 News Portal Backend API is running!');
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        database: isDbAvailable() ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Start server
const startServer = async () => {
    console.log('🚀 Initializing server...');
    console.log(`📊 DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set (will use default)'}`);

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });

    // Try to connect to database in background
    await initDB();
};

startServer().catch(err => {
    console.error('❌ Server startup error:', err);
});
