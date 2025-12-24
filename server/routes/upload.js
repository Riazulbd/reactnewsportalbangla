const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Get max file size from settings (default 5MB)
const getMaxFileSize = async () => {
    try {
        const result = await pool.query("SELECT value FROM settings WHERE key = 'maxImageSizeMB'");
        if (result.rows.length > 0) {
            const value = JSON.parse(result.rows[0].value);
            return (typeof value === 'number' ? value : 5) * 1024 * 1024;
        }
    } catch {
        // Ignore errors, use default
    }
    return 5 * 1024 * 1024; // 5MB default
};

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
    }
};

// Create multer instance with dynamic limits
const createUploader = async () => {
    const maxSize = await getMaxFileSize();
    return multer({
        storage,
        fileFilter,
        limits: {
            fileSize: maxSize
        }
    });
};

// Upload single image
router.post('/', async (req, res) => {
    console.log('📤 UPLOAD - Request received');

    try {
        const maxSize = await getMaxFileSize();
        console.log('  Max file size:', maxSize / (1024 * 1024), 'MB');

        const upload = multer({
            storage,
            fileFilter,
            limits: { fileSize: maxSize }
        }).single('image');

        upload(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                console.error('❌ UPLOAD - Multer error:', err.code, err.message);
                if (err.code === 'LIMIT_FILE_SIZE') {
                    const maxMB = maxSize / (1024 * 1024);
                    return res.status(413).json({
                        error: `ফাইল খুব বড়। সর্বোচ্চ ${maxMB}MB অনুমোদিত।`
                    });
                }
                return res.status(400).json({ error: err.message });
            } else if (err) {
                console.error('❌ UPLOAD - Error:', err.message);
                return res.status(400).json({ error: err.message });
            }

            if (!req.file) {
                console.log('⚠️ UPLOAD - No file received');
                return res.status(400).json({ error: 'কোনো ফাইল আপলোড হয়নি' });
            }

            console.log('✅ UPLOAD - File saved:');
            console.log('  Filename:', req.file.filename);
            console.log('  Original:', req.file.originalname);
            console.log('  Size:', req.file.size, 'bytes');
            console.log('  Type:', req.file.mimetype);

            // Return the file info
            const fileUrl = `/uploads/${req.file.filename}`;
            res.json({
                url: fileUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            });
        });
    } catch (error) {
        console.error('❌ UPLOAD - Exception:', error.message);
        res.status(500).json({ error: 'আপলোড ব্যর্থ হয়েছে: ' + error.message });
    }
});

// Get upload settings
router.get('/settings', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT value FROM settings WHERE key IN ('maxImageSizeMB', 'allowedImageTypes')"
        );

        const settings = {
            maxImageSizeMB: 5,
            allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        };

        result.rows.forEach(row => {
            try {
                const value = JSON.parse(row.value);
                if (row.key === 'maxImageSizeMB') settings.maxImageSizeMB = value;
                if (row.key === 'allowedImageTypes') settings.allowedImageTypes = value;
            } catch {
                // Ignore parse errors
            }
        });

        res.json(settings);
    } catch (error) {
        console.error('Error fetching upload settings:', error);
        res.status(500).json({ error: 'Failed to fetch upload settings' });
    }
});

// Delete uploaded file
router.delete('/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);

    // Security check - ensure filename doesn't contain path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ error: 'Invalid filename' });
    }

    fs.unlink(filePath, (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).json({ error: 'File not found' });
            }
            console.error('Delete error:', err);
            return res.status(500).json({ error: 'Failed to delete file' });
        }
        res.json({ message: 'File deleted' });
    });
});

module.exports = router;
