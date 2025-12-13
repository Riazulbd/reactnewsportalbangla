import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../admin/DataContext';
import ArticleCard from '../components/ArticleCard';
import BreakingNews from '../components/BreakingNews';
import './HomePage.css';

function HomePage() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const { articles, categories, getHeroArticle, getMainCategories } = useData();

    const heroArticle = getHeroArticle();
    const mainCategories = getMainCategories();

    // 4 small posts for sidebar (excluding hero article)
    const sidebarArticles = articles
        .filter(a => a.id !== heroArticle?.id)
        .slice(0, 4);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail('');
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    const getCategory = (catId) => categories.find(c => c.id === catId);

    // Get articles for a category (4 per category)
    const getCategoryArticles = (categoryId) => {
        return articles.filter(a => a.category === categoryId).slice(0, 4);
    };

    if (!heroArticle) {
        return (
            <div className="home-page">
                <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                    <h2>এখনো কোনো প্রবন্ধ নেই</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>অ্যাডমিন প্যানেলে গিয়ে প্রবন্ধ যোগ করুন।</p>
                </div>
            </div>
        );
    }

    return (
        <div className="home-page">
            <BreakingNews />

            <main className="container">
                {/* Hero Section - 1 big + 4 small */}
                <section className="hero-section">
                    <div className="hero-grid">
                        <Link to={`/article/${heroArticle.id}`} className="hero-featured">
                            <img
                                src={heroArticle.image}
                                alt={heroArticle.title}
                                className="hero-featured-image"
                            />
                            <div className="hero-featured-overlay">
                                <span
                                    className="hero-featured-category category-badge"
                                    style={{ '--category-color': getCategory(heroArticle.category)?.color }}
                                >
                                    {getCategory(heroArticle.category)?.name}
                                </span>
                                <h1 className="hero-featured-title">{heroArticle.title}</h1>
                                <p className="hero-featured-excerpt">{heroArticle.excerpt}</p>
                                <div className="hero-featured-meta">
                                    <span>📅 {heroArticle.date}</span>
                                    <span>{heroArticle.readTime}</span>
                                </div>
                            </div>
                        </Link>

                        <div className="hero-sidebar">
                            {sidebarArticles.map((article) => (
                                <ArticleCard key={article.id} article={article} variant="compact" />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Category Sections - in ordered sequence, 4 articles each */}
                {mainCategories.map((category) => {
                    const categoryArticles = getCategoryArticles(category.id);

                    if (categoryArticles.length === 0) return null;

                    return (
                        <section key={category.id} className="category-section">
                            <div className="section-header">
                                <h2 className="section-title">{category.name}</h2>
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
                            ১ লক্ষের বেশি গ্রাহকের সাথে যোগ দিন।
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
