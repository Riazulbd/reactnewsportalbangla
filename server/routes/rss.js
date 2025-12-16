const express = require('express');
const router = express.Router();
const Parser = require('rss-parser');
const { pool, isDbAvailable } = require('../db');

const parser = new Parser({
    timeout: 10000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsPortal/1.0)'
    }
});

// Get all RSS feeds
router.get('/feeds', async (req, res) => {
    if (!isDbAvailable()) {
        return res.status(503).json({ error: 'Database not available' });
    }
    try {
        const result = await pool.query('SELECT * FROM rss_feeds ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching feeds:', err);
        res.status(500).json({ error: 'Failed to fetch feeds' });
    }
});

// Add new RSS feed
router.post('/feeds', async (req, res) => {
    if (!isDbAvailable()) {
        return res.status(503).json({ error: 'Database not available' });
    }
    const { url, name, category } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // Validate feed URL by trying to parse it
        await parser.parseURL(url);

        const result = await pool.query(
            `INSERT INTO rss_feeds (url, name, category) VALUES ($1, $2, $3) RETURNING *`,
            [url, name || 'Unnamed Feed', category || 'national']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding feed:', err);
        if (err.message.includes('Status code')) {
            return res.status(400).json({ error: 'Invalid RSS feed URL or feed not accessible' });
        }
        res.status(500).json({ error: 'Failed to add feed: ' + err.message });
    }
});

// Delete RSS feed
router.delete('/feeds/:id', async (req, res) => {
    if (!isDbAvailable()) {
        return res.status(503).json({ error: 'Database not available' });
    }
    try {
        const result = await pool.query('DELETE FROM rss_feeds WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Feed not found' });
        }
        res.json({ message: 'Feed deleted' });
    } catch (err) {
        console.error('Error deleting feed:', err);
        res.status(500).json({ error: 'Failed to delete feed' });
    }
});

// Import articles from all feeds
router.post('/import', async (req, res) => {
    if (!isDbAvailable()) {
        return res.status(503).json({ error: 'Database not available' });
    }
    try {
        const feedsResult = await pool.query('SELECT * FROM rss_feeds');
        const feeds = feedsResult.rows;

        if (feeds.length === 0) {
            return res.json({ imported: 0, message: 'কোনো RSS ফিড নেই' });
        }

        let totalImported = 0;
        const errors = [];

        for (const feed of feeds) {
            try {
                const imported = await importFeed(feed);
                totalImported += imported;

                // Update last_imported timestamp
                await pool.query(
                    'UPDATE rss_feeds SET last_imported = NOW() WHERE id = $1',
                    [feed.id]
                );
            } catch (err) {
                errors.push({ feed: feed.name, error: err.message });
            }
        }

        res.json({
            imported: totalImported,
            message: `${totalImported}টি নিউজ ইম্পোর্ট হয়েছে`,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (err) {
        console.error('Import error:', err);
        res.status(500).json({ error: 'Import failed: ' + err.message });
    }
});

// Import from specific feed
router.post('/import/:id', async (req, res) => {
    if (!isDbAvailable()) {
        return res.status(503).json({ error: 'Database not available' });
    }
    try {
        const feedResult = await pool.query('SELECT * FROM rss_feeds WHERE id = $1', [req.params.id]);
        if (feedResult.rows.length === 0) {
            return res.status(404).json({ error: 'Feed not found' });
        }

        const feed = feedResult.rows[0];
        const imported = await importFeed(feed);

        await pool.query(
            'UPDATE rss_feeds SET last_imported = NOW() WHERE id = $1',
            [feed.id]
        );

        res.json({
            imported,
            message: `${imported}টি নিউজ ইম্পোর্ট হয়েছে`
        });
    } catch (err) {
        console.error('Import error:', err);
        res.status(500).json({ error: 'Import failed: ' + err.message });
    }
});

// Helper function to import articles from a feed
async function importFeed(feed) {
    const rss = await parser.parseURL(feed.url);
    let imported = 0;

    for (const item of rss.items.slice(0, 20)) { // Limit to 20 articles per import
        try {
            // Check if article already exists (by source URL)
            const existing = await pool.query(
                'SELECT id FROM articles WHERE source_url = $1',
                [item.link]
            );

            if (existing.rows.length > 0) {
                continue; // Skip duplicate
            }

            // Generate slug from title
            const slug = generateSlug(item.title) + '-' + Date.now();

            // Extract image from content or media
            let image = item.enclosure?.url || '';
            if (!image && item['content:encoded']) {
                const imgMatch = item['content:encoded'].match(/<img[^>]+src="([^">]+)"/);
                if (imgMatch) image = imgMatch[1];
            }
            if (!image && item.content) {
                const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
                if (imgMatch) image = imgMatch[1];
            }

            // Clean content
            const content = stripHtml(item['content:encoded'] || item.content || item.contentSnippet || '');
            const excerpt = item.contentSnippet || content.substring(0, 200) + '...';

            await pool.query(
                `INSERT INTO articles (title, slug, excerpt, content, category, author, image, source, source_url, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                    item.title,
                    slug,
                    excerpt,
                    content,
                    feed.category || 'national',
                    item.creator || item.author || feed.name || 'RSS',
                    image,
                    'rss',
                    item.link,
                    item.pubDate ? new Date(item.pubDate) : new Date()
                ]
            );

            imported++;
        } catch (err) {
            console.error('Error importing article:', err.message);
            // Continue with next article
        }
    }

    return imported;
}

// Helper: Generate slug from Bengali/English title
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s\u0980-\u09FF-]/g, '') // Keep Bengali, English, numbers
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 60)
        .trim();
}

// Helper: Strip HTML tags
function stripHtml(html) {
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
}

module.exports = router;
