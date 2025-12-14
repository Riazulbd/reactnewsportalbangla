require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://admin:secret123@localhost:5432/newsportal',
});

// Data from existing articles.js
const categories = [
    { id: 'politics', name: 'রাজনীতি', color: '#ef4444' },
    { id: 'sports', name: 'খেলাধুলা', color: '#22c55e' },
    { id: 'technology', name: 'প্রযুক্তি', color: '#3b82f6' },
    { id: 'entertainment', name: 'বিনোদন', color: '#a855f7' },
    { id: 'business', name: 'ব্যবসা', color: '#f59e0b' },
    { id: 'world', name: 'আন্তর্জাতিক', color: '#06b6d4' },
];

const articles = [];

// Helper to generate dummy Bengali content
const getDummyContent = (category, index) => {
    const titles = [
        "নতুন দিগন্তের সূচনা: বিস্ময়কর ঘটনা",
        "বিশেষ প্রতিবেদন: পরিবর্তনের হাওয়া",
        "ভবিষ্যতের পরিকল্পনা নিয়ে আলোচনা",
        "অসাধারণ অর্জনের গল্প"
    ];

    return {
        title: `${categories.find(c => c.id === category).name}: ${titles[index]} (${index + 1})`,
        excerpt: "এটি একটি ডামি আর্টিকেল যা নিউজ পোর্টালের লেআউট টেস্ট করার জন্য তৈরি করা হয়েছে। এখানে কিছু সাধারণ টেক্সট থাকবে।",
        content: `এটি একটি বিস্তারিত ডামি আর্টিকেল। নিউজ পোর্টালের বিভিন্ন সেকশন কীভাবে কাজ করে তা পরীক্ষা করার জন্য এই কন্টেন্ট ব্যবহার করা হচ্ছে। 
        
        প্যারাগ্রাফ ১: এখানে ঘটনার বিস্তারিত বর্ণনা থাকবে। কে, কখন, কোথায় এবং কীভাবে ঘটনাটি ঘটেছে তার বিবরণ।
        
        প্যারাগ্রাফ ২: সংশ্লিষ্টদের মতামত এবং প্রতিক্রিয়া। এই ঘটনার প্রভাব এবং ভবিষ্যতের ফলাফল নিয়ে আলোচনা।
        
        প্যারাগ্রাফ ৩: একটি উপসংহার এবং পরবর্তী পদক্ষেপ। পাঠকদের জন্য কিছু চিন্তার খোরাক এবং সাধারণ পর্যবেক্ষণ।`,
        category: category,
        author: 'ফাহিম আহমেদ',
        authorAvatar: `https://i.pravatar.cc/150?u=${category}${index}`,
        image: `https://placehold.co/800x400/e2e8f0/1e293b?text=${category.toUpperCase()}+${index + 1}`,
        featured: index === 0, // First article of each category is featured
        slug: `${category}-dummy-article-${index + 1}-${Date.now()}`
    };
};

// Generate 4 articles for each category
categories.forEach(cat => {
    for (let i = 0; i < 4; i++) {
        articles.push(getDummyContent(cat.id, i));
    }
});

const defaultAdmin = {
    username: 'admin',
    password: 'admin123',
    name: 'অ্যাডমিন',
    email: 'admin@example.com',
    role: 'admin'
};

async function seed() {
    const client = await pool.connect();

    try {
        console.log('🌱 Starting database seed...\n');

        // Create tables
        console.log('📦 Creating tables...');
        await client.query(`
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

            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE,
                color VARCHAR(20) DEFAULT '#7c3aed',
                parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
                order_index INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255),
                email VARCHAR(255),
                role VARCHAR(50) DEFAULT 'author',
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS settings (
                key VARCHAR(100) PRIMARY KEY,
                value JSONB
            );

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
        console.log('✅ Tables created\n');

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await client.query('DELETE FROM articles');
        await client.query('DELETE FROM categories');
        await client.query('DELETE FROM users');
        console.log('✅ Data cleared\n');

        // Seed categories
        console.log('📁 Seeding categories...');
        for (let i = 0; i < categories.length; i++) {
            const cat = categories[i];
            await client.query(
                'INSERT INTO categories (name, slug, color, order_index) VALUES ($1, $2, $3, $4)',
                [cat.name, cat.id, cat.color, i]
            );
            console.log(`  ✓ ${cat.name}`);
        }
        console.log('✅ Categories seeded\n');

        // Seed articles
        console.log('📰 Seeding articles...');
        for (const article of articles) {
            await client.query(
                `INSERT INTO articles (title, slug, excerpt, content, category, author, author_avatar, image, featured, read_time)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                    article.title,
                    article.slug,
                    article.excerpt,
                    article.content,
                    article.category,
                    article.author,
                    article.authorAvatar,
                    article.image,
                    article.featured,
                    '৫ মিনিট'
                ]
            );
            console.log(`  ✓ ${article.title.substring(0, 40)}...`);
        }
        console.log('✅ Articles seeded\n');

        // Seed admin user
        console.log('👤 Creating admin user...');
        const hashedPassword = await bcrypt.hash(defaultAdmin.password, 10);
        await client.query(
            'INSERT INTO users (username, password, name, email, role) VALUES ($1, $2, $3, $4, $5)',
            [defaultAdmin.username, hashedPassword, defaultAdmin.name, defaultAdmin.email, defaultAdmin.role]
        );
        console.log(`  ✓ Admin user created (username: admin, password: admin123)\n`);

        console.log('🎉 Database seed completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   - ${categories.length} categories`);
        console.log(`   - ${articles.length} articles`);
        console.log(`   - 1 admin user`);

    } catch (error) {
        console.error('❌ Seed error:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
