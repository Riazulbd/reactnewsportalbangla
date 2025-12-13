import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useData } from '../admin/DataContext';
import './Header.css';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();

    const { getMainCategories, getSubcategories, theme, toggleTheme, settings } = useData();
    const mainCategories = getMainCategories();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    return (
        <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
            <div className="container header-container">
                {/* Logo */}
                <Link to="/" className="logo">
                    {settings?.siteLogo ? (
                        <img src={settings.siteLogo} alt="Logo" className="logo-image" />
                    ) : (
                        <>
                            <div className="logo-icon">স</div>
                            <div className="logo-text">
                                সংবাদ
                                <span>পোর্টাল</span>
                            </div>
                        </>
                    )}
                </Link>

                {/* Desktop Navigation */}
                <nav className="nav-desktop">
                    <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        প্রচ্ছদ
                    </NavLink>
                    {mainCategories.slice(0, 6).map((cat) => {
                        const subcategories = getSubcategories(cat.id);
                        return (
                            <div key={cat.id} className="nav-item-wrapper">
                                <NavLink
                                    to={`/category/${cat.id}`}
                                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                                >
                                    {cat.name}
                                    {subcategories.length > 0 && <span className="nav-arrow">▾</span>}
                                </NavLink>
                                {subcategories.length > 0 && (
                                    <div className="nav-dropdown">
                                        {subcategories.map(sub => (
                                            <NavLink
                                                key={sub.id}
                                                to={`/category/${sub.id}`}
                                                className="nav-dropdown-link"
                                            >
                                                {sub.name}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        আমাদের সম্পর্কে
                    </NavLink>
                </nav>

                {/* Actions */}
                <div className="header-actions">
                    <button
                        className="action-btn search-btn"
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        aria-label="অনুসন্ধান"
                    >
                        🔍
                    </button>

                    <button
                        className="action-btn theme-btn"
                        onClick={toggleTheme}
                        aria-label="থিম পরিবর্তন"
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>

                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="মেনু"
                    >
                        {isMenuOpen ? '✕' : '☰'}
                    </button>
                </div>

                {/* Search Overlay */}
                {isSearchOpen && (
                    <div className="search-overlay">
                        <form onSubmit={handleSearch} className="search-form">
                            <input
                                type="text"
                                placeholder="অনুসন্ধান করুন..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button type="submit">🔍</button>
                        </form>
                        <button className="search-close" onClick={() => setIsSearchOpen(false)}>
                            ✕
                        </button>
                    </div>
                )}

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <nav className="nav-mobile">
                        <NavLink to="/" onClick={() => setIsMenuOpen(false)}>প্রচ্ছদ</NavLink>
                        {mainCategories.map((cat) => (
                            <NavLink key={cat.id} to={`/category/${cat.id}`} onClick={() => setIsMenuOpen(false)}>
                                {cat.name}
                            </NavLink>
                        ))}
                        <NavLink to="/about" onClick={() => setIsMenuOpen(false)}>আমাদের সম্পর্কে</NavLink>
                    </nav>
                )}
            </div>
        </header>
    );
}

export default Header;
