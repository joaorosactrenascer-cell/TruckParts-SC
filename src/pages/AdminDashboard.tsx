import { Shield, Users, Activity, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('admin.dashboard')}</h1>
        <div className="flex gap-4">
          <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2">
            <Settings className="h-4 w-4" /> {t('admin.settings')}
          </button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/10 p-3 rounded-xl"><Users className="h-6 w-6" /></div>
            <h3 className="font-medium opacity-80">{t('admin.totalUsers')}</h3>
          </div>
          <p className="text-4xl font-bold">12,450</p>
        </div>
        
        <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/10 p-3 rounded-xl"><Shield className="h-6 w-6" /></div>
            <h3 className="font-medium opacity-80">{t('admin.verifiedSuppliers')}</h3>
          </div>
          <p className="text-4xl font-bold">342</p>
        </div>
        
        <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/10 p-3 rounded-xl"><Activity className="h-6 w-6" /></div>
            <h3 className="font-medium opacity-80">{t('admin.platformGmv')}</h3>
          </div>
          <p className="text-4xl font-bold">$1.2M</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-xl font-bold mb-6">{t('admin.pendingApprovals')}</h3>
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                <div>
                  <p className="font-bold">Supplier Company {i}</p>
                  <p className="text-sm text-slate-500">{t('admin.appliedDaysAgo', { days: 2 })}</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-emerald-600 hover:bg-emerald-50 px-3 py-1 rounded-lg font-medium transition-colors">{t('admin.approve')}</button>
                  <button className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg font-medium transition-colors">{t('admin.reject')}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-xl font-bold mb-6">{t('admin.systemHealth')}</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">{t('admin.databaseLoad')}</span>
              <span className="font-medium text-emerald-600">{t('admin.normal')} (24%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">{t('admin.aiSearchLatency')}</span>
              <span className="font-medium text-emerald-600">120ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">{t('admin.edgeFunctions')}</span>
              <span className="font-medium text-emerald-600">100% {t('admin.uptime')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
