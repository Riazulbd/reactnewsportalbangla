const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get all articles
router.get('/', async (req, res) => {
    try {
        const { category, featured, limit = 100, offset = 0 } = req.query;
        let query = 'SELECT * FROM articles';
        const params = [];
        const conditions = [];

        if (category) {
            conditions.push(`category = $${params.length + 1}`);
            params.push(category);
        }
        if (featured === 'true') {
            conditions.push('featured = true');
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Failed to fetch articles' });
    }
});

// Get single article by ID or slug
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = isNaN(id)
            ? 'SELECT * FROM articles WHERE slug = $1'
            : 'SELECT * FROM articles WHERE id = $1 OR slug = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ error: 'Failed to fetch article' });
    }
});

// Create article
router.post('/', async (req, res) => {
    try {
        const {
            title, slug, excerpt, content, category, author,
            authorAvatar, image, readTime, featured, tags, seo
        } = req.body;

        console.log('📝 CREATE ARTICLE - Request received:');
        console.log('  Title:', title);
        console.log('  Slug:', slug);
        console.log('  Category:', category);
        console.log('  Has content:', !!content);
        console.log('  Has image:', !!image);

        const result = await pool.query(
            `INSERT INTO articles 
             (title, slug, excerpt, content, category, author, author_avatar, image, read_time, featured, tags, seo)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING *`,
            [title, slug, excerpt, content, category, author, authorAvatar, image, readTime || '৫ মিনিট', featured || false, tags || [], seo || {}]
        );

        console.log('✅ ARTICLE CREATED - ID:', result.rows[0].id);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('❌ ERROR creating article:', error.message);
        console.error('  Stack:', error.stack);
        res.status(500).json({ error: 'Failed to create article: ' + error.message });
    }
});

// Update article
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title, slug, excerpt, content, category, author,
            authorAvatar, image, readTime, featured, tags, seo
        } = req.body;

        console.log('📝 UPDATE ARTICLE - Request received:');
        console.log('  ID:', id);
        console.log('  Title:', title);
        console.log('  Has content:', !!content);

        const result = await pool.query(
            `UPDATE articles SET 
             title = $1, slug = $2, excerpt = $3, content = $4, category = $5, 
             author = $6, author_avatar = $7, image = $8, read_time = $9, 
             featured = $10, tags = $11, seo = $12, updated_at = NOW()
             WHERE id = $13 RETURNING *`,
            [title, slug, excerpt, content, category, author, authorAvatar, image, readTime, featured, tags, seo, id]
        );

        if (result.rows.length === 0) {
            console.log('⚠️ Article not found:', id);
            return res.status(404).json({ error: 'Article not found' });
        }

        console.log('✅ ARTICLE UPDATED - ID:', result.rows[0].id);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('❌ ERROR updating article:', error.message);
        console.error('  Stack:', error.stack);
        res.status(500).json({ error: 'Failed to update article: ' + error.message });
    }
});

// Delete article
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM articles WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json({ message: 'Article deleted', article: result.rows[0] });
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ error: 'Failed to delete article' });
    }
});

module.exports = router;
