const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Webhook endpoint for external article submission
router.post('/article', async (req, res) => {
    try {
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            return res.status(401).json({ error: 'Missing API key. Include X-API-Key header.' });
        }

        // Validate API key
        const keyResult = await pool.query('SELECT value FROM settings WHERE key = $1', ['webhookApiKey']);
        if (keyResult.rows.length === 0) {
            return res.status(401).json({ error: 'No API key configured. Generate one in settings.' });
        }

        const storedKey = JSON.parse(keyResult.rows[0].value);
        if (apiKey !== storedKey) {
            return res.status(401).json({ error: 'Invalid API key' });
        }

        // Validate required fields
        const { title, content, excerpt, category, author, image, featured, tags } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Missing required fields: title, content' });
        }

        // Generate slug
        const slug = title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 100) + '-' + Date.now();

        // Insert article
        const result = await pool.query(
            `INSERT INTO articles 
             (title, slug, excerpt, content, category, author, image, featured, tags)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [
                title,
                slug,
                excerpt || content.substring(0, 200) + '...',
                content,
                category || 'uncategorized',
                author || 'API',
                image || '',
                featured || false,
                tags || []
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Article created successfully',
            article: result.rows[0]
        });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Failed to create article: ' + error.message });
    }
});

module.exports = router;
