import { useState, useEffect } from 'react';
import '../admin.css';

function RssSettings() {
    const [feeds, setFeeds] = useState([]);
    const [newFeed, setNewFeed] = useState({ url: '', name: '', category: 'national' });
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [message, setMessage] = useState(null);

    const categories = [
        { id: 'national', name: 'জাতীয়' },
        { id: 'politics', name: 'রাজনীতি' },
        { id: 'sports', name: 'মাঠে ময়দানে' },
        { id: 'entertainment', name: 'শোবিজ' },
        { id: 'international', name: 'পূর্ব-পশ্চিম' },
        { id: 'economy', name: 'অর্থনীতি' },
        { id: 'technology', name: 'তথ্যপ্রযুক্তি' },
        { id: 'islamic', name: 'ইসলামী জীবন' },
        { id: 'opinion', name: 'মতামত' },
        { id: 'lifestyle', name: 'জীবনযাপন' }
    ];

    useEffect(() => {
        fetchFeeds();
    }, []);

    const fetchFeeds = async () => {
        try {
            const res = await fetch('/api/rss/feeds');
            if (res.ok) {
                const data = await res.json();
                setFeeds(data);
            }
        } catch (err) {
            console.error('Error fetching feeds:', err);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleAddFeed = async (e) => {
        e.preventDefault();
        if (!newFeed.url) return;

        setLoading(true);
        try {
            const res = await fetch('/api/rss/feeds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newFeed)
            });
            const data = await res.json();

            if (res.ok) {
                setFeeds([data, ...feeds]);
                setNewFeed({ url: '', name: '', category: 'national' });
                showMessage('success', 'ফিড যোগ হয়েছে!');
            } else {
                showMessage('error', data.error || 'ফিড যোগ করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            showMessage('error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFeed = async (id) => {
        if (!confirm('এই ফিড মুছে ফেলতে চান?')) return;

        try {
            const res = await fetch(`/api/rss/feeds/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setFeeds(feeds.filter(f => f.id !== id));
                showMessage('success', 'ফিড মুছে ফেলা হয়েছে');
            }
        } catch (err) {
            showMessage('error', err.message);
        }
    };

    const handleImportAll = async () => {
        setImporting(true);
        try {
            const res = await fetch('/api/rss/import', { method: 'POST' });
            const data = await res.json();

            if (res.ok) {
                showMessage('success', data.message);
                fetchFeeds(); // Refresh to update last_imported
            } else {
                showMessage('error', data.error);
            }
        } catch (err) {
            showMessage('error', err.message);
        } finally {
            setImporting(false);
        }
    };

    const handleImportSingle = async (id) => {
        setImporting(true);
        try {
            const res = await fetch(`/api/rss/import/${id}`, { method: 'POST' });
            const data = await res.json();

            if (res.ok) {
                showMessage('success', data.message);
                fetchFeeds();
            } else {
                showMessage('error', data.error);
            }
        } catch (err) {
            showMessage('error', err.message);
        } finally {
            setImporting(false);
        }
    };

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1 className="admin-page-title">📡 RSS ফিড</h1>
                    <p className="admin-breadcrumb">অ্যাডমিন / RSS ফিড</p>
                </div>
                <button
                    className="admin-btn admin-btn-primary"
                    onClick={handleImportAll}
                    disabled={importing || feeds.length === 0}
                >
                    {importing ? '⏳ ইম্পোর্ট হচ্ছে...' : '📥 সকল ফিড ইম্পোর্ট'}
                </button>
            </div>

            {message && (
                <div style={{
                    padding: 'var(--space-md)',
                    background: message.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-lg)',
                    border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
                    color: message.type === 'success' ? '#22c55e' : '#ef4444'
                }}>
                    {message.type === 'success' ? '✓' : '✕'} {message.text}
                </div>
            )}

            {/* Add Feed Form */}
            <div className="admin-table-container" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="admin-table-header">
                    <h3 className="admin-table-title">➕ নতুন ফিড যোগ করুন</h3>
                </div>
                <div style={{ padding: 'var(--space-lg)' }}>
                    <form onSubmit={handleAddFeed} style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 'var(--space-md)',
                        alignItems: 'end'
                    }}>
                        <div className="admin-form-group">
                            <label className="admin-form-label">RSS URL</label>
                            <input
                                type="url"
                                className="admin-form-input"
                                placeholder="https://example.com/feed.xml"
                                value={newFeed.url}
                                onChange={e => setNewFeed({ ...newFeed, url: e.target.value })}
                                required
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-form-label">ফিডের নাম</label>
                            <input
                                type="text"
                                className="admin-form-input"
                                placeholder="যেমন: প্রথম আলো"
                                value={newFeed.name}
                                onChange={e => setNewFeed({ ...newFeed, name: e.target.value })}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-form-label">ক্যাটেগরি</label>
                            <select
                                className="admin-form-input"
                                value={newFeed.category}
                                onChange={e => setNewFeed({ ...newFeed, category: e.target.value })}
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
                            {loading ? '⏳' : '➕'} যোগ করুন
                        </button>
                    </form>
                </div>
            </div>

            {/* Feeds List */}
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3 className="admin-table-title">📋 সংরক্ষিত ফিড ({feeds.length})</h3>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>নাম</th>
                            <th>URL</th>
                            <th>ক্যাটেগরি</th>
                            <th>শেষ ইম্পোর্ট</th>
                            <th>অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feeds.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-text-muted)' }}>
                                    কোনো ফিড যোগ করা হয়নি
                                </td>
                            </tr>
                        ) : (
                            feeds.map(feed => (
                                <tr key={feed.id}>
                                    <td>{feed.name || 'Unnamed'}</td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <a href={feed.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent-primary)' }}>
                                            {feed.url}
                                        </a>
                                    </td>
                                    <td>{categories.find(c => c.id === feed.category)?.name || feed.category}</td>
                                    <td>{feed.last_imported ? new Date(feed.last_imported).toLocaleString('bn-BD') : 'কখনো না'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                                            <button
                                                className="admin-btn"
                                                onClick={() => handleImportSingle(feed.id)}
                                                disabled={importing}
                                                style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-xs) var(--space-sm)' }}
                                            >
                                                📥
                                            </button>
                                            <button
                                                className="admin-btn"
                                                onClick={() => handleDeleteFeed(feed.id)}
                                                style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-xs) var(--space-sm)', background: 'rgba(239, 68, 68, 0.2)' }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Sample Feeds */}
            <div style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-lg)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ marginBottom: 'var(--space-md)', color: 'var(--color-text-primary)' }}>💡 জনপ্রিয় বাংলা নিউজ RSS ফিড</h4>
                <ul style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                    <li>প্রথম আলো: <code>https://www.prothomalo.com/feed</code></li>
                    <li>বিডি প্রতিদিন: <code>https://www.bd-pratidin.com/feed</code></li>
                    <li>কালের কণ্ঠ: <code>https://www.kalerkantho.com/rss.xml</code></li>
                    <li>যুগান্তর: <code>https://www.jugantor.com/feed</code></li>
                </ul>
            </div>
        </div>
    );
}

export default RssSettings;
