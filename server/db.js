const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://admin:secret123@localhost:5432/newsportal',
    connectionTimeoutMillis: 5000,
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
                    url TEXT NOT NULL,
                    name VARCHAR(255),
                    alt TEXT,
                    type VARCHAR(100),
                    size INTEGER,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            `);

            console.log('✅ Database tables initialized');
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
