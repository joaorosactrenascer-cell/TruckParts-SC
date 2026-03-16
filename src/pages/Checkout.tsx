import { useTranslation } from 'react-i18next';

export default function Checkout() {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('checkout.title')}</h1>
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <form className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-4">{t('checkout.shippingInfo')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder={t('checkout.firstName')} className="border border-slate-200 rounded-xl p-3 w-full" />
              <input type="text" placeholder={t('checkout.lastName')} className="border border-slate-200 rounded-xl p-3 w-full" />
              <input type="text" placeholder={t('checkout.address')} className="border border-slate-200 rounded-xl p-3 w-full col-span-2" />
              <input type="text" placeholder={t('checkout.city')} className="border border-slate-200 rounded-xl p-3 w-full" />
              <input type="text" placeholder={t('checkout.postalCode')} className="border border-slate-200 rounded-xl p-3 w-full" />
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-xl font-bold mb-4">{t('checkout.paymentMethod')}</h3>
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 text-center">
              {t('checkout.stripePlaceholder')}
            </div>
          </div>
          
          <button type="button" className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-xl font-medium transition-colors">
            {t('checkout.placeOrder')} ($450.00)
          </button>
        </form>
      </div>
    </div>
  );
}
