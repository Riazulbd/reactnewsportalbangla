const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Encryption key (must match database.js route)
const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY || 'newsportal-secure-key-32chars!!';
const IV_LENGTH = 16;

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
        return text;
    }
}

// Load saved config from config.json
function loadSavedConfig() {
    const configPath = path.join(__dirname, 'config.json');
    try {
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (config.password) {
                config.password = decrypt(config.password);
            }
            return config;
        }
    } catch (err) {
        console.error('Error loading saved DB config:', err.message);
    }
    return null;
}

// Build connection string from saved config
function getConnectionString() {
    // Priority 1: Environment variable
    if (process.env.DATABASE_URL) {
        console.log('📊 Using DATABASE_URL from environment');
        return process.env.DATABASE_URL;
    }

    // Priority 2: Saved config.json
    const savedConfig = loadSavedConfig();
    if (savedConfig && savedConfig.host && savedConfig.password) {
        console.log('📊 Using saved database configuration from config.json');
        const { host, port, database, username, password } = savedConfig;
        return `postgres://${username}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
    }

    // Priority 3: Default local database
    console.log('📊 No database configured. Using local default.');
    return 'postgres://admin:secret123@localhost:5432/newsportal';
}

// Get SSL config from saved config
function getSSLConfig() {
    const savedConfig = loadSavedConfig();
    if (savedConfig && savedConfig.sslMode) {
        if (savedConfig.sslMode === 'require' || savedConfig.sslMode === 'verify-full') {
            return { rejectUnauthorized: savedConfig.sslMode === 'verify-full' };
        } else if (savedConfig.sslMode === 'prefer') {
            return { rejectUnauthorized: false };
        }
    }
    // Check if using cloud database (DATABASE_URL usually requires SSL)
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')) {
        return { rejectUnauthorized: false };
    }
    return undefined;
}

const pool = new Pool({
    connectionString: getConnectionString(),
    ssl: getSSLConfig(),
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 10,
});

// Track database availability
let dbAvailable = false;


// Initialize database tables with retry
const initDB = async (retries = 10, delay = 3000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const client = await pool.connect();
            console.log(`✅ Database connected (attempt ${i + 1})`);

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

                -- Media library table
                CREATE TABLE IF NOT EXISTS media (
                    id SERIAL PRIMARY KEY,
                    filename VARCHAR(255) NOT NULL,
                    original_name VARCHAR(255),
                    mime_type VARCHAR(100),
                    size INTEGER,
                    url TEXT,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            `);

            console.log('✅ Database tables initialized');

            // Check if seeding is needed
            const result = await client.query('SELECT COUNT(*) FROM articles');
            const count = parseInt(result.rows[0].count);

            if (count === 0) {
                console.log('🌱 Database is empty. Running auto-seed...');
                // Lazy load seed to avoid circular dependencies if any (though currently none)
                // But better to just run the seed logic here or call the seed file.
                // Since seed.js is a standalone script, we should modify it to export the function or assume it runs.
                // To be safe and reuse code, let's assume we will modify seed.js next.
                // For this step, I will assume we will modify seed.js next.

                const { seed } = require('./seed');
                await seed();
            } else {
                console.log(`✅ Database already contains ${count} articles. Skipping seed.`);
            }

            client.release();
            dbAvailable = true;
            return true;
        } catch (err) {
            console.error(`❌ Database connection attempt ${i + 1}/${retries} failed:`, err.message);
            if (i < retries - 1) {
                console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    console.error('❌ Could not connect to database after all retries. Running without database.');
    dbAvailable = false;
    return false;
};

const isDbAvailable = () => dbAvailable;

module.exports = { pool, initDB, isDbAvailable };
