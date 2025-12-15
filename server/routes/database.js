const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Config file path
const configPath = path.join(__dirname, '../config.json');

// Encryption key (in production, use environment variable)
const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY || 'newsportal-secure-key-32chars!!';
const IV_LENGTH = 16;

// Encrypt function
function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Decrypt function
function decrypt(text) {
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch {
        return text; // Return as-is if decryption fails
    }
}

// Load saved config
function loadConfig() {
    try {
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (config.password) {
                config.password = decrypt(config.password);
            }
            return config;
        }
    } catch (err) {
        console.error('Error loading config:', err);
    }
    return null;
}

// Save config
function saveConfig(config) {
    const toSave = { ...config };
    if (toSave.password) {
        toSave.password = encrypt(toSave.password);
    }
    fs.writeFileSync(configPath, JSON.stringify(toSave, null, 2));
}

// Test database connection
router.post('/test', async (req, res) => {
    const { host, port, database, username, password } = req.body;

    if (!host || !port || !database || !username || !password) {
        return res.status(400).json({
            success: false,
            error: 'সকল ফিল্ড পূরণ করুন'
        });
    }

    const connectionString = `postgres://${username}:${password}@${host}:${port}/${database}`;
    const testPool = new Pool({ connectionString, connectionTimeoutMillis: 5000 });

    try {
        const client = await testPool.connect();
        const result = await client.query('SELECT version()');
        client.release();
        await testPool.end();

        res.json({
            success: true,
            message: 'সংযোগ সফল!',
            version: result.rows[0].version
        });
    } catch (err) {
        await testPool.end().catch(() => { });
        res.json({
            success: false,
            error: `সংযোগ ব্যর্থ: ${err.message}`
        });
    }
});

// Save database configuration
router.post('/configure', async (req, res) => {
    const { host, port, database, username, password } = req.body;

    if (!host || !port || !database || !username || !password) {
        return res.status(400).json({
            success: false,
            error: 'সকল ফিল্ড পূরণ করুন'
        });
    }

    // Test connection first
    const connectionString = `postgres://${username}:${password}@${host}:${port}/${database}`;
    const testPool = new Pool({ connectionString, connectionTimeoutMillis: 5000 });

    try {
        const client = await testPool.connect();
        client.release();
        await testPool.end();

        // Save configuration
        saveConfig({ host, port, database, username, password });

        res.json({
            success: true,
            message: 'কনফিগারেশন সংরক্ষিত হয়েছে!'
        });
    } catch (err) {
        await testPool.end().catch(() => { });
        res.status(400).json({
            success: false,
            error: `সংযোগ পরীক্ষা ব্যর্থ: ${err.message}`
        });
    }
});

// Run migrations
router.post('/migrate', async (req, res) => {
    const { host, port, database, username, password } = req.body;

    const connectionString = `postgres://${username}:${password}@${host}:${port}/${database}`;
    const pool = new Pool({ connectionString });

    try {
        const client = await pool.connect();

        // Create all tables
        await client.query(`
            -- Articles table
            CREATE TABLE IF NOT EXISTS articles (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                slug VARCHAR(255) UNIQUE,
                excerpt TEXT,
                content TEXT,
                category VARCHAR(100),
                author VARCHAR(255),
                author_avatar TEXT,
                image TEXT,
                read_time VARCHAR(50) DEFAULT '৫ মিনিট',
                featured BOOLEAN DEFAULT FALSE,
                tags TEXT[] DEFAULT '{}',
                seo JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );

            -- Categories table
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE,
                color VARCHAR(20) DEFAULT '#7c3aed',
                parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
                order_index INTEGER DEFAULT 0
            );

            -- Users table
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255),
                email VARCHAR(255),
                role VARCHAR(50) DEFAULT 'author',
                created_at TIMESTAMP DEFAULT NOW()
            );

            -- Settings table
            CREATE TABLE IF NOT EXISTS settings (
                key VARCHAR(100) PRIMARY KEY,
                value JSONB
            );

            -- Media table
            CREATE TABLE IF NOT EXISTS media (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) NOT NULL,
                original_name VARCHAR(255),
                mime_type VARCHAR(100),
                size INTEGER,
                url TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );

            -- Create indexes
            CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
            CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured);
            CREATE INDEX IF NOT EXISTS idx_articles_created ON articles(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
        `);

        client.release();
        await pool.end();

        // Save config after successful migration
        saveConfig({ host, port, database, username, password });

        res.json({
            success: true,
            message: 'মাইগ্রেশন সফল! সকল টেবিল তৈরি হয়েছে।'
        });
    } catch (err) {
        await pool.end().catch(() => { });
        res.status(500).json({
            success: false,
            error: `মাইগ্রেশন ব্যর্থ: ${err.message}`
        });
    }
});

// Get current config (without password)
router.get('/config', (req, res) => {
    const config = loadConfig();
    if (config) {
        res.json({
            host: config.host,
            port: config.port,
            database: config.database,
            username: config.username,
            hasPassword: !!config.password
        });
    } else {
        res.json({
            host: '',
            port: '5432',
            database: '',
            username: '',
            hasPassword: false
        });
    }
});

module.exports = router;
