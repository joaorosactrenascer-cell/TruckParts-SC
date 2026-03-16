import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Wrench, CheckCircle, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ProductPage() {
  const { t } = useTranslation();
  const { id } = useParams();

  // Mock product data
  const product = {
    id,
    name: 'Volvo FH 2018 Headlight Assembly',
    price: 450.00,
    supplier: 'AutoParts Direct',
    supplierId: 'sup-1',
    image: 'https://picsum.photos/seed/headlight/800/600',
    oem: 'VO-12345678',
    condition: 'New',
    stock: 12,
    compatibility: ['Volvo FH 2016', 'Volvo FH 2017', 'Volvo FH 2018', 'Volvo FH 2019'],
    description: 'High-quality OEM replacement headlight assembly for Volvo FH series trucks. Features integrated LED daytime running lights and premium reflectors for maximum visibility.'
  };

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
        <img src={product.image} alt={product.name} className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
      </div>
      
      <div className="space-y-8">
        <div>
          <Link to={`/supplier/${product.supplierId}`} className="text-emerald-600 font-medium hover:underline mb-2 inline-block">{product.supplier}</Link>
          <h1 className="text-4xl font-bold tracking-tight mb-4">{product.name}</h1>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <CheckCircle className="h-4 w-4" /> {t('product.inStock')} ({product.stock})
            </span>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500 block">{t('product.oemNumber')}</span>
              <span className="font-medium">{product.oem}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t('product.condition')}</span>
              <span className="font-medium">{product.condition}</span>
            </div>
          </div>
          <div>
            <span className="text-slate-500 block mb-2 text-sm">{t('product.compatibleModels')}</span>
            <div className="flex flex-wrap gap-2">
              {product.compatibility.map(model => (
                <span key={model} className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs font-medium">{model}</span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-2">{t('product.description')}</h3>
          <p className="text-slate-600 leading-relaxed">{product.description}</p>
        </div>

        <div className="flex gap-4 pt-4">
          <button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
            <ShoppingCart className="h-5 w-5" /> {t('product.addToCart')}
          </button>
          <Link to={`/book-installation/${product.id}`} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
            <Wrench className="h-5 w-5" /> {t('product.bookInstallation')}
          </Link>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-slate-500 justify-center">
          <ShieldCheck className="h-4 w-4 text-emerald-500" /> {t('product.secureTransaction')}
        </div>
      </div>
    </div>
  );
}
