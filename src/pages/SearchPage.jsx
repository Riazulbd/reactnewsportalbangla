import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useData } from '../admin/DataContext';
import ArticleCard from '../components/ArticleCard';
import './SearchPage.css';

function SearchPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { searchArticles, categories } = useData();

    const query = searchParams.get('q') || '';
    const [searchInput, setSearchInput] = useState(query);
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (query) {
            setResults(searchArticles(query));
            setSearchInput(query);
        } else {
            setResults([]);
        }
    }, [query, searchArticles]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    };

    const suggestions = ['প্রযুক্তি', 'রাজনীতি', 'জলবায়ু', 'খেলাধুলা', 'ব্যবসা'];

    return (
        <div className="search-page">
            <div className="container">
                <header className="search-header">
                    {query ? (
                        <h1 className="search-title">
                            "<span className="search-query">{query}</span>" এর জন্য ফলাফল
                        </h1>
                    ) : (
                        <h1 className="search-title">প্রবন্ধ অনুসন্ধান করুন</h1>
                    )}
                </header>

                <form className="search-form-large" onSubmit={handleSearch}>
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="সংবাদ, বিষয় বা কীওয়ার্ড অনুসন্ধান করুন..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        autoFocus
                    />
                </form>

                {query ? (
                    <>
                        <p className="search-results-count">
                            {results.length}টি প্রবন্ধ পাওয়া গেছে
                        </p>

                        {results.length > 0 ? (
                            <div className="search-results-grid">
                                {results.map((article) => (
                                    <ArticleCard key={article.id} article={article} />
                                ))}
                            </div>
                        ) : (
                            <div className="no-results">
                                <h3>কোনো ফলাফল পাওয়া যায়নি</h3>
                                <p>ভিন্ন কীওয়ার্ড চেষ্টা করুন বা আমাদের বিভাগগুলো ব্রাউজ করুন</p>
                                <div className="search-suggestions">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            className="suggestion-tag"
                                            onClick={() => handleSuggestionClick(cat.name)}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="no-results">
                        <h3>আপনি কী খুঁজছেন?</h3>
                        <p>উপরে একটি অনুসন্ধান শব্দ লিখুন বা এই জনপ্রিয় বিষয়গুলো চেষ্টা করুন</p>
                        <div className="search-suggestions">
                            {suggestions.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    className="suggestion-tag"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchPage;
