import { Link } from 'react-router-dom';
import { useData } from '../admin/DataContext';
import './ArticleCard.css';

function ArticleCard({ article, variant = 'default', showAuthor = false }) {
    const { categories } = useData();
    const category = categories.find((c) => c.id === article.category);

    return (
        <Link
            to={`/article/${article.id}`}
            className={`article-card ${variant === 'featured' ? 'featured' : ''} ${variant === 'compact' ? 'compact' : ''}`}
        >
            <div className="article-card-image">
                <img src={article.image} alt={article.title} loading="lazy" />
                <span
                    className="article-card-category category-badge"
                    style={{ '--category-color': category?.color }}
                >
                    {category?.name}
                </span>
            </div>

            <div className="article-card-content">
                <h3 className="article-card-title">{article.title}</h3>
                <p className="article-card-excerpt">{article.excerpt}</p>

                <div className="article-card-meta">
                    {showAuthor && (
                        <div className="article-card-author">
                            <img src={article.authorAvatar} alt={article.author} />
                            <span>{article.author}</span>
                        </div>
                    )}
                    <div className="article-card-date">
                        <span>📅</span>
                        <span>{article.date}</span>
                    </div>
                    <span>{article.readTime}</span>
                </div>
            </div>
        </Link>
    );
}

export default ArticleCard;
