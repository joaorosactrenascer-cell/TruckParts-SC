import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Truck, Search, ShoppingCart, User, Settings, Package, LogIn, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Pages
import Home from './pages/Home';
import SearchPage from './pages/Search';
import ProductPage from './pages/Product';
import SupplierPage from './pages/Supplier';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import SupplierDashboard from './pages/SupplierDashboard';
import AdminDashboard from './pages/AdminDashboard';
import InstallationBooking from './pages/InstallationBooking';
import Auth from './pages/Auth';

function Navbar() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'pt-BR' ? 'en' : 'pt-BR';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className="bg-slate-900 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <Truck className="h-6 w-6 text-emerald-400" />
          <span>TRUCKPARTS<span className="text-emerald-400">SC</span></span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/search" className="flex items-center gap-1 hover:text-emerald-400 transition-colors">
            <Search className="h-4 w-4" /> {t('nav.search')}
          </Link>
          <Link to="/cart" className="flex items-center gap-1 hover:text-emerald-400 transition-colors">
            <ShoppingCart className="h-4 w-4" /> {t('nav.cart')}
          </Link>
          <Link to="/orders" className="flex items-center gap-1 hover:text-emerald-400 transition-colors">
            <Package className="h-4 w-4" /> {t('nav.orders')}
          </Link>
          <Link to="/supplier-dashboard" className="flex items-center gap-1 hover:text-emerald-400 transition-colors">
            <Settings className="h-4 w-4" /> {t('nav.supplier')}
          </Link>
          <Link to="/admin" className="flex items-center gap-1 hover:text-emerald-400 transition-colors">
            <User className="h-4 w-4" /> {t('nav.admin')}
          </Link>
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1 hover:text-emerald-400 transition-colors ml-2"
            title="Toggle Language"
          >
            <Globe className="h-4 w-4" /> {i18n.language === 'pt-BR' ? 'EN' : 'PT'}
          </button>
          <Link to="/auth" className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg font-medium transition-colors ml-2">
            <LogIn className="h-4 w-4" /> {t('nav.signIn')}
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  const { t } = useTranslation();
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/supplier/:id" element={<SupplierPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/supplier-dashboard" element={<SupplierDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/book-installation/:productId" element={<InstallationBooking />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>
        <footer className="bg-slate-900 text-slate-400 py-8 text-center">
          <p>{t('nav.footer')}</p>
        </footer>
      </div>
    </Router>
  );
}
