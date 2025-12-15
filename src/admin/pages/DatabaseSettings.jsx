import { useState, useEffect } from 'react';
import '../admin.css';

function DatabaseSettings() {
    const [dbConfig, setDbConfig] = useState({
        host: '',
        port: '5432',
        database: '',
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [message, setMessage] = useState(null);

    // Load current config on mount
    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await fetch('/api/database/config');
            if (response.ok) {
                const data = await response.json();
                setDbConfig(prev => ({
                    ...prev,
                    host: data.host || '',
                    port: data.port || '5432',
                    database: data.database || '',
                    username: data.username || '',
                    password: data.hasPassword ? '••••••••' : ''
                }));
            }
        } catch {
            // Ignore errors
        }
    };

    const handleChange = (field, value) => {
        setDbConfig(prev => ({ ...prev, [field]: value }));
        setTestResult(null);
        setMessage(null);
    };

    const handleTest = async () => {
        setLoading(true);
        setTestResult(null);
        setMessage(null);

        try {
            const response = await fetch('/api/database/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dbConfig)
            });
            const data = await response.json();
            setTestResult(data);
        } catch (err) {
            setTestResult({ success: false, error: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/database/configure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dbConfig)
            });
            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: data.message });
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleMigrate = async () => {
        if (!window.confirm('এটি ডাটাবেসে সকল টেবিল তৈরি করবে। চালিয়ে যেতে চান?')) {
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/database/migrate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dbConfig)
            });
            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: data.message });
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-table-container" style={{ marginBottom: 'var(--space-xl)' }}>
            <div className="admin-table-header">
                <h3 className="admin-table-title">🗄️ ডাটাবেস কনফিগারেশন</h3>
            </div>
            <div style={{ padding: 'var(--space-lg)' }}>
                <div style={{
                    padding: 'var(--space-md)',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-lg)',
                    color: '#f59e0b'
                }}>
                    ⚠️ <strong>সতর্কতা:</strong> প্রোডাকশনে .env ফাইল ব্যবহার করুন। এই UI শুধুমাত্র ডেভেলপমেন্ট/টেস্টিং এর জন্য।
                </div>

                {message && (
                    <div style={{
                        padding: 'var(--space-md)',
                        background: message.type === 'success'
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-lg)',
                        color: message.type === 'success' ? '#22c55e' : '#ef4444'
                    }}>
                        {message.type === 'success' ? '✓' : '✕'} {message.text}
                    </div>
                )}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--space-md)'
                }}>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Host</label>
                        <input
                            type="text"
                            className="admin-form-input"
                            placeholder="localhost"
                            value={dbConfig.host}
                            onChange={(e) => handleChange('host', e.target.value)}
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Port</label>
                        <input
                            type="text"
                            className="admin-form-input"
                            placeholder="5432"
                            value={dbConfig.port}
                            onChange={(e) => handleChange('port', e.target.value)}
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Database Name</label>
                        <input
                            type="text"
                            className="admin-form-input"
                            placeholder="newsportal"
                            value={dbConfig.database}
                            onChange={(e) => handleChange('database', e.target.value)}
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Username</label>
                        <input
                            type="text"
                            className="admin-form-input"
                            placeholder="admin"
                            value={dbConfig.username}
                            onChange={(e) => handleChange('username', e.target.value)}
                        />
                    </div>
                    <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="admin-form-label">Password</label>
                        <input
                            type="password"
                            className="admin-form-input"
                            placeholder="••••••••"
                            value={dbConfig.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                        />
                    </div>
                </div>

                {testResult && (
                    <div style={{
                        padding: 'var(--space-md)',
                        background: testResult.success
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${testResult.success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        borderRadius: 'var(--radius-md)',
                        marginTop: 'var(--space-lg)',
                        color: testResult.success ? '#22c55e' : '#ef4444'
                    }}>
                        {testResult.success ? (
                            <>✓ {testResult.message}<br /><small style={{ opacity: 0.8 }}>{testResult.version}</small></>
                        ) : (
                            <>✕ {testResult.error}</>
                        )}
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    gap: 'var(--space-md)',
                    marginTop: 'var(--space-xl)',
                    flexWrap: 'wrap'
                }}>
                    <button
                        className="admin-btn"
                        onClick={handleTest}
                        disabled={loading}
                        style={{ background: 'var(--color-bg-tertiary)' }}
                    >
                        {loading ? '⏳' : '🔌'} সংযোগ পরীক্ষা
                    </button>
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? '⏳' : '💾'} সংরক্ষণ
                    </button>
                    <button
                        className="admin-btn"
                        onClick={handleMigrate}
                        disabled={loading}
                        style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}
                    >
                        {loading ? '⏳' : '🛠️'} টেবিল তৈরি করুন
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DatabaseSettings;
