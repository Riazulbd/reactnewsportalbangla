import { useParams } from 'react-router-dom';
import { useData } from '../admin/DataContext';
import ArticleCard from '../components/ArticleCard';
import './CategoryPage.css';

function CategoryPage() {
    const { categoryId } = useParams();
    const { categories, getArticlesByCategory, getSubcategories } = useData();

    const category = categories.find((c) => c.id === categoryId);
    const articles = getArticlesByCategory(categoryId);
    const subcategories = getSubcategories(categoryId);

    if (!category) {
        return (
            <div className="container category-page">
                <div className="no-articles">
                    <h3>বিভাগ পাওয়া যায়নি</h3>
                    <p>আপনি যে বিভাগটি খুঁজছেন তা বিদ্যমান নেই।</p>
                </div>
            </div>
        );
    }

    const categoryDescriptions = {
        politics: 'বিশ্বজুড়ে সর্বশেষ রাজনৈতিক সংবাদ, বিশ্লেষণ এবং নীতি আপডেট সম্পর্কে জানুন।',
        sports: 'আপনার প্রিয় খেলা এবং খেলোয়াড়দের সর্বশেষ স্কোর, হাইলাইটস এবং বিস্তারিত কভারেজ পান।',
        technology: 'অত্যাধুনিক উদ্ভাবন, প্রযুক্তি প্রবণতা এবং ডিজিটাল রূপান্তরের ভবিষ্যত অন্বেষণ করুন।',
        entertainment: 'সেলিব্রিটি সংবাদ, চলচ্চিত্র পর্যালোচনা, সঙ্গীত এবং পপ সংস্কৃতি কভারেজের জন্য আপনার গন্তব্য।',
        business: 'বাজারের অন্তর্দৃষ্টি, অর্থনৈতিক বিশ্লেষণ এবং কর্পোরেট সংবাদ ব্যবসা জগতে এগিয়ে থাকতে।',
        world: 'বিশ্বের প্রতিটি কোণ থেকে সংবাদ নিয়ে আসা বৈশ্বিক সংবাদ কভারেজ।',
    };

    return (
        <div className="category-page">
            <div className="container">
                <header
                    className="category-header"
                    style={{ '--category-color-dim': `${category.color}33` }}
                >
                    <span
                        className="category-badge-large"
                        style={{ backgroundColor: category.color, color: 'white' }}
                    >
                        {category.name}
                    </span>
                    <h1 className="category-title">{category.name}</h1>
                    <p className="category-description">
                        {categoryDescriptions[category.id] || `${category.name} বিভাগের সর্বশেষ সংবাদ`}
                    </p>

                    {/* Subcategories */}
                    {subcategories.length > 0 && (
                        <div className="subcategories">
                            {subcategories.map(sub => (
                                <a
                                    key={sub.id}
                                    href={`/category/${sub.id}`}
                                    className="subcategory-tag"
                                    style={{ '--category-color': sub.color }}
                                >
                                    {sub.name}
                                </a>
                            ))}
                        </div>
                    )}

                    <div className="category-stats">
                        <div className="stat-item">
                            <div className="stat-number">{articles.length}</div>
                            <div className="stat-label">প্রবন্ধ</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">২৪/৭</div>
                            <div className="stat-label">কভারেজ</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">{subcategories.length}</div>
                            <div className="stat-label">উপবিভাগ</div>
                        </div>
                    </div>
                </header>

                {articles.length > 0 ? (
                    <div className="category-articles-grid">
                        {articles.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                ) : (
                    <div className="no-articles">
                        <h3>এখনো কোনো প্রবন্ধ নেই</h3>
                        <p>সর্বশেষ {category.name.toLowerCase()} সংবাদের জন্য শীঘ্রই আবার দেখুন।</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CategoryPage;
