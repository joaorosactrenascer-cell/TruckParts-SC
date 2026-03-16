import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function InstallationBooking() {
  const { t } = useTranslation();
  const { productId } = useParams();
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t('installation.title')}</h1>
      <p className="text-slate-500 mb-8">{t('installation.subtitle')}</p>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-xl font-bold mb-4">{t('installation.availableInstallers')}</h3>
          
          {[1,2,3].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex gap-6 hover:border-emerald-200 transition-colors cursor-pointer">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-lg">ProTruck Mechanics {i}</h4>
                    <div className="flex items-center gap-1 text-sm text-slate-500 mb-2">
                      <MapPin className="h-4 w-4" /> {t('installation.milesAway', { distance: 2.4 })}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-emerald-600">$85/hr</p>
                    <p className="text-xs text-slate-500">{t('installation.estHours', { hours: 2 })}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-amber-500 font-medium">
                    <Star className="h-4 w-4 fill-current" /> 4.9 (120 {t('installation.reviews')})
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-medium">{t('installation.certified')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit sticky top-6">
          <h3 className="text-xl font-bold mb-6">{t('installation.scheduleDetails')}</h3>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('installation.selectDate')}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input type="date" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('installation.selectTime')}</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <select className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 bg-white">
                  <option>09:00 AM</option>
                  <option>11:00 AM</option>
                  <option>02:00 PM</option>
                  <option>04:00 PM</option>
                </select>
              </div>
            </div>
          </div>
          
          <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-xl font-medium transition-colors">
            {t('installation.confirmBooking')}
          </button>
        </div>
      </div>
    </div>
  );
}
