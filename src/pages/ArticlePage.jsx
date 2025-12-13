import { useParams, Link } from 'react-router-dom';
import { useData } from '../admin/DataContext';
import ArticleCard from '../components/ArticleCard';
import './ArticlePage.css';

function ArticlePage() {
    const { id } = useParams();
    const { articles, categories, getArticleById } = useData();
    const article = getArticleById(id);

    if (!article) {
        return (
            <div className="container article-page">
                <div className="no-articles">
                    <h3>প্রবন্ধ পাওয়া যায়নি</h3>
                    <p>আপনি যে প্রবন্ধটি খুঁজছেন তা বিদ্যমান নেই।</p>
                    <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        প্রচ্ছদে ফিরে যান
                    </Link>
                </div>
            </div>
        );
    }

    const category = categories.find((c) => c.id === article.category);
    const relatedArticles = articles
        .filter((a) => a.category === article.category && a.id !== article.id)
        .slice(0, 3);

    // Get current page URL for sharing
    const articleUrl = typeof window !== 'undefined' ? window.location.href : '';
    const encodedUrl = encodeURIComponent(articleUrl);
    const encodedTitle = encodeURIComponent(article.title);

    // Share handlers
    const shareOnTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank', 'width=600,height=400');
    };

    const shareOnFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'width=600,height=400');
    };

    const shareOnWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, '_blank');
    };

    const shareOnLinkedIn = () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank', 'width=600,height=400');
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(articleUrl);
            alert('লিংক কপি করা হয়েছে!');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="article-page">
            <div className="container">
                <div className="article-container">
                    <Link to="/" className="back-link">
                        ← প্রচ্ছদে ফিরুন
                    </Link>

                    <header className="article-header">
                        <span
                            className="article-category category-badge"
                            style={{ '--category-color': category?.color }}
                        >
                            {category?.name}
                        </span>
                        <h1 className="article-title">{article.title}</h1>

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="article-tags">
                                {article.tags.map((tag, index) => (
                                    <Link key={index} to={`/search?q=${encodeURIComponent(tag)}`} className="article-tag">
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                        )}

                        <div className="article-meta">
                            <div className="article-author">
                                <img src={article.authorAvatar} alt={article.author} />
                                <div className="article-author-info">
                                    <div className="article-author-name">{article.author}</div>
                                    <div className="article-author-role">সিনিয়র সংবাদদাতা</div>
                                </div>
                            </div>
                            <span>📅 {article.date}</span>
                            <span>⏱️ {article.readTime}</span>
                        </div>
                    </header>

                    <div className="article-hero-image">
                        <img src={article.image} alt={article.title} />
                    </div>

                    <div className="article-content">
                        {article.content.split('\n\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>

                    <div className="article-share">
                        <span className="share-label">এই প্রবন্ধ শেয়ার করুন:</span>
                        <div className="share-buttons">
                            <button
                                className="share-btn share-twitter"
                                onClick={shareOnTwitter}
                                title="টুইটারে শেয়ার করুন"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </button>
                            <button
                                className="share-btn share-facebook"
                                onClick={shareOnFacebook}
                                title="ফেসবুকে শেয়ার করুন"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </button>
                            <button
                                className="share-btn share-whatsapp"
                                onClick={shareOnWhatsApp}
                                title="হোয়াটসঅ্যাপে শেয়ার করুন"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </button>
                            <button
                                className="share-btn share-linkedin"
                                onClick={shareOnLinkedIn}
                                title="লিংকডইনে শেয়ার করুন"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </button>
                            <button
                                className="share-btn share-copy"
                                onClick={copyLink}
                                title="লিংক কপি করুন"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="author-bio">
                        <img
                            src={article.authorAvatar}
                            alt={article.author}
                            className="author-bio-avatar"
                        />
                        <div className="author-bio-content">
                            <h4>{article.author}</h4>
                            <p>
                                ১৫ বছরেরও বেশি অভিজ্ঞতাসম্পন্ন পুরস্কারপ্রাপ্ত সাংবাদিক,
                                {' '}{category?.name} সংবাদ কভার করছেন। গভীর বিশ্লেষণ এবং
                                অনুসন্ধানী প্রতিবেদনের জন্য পরিচিত।
                            </p>
                        </div>
                    </div>
                </div>

                {relatedArticles.length > 0 && (
                    <div className="related-articles">
                        <h3 className="related-header">সম্পর্কিত প্রবন্ধ</h3>
                        <div className="related-grid">
                            {relatedArticles.map((relatedArticle) => (
                                <ArticleCard key={relatedArticle.id} article={relatedArticle} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ArticlePage;
