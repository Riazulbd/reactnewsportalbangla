const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ============================================================
// DATABASE CONNECTION - PROVIDER-AGNOSTIC, FAIL-SAFE
// Supports: Supabase, Neon, Railway, DigitalOcean, AWS, Local
// ============================================================

// Encryption key for stored credentials
const RAW_KEY = process.env.DB_ENCRYPTION_KEY || 'newsportal-secure-key-default';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(RAW_KEY).digest();
const IV_LENGTH = 16;

// Invalid hostnames that should never be used
const INVALID_HOSTNAMES = ['base', 'hostname', 'host', 'example.com', 'your-host', 'your-db-host'];

// Decrypt function for stored passwords
function decrypt(text) {
    try {
        const textParts = text.split(':');
        if (textParts.length < 2) return text; // Not encrypted
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch {
        return text;
    }
}

// Load saved config from config.json (for admin UI database settings)
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
        console.error('⚠️ Error loading saved DB config:', err.message);
    }
    return null;
}

// Validate a database URL and return parsed components
function validateDatabaseUrl(url) {
    if (!url || typeof url !== 'string' || url.trim() === '') {
        return { valid: false, error: 'DATABASE_URL is empty or not set' };
    }

    try {
        const parsed = new URL(url);

        // Check protocol
        if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
            return { valid: false, error: `Unsupported protocol: ${parsed.protocol}. Expected postgres:// or postgresql://` };
        }

        // Check hostname
        if (!parsed.hostname || parsed.hostname.trim() === '') {
            return { valid: false, error: 'DATABASE_URL hostname is missing' };
        }

        // Check for invalid placeholder hostnames
        const hostname = parsed.hostname.toLowerCase();
        if (INVALID_HOSTNAMES.includes(hostname)) {
            return {
                valid: false,
                error: `DATABASE_URL contains placeholder hostname "${hostname}". Please set a real database host.`
            };
        }

        // Check for localhost in production (warning, not error)
        const isProduction = process.env.NODE_ENV === 'production';
        if (isProduction && (hostname === 'localhost' || hostname === '127.0.0.1')) {
            console.warn('⚠️ WARNING: Using localhost database in production environment');
        }

        // Validate port if specified
        if (parsed.port && (parseInt(parsed.port) < 1 || parseInt(parsed.port) > 65535)) {
            return { valid: false, error: `Invalid port: ${parsed.port}` };
        }

        return {
            valid: true,
            hostname: parsed.hostname,
            port: parsed.port || '5432',
            database: parsed.pathname?.slice(1) || 'postgres',
            username: parsed.username || 'postgres',
            hasPassword: !!parsed.password
        };
    } catch (err) {
        return { valid: false, error: `Failed to parse DATABASE_URL: ${err.message}` };
    }
}

// Build connection configuration from individual env vars
function buildFromEnvVars() {
    const host = process.env.DB_HOST;
    const port = process.env.DB_PORT || '5432';
    const database = process.env.DB_NAME || process.env.DB_DATABASE || 'postgres';
    const username = process.env.DB_USER || process.env.DB_USERNAME || 'postgres';
    const password = process.env.DB_PASSWORD;

    if (!host) {
        return { valid: false, error: 'DB_HOST environment variable is not set' };
    }

    if (INVALID_HOSTNAMES.includes(host.toLowerCase())) {
        return { valid: false, error: `DB_HOST contains placeholder value "${host}". Please set a real database host.` };
    }

    if (!password) {
        return { valid: false, error: 'DB_PASSWORD environment variable is not set' };
    }

    return {
        valid: true,
        connectionString: `postgres://${username}:${encodeURIComponent(password)}@${host}:${port}/${database}`,
        hostname: host,
        port,
        database
    };
}

