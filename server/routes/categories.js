const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get all categories
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY order_index ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Get single category
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = isNaN(id)
            ? 'SELECT * FROM categories WHERE slug = $1'
            : 'SELECT * FROM categories WHERE id = $1 OR slug = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ error: 'Failed to fetch category' });
    }
});

// Create category
router.post('/', async (req, res) => {
    try {
        const { name, slug, color, parentId, orderIndex } = req.body;
        const result = await pool.query(
            `INSERT INTO categories (name, slug, color, parent_id, order_index)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, slug, color || '#7c3aed', parentId || null, orderIndex || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// Update category
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, color, parentId, orderIndex } = req.body;
        const result = await pool.query(
            `UPDATE categories SET name = $1, slug = $2, color = $3, parent_id = $4, order_index = $5
             WHERE id = $6 RETURNING *`,
            [name, slug, color, parentId, orderIndex, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// Delete category
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ message: 'Category deleted', category: result.rows[0] });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// Reorder categories
router.post('/reorder', async (req, res) => {
    try {
        const { order } = req.body; // Array of category IDs in new order
        for (let i = 0; i < order.length; i++) {
            await pool.query('UPDATE categories SET order_index = $1 WHERE id = $2', [i, order[i]]);
        }
        res.json({ message: 'Categories reordered' });
    } catch (error) {
        console.error('Error reordering categories:', error);
        res.status(500).json({ error: 'Failed to reorder categories' });
    }
});

module.exports = router;
