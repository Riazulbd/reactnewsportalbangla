import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useData } from '../admin/DataContext';
import './Header.css';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const navigate = useNavigate();

    const { getMainCategories, getSubcategories, theme, toggleTheme, settings } = useData();
    const mainCategories = getMainCategories();

    // Bengali date and time format
    useEffect(() => {
        const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

        const toBengaliNumber = (num) => {
            return String(num).split('').map(d => bengaliNumerals[parseInt(d)]).join('');
        };

        const formatBengaliDateTime = () => {
            const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
            const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

            const now = new Date();
            const dayName = days[now.getDay()];
            const day = toBengaliNumber(now.getDate());
            const month = months[now.getMonth()];
            const year = toBengaliNumber(now.getFullYear());

            // Format time in 12-hour format
            let hours = now.getHours();
            const minutes = now.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // 0 = 12
            const timeStr = `${toBengaliNumber(hours)}:${toBengaliNumber(minutes.toString().padStart(2, '0'))} ${ampm}`;

            setCurrentDate(`${dayName}, ${day} ${month}, ${year}`);
            setCurrentTime(timeStr);
        };

        formatBengaliDateTime();
        // Update time every minute
        const interval = setInterval(formatBengaliDateTime, 60000);
        return () => clearInterval(interval);
    }, []);

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
            {/* Top Bar - Date & Social */}
            <div className="header-topbar">
                <div className="container topbar-container">
                    <div className="topbar-left">
                        <button
                            className="topbar-search-btn"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            aria-label="অনুসন্ধান"
                        >
                            🔍
                        </button>
                        <div className="topbar-social">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="var(--color-bg-primary)" /></svg>
                            </a>
                        </div>
                    </div>
                    <div className="topbar-date">{currentDate} | {currentTime}</div>
                    <div className="topbar-right">
                        <button
                            className="topbar-theme-btn"
                            onClick={toggleTheme}
                            aria-label="থিম পরিবর্তন"
                        >
                            {theme === 'dark' ? '☀️ দিন' : '🌙 রাত'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Logo Section */}
            <div className="header-logo-section">
                <div className="container logo-container">
                    <Link to="/" className="logo">
                        {settings?.siteLogo ? (
                            <img src={settings.siteLogo} alt="Logo" className="logo-image" />
                        ) : (
                            <div className="logo-content">
                                <span className="logo-main">বাংলা সংবাদ</span>
                                <span className="logo-sub">সর্বাধিক পঠিত বাংলা নিউজ পোর্টাল</span>
                            </div>
                        )}
                    </Link>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="main-nav">
                <div className="container nav-container">
                    <div className="nav-links">
                        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="nav-home-icon">🏠</span>
                        </NavLink>
                        <NavLink to="/latest" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            সর্বশেষ
                        </NavLink>
                        {mainCategories.slice(0, 7).map((cat) => {
                            const subcategories = getSubcategories(cat.id);
                            return (
                                <div key={cat.id} className="nav-item-wrapper">
                                    <NavLink
                                        to={`/category/${cat.slug || cat.id}`}
                                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                    >
                                        {cat.name}
                                        {subcategories.length > 0 && <span className="nav-arrow">▾</span>}
                                    </NavLink>
                                    {subcategories.length > 0 && (
                                        <div className="nav-dropdown">
                                            {subcategories.map(sub => (
                                                <NavLink
                                                    key={sub.id}
                                                    to={`/category/${sub.slug || sub.id}`}
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
                        {mainCategories.length > 7 && (
                            <div className="nav-item-wrapper">
                                <button className="nav-link nav-more-btn">
                                    অন্যান্য <span className="nav-arrow">▾</span>
                                </button>
                                <div className="nav-dropdown">
                                    {mainCategories.slice(7).map(cat => (
                                        <NavLink
                                            key={cat.id}
                                            to={`/category/${cat.slug || cat.id}`}
                                            className="nav-dropdown-link"
                                        >
                                            {cat.name}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="মেনু"
                    >
                        {isMenuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </nav>

            {/* Search Overlay */}
            {isSearchOpen && (
                <div className="search-overlay">
                    <div className="container">
                        <form onSubmit={handleSearch} className="search-form">
                            <input
                                type="text"
                                placeholder="অনুসন্ধান করুন..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button type="submit">🔍 খুঁজুন</button>
                            <button type="button" className="search-close" onClick={() => setIsSearchOpen(false)}>
                                ✕
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Mobile Menu */}
            {isMenuOpen && (
                <nav className="nav-mobile">
                    <NavLink to="/" onClick={() => setIsMenuOpen(false)}>🏠 প্রচ্ছদ</NavLink>
                    <NavLink to="/latest" onClick={() => setIsMenuOpen(false)}>📰 সর্বশেষ</NavLink>
                    {mainCategories.map((cat) => (
                        <NavLink key={cat.id} to={`/category/${cat.slug || cat.id}`} onClick={() => setIsMenuOpen(false)}>
                            {cat.name}
                        </NavLink>
                    ))}
                </nav>
            )}
        </header>
    );
}

export default Header;
