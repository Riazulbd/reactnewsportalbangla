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

const articles = [
    {
        title: "জলবায়ু সম্মেলনে বিশ্ব নেতাদের ঐতিহাসিক মিলন",
        excerpt: "১৯০টিরও বেশি দেশের নেতারা জলবায়ু পরিবর্তনের চ্যালেঞ্জ মোকাবেলা এবং নতুন পরিবেশ নীতি প্রণয়নে একত্রিত হয়েছেন।",
        content: `১৯০টিরও বেশি দেশের বিশ্ব নেতারা ইতিহাসের সবচেয়ে গুরুত্বপূর্ণ জলবায়ু সম্মেলনে একত্রিত হয়েছেন। জেনেভায় অনুষ্ঠিত এই তিন দিনের অনুষ্ঠানের লক্ষ্য কার্বন নিঃসরণ এবং নবায়নযোগ্য শক্তি গ্রহণের বিষয়ে বাধ্যতামূলক চুক্তি স্থাপন করা।

বৈশ্বিক তাপমাত্রা ক্রমাগত বৃদ্ধি এবং চরম আবহাওয়ার ঘটনা আরও ঘন ঘন হওয়ার সাথে সাথে এই সম্মেলন একটি গুরুত্বপূর্ণ সময়ে অনুষ্ঠিত হচ্ছে।`,
        category: 'politics',
        author: 'সারাহ মিচেল',
        authorAvatar: 'https://i.pravatar.cc/150?img=1',
        image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800',
        featured: true,
        slug: 'climate-summit-world-leaders'
    },
    {
        title: "চ্যাম্পিয়নশিপ ফাইনালে দুর্বলদের অবিশ্বাস্য জয়",
        excerpt: "যে খেলাটি প্রজন্মের পর প্রজন্ম মনে রাখা হবে, সেখানে দুর্বল দলটি নাটকীয় অতিরিক্ত সময়ে জয় ছিনিয়ে নিয়েছে।",
        content: `ক্রীড়া বিশ্লেষকরা যাকে এখন পর্যন্ত সেরা চ্যাম্পিয়নশিপ খেলা বলছেন, সেখানে আন্ডারডগ দল ডিফেন্ডিং চ্যাম্পিয়নদের বিরুদ্ধে অতিরিক্ত সময়ে অবিশ্বাস্য জয় পেয়েছে।`,
        category: 'sports',
        author: 'মাইক জনসন',
        authorAvatar: 'https://i.pravatar.cc/150?img=3',
        image: 'https://images.unsplash.com/photo-1461896836934-478978c600b7?w=800',
        featured: false,
        slug: 'championship-underdog-victory'
    },
    {
        title: "বিপ্লবী এআই সিস্টেমে বৈজ্ঞানিক অগ্রগতি",
        excerpt: "একটি নতুন কৃত্রিম বুদ্ধিমত্তা সিস্টেম কয়েক দশকের পুরনো গাণিতিক সমস্যার সমাধান করেছে, পদার্থবিজ্ঞান এবং প্রকৌশলে নতুন সম্ভাবনার দ্বার খুলে দিয়েছে।",
        content: `বিজ্ঞানীরা কৃত্রিম বুদ্ধিমত্তায় একটি যুগান্তকারী অর্জন ঘোষণা করেছেন, যেখানে একটি নতুন এআই সিস্টেম সফলভাবে একটি গাণিতিক সমস্যার সমাধান করেছে যা ৫০ বছরেরও বেশি সময় ধরে গবেষকদের বিভ্রান্ত করে রেখেছিল।`,
        category: 'technology',
        author: 'ড. এমিলি চেন',
        authorAvatar: 'https://i.pravatar.cc/150?img=5',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
        featured: true,
        slug: 'ai-breakthrough-mathematics'
    },
    {
        title: "ব্লকবাস্টার চলচ্চিত্র সর্বকালের বক্স অফিস রেকর্ড ভেঙেছে",
        excerpt: "প্রিয় ফ্র্যাঞ্চাইজির সর্বশেষ কিস্তি বক্স অফিস রেকর্ড ভেঙে সিনেমা ইতিহাসের সর্বোচ্চ আয়কারী চলচ্চিত্রে পরিণত হয়েছে।",
        content: `হলিউড উদযাপন করছে কারণ সর্বশেষ ব্লকবাস্টার আনুষ্ঠানিকভাবে সর্বকালের সর্বোচ্চ আয়কারী চলচ্চিত্রে পরিণত হয়েছে, প্রায় এক দশক ধরে দাঁড়িয়ে থাকা রেকর্ড ছাড়িয়ে গেছে।`,
        category: 'entertainment',
        author: 'জেসিকা ওয়াং',
        authorAvatar: 'https://i.pravatar.cc/150?img=9',
        image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
        featured: false,
        slug: 'blockbuster-box-office-record'
    },
    {
        title: "টেক জায়ান্টের বিপ্লবী টেকসই শক্তি উদ্যোগ ঘোষণা",
        excerpt: "বড় প্রযুক্তি কোম্পানি নবায়নযোগ্য শক্তিতে ৫০ বিলিয়ন ডলার বিনিয়োগের প্রতিশ্রুতি দিয়েছে।",
        content: `টেক শিল্পের জন্য রূপান্তরকারী হিসাবে প্রশংসিত একটি পদক্ষেপে, বিশ্বের বৃহত্তম প্রযুক্তি কোম্পানিগুলোর একটি টেকসই শক্তি অবকাঠামোতে ৫০ বিলিয়ন ডলার বিনিয়োগের ঘোষণা করেছে।`,
        category: 'business',
        author: 'রবার্ট টেলর',
        authorAvatar: 'https://i.pravatar.cc/150?img=11',
        image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800',
        featured: false,
        slug: 'tech-giant-sustainable-energy'
    },
    {
        title: "দশকের দ্বন্দ্বের পর ঐতিহাসিক শান্তি চুক্তি স্বাক্ষর",
        excerpt: "দুই দেশ আনুষ্ঠানিকভাবে দশকের শত্রুতার অবসান ঘটিয়ে ব্যাপক শান্তি চুক্তি স্বাক্ষর করেছে।",
        content: `অসংখ্য বিশ্ব নেতাদের উপস্থিতিতে একটি অনুষ্ঠানে, দুই দীর্ঘদিনের প্রতিদ্বন্দ্বী একটি ঐতিহাসিক শান্তি চুক্তি স্বাক্ষর করেছে।`,
        category: 'world',
        author: 'আমান্ডা রবার্টস',
        authorAvatar: 'https://i.pravatar.cc/150?img=25',
        image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800',
        featured: false,
        slug: 'historic-peace-agreement'
    },
    {
        title: "উদীয়মান তারকা খেলোয়াড় বিশ্ব রেকর্ড ভাঙলেন",
        excerpt: "১৯ বছর বয়সী একজন সেনসেশন রেকর্ড বই পুনর্লিখন করেছেন।",
        content: `ক্রীড়া বিশ্ব তোলপাড় হচ্ছে ১৯ বছর বয়সী একজন খেলোয়াড় ইতিহাসের সবচেয়ে উল্লেখযোগ্য পারফরম্যান্সগুলোর একটি প্রদান করার পরে।`,
        category: 'sports',
        author: 'মাইক জনসন',
        authorAvatar: 'https://i.pravatar.cc/150?img=3',
        image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
        featured: false,
        slug: 'rising-star-world-record'
    },
    {
        title: "কোয়ান্টাম কম্পিউটিং মাইলফলক: প্রথম ত্রুটিমুক্ত প্রসেসর",
        excerpt: "বিজ্ঞানীরা প্রথম ত্রুটিমুক্ত কোয়ান্টাম প্রসেসর তৈরি করেছেন।",
        content: `গবেষকদের একটি দল এমন কিছু অর্জন করেছে যা অনেকের মতে বছরের পর বছর দূরে ছিল: ঘরের তাপমাত্রায় ত্রুটিমুক্ত অপারেশনে সক্ষম প্রথম কোয়ান্টাম প্রসেসর তৈরি।`,
        category: 'technology',
        author: 'ড. এমিলি চেন',
        authorAvatar: 'https://i.pravatar.cc/150?img=5',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
        featured: false,
        slug: 'quantum-computing-milestone'
    }
];

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
