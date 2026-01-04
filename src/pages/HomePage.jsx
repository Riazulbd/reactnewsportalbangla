import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../admin/DataContext';
import ArticleCard from '../components/ArticleCard';

import './HomePage.css';

function HomePage() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const touchStartX = useRef(null);
    const touchEndX = useRef(null);
    const sliderRef = useRef(null);

    const { articles, categories, getFeaturedArticles, getMainCategories, getSubcategories, settings, refreshData } = useData();

    // Refresh data on mount to get latest from API
    useEffect(() => {
        refreshData?.();
    }, []);

    const featuredArticles = getFeaturedArticles();
    const mainCategories = getMainCategories();

    // Configurable slider interval from settings (default 3 seconds)
    const sliderInterval = settings?.sliderInterval || 3000;

    // Auto-slide with configurable interval and pause-on-hover
    useEffect(() => {
        if (featuredArticles.length > 1 && !isPaused) {
            const interval = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % featuredArticles.length);
            }, sliderInterval);
            return () => clearInterval(interval);
        }
    }, [featuredArticles.length, sliderInterval, isPaused]);

    // Keyboard navigation for slider
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setCurrentSlide(prev => prev === 0 ? featuredArticles.length - 1 : prev - 1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            setCurrentSlide(prev => (prev + 1) % featuredArticles.length);
        }
    }, [featuredArticles.length]);

    // Touch/Swipe handlers
    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX;
    }, []);

    const handleTouchMove = useCallback((e) => {
        touchEndX.current = e.touches[0].clientX;
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (!touchStartX.current || !touchEndX.current) return;

        const diff = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50;

        if (Math.abs(diff) > minSwipeDistance) {
            if (diff > 0) {
                // Swipe left - next slide
                setCurrentSlide(prev => (prev + 1) % featuredArticles.length);
            } else {
                // Swipe right - previous slide
                setCurrentSlide(prev => prev === 0 ? featuredArticles.length - 1 : prev - 1);
            }
        }

        touchStartX.current = null;
        touchEndX.current = null;
    }, [featuredArticles.length]);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail('');
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    const getCategory = (catId) => categories.find(c => c.id === catId);

    const getCategoryArticles = (categoryId) => {
        return articles.filter(a => a.category === categoryId).slice(0, 4);
    };

    if (featuredArticles.length === 0 && articles.length === 0) {
        return (
            <div className="home-page">
                <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                    <h2>এখনো কোনো প্রবন্ধ নেই</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>অ্যাডমিন প্যানেলে গিয়ে প্রবন্ধ যোগ করুন।</p>
                </div>
            </div>
        );
    }

    const currentFeatured = featuredArticles[currentSlide] || articles[0];

    return (
        <div className="home-page">

            <main className="container">
                {/* Breaking News Ticker */}
                {articles.length > 0 && (
                    <section className="breaking-news-ticker" aria-label="ব্রেকিং নিউজ">
                        <div className="ticker-label">
                            <span className="ticker-icon">🔴</span>
                            <span>ব্রেকিং</span>
                        </div>
                        <div className="ticker-content">
                            <div className="ticker-track">
                                {articles.slice(0, 10).map((article, index) => (
                                    <Link
                                        key={article.id}
                                        to={`/article/${article.id}`}
                                        className="ticker-item"
                                    >
                                        <span className="ticker-separator">●</span>
                                        {article.title}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Quick Links / Services */}
                <section className="quick-links-section" aria-label="দ্রুত লিংক">
                    <div className="quick-links-grid">
                        <Link to="/category/national" className="quick-link-item">
                            <span className="quick-link-icon">🇧🇩</span>
                            <span className="quick-link-label">জাতীয়</span>
                        </Link>
                        <Link to="/category/international" className="quick-link-item">
                            <span className="quick-link-icon">🌍</span>
                            <span className="quick-link-label">আন্তর্জাতিক</span>
                        </Link>
                        <Link to="/category/sports" className="quick-link-item">
                            <span className="quick-link-icon">⚽</span>
                            <span className="quick-link-label">খেলাধুলা</span>
                        </Link>
                        <Link to="/category/entertainment" className="quick-link-item">
                            <span className="quick-link-icon">🎬</span>
                            <span className="quick-link-label">বিনোদন</span>
                        </Link>
                        <Link to="/category/technology" className="quick-link-item">
                            <span className="quick-link-icon">💻</span>
                            <span className="quick-link-label">প্রযুক্তি</span>
                        </Link>
                        <Link to="/category/economy" className="quick-link-item">
                            <span className="quick-link-icon">📈</span>
                            <span className="quick-link-label">অর্থনীতি</span>
                        </Link>
                        <Link to="/category/lifestyle" className="quick-link-item">
                            <span className="quick-link-icon">✨</span>
                            <span className="quick-link-label">জীবনধারা</span>
                        </Link>
                        <Link to="/category/opinion" className="quick-link-item">
                            <span className="quick-link-icon">💭</span>
                            <span className="quick-link-label">মতামত</span>
                        </Link>
                    </div>
                </section>

                {/* Featured Slider */}
                {featuredArticles.length > 0 && (
                    <section className="hero-section">
                        <div
                            className="featured-slider"
                            ref={sliderRef}
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            onKeyDown={handleKeyDown}
                            role="region"
                            aria-label="ফিচার্ড সংবাদ স্লাইডার"
                            aria-live="polite"
                            tabIndex={0}
                        >
                            {featuredArticles.map((article, index) => (
                                <Link
                                    key={article.id}
                                    to={`/article/${article.id}`}
                                    className={`featured-slide ${index === currentSlide ? 'active' : ''}`}
                                >
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="featured-slide-image"
                                    />
                                    <div className="featured-slide-overlay">
                                        <span
                                            className="category-badge"
                                            style={{ '--category-color': getCategory(article.category)?.color }}
                                        >
                                            {getCategory(article.category)?.name}
                                        </span>
                                        <h1 className="featured-slide-title">{article.title}</h1>
                                        <p className="featured-slide-excerpt">{article.excerpt}</p>
                                        <div className="featured-slide-meta">
                                            <span>📅 {article.date}</span>
                                            <span>⏱️ {article.readTime}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}

                            {/* Slider Dots */}
                            {featuredArticles.length > 1 && (
                                <div className="slider-dots" role="tablist" aria-label="স্লাইড নেভিগেশন">
                                    {featuredArticles.map((_, index) => (
                                        <button
                                            key={index}
                                            className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                                            onClick={() => setCurrentSlide(index)}
                                            role="tab"
                                            aria-selected={index === currentSlide}
                                            aria-label={`স্লাইড ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Slider Arrows */}
                            {featuredArticles.length > 1 && (
                                <>
                                    <button
                                        className="slider-arrow slider-arrow-prev"
                                        onClick={() => setCurrentSlide(prev => prev === 0 ? featuredArticles.length - 1 : prev - 1)}
                                        aria-label="পূর্ববর্তী স্লাইড"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        className="slider-arrow slider-arrow-next"
                                        onClick={() => setCurrentSlide(prev => (prev + 1) % featuredArticles.length)}
                                        aria-label="পরবর্তী স্লাইড"
                                    >
                                        ›
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Side Articles */}
                        <div className="hero-sidebar">
                            {articles
                                .filter(a => !featuredArticles.some(f => f.id === a.id))
                                .slice(0, 4)
                                .map((article) => (
                                    <ArticleCard key={article.id} article={article} variant="compact" />
                                ))}
                        </div>
                    </section>
                )}

                {/* Category Sections with Subcategories */}
                {mainCategories.map((category) => {
                    const categoryArticles = getCategoryArticles(category.id);
                    const subcategories = getSubcategories(category.id);

                    if (categoryArticles.length === 0) return null;

                    return (
                        <section key={category.id} className="category-section">
                            <div className="section-header">
                                <div>
                                    <h2 className="section-title">{category.name}</h2>
                                    {subcategories.length > 0 && (
                                        <div className="section-subcategories">
                                            {subcategories.map(sub => (
                                                <Link key={sub.id} to={`/category/${sub.id}`} className="section-subcategory">
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <Link to={`/category/${category.id}`} className="section-link">
                                    সব দেখুন →
                                </Link>
                            </div>
                            <div className="articles-grid">
                                {categoryArticles.map((article) => (
                                    <ArticleCard key={article.id} article={article} />
                                ))}
                            </div>
                        </section>
                    );
                })}

                {/* Most Read Section */}
                <section className="most-read-section">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">🔥 আজকের সর্বাধিক পঠিত</h2>
                        </div>
                        <div className="most-read-grid">
                            {articles.slice(0, 5).map((article, index) => (
                                <Link
                                    key={article.id}
                                    to={`/article/${article.id}`}
                                    className="most-read-item"
                                >
                                    <span className="most-read-number">{index + 1}</span>
                                    <div className="most-read-content">
                                        <h4>{article.title}</h4>
                                        <span className="most-read-category">
                                            {getCategory(article.category)?.name}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Video Highlights Section */}
                <section className="video-highlights-section">
                    <div className="section-header">
                        <h2 className="section-title">🎬 ভিডিও হাইলাইটস</h2>
                        <Link to="/videos" className="section-link">
                            সব ভিডিও →
                        </Link>
                    </div>
                    <div className="video-grid">
                        {articles.slice(0, 4).map((article) => (
                            <Link
                                key={article.id}
                                to={`/article/${article.id}`}
                                className="video-card"
                            >
                                <div className="video-thumbnail">
                                    <img src={article.image} alt={article.title} />
                                    <div className="video-play-button">
                                        <span>▶</span>
                                    </div>
                                    <span className="video-duration">৫:৩২</span>
                                </div>
                                <h4 className="video-title">{article.title}</h4>
                                <span className="video-meta">
                                    {getCategory(article.category)?.name} • {article.date}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Opinion & Editorial Section */}
                <section className="opinion-section">
                    <div className="section-header">
                        <h2 className="section-title">💭 মতামত ও সম্পাদকীয়</h2>
                        <Link to="/category/opinion" className="section-link">
                            সব মতামত →
                        </Link>
                    </div>
                    <div className="opinion-grid">
                        {articles.slice(0, 3).map((article) => (
                            <Link
                                key={article.id}
                                to={`/article/${article.id}`}
                                className="opinion-card"
                            >
                                <div className="opinion-author">
                                    <div className="author-avatar">
                                        {article.author?.charAt(0) || 'স'}
                                    </div>
                                    <div className="author-info">
                                        <span className="author-name">{article.author || 'সম্পাদকীয়'}</span>
                                        <span className="author-role">কলামিস্ট</span>
                                    </div>
                                </div>
                                <h3 className="opinion-title">{article.title}</h3>
                                <p className="opinion-excerpt">{article.excerpt}</p>
                                <span className="opinion-date">{article.date}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Newsletter CTA */}
                <section className="newsletter-cta">
                    <div className="newsletter-card">
                        <h2>আপডেট থাকুন, এগিয়ে থাকুন</h2>
                        <p>
                            ব্রেকিং নিউজ এবং একচেটিয়া সংবাদ সরাসরি আপনার ইনবক্সে পান।
                        </p>
                        <form className="newsletter-form-inline" onSubmit={handleSubscribe}>
                            <input
                                type="email"
                                placeholder="আপনার ইমেইল লিখুন"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit">
                                {subscribed ? '✓ সাবস্ক্রাইব হয়েছে!' : 'সাবস্ক্রাইব করুন'}
                            </button>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default HomePage;
