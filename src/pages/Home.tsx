import { Link } from 'react-router-dom';
import { Search, Camera, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white rounded-3xl p-12 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">{t('home.heroTitle1')}<span className="text-emerald-400">{t('home.heroTitle2')}</span></h1>
          <p className="text-xl text-slate-300">{t('home.heroSubtitle')}</p>
          
          <div className="flex justify-center gap-4 pt-4">
            <Link to="/search" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-medium flex items-center gap-2 transition-colors">
              <Search className="h-5 w-5" /> {t('home.startSearching')}
            </Link>
            <Link to="/search?mode=image" className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-medium flex items-center gap-2 transition-colors backdrop-blur-sm">
              <Camera className="h-5 w-5" /> {t('home.aiImageSearch')}
            </Link>
          </div>
        </div>
        {/* Abstract background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="bg-emerald-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
            <Search className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold mb-3">{t('home.smartSearch')}</h3>
          <p className="text-slate-600">{t('home.smartSearchDesc')}</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
            <Camera className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold mb-3">{t('home.aiPartRecognition')}</h3>
          <p className="text-slate-600">{t('home.aiPartRecognitionDesc')}</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="bg-orange-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
            <Wrench className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="text-xl font-bold mb-3">{t('home.certifiedInstallation')}</h3>
          <p className="text-slate-600">{t('home.certifiedInstallationDesc')}</p>
        </div>
      </section>
    </div>
  );
}
