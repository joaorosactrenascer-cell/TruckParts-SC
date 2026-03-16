import { Package, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SupplierDashboard() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('supplierDashboard.title')}</h1>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-colors">
          {t('supplierDashboard.addNewProduct')}
        </button>
      </div>
      
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><DollarSign className="h-6 w-6" /></div>
            <h3 className="text-slate-500 font-medium">{t('supplierDashboard.totalRevenue')}</h3>
          </div>
          <p className="text-3xl font-bold">$24,500</p>
          <p className="text-emerald-500 text-sm font-medium mt-2 flex items-center gap-1"><TrendingUp className="h-4 w-4" /> {t('supplierDashboard.thisMonth', { percent: '+12%' })}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-100 p-3 rounded-xl text-purple-600"><Package className="h-6 w-6" /></div>
            <h3 className="text-slate-500 font-medium">{t('supplierDashboard.activeProducts')}</h3>
          </div>
          <p className="text-3xl font-bold">142</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-orange-100 p-3 rounded-xl text-orange-600"><Package className="h-6 w-6" /></div>
            <h3 className="text-slate-500 font-medium">{t('supplierDashboard.pendingOrders')}</h3>
          </div>
          <p className="text-3xl font-bold">18</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600"><Users className="h-6 w-6" /></div>
            <h3 className="text-slate-500 font-medium">{t('supplierDashboard.customerRating')}</h3>
          </div>
          <p className="text-3xl font-bold">4.8/5</p>
        </div>
      </div>
      
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold">{t('supplierDashboard.recentOrders')}</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm">
            <tr>
              <th className="p-4 font-medium">{t('supplierDashboard.orderId')}</th>
              <th className="p-4 font-medium">{t('supplierDashboard.product')}</th>
              <th className="p-4 font-medium">{t('supplierDashboard.customer')}</th>
              <th className="p-4 font-medium">{t('supplierDashboard.date')}</th>
              <th className="p-4 font-medium">{t('supplierDashboard.status')}</th>
              <th className="p-4 font-medium">{t('supplierDashboard.amount')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[1,2,3,4,5].map(i => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium">#ORD-00{i}</td>
                <td className="p-4 text-slate-600">Volvo FH Headlight</td>
                <td className="p-4 text-slate-600">John Doe</td>
                <td className="p-4 text-slate-500">Mar 15, 2026</td>
                <td className="p-4">
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">{t('supplierDashboard.processing')}</span>
                </td>
                <td className="p-4 font-bold">$450.00</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
