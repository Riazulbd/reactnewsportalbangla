const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://admin:secret123@localhost:5432/newsportal',
});

// Initialize database tables
const initDB = async () => {
    const client = await pool.connect();
    try {
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
    } catch (err) {
        console.error('❌ Database initialization error:', err);
    } finally {
        client.release();
    }
};

module.exports = { pool, initDB };
