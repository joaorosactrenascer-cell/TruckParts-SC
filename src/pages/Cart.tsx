import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Cart() {
  const { t } = useTranslation();
  const cartItems = [
    { id: '1', name: 'Volvo FH 2018 Headlight Assembly', price: 450.00, quantity: 1, image: 'https://picsum.photos/seed/headlight/100/100' },
  ];

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('cart.title')}</h1>
      
      {cartItems.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm items-center">
                <img src={item.image} alt={item.name} className="w-24 h-24 rounded-xl object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-emerald-600 font-bold">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <select className="border border-slate-200 rounded-lg p-2 bg-slate-50" defaultValue={item.quantity}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
            <h3 className="text-xl font-bold mb-4">{t('cart.orderSummary')}</h3>
            <div className="space-y-2 mb-4 text-slate-600">
              <div className="flex justify-between"><span>{t('cart.subtotal')}</span><span>${total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>{t('cart.shipping')}</span><span>{t('cart.calculatedAtCheckout')}</span></div>
            </div>
            <div className="border-t border-slate-200 pt-4 mb-6">
              <div className="flex justify-between font-bold text-xl"><span>{t('cart.total')}</span><span>${total.toFixed(2)}</span></div>
            </div>
            <Link to="/checkout" className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white text-center px-6 py-4 rounded-xl font-medium transition-colors">
              {t('cart.proceedToCheckout')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
          <p className="text-slate-500 mb-4">{t('cart.empty')}</p>
          <Link to="/search" className="text-emerald-600 font-medium hover:underline">{t('cart.continueShopping')}</Link>
        </div>
      )}
    </div>
  );
}
