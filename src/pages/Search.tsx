import { useState, FormEvent } from 'react';
import { Search, Camera, Upload, Filter } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function SearchPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'image' ? 'image' : 'text';
  
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'text' | 'image'>(initialMode);
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Compatibility Filters
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Mock search results
    setTimeout(() => {
      setResults([
        { id: '1', name: 'Volvo FH 2018 Headlight Assembly', price: 450.00, supplier: 'AutoParts Direct', image: 'https://picsum.photos/seed/headlight/400/300' },
        { id: '2', name: 'Volvo FH 2018 Front Bumper', price: 850.00, supplier: 'TruckSpares EU', image: 'https://picsum.photos/seed/bumper/400/300' },
        { id: '3', name: 'Volvo FH 2018 Brake Pads Set', price: 120.00, supplier: 'BrakeMasters', image: 'https://picsum.photos/seed/brakes/400/300' },
      ]);
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-lg">{t('search.compatibility')}</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('search.truckBrand')}</label>
              <select 
                value={brand} 
                onChange={(e) => setBrand(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500"
              >
                <option value="">{t('search.allBrands')}</option>
                <option value="volvo">Volvo</option>
                <option value="scania">Scania</option>
                <option value="mercedes">Mercedes-Benz</option>
                <option value="man">MAN</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('search.model')}</label>
              <select 
                value={model} 
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500"
                disabled={!brand}
              >
                <option value="">{t('search.allModels')}</option>
                {brand === 'volvo' && (
                  <>
                    <option value="fh">FH</option>
                    <option value="fm">FM</option>
                    <option value="fmx">FMX</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('search.year')}</label>
              <select 
                value={year} 
                onChange={(e) => setYear(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500"
                disabled={!model}
              >
                <option value="">{t('search.allYears')}</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
                <option value="2019">2019</option>
                <option value="2018">2018</option>
              </select>
            </div>
            
            <button 
              onClick={handleSearch}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg font-medium transition-colors mt-2"
            >
              {t('search.applyFilters')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Search Area */}
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t('search.searchParts')}</h1>
          <div className="flex gap-2 bg-slate-200 p-1 rounded-lg">
            <button 
              onClick={() => setMode('text')} 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'text' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t('search.textSearch')}
            </button>
            <button 
              onClick={() => setMode('image')} 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'image' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t('search.aiImageSearch')}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          {mode === 'text' ? (
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input 
                  type="text" 
                  placeholder={t('search.searchPlaceholder')} 
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-medium transition-colors">
                {t('search.searchBtn')}
              </button>
            </form>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleSearch({ preventDefault: () => {} } as any)}>
              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">{t('search.uploadImage')}</h3>
              <p className="text-slate-500 mb-6">{t('search.uploadImageDesc')}</p>
              <span className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium">{t('search.selectImage')}</span>
            </div>
          )}
        </div>

        {isSearching ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-slate-500">{t('search.searching')}</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex flex-col">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-sm text-slate-500 mb-2">{product.supplier}</p>
                  <h3 className="font-bold text-lg mb-4 line-clamp-2 flex-1">{product.name}</h3>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-2xl font-bold text-emerald-600">${product.price.toFixed(2)}</span>
                    <span className="text-sm font-medium text-slate-900 bg-slate-100 px-3 py-1 rounded-full">{t('search.view')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">{t('search.noPartsFound')}</h3>
            <p className="text-slate-500">{t('search.tryAdjusting')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
