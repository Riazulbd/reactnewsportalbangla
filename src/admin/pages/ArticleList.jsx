import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../DataContext';
import '../admin.css';

function ArticleList() {
    const { articles, categories, deleteArticle } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = (id) => {
        deleteArticle(id);
        setDeleteConfirm(null);
    };

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1 className="admin-page-title">প্রবন্ধ ব্যবস্থাপনা</h1>
                    <p className="admin-breadcrumb">অ্যাডমিন / প্রবন্ধ</p>
                </div>
                <Link to="/admin/articles/new" className="admin-btn admin-btn-primary">
                    ➕ নতুন প্রবন্ধ
                </Link>
            </div>

            <div className="admin-table-container">
                <div className="admin-table-header">
                    <div className="admin-search">
                        <span className="admin-search-icon">🔍</span>
                        <input
                            type="text"
                            className="admin-search-input"
                            placeholder="প্রবন্ধ খুঁজুন..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="admin-table-actions">
                        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                            মোট: {filteredArticles.length}টি প্রবন্ধ
                        </span>
                    </div>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ছবি</th>
                            <th>শিরোনাম</th>
                            <th>বিভাগ</th>
                            <th>লেখক</th>
                            <th>তারিখ</th>
                            <th>ফিচার্ড</th>
                            <th>অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredArticles.map((article) => {
                            const category = categories.find(c => c.id === article.category);
                            return (
                                <tr key={article.id}>
                                    <td>
                                        <img src={article.image} alt="" className="admin-table-img" />
                                    </td>
                                    <td style={{ maxWidth: '250px' }}>
                                        <div style={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            color: 'var(--color-text-primary)'
                                        }}>
                                            {article.title}
                                        </div>
                                    </td>
                                    <td>
                                        <span
                                            className="category-badge"
                                            style={{ '--category-color': category?.color }}
                                        >
                                            {category?.name}
                                        </span>
                                    </td>
                                    <td>{article.author}</td>
                                    <td>{article.date}</td>
                                    <td>{article.featured ? '⭐' : '—'}</td>
                                    <td>
                                        <div className="admin-table-actions-cell">
                                            <Link
                                                to={`/admin/articles/edit/${article.id}`}
                                                className="admin-btn admin-btn-icon"
                                                title="সম্পাদনা"
                                            >
                                                ✏️
                                            </Link>
                                            <button
                                                className="admin-btn admin-btn-icon"
                                                onClick={() => setDeleteConfirm(article.id)}
                                                title="মুছুন"
                                                style={{ color: '#ef4444' }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {filteredArticles.length === 0 && (
                    <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        কোনো প্রবন্ধ পাওয়া যায়নি
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">প্রবন্ধ মুছুন</h3>
                            <button className="admin-modal-close" onClick={() => setDeleteConfirm(null)}>
                                ✕
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <p style={{ color: 'var(--color-text-secondary)' }}>
                                আপনি কি নিশ্চিত যে এই প্রবন্ধটি মুছে ফেলতে চান? এই ক্রিয়াটি পূর্বাবস্থায় ফেরানো যাবে না।
                            </p>
                        </div>
                        <div className="admin-modal-footer">
                            <button
                                className="admin-btn admin-btn-secondary"
                                onClick={() => setDeleteConfirm(null)}
                            >
                                বাতিল
                            </button>
                            <button
                                className="admin-btn admin-btn-danger"
                                onClick={() => handleDelete(deleteConfirm)}
                            >
                                মুছে ফেলুন
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ArticleList;
