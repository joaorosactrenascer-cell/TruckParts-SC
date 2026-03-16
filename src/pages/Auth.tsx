import { useState } from 'react';
import { Mail, Lock, User, Truck, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Auth() {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'customer' | 'supplier' | 'installer'>('customer');

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}</h1>
          <p className="text-slate-500">
            {isLogin ? t('auth.signInToAccess') : t('auth.joinPlatform')}
          </p>
        </div>

        <form className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('auth.iAmA')}</label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-colors ${role === 'customer' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <User className="h-5 w-5" />
                    <span className="text-xs font-medium">{t('auth.customer')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('supplier')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-colors ${role === 'supplier' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <Truck className="h-5 w-5" />
                    <span className="text-xs font-medium">{t('auth.supplier')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('installer')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-colors ${role === 'installer' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <Wrench className="h-5 w-5" />
                    <span className="text-xs font-medium">{t('auth.installer')}</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('auth.fullName')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input type="text" placeholder="John Doe" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('auth.emailAddress')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input type="email" placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
            </div>
          </div>

          <button type="button" className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-xl font-medium transition-colors mt-6">
            {isLogin ? t('auth.signIn') : t('auth.createAccount')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-emerald-600 hover:underline text-sm font-medium"
          >
            {isLogin ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
          </button>
        </div>
      </div>
    </div>
  );
}
