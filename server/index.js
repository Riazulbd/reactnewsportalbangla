require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool, initDB, isDbAvailable } = require('./db');
const articlesRoutes = require('./routes/articles');
const categoriesRoutes = require('./routes/categories');
const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');
const webhookRoutes = require('./routes/webhook');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// SSR for Social Media Crawlers
app.get('/article/:id', async (req, res, next) => {
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
    <meta property="og:locale" content="bn_BD">
    <meta property="og:site_name" content="বাংলা সংবাদ পোর্টাল">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${articleUrl}">
    <meta name="twitter:title" content="${article.title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
</head>
<body>
    <h1>${article.title}</h1>
    <p>${description}</p>
    <img src="${imageUrl}" alt="${article.title}">
    <script>window.location.href = '${articleUrl}';</script>
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

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        database: isDbAvailable() ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Start server (don't wait for DB, but try to connect)
const startServer = async () => {
    console.log('🚀 Starting server...');
    console.log(`📊 DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set (using default)'}`);

    // Start HTTP server immediately
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 API: http://localhost:${PORT}/api`);
    });

    // Try to connect to database in background
    await initDB();
};

startServer().catch(err => {
    console.error('Server startup error:', err);
    // Don't exit - keep running even with errors
});
