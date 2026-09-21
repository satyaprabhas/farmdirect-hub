import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Award, Users, Calendar, Clock, DollarSign, ArrowUpRight, Sparkles, Filter } from 'lucide-react';
import api from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface CropAdvisoryItem {
  id: number;
  name: string;
  mandated_price: number;
  farmer_price: number;
  current_active_farmers: number;
  total_stock_available: number;
  avg_yield_acre: number;
  est_profit_acre: number;
  margin_percent: number;
  demand_score: number;
  demand_level: string;
  best_season: string;
  harvest_days: number;
  recommendation: string;
  stat_note: string;
}

export default function CropAdvisory() {
  const navigate = useNavigate();
  const { t, translateVeg, language } = useLanguage();

  const [advisoryList, setAdvisoryList] = useState<CropAdvisoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDemand, setFilterDemand] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'profit' | 'demand' | 'days'>('profit');

  useEffect(() => {
    const fetchAdvisory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/farmer/crop-advisory');
        const list = Array.isArray(res.data) ? res.data : (res.data?.advisory || []);
        setAdvisoryList(list);
      } catch (err) {
        console.error('Failed to fetch crop advisory:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvisory();
  }, []);

  const filteredList = advisoryList
    .filter(item => {
      if (filterDemand === 'HIGH') return item.demand_level === 'HIGH';
      if (filterDemand === 'MODERATE') return item.demand_level === 'MODERATE';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'profit') return b.est_profit_acre - a.est_profit_acre;
      if (sortBy === 'demand') return b.demand_score - a.demand_score;
      if (sortBy === 'days') return a.harvest_days - b.harvest_days;
      return 0;
    });

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            {language === 'te' ? 'మార్కెట్ గణాంకాలు & లాభాల సూచిక' : 'Market Statistics & Yield Analytics'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('advisory.title', 'Crop Cultivation Advisory & Profit Analytics')}
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base mt-2 leading-relaxed">
            {t('advisory.subtitle', 'Discover which crops yield maximum profits based on market trends and statistics.')}
          </p>
        </div>
      </div>

      {/* Filter and Sorting bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>{language === 'te' ? 'డిమాండ్ వడపోత:' : 'Filter by Demand:'}</span>
          <button
            onClick={() => setFilterDemand('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${filterDemand === 'ALL' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
          >
            {language === 'te' ? 'అన్నీ' : 'All'}
          </button>
          <button
            onClick={() => setFilterDemand('HIGH')}
            className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${filterDemand === 'HIGH' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
          >
            {language === 'te' ? 'అధిక డిమాండ్' : 'High Demand'}
          </button>
          <button
            onClick={() => setFilterDemand('MODERATE')}
            className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${filterDemand === 'MODERATE' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
          >
            {language === 'te' ? 'మధ్యస్థం' : 'Moderate'}
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
          <span>{t('market.sortBy', 'Sort by')}:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="border rounded-lg px-3 py-1 text-xs font-medium bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-200 cursor-pointer"
          >
            <option value="profit">{language === 'te' ? 'లాభం: ఎక్కువ నుండి తక్కువ' : 'Estimated Profit (Highest)'}</option>
            <option value="demand">{language === 'te' ? 'డిమాండ్ స్కోరు' : 'Market Demand Score'}</option>
            <option value="days">{language === 'te' ? 'కోత సమయం (తక్కువ రోజులు)' : 'Shortest Harvest Duration'}</option>
          </select>
        </div>
      </div>

      {/* Advisory Crop Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.map((crop) => {
          const isHighProfit = crop.est_profit_acre >= 55000;
          return (
            <div
              key={crop.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {translateVeg(crop.name)}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${crop.demand_level === 'HIGH' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                      {crop.demand_level === 'HIGH' ? t('advisory.highDemand', 'High Demand') : t('advisory.moderateDemand', 'Moderate Demand')}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {crop.harvest_days} {language === 'te' ? 'రోజులు' : 'days'}
                    </span>
                  </div>
                </div>

                {isHighProfit && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-2 py-1 rounded-lg">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    {language === 'te' ? 'టాప్ లాభం' : 'Top Profit'}
                  </span>
                )}
              </div>

              {/* Profit & Yield Stats */}
              <div className="p-5 space-y-4 flex-grow">
                <div className="bg-emerald-50/70 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/40">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase">
                      {t('advisory.estProfit', 'Est. Profit / Acre')}
                    </span>
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      +{crop.margin_percent}% {t('advisory.margin', 'Margin')}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                    ₹{crop.est_profit_acre.toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    {language === 'te' ? `సగటు దిగుబడి: ~${crop.avg_yield_acre} కేజీలు / ఎకరాకు` : `Average Yield: ~${crop.avg_yield_acre} kg / acre`}
                  </p>
                </div>

                {/* Price & Competition Matrix */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-lg">
                    <span className="text-gray-500 dark:text-gray-400 block mb-0.5">{t('advisory.farmerPrice', 'Farmer Rate')}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">₹{crop.farmer_price} / kg</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">(Govt: ₹{crop.mandated_price})</span>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-lg">
                    <span className="text-gray-500 dark:text-gray-400 block mb-0.5 flex items-center gap-1">
                      <Users className="w-3 h-3 text-gray-400" />
                      {t('advisory.activeCompetition', 'Competing Farmers')}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{crop.current_active_farmers} {language === 'te' ? 'రైతులు' : 'farmers'}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">{crop.total_stock_available} kg listed</span>
                  </div>
                </div>

                {/* Season and Recommendation Note */}
                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100/60 dark:border-amber-800/30">
                  <div className="flex items-center gap-1 font-semibold text-amber-900 dark:text-amber-300">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{crop.best_season}</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
                    {crop.recommendation}
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="p-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">
                  {crop.stat_note}
                </span>
                <button
                  onClick={() => navigate('/farmer/add-produce')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <span>{t('farmer.addNewProduce', 'List Produce')}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
