const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const crypto = require('crypto');

// Get all settings
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM settings');
        const settings = {};
        result.rows.forEach(row => {
            settings[row.key] = row.value;
        });
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Get single setting
router.get('/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const result = await pool.query('SELECT value FROM settings WHERE key = $1', [key]);
        if (result.rows.length === 0) {
            return res.json({ value: null });
        }
        res.json({ value: result.rows[0].value });
    } catch (error) {
        console.error('Error fetching setting:', error);
        res.status(500).json({ error: 'Failed to fetch setting' });
    }
});

// Save settings (upsert)
router.post('/', async (req, res) => {
    try {
        const settings = req.body;
        for (const [key, value] of Object.entries(settings)) {
            await pool.query(
                `INSERT INTO settings (key, value) VALUES ($1, $2)
                 ON CONFLICT (key) DO UPDATE SET value = $2`,
                [key, JSON.stringify(value)]
            );
        }
        res.json({ message: 'Settings saved' });
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

// Generate new webhook API key
router.post('/generate-api-key', async (req, res) => {
    try {
        const apiKey = 'whk_' + crypto.randomBytes(24).toString('hex');
        await pool.query(
            `INSERT INTO settings (key, value) VALUES ('webhookApiKey', $1)
             ON CONFLICT (key) DO UPDATE SET value = $1`,
            [JSON.stringify(apiKey)]
        );
        res.json({ apiKey });
    } catch (error) {
        console.error('Error generating API key:', error);
        res.status(500).json({ error: 'Failed to generate API key' });
    }
});

module.exports = router;
