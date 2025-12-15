import { Link } from 'react-router-dom';
import { useData } from '../admin/DataContext';
import './BreakingNews.css';

function BreakingNews() {
    const { articles } = useData();

    // Get latest 10 articles for ticker
    const latestArticles = articles
        .slice()
        .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
        .slice(0, 10);

    if (latestArticles.length === 0) {
        return null;
    }

    // Duplicate for seamless scrolling
    const tickerItems = [...latestArticles, ...latestArticles];

    return (
        <div className="breaking-news">
            <div className="breaking-news-label">
                <span className="pulse-dot"></span>
                শিরোনাম
            </div>
            <div className="breaking-news-ticker">
                {tickerItems.map((article, index) => (
                    <Link
                        key={`${article.id}-${index}`}
                        to={`/article/${article.slug || article.id}`}
                        className="breaking-news-item"
                    >
                        {article.title}
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default BreakingNews;
