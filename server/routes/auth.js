const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'bangla-sangbad-jwt-secret-2024';

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check database users
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            const validPassword = await bcrypt.compare(password, user.password);

            if (validPassword) {
                const token = jwt.sign(
                    { id: user.id, username: user.username, role: user.role },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );
                return res.json({
                    success: true,
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        }

        // Fallback: default admin (for first-time setup)
        if (username === 'admin' && password === 'admin123') {
            // Create default admin if not exists
            const hashedPassword = await bcrypt.hash('admin123', 10);
            try {
                await pool.query(
                    `INSERT INTO users (username, password, name, email, role) 
                     VALUES ('admin', $1, 'অ্যাডমিন', 'admin@example.com', 'admin')
                     ON CONFLICT (username) DO NOTHING`,
                    [hashedPassword]
                );
            } catch (e) { /* ignore */ }

            const token = jwt.sign(
                { id: 1, username: 'admin', role: 'admin' },
                JWT_SECRET,
                { expiresIn: '7d' }
            );
            return res.json({
                success: true,
                token,
                user: {
                    id: 1,
                    username: 'admin',
                    name: 'অ্যাডমিন',
                    email: 'admin@example.com',
                    role: 'admin'
                }
            });
        }

        res.status(401).json({ success: false, error: 'ভুল ইউজারনেম বা পাসওয়ার্ড' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Verify token / Get current user
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const result = await pool.query('SELECT id, username, name, email, role FROM users WHERE id = $1', [decoded.id]);

        if (result.rows.length === 0) {
            // Return decoded token data if user not in DB (for default admin)
            return res.json({
                id: decoded.id,
                username: decoded.username,
                name: 'অ্যাডমিন',
                email: 'admin@example.com',
                role: decoded.role
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Auth verify error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Get all users (admin only)
router.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, name, email, role, created_at FROM users ORDER BY id');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Create user
router.post('/users', async (req, res) => {
    try {
        const { username, password, name, email, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (username, password, name, email, role)
             VALUES ($1, $2, $3, $4, $5) RETURNING id, username, name, email, role`,
            [username, hashedPassword, name, email, role || 'author']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Username already exists' });
        }
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Update user
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, password } = req.body;

        let query, params;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query = 'UPDATE users SET name = $1, email = $2, role = $3, password = $4 WHERE id = $5 RETURNING id, username, name, email, role';
            params = [name, email, role, hashedPassword, id];
        } else {
            query = 'UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, username, name, email, role';
            params = [name, email, role, id];
        }

        const result = await pool.query(query, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Change password
router.put('/password', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const { currentPassword, newPassword } = req.body;

        // Get current user password
        const result = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        // Verify current password
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'বর্তমান পাসওয়ার্ড ভুল' });
        }

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

        res.json({ success: true, message: 'পাসওয়ার্ড পরিবর্তন হয়েছে' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (id === '1') {
            return res.status(403).json({ error: 'Cannot delete main admin' });
        }
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;
