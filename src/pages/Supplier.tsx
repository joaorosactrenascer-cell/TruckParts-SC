import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function SupplierPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-8">
        <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center text-2xl font-bold text-slate-500">
          AD
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">AutoParts Direct</h1>
          <p className="text-slate-500 mb-4">{t('supplier.verifiedSince')}</p>
          <div className="flex gap-4 text-sm font-medium">
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">4.9/5 {t('supplier.rating')}</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">1,200+ {t('supplier.orders')}</span>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-6">{t('supplier.productsBy')} AutoParts Direct</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Mock products */}
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
              <div className="aspect-[4/3] bg-slate-100"></div>
              <div className="p-4">
                <h3 className="font-bold mb-2">Sample Part {i}</h3>
                <span className="text-emerald-600 font-bold">$199.00</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
