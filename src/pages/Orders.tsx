import { Package, Truck, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Orders() {
  const { t } = useTranslation();
  const orders = [
    { id: 'ORD-1234', date: '2026-03-15', status: 'Shipped', total: 450.00, items: 1 },
    { id: 'ORD-5678', date: '2026-02-28', status: 'Delivered', total: 120.00, items: 2 },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('orders.title')}</h1>
      
      <div className="space-y-6">
        {orders.map(order => (
          <div key={order.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-xl ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                {order.status === 'Delivered' ? <CheckCircle className="h-6 w-6" /> : <Truck className="h-6 w-6" />}
              </div>
              <div>
                <h3 className="font-bold text-lg">{order.id}</h3>
                <p className="text-slate-500 text-sm">{t('orders.placedOn', { date: order.date })} • {t('orders.itemsCount', { count: order.items })}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-bold text-xl">${order.total.toFixed(2)}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                {order.status === 'Delivered' ? t('orders.statusDelivered') : t('orders.statusShipped')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
