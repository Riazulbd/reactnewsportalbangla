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
                            <button className="share-btn" title="টুইটারে শেয়ার করুন">𝕏</button>
                            <button className="share-btn" title="ফেসবুকে শেয়ার করুন">f</button>
                            <button className="share-btn" title="লিংকডইনে শেয়ার করুন">in</button>
                            <button className="share-btn" title="লিংক কপি করুন">🔗</button>
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
                                অনুসন্ধানী প্রতিবেদনের জন্য পরিচিত। সর্বশেষ আপডেটের জন্য সোশ্যাল মিডিয়ায় অনুসরণ করুন।
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
