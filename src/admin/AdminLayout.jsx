import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';
import './admin.css';

function AdminLayout() {
    const { isAuthenticated, user, loading, logout } = useAuth();
    const { theme, toggleTheme } = useData();

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-bg-primary)',
                color: 'var(--color-text-muted)'
            }}>
                লোড হচ্ছে...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <div className="admin-logo">
                        <div className="admin-logo-icon">স</div>
                        <div className="admin-logo-text">
                            সংবাদপোর্টাল
                            <span>অ্যাডমিন</span>
                        </div>
                    </div>
                </div>

                <nav className="admin-nav">
                    <div className="admin-nav-section">
                        <div className="admin-nav-title">মেনু</div>
                        <ul className="admin-nav-list">
                            <li>
                                <NavLink
                                    to="/admin"
                                    end
                                    className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                                >
                                    <span>📊</span>
                                    <span>ড্যাশবোর্ড</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/admin/articles"
                                    className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                                >
                                    <span>📰</span>
                                    <span>প্রবন্ধ</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/admin/categories"
                                    className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                                >
                                    <span>📁</span>
                                    <span>বিভাগ</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/admin/media"
                                    className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                                >
                                    <span>🖼️</span>
                                    <span>মিডিয়া</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/admin/settings"
                                    className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                                >
                                    <span>⚙️</span>
                                    <span>সেটিংস</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/admin/profile"
                                    className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                                >
                                    <span>👤</span>
                                    <span>প্রোফাইল</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/admin/users"
                                    className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                                >
                                    <span>👥</span>
                                    <span>ব্যবহারকারী</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    <div className="admin-nav-section">
                        <div className="admin-nav-title">দ্রুত লিংক</div>
                        <ul className="admin-nav-list">
                            <li>
                                <a href="/" target="_blank" className="admin-nav-link">
                                    <span>🌐</span>
                                    <span>সাইট দেখুন</span>
                                </a>
                            </li>
                            <li>
                                <button
                                    className="admin-nav-link"
                                    onClick={toggleTheme}
                                    style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
                                    <span>{theme === 'dark' ? 'লাইট মোড' : 'ডার্ক মোড'}</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-user">
                        <div className="admin-user-avatar">👤</div>
                        <div className="admin-user-info">
                            <div className="admin-user-name">{user?.name}</div>
                            <div className="admin-user-role">{user?.role}</div>
                        </div>
                    </div>
                    <button className="admin-logout-btn" onClick={logout}>
                        🚪 লগআউট
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
}

export default AdminLayout;
