import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ArticlePage from './pages/ArticlePage';
import SearchPage from './pages/SearchPage';
import AboutPage from './pages/AboutPage';

// Admin imports
import { AuthProvider } from './admin/AuthContext';
import { DataProvider } from './admin/DataContext';
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import ArticleList from './admin/pages/ArticleList';
import ArticleForm from './admin/pages/ArticleForm';
import CategoryManager from './admin/pages/CategoryManager';
import MediaLibrary from './admin/pages/MediaLibrary';
import AdminSettings from './admin/pages/AdminSettings';
import DatabaseSettings from './admin/pages/DatabaseSettings';
import RssSettings from './admin/pages/RssSettings';
import Profile from './admin/pages/Profile';

import UserManagement from './admin/pages/UserManagement';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <>
                <Header />
                <main className="app-main">
                  <HomePage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/category/:categoryId" element={
              <>
                <Header />
                <main className="app-main">
                  <CategoryPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/article/:id" element={
              <>
                <Header />
                <main className="app-main">
                  <ArticlePage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/search" element={
              <>
                <Header />
                <main className="app-main">
                  <SearchPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/about" element={
              <>
                <Header />
                <main className="app-main">
                  <AboutPage />
                </main>
                <Footer />
              </>
            } />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="articles" element={<ArticleList />} />
              <Route path="articles/new" element={<ArticleForm />} />
              <Route path="articles/edit/:id" element={<ArticleForm />} />
              <Route path="categories" element={<CategoryManager />} />
              <Route path="media" element={<MediaLibrary />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="database" element={<DatabaseSettings />} />
              <Route path="rss" element={<RssSettings />} />
              <Route path="profile" element={<Profile />} />

              <Route path="users" element={<UserManagement />} />
            </Route>
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
