import { breakingNews } from '../data/articles';
import './BreakingNews.css';

function BreakingNews() {
    return (
        <div className="breaking-news">
            <div className="breaking-news-label">
                🔴 শিরোনাম
            </div>
            <div className="breaking-news-ticker">
                {breakingNews.concat(breakingNews).map((news, index) => (
                    <span key={index} className="breaking-news-item">
                        {news}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default BreakingNews;
