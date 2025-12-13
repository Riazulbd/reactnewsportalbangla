import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../admin/DataContext';
import './Footer.css';

function Footer() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const { getMainCategories } = useData();
    const mainCategories = getMainCategories();

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail('');
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    return (
        <footer className="footer">
            <div className="footer-main">
                <div className="footer-brand">
                    <Link to="/" className="footer-logo">
                        <div className="footer-logo-icon">স</div>
                        <div className="footer-logo-text">
                            সংবাদ<span>পোর্টাল</span>
                        </div>
                    </Link>
                    <p className="footer-description">
                        ব্রেকিং নিউজ, গভীর বিশ্লেষণ এবং সবচেয়ে গুরুত্বপূর্ণ সংবাদের ব্যাপক কভারেজের জন্য আপনার বিশ্বস্ত উৎস।
                    </p>
                    <div className="footer-social">
                        <a href="#" className="social-link" title="টুইটার">𝕏</a>
                        <a href="#" className="social-link" title="ফেসবুক">f</a>
                        <a href="#" className="social-link" title="ইনস্টাগ্রাম">📷</a>
                        <a href="#" className="social-link" title="ইউটিউব">▶</a>
                    </div>
                </div>

                <div className="footer-column">
                    <h4>বিভাগসমূহ</h4>
                    <div className="footer-links">
                        {mainCategories.map((cat) => (
                            <Link key={cat.id} to={`/category/${cat.id}`} className="footer-link">
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="footer-column">
                    <h4>প্রতিষ্ঠান</h4>
                    <div className="footer-links">
                        <Link to="/about" className="footer-link">আমাদের সম্পর্কে</Link>
                        <a href="#" className="footer-link">ক্যারিয়ার</a>
                        <a href="#" className="footer-link">যোগাযোগ</a>
                        <a href="#" className="footer-link">বিজ্ঞাপন</a>
                    </div>
                </div>

                <div className="footer-column">
                    <h4>নিউজলেটার</h4>
                    <p className="footer-description" style={{ marginBottom: 'var(--space-md)' }}>
                        সর্বশেষ সংবাদ সরাসরি আপনার ইনবক্সে পান।
                    </p>
                    <div className="footer-newsletter">
                        <form className="newsletter-form" onSubmit={handleSubscribe}>
                            <input
                                type="email"
                                className="newsletter-input"
                                placeholder="আপনার ইমেইল ঠিকানা"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="newsletter-btn">
                                {subscribed ? '✓ সাবস্ক্রাইব হয়েছে!' : 'সাবস্ক্রাইব করুন'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="footer-bottom-content">
                    <p>© ২০২৫ সংবাদপোর্টাল। সর্বস্বত্ব সংরক্ষিত।</p>
                    <div className="footer-bottom-links">
                        <a href="#" className="footer-bottom-link">গোপনীয়তা নীতি</a>
                        <a href="#" className="footer-bottom-link">সেবার শর্তাবলী</a>
                        <a href="#" className="footer-bottom-link">কুকি সেটিংস</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
