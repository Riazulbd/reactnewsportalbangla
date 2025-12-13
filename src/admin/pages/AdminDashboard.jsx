import { Link } from 'react-router-dom';
import { useData } from '../DataContext';
import '../admin.css';

function AdminDashboard() {
    const { articles, categories } = useData();

    const stats = [
        {
            icon: '📰',
            label: 'মোট প্রবন্ধ',
            value: articles.length,
            color: 'rgba(220, 38, 38, 0.2)',
        },
        {
            icon: '📁',
            label: 'বিভাগ',
            value: categories.length,
            color: 'rgba(124, 58, 237, 0.2)',
        },
        {
            icon: '⭐',
            label: 'ফিচার্ড',
            value: articles.filter(a => a.featured).length,
            color: 'rgba(245, 158, 11, 0.2)',
        },
        {
            icon: '👁️',
            label: 'দর্শন (আজ)',
            value: '১২,৪৫৬',
            color: 'rgba(34, 197, 94, 0.2)',
        },
    ];

    const recentArticles = articles.slice(0, 5);

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1 className="admin-page-title">ড্যাশবোর্ড</h1>
                    <p className="admin-breadcrumb">অ্যাডমিন / ড্যাশবোর্ড</p>
                </div>
                <Link to="/admin/articles/new" className="admin-btn admin-btn-primary">
                    ➕ নতুন প্রবন্ধ
                </Link>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-card-icon" style={{ background: stat.color }}>
                                {stat.icon}
                            </div>
                        </div>
                        <div className="stat-card-value">{stat.value}</div>
                        <div className="stat-card-label">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3 className="admin-table-title">সাম্প্রতিক প্রবন্ধ</h3>
                    <Link to="/admin/articles" className="admin-btn admin-btn-secondary">
                        সব দেখুন
                    </Link>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ছবি</th>
                            <th>শিরোনাম</th>
                            <th>বিভাগ</th>
                            <th>তারিখ</th>
                            <th>অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentArticles.map((article) => {
                            const category = categories.find(c => c.id === article.category);
                            return (
                                <tr key={article.id}>
                                    <td>
                                        <img src={article.image} alt="" className="admin-table-img" />
                                    </td>
                                    <td style={{ maxWidth: '300px' }}>
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
                                    <td>{article.date}</td>
                                    <td>
                                        <div className="admin-table-actions-cell">
                                            <Link
                                                to={`/admin/articles/edit/${article.id}`}
                                                className="admin-btn admin-btn-icon"
                                                title="সম্পাদনা"
                                            >
                                                ✏️
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminDashboard;