// Get database connection configuration with strict validation
function getConnectionConfig() {
    console.log('📊 Initializing database connection...');

    // Priority 1: DATABASE_URL environment variable
    if (process.env.DATABASE_URL) {
        const validation = validateDatabaseUrl(process.env.DATABASE_URL);

        if (!validation.valid) {
            console.error('❌ DATABASE_URL VALIDATION FAILED:', validation.error);
            throw new Error(`Database configuration error: ${validation.error}`);
        }

        console.log('✅ Using DATABASE_URL from environment');
        console.log('  Host:', validation.hostname);
        console.log('  Port:', validation.port);
        console.log('  Database:', validation.database);

        return {
            connectionString: process.env.DATABASE_URL,
            hostname: validation.hostname
        };
    }

    // Priority 2: Individual DB_* environment variables
    if (process.env.DB_HOST) {
        const config = buildFromEnvVars();

        if (!config.valid) {
            console.error('❌ DB ENV VARS VALIDATION FAILED:', config.error);
            throw new Error(`Database configuration error: ${config.error}`);
        }

        console.log('✅ Using individual DB_* environment variables');
        console.log('  Host:', config.hostname);
        console.log('  Port:', config.port);
        console.log('  Database:', config.database);

        return {
            connectionString: config.connectionString,
            hostname: config.hostname
        };
    }

    // Priority 3: Saved config.json (from admin UI)
    const savedConfig = loadSavedConfig();
    if (savedConfig && savedConfig.host && savedConfig.password) {
        if (INVALID_HOSTNAMES.includes(savedConfig.host.toLowerCase())) {
            console.error('❌ SAVED CONFIG VALIDATION FAILED: Invalid hostname in config.json');
            throw new Error(`Database configuration error: config.json contains placeholder hostname "${savedConfig.host}"`);
        }

        console.log('✅ Using saved database configuration from config.json');
        console.log('  Host:', savedConfig.host);
        console.log('  Port:', savedConfig.port || 5432);
        console.log('  Database:', savedConfig.database || 'postgres');

        const { host, port = 5432, database = 'postgres', username = 'postgres', password } = savedConfig;
        return {
            connectionString: `postgres://${username}:${encodeURIComponent(password)}@${host}:${port}/${database}`,
            hostname: host
        };
    }

    // No valid configuration found
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
        console.error('❌ FATAL: No database configuration found in production!');
        console.error('   Set DATABASE_URL or DB_HOST/DB_PASSWORD environment variables.');
        throw new Error('No database configuration found. Set DATABASE_URL or individual DB_* variables.');
    }

    // Development fallback only
    console.warn('⚠️ No database configured. Using local development default.');
    console.warn('   This is only acceptable in development mode.');
    return {
        connectionString: 'postgres://postgres:postgres@localhost:5432/newsportal',
        hostname: 'localhost'
    };
}

// Get SSL configuration
function getSSLConfig(hostname) {
    // Check saved config for explicit SSL setting
    const savedConfig = loadSavedConfig();
    if (savedConfig?.sslMode) {
        if (savedConfig.sslMode === 'require' || savedConfig.sslMode === 'verify-full') {
            return { rejectUnauthorized: savedConfig.sslMode === 'verify-full' };
        } else if (savedConfig.sslMode === 'prefer') {
            return { rejectUnauthorized: false };
        } else if (savedConfig.sslMode === 'disable') {
            return undefined;
        }
    }

    // Auto-detect SSL need based on hostname
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
        // Cloud databases typically require SSL
        return { rejectUnauthorized: false };
    }

    return undefined;
}

// Initialize pool with validated configuration
let pool;
let dbAvailable = false;
let connectionHostname = 'unknown';

try {
    const config = getConnectionConfig();
    connectionHostname = config.hostname;

    pool = new Pool({
        connectionString: config.connectionString,
        ssl: getSSLConfig(config.hostname),
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
        max: 10,
    });
} catch (err) {
    console.error('❌ FATAL: Database pool creation failed:', err.message);
    // Create a dummy pool that will fail on any query
    pool = {
        query: async () => { throw new Error('Database not configured: ' + err.message); },
        connect: async () => { throw new Error('Database not configured: ' + err.message); },
    };
}

// Initialize database tables with retry
const initDB = async (retries = 10, delay = 3000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const client = await pool.connect();
            console.log(`✅ Database connected (attempt ${i + 1}) to ${connectionHostname}`);

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

                -- RSS Feeds table
                CREATE TABLE IF NOT EXISTS rss_feeds (
                    id SERIAL PRIMARY KEY,
                    url TEXT NOT NULL,
                    name VARCHAR(255),
                    category VARCHAR(100) DEFAULT 'national',
                    last_imported TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW()
                );

                -- Add source columns to articles if not exist
                DO $$ BEGIN
                    ALTER TABLE articles ADD COLUMN IF NOT EXISTS source VARCHAR(50);
                    ALTER TABLE articles ADD COLUMN IF NOT EXISTS source_url TEXT;
                EXCEPTION WHEN OTHERS THEN NULL;
                END $$;
            `);

            console.log('✅ Database tables initialized');

            // Check if seeding is needed
            const result = await client.query('SELECT COUNT(*) FROM articles');
            const count = parseInt(result.rows[0].count);

            if (count === 0) {
                console.log('🌱 Database is empty. Running auto-seed...');
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

    console.error('❌ Could not connect to database after all retries.');

    // In production, this is fatal
    if (process.env.NODE_ENV === 'production') {
        console.error('❌ FATAL: Exiting due to database connection failure in production.');
        process.exit(1);
    }

    dbAvailable = false;
    return false;
};

const isDbAvailable = () => dbAvailable;
const getDbHostname = () => connectionHostname;

module.exports = { pool, initDB, isDbAvailable, getDbHostname };
