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

    const { articles, categories, getFeaturedArticles, getMainCategories, getSubcategories, settings } = useData();

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
                                <div className="slider-dots">
                                    {featuredArticles.map((_, index) => (
                                        <button
                                            key={index}
                                            className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                                            onClick={() => setCurrentSlide(index)}
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
                                    >
                                        ‹
                                    </button>
                                    <button
                                        className="slider-arrow slider-arrow-next"
                                        onClick={() => setCurrentSlide(prev => (prev + 1) % featuredArticles.length)}
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
