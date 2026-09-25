import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Send, 
  X, 
  Stethoscope, 
  Image, 
  MapPin, 
  User, 
  Award,
  FlaskConical,
  Sprout,
  Layers,
  Droplets,
  Leaf,
  Calendar,
  Maximize2,
  Sparkles
} from 'lucide-react';
import api, { getImageUrl } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import DashboardCard from '../../components/common/DashboardCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface CaseItem {
  id: number;
  farmer_id: number;
  crop_name: string;
  image_url: string;
  symptoms: string;
  affected_area: string;
  status: 'PENDING' | 'RESOLVED' | 'ANALYZED';
  adviser_id?: number;
  disease_name?: string;
  prescription?: string;
  adviser_notes?: string;
  created_at: string;
  advised_at?: string;
  farmer_name: string;
  farmer_mobile: string;
  farmer_location: string;
}

interface SoilReportItem {
  id: number;
  farmer_id: number;
  farmer_name: string;
  farmer_mobile: string;
  farmer_village?: string;
  farmer_district?: string;
  farmer_state?: string;
  crop_name: string;
  land_area: string;
  soil_type?: string;
  fertilizer_preference?: 'ORGANIC' | 'CHEMICAL' | 'MIXED';
  soil_report_image?: string;
  farmer_notes?: string;
  status: 'PENDING' | 'ADVISED';
  adviser_id?: number;
  adviser_name?: string;
  fertilizer_advice?: string;
  general_prescription?: string;
  adviser_notes?: string;
  created_at: string;
  advised_at?: string;
}

export default function AdviserDashboard() {
  const { user } = useAuth();
  const { t, translateVeg, language } = useLanguage();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'DISEASE' | 'SOIL'>('DISEASE');
  const [stats, setStats] = useState({
    total_cases: 0,
    pending_cases: 0,
    resolved_cases: 0,
    total_soil_cases: 0,
    pending_soil_cases: 0,
    advised_soil_cases: 0
  });

  const [cases, setCases] = useState<CaseItem[]>([]);
  const [soilReports, setSoilReports] = useState<SoilReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');
  const [soilFilterStatus, setSoilFilterStatus] = useState<'ALL' | 'PENDING' | 'ADVISED'>('ALL');

  // Disease Modal state
  const [activeCase, setActiveCase] = useState<CaseItem | null>(null);
  const [diseaseName, setDiseaseName] = useState('');
  const [prescription, setPrescription] = useState('');
  const [adviserNotes, setAdviserNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Soil Nutrient Modal state
  const [activeSoilReport, setActiveSoilReport] = useState<SoilReportItem | null>(null);
  const [fertilizerAdvice, setFertilizerAdvice] = useState('');
  const [soilNotes, setSoilNotes] = useState('');
  const [submittingSoil, setSubmittingSoil] = useState(false);

  // Image preview modal
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, casesRes, soilRes] = await Promise.all([
        api.get('/adviser/stats'),
        api.get('/adviser/cases'),
        api.get('/adviser/soil-reports')
      ]);

      const rawStats = statsRes.data.stats || statsRes.data || {};
      setStats({
        total_cases: rawStats.total_cases || 0,
        pending_cases: rawStats.pending_cases || 0,
        resolved_cases: rawStats.resolved_cases || 0,
        total_soil_cases: rawStats.total_soil_cases || 0,
        pending_soil_cases: rawStats.pending_soil_cases || 0,
        advised_soil_cases: rawStats.advised_soil_cases || 0
      });

      setCases(casesRes.data || []);
      setSoilReports(soilRes.data || []);
    } catch (err) {
      console.error('Failed to load adviser portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openPrescribeModal = (c: CaseItem) => {
    setActiveCase(c);
    setDiseaseName(c.disease_name || '');
    setPrescription(c.prescription || '');
    setAdviserNotes(c.adviser_notes || '');
  };

  const openSoilModal = (s: SoilReportItem) => {
    setActiveSoilReport(s);
    setFertilizerAdvice(s.fertilizer_advice || s.general_prescription || '');
    setSoilNotes(s.adviser_notes || '');
  };

  const handleAdviseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase) return;
    if (!diseaseName || !prescription) {
      showToast(language === 'te' ? 'దయచేసి తెగులు పేరు మరియు సూచించిన చికిత్సను నమోదు చేయండి' : 'Please provide diagnosed disease name and prescription', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/adviser/cases/${activeCase.id}/advise`, {
        disease_name: diseaseName,
        prescription,
        adviser_notes: adviserNotes
      });

      showToast(language === 'te' ? 'రైతుకు సలహా మరియు మందుల వివరాలు విజయవంతంగా పంపబడ్డాయి!' : 'Prescription & agronomic advice submitted to farmer successfully!', 'success');
      setActiveCase(null);
      await fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to submit advice', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSoilAdviseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSoilReport) return;
    if (!fertilizerAdvice.trim()) {
      showToast(language === 'te' ? 'దయచేసి ఎరువుల సలహాను నమోదు చేయండి' : 'Please type your fertilizer recommendations and schedule', 'error');
      return;
    }

    setSubmittingSoil(true);
    try {
      await api.post(`/adviser/soil-reports/${activeSoilReport.id}/advise`, {
        fertilizer_advice: fertilizerAdvice,
        adviser_notes: soilNotes
      });

      showToast(
        language === 'te' 
          ? 'రైతు ఎంపిక ఆధారంగా ఎరువుల సలహా విజయవంతంగా పంపబడింది!' 
          : 'Fertilizer advice tailored to farmer choice submitted successfully!', 
        'success'
      );
      setActiveSoilReport(null);
      await fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to submit fertilizer advice', 'error');
    } finally {
      setSubmittingSoil(false);
    }
  };

  const filteredCases = cases.filter(c => {
    if (filterStatus === 'PENDING') return c.status === 'PENDING';
    if (filterStatus === 'RESOLVED') return c.status === 'RESOLVED' || (c.status as any) === 'ANALYZED';
    return true;
  });

  const filteredSoilReports = soilReports.filter(s => {
    if (soilFilterStatus === 'PENDING') return s.status === 'PENDING';
    if (soilFilterStatus === 'ADVISED') return s.status === 'ADVISED';
    return true;
  });

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Adviser Header */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-800 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <GraduationCap className="w-4 h-4 text-purple-200" />
            {t('role.adviser', 'Certified Agricultural Consultant')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('adviser.dashTitle', 'Agricultural Adviser Portal')}
          </h1>
          <p className="text-purple-100 text-sm mt-1">
            {t('farmer.welcomeBack', 'Welcome')}, {user?.full_name} • {user?.specialization || 'Agronomy & Plant Pathology'}
          </p>
        </div>

        {user?.license_number && (
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-xs text-purple-100">
            <span className="block font-semibold uppercase text-[10px] text-purple-200">{t('adviser.license', 'License / Reg ID')}</span>
            <span className="font-mono text-sm font-bold text-white">{user.license_number}</span>
          </div>
        )}
      </div>

      {/* Admin Approval Notice if not verified */}
      {!user?.is_verified && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-sm flex items-start gap-3.5 text-amber-950">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-sm">
            <h3 className="font-bold text-amber-900 text-base">
              {language === 'te' ? 'నిర్వాహక ఆమోదం పెండింగ్‌లో ఉంది' : 'Adviser Account Pending Admin Approval'}
            </h3>
            <p className="text-amber-800 text-xs sm:text-sm leading-relaxed">
              {language === 'te' 
                ? 'మీ సలహాదారు ఖాతా ప్రస్తుతం అడ్మిన్ పరిశీలనలో ఉంది. అడ్మిన్ ఆమోదించిన తర్వాత మాత్రమే మీరు రైతులకు రోగ నిర్ధారణ మరియు మందులను సూచించగలరు.' 
                : 'Your adviser account is pending verification and approval by the Administrator. You can view submitted cases below, but prescription submission will be enabled once approved by Admin.'}
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {activeTab === 'DISEASE' ? (
          <>
            <DashboardCard 
              title={t('adviser.totalCases', 'Total Disease Consultations')} 
              value={stats.total_cases.toString()} 
              icon={<FileText size={24} className="text-purple-500" />} 
            />
            <DashboardCard 
              title={t('adviser.pendingCases', 'Awaiting Disease Diagnosis')} 
              value={stats.pending_cases.toString()} 
              icon={<Clock size={24} className="text-amber-500" />} 
            />
            <DashboardCard 
              title={t('adviser.resolvedCases', 'Prescribed & Solved')} 
              value={stats.resolved_cases.toString()} 
              icon={<CheckCircle2 size={24} className="text-emerald-500" />} 
            />
          </>
        ) : (
          <>
            <DashboardCard 
              title={t('adviser.totalSoilCases', 'Total Soil Health Reports')} 
              value={stats.total_soil_cases.toString()} 
              icon={<FlaskConical size={24} className="text-teal-500" />} 
            />
            <DashboardCard 
              title={t('adviser.pendingCases', 'Awaiting Fertilizer Advice')} 
              value={stats.pending_soil_cases.toString()} 
              icon={<Clock size={24} className="text-amber-500" />} 
            />
            <DashboardCard 
              title={t('adviser.resolvedCases', 'Advised & Solved')} 
              value={stats.advised_soil_cases.toString()} 
              icon={<CheckCircle2 size={24} className="text-emerald-500" />} 
            />
          </>
        )}
      </div>

      {/* Main Tab Switcher */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 gap-2">
        <button
          onClick={() => setActiveTab('DISEASE')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'DISEASE'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>{t('adviser.tabDisease', 'Crop Disease Consultations')}</span>
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
            {cases.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('SOIL')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'SOIL'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>{t('adviser.tabSoil', 'Farmer Support (Soil & Nutrients)')}</span>
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
            {soilReports.length}
          </span>
        </button>
      </div>

      {/* TAB 1: DISEASE CONSULTATIONS */}
      {activeTab === 'DISEASE' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-purple-600" />
                {t('adviser.casesList', 'Farmer Disease Consultations')}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {language === 'te' ? 'రైతులు అప్‌లోడ్ చేసిన ఫోటోలు పరిశీలించి సరైన మందులను సూచించండి' : 'Review farmer crop photos and diagnose diseases with verified remedy'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${filterStatus === 'ALL' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                {language === 'te' ? 'అన్నీ' : 'All'} ({cases.length})
              </button>
              <button
                onClick={() => setFilterStatus('PENDING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${filterStatus === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                {language === 'te' ? 'పెండింగ్' : 'Pending'} ({cases.filter(c => c.status === 'PENDING').length})
              </button>
              <button
                onClick={() => setFilterStatus('RESOLVED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${filterStatus === 'RESOLVED' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                {language === 'te' ? 'పరిష్కరించినవి' : 'Resolved'} ({cases.filter(c => c.status === 'RESOLVED' || (c.status as any) === 'ANALYZED').length})
              </button>
            </div>
          </div>

          {filteredCases.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                {language === 'te' ? 'ఈ ఫిల్టర్‌లో ఎటువంటి కేసులు లేవు.' : 'No cases found matching this filter.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredCases.map((c) => {
                const isResolved = c.status === 'RESOLVED' || (c.status as any) === 'ANALYZED';
                return (
                  <div key={c.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <div className="flex flex-col lg:flex-row gap-5 items-start">
                      {/* Crop Photo */}
                      <div className="w-full lg:w-44 h-36 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 border border-gray-200 dark:border-gray-600 relative">
                        {c.image_url ? (
                          <img 
                            src={getImageUrl(c.image_url)} 
                            alt="Farmer crop photo" 
                            onError={(e) => { (e.target as HTMLImageElement).src = '/uploads/1789360871472.jpeg'; }}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs">
                            <Image className="w-8 h-8 mb-1 opacity-50" />
                            <span>No photo</span>
                          </div>
                        )}
                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isResolved ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                          {isResolved ? 'Solved' : 'Pending'}
                        </span>
                      </div>

                      {/* Case details */}
                      <div className="space-y-3 flex-grow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {translateVeg(c.crop_name)}
                              </h3>
                              <span className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded font-medium">
                                {c.affected_area || 'Area not specified'}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                {c.farmer_name} ({c.farmer_mobile})
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                {c.farmer_location || 'Local Farmer'}
                              </span>
                              <span>• {new Date(c.created_at).toLocaleString()}</span>
                            </div>
                          </div>

                          {!user?.is_verified ? (
                            <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-xl text-xs font-semibold">
                              {language === 'te' ? 'ఆమోదం అవసరం' : 'Approval Required'}
                            </span>
                          ) : (
                            <button
                              onClick={() => openPrescribeModal(c)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0 ${isResolved ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                            >
                              <Send className="w-3.5 h-3.5" />
                              {isResolved ? (language === 'te' ? 'సవరించండి' : 'Update Advice') : (language === 'te' ? 'సలహా ఇవ్వండి' : 'Provide Advisory')}
                            </button>
                          )}
                        </div>

                        {/* Symptoms */}
                        <div className="text-xs bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                          <span className="font-semibold text-gray-600 dark:text-gray-300 block mb-1 uppercase tracking-wider text-[10px]">
                            {t('disease.symptoms', 'Farmer Symptoms Note')}:
                          </span>
                          <p className="text-gray-800 dark:text-gray-200">
                            {c.symptoms}
                          </p>
                        </div>

                        {/* Current prescription if resolved */}
                        {isResolved && (
                          <div className="text-xs bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40 space-y-1 text-emerald-900 dark:text-emerald-200">
                            <span className="font-bold block">
                              🔬 {t('disease.diagnosis', 'Diagnosed')}: {c.disease_name}
                            </span>
                            <p className="whitespace-pre-line text-emerald-800 dark:text-emerald-300 font-medium">
                              💊 {c.prescription}
                            </p>
                            {c.adviser_notes && (
                              <p className="text-emerald-700 dark:text-emerald-400 text-[11px] pt-1">
                                💡 {c.adviser_notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FARMER SUPPORT: SOIL & NUTRIENT ADVISORY */}
      {activeTab === 'SOIL' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-teal-600" />
                {t('adviser.tabSoil', 'Farmer Support (Soil & Nutrients)')}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {language === 'te' 
                  ? 'రైతు ఎంపిక (సేంద్రీయ/రసాయన) మరియు నేల రిపోర్టు ఆధారంగా సరైన ఎరువుల సలహాను అందించండి' 
                  : 'Review soil report and provide tailored fertilizer advice based on farmer decision'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoilFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${soilFilterStatus === 'ALL' ? 'bg-teal-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                {language === 'te' ? 'అన్నీ' : 'All'} ({soilReports.length})
              </button>
              <button
                onClick={() => setSoilFilterStatus('PENDING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${soilFilterStatus === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                {language === 'te' ? 'పెండింగ్' : 'Pending'} ({soilReports.filter(s => s.status === 'PENDING').length})
              </button>
              <button
                onClick={() => setSoilFilterStatus('ADVISED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${soilFilterStatus === 'ADVISED' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                {language === 'te' ? 'సూచించినవి' : 'Advised'} ({soilReports.filter(s => s.status === 'ADVISED').length})
              </button>
            </div>
          </div>

          {filteredSoilReports.length === 0 ? (
            <div className="p-12 text-center">
              <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                {language === 'te' ? 'ఈ ఫిల్టర్‌లో ఎటువంటి నేల నివేదికలు లేవు.' : 'No soil test reports found matching this filter.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredSoilReports.map((s) => {
                const isAdvised = s.status === 'ADVISED';
                const isOrganic = s.fertilizer_preference === 'ORGANIC';
                const isChemical = s.fertilizer_preference === 'CHEMICAL';

                return (
                  <div key={s.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <div className="flex flex-col lg:flex-row gap-5 items-start">
                      {/* Soil Report Photo */}
                      <div className="w-full lg:w-44 h-36 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 border border-gray-200 dark:border-gray-600 relative group">
                        {s.soil_report_image ? (
                          <>
                            <img 
                              src={getImageUrl(s.soil_report_image)} 
                              alt="Soil test report photo" 
                              onError={(e) => { (e.target as HTMLImageElement).src = '/uploads/1789360871472.jpeg'; }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <button
                              onClick={() => setViewingImage(getImageUrl(s.soil_report_image!))}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                              title="View full report photo"
                            >
                              <Maximize2 className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs">
                            <Image className="w-8 h-8 mb-1 opacity-50" />
                            <span>No report photo</span>
                          </div>
                        )}
                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isAdvised ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                          {isAdvised ? 'Advised' : 'Pending'}
                        </span>
                      </div>

                      {/* Soil Report Case Details */}
                      <div className="space-y-3 flex-grow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {translateVeg(s.crop_name)}
                              </h3>
                              <span className="text-xs bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded font-semibold">
                                {s.land_area}
                              </span>
                              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                                {s.soil_type || 'General Soil'}
                              </span>

                              {/* Farmer Preference Badge */}
                              {isOrganic && (
                                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border border-green-200">
                                  <Leaf className="w-3.5 h-3.5 text-green-600" />
                                  {language === 'te' ? 'రైతు ఎంపిక: సేంద్రీయ ఎరువులు' : "Farmer Choice: Organic"}
                                </span>
                              )}
                              {isChemical && (
                                <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border border-purple-200">
                                  <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
                                  {language === 'te' ? 'రైతు ఎంపిక: రసాయన ఎరువులు' : "Farmer Choice: Chemical"}
                                </span>
                              )}
                              {s.fertilizer_preference === 'MIXED' && (
                                <span className="text-xs bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 px-2.5 py-0.5 rounded-full font-bold border border-teal-200">
                                  {language === 'te' ? 'రైతు ఎంపిక: సమగ్ర (సేంద్రీయ & రసాయన)' : "Farmer Choice: Integrated"}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                {s.farmer_name} ({s.farmer_mobile})
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                {[s.farmer_village, s.farmer_district, s.farmer_state].filter(Boolean).join(', ') || 'Local Farm'}
                              </span>
                              <span>• {new Date(s.created_at).toLocaleString()}</span>
                            </div>
                          </div>

                          {!user?.is_verified ? (
                            <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-xl text-xs font-semibold">
                              {language === 'te' ? 'ఆమోదం అవసరం' : 'Approval Required'}
                            </span>
                          ) : (
                            <button
                              onClick={() => openSoilModal(s)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0 ${isAdvised ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}
                            >
                              <FlaskConical className="w-3.5 h-3.5" />
                              {isAdvised ? (language === 'te' ? 'సలహా సవరించండి' : 'Update Advice') : (language === 'te' ? 'ఎరువుల సలహా ఇవ్వండి' : 'Provide Fertilizer Advice')}
                            </button>
                          )}
                        </div>

                        {/* Farmer Notes */}
                        {s.farmer_notes && (
                          <div className="text-xs bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                            <span className="font-semibold text-gray-600 dark:text-gray-300 block mb-0.5 uppercase tracking-wider text-[10px]">
                              {t('support.notes', 'Farmer Notes')}:
                            </span>
                            <p className="text-gray-800 dark:text-gray-200">
                              {s.farmer_notes}
                            </p>
                          </div>
                        )}

                        {/* Prescribed Guidance Preview if Advised */}
                        {isAdvised && (
                          <div className="text-xs bg-teal-50 dark:bg-teal-950/20 p-3.5 rounded-xl border border-teal-200 dark:border-teal-800/40 space-y-2 text-teal-950 dark:text-teal-200">
                            <div className="flex items-center justify-between text-teal-800 dark:text-teal-300 font-bold uppercase text-[10px]">
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                {t('support.fertilizerAdvice', 'Prescribed Fertilizer Advice')}
                              </span>
                              <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300">
                                {isOrganic ? '🌿 Organic Advice' : '🧪 Chemical Advice'}
                              </span>
                            </div>

                            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed font-medium">
                              {s.fertilizer_advice || s.general_prescription}
                            </p>

                            {s.adviser_notes && (
                              <p className="text-teal-700 dark:text-teal-400 text-[11px] pt-1 border-t border-teal-100 dark:border-teal-900/60 italic">
                                💡 {s.adviser_notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Disease Advisory Modal */}
      {activeCase && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-xl w-full shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-800 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {language === 'te' ? 'వైద్య సలహా & మందుల సూచన' : 'Prescribe Agronomic Treatment'}
                </h3>
                <p className="text-purple-200 text-xs">
                  {translateVeg(activeCase.crop_name)} • {activeCase.farmer_name}
                </p>
              </div>
              <button 
                onClick={() => setActiveCase(null)} 
                className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdviseSubmit} className="p-6 space-y-4 overflow-y-auto flex-grow">
              <div className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 items-start">
                {activeCase.image_url ? (
                  <img 
                    src={getImageUrl(activeCase.image_url)} 
                    alt="Affected crop preview" 
                    onError={(e) => { (e.target as HTMLImageElement).src = '/uploads/1789360871472.jpeg'; }}
                    className="w-24 h-24 object-cover rounded-lg shrink-0 border border-gray-300"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center shrink-0 text-gray-400">
                    <Image className="w-8 h-8" />
                  </div>
                )}
                <div className="text-xs space-y-1 overflow-hidden">
                  <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[10px] block">
                    {t('disease.symptoms', 'Reported Symptoms')}:
                  </span>
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                    {activeCase.symptoms}
                  </p>
                  <span className="text-[11px] text-gray-400 block pt-0.5">
                    📍 {activeCase.farmer_location || 'Local Farm'} • {activeCase.affected_area || 'Not specified'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {t('adviser.diseaseInput', 'Diagnosed Disease / Pest Name')} *
                </label>
                <input
                  type="text"
                  required
                  value={diseaseName}
                  onChange={(e) => setDiseaseName(e.target.value)}
                  placeholder="e.g. Early Blight (Alternaria solani) / Aphid Infestation"
                  className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {t('disease.prescription', 'Prescription & Treatment Plan')} *
                </label>
                <textarea
                  rows={4}
                  required
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  placeholder="e.g. Spray Mancozeb 75% WP @ 2.5g per litre of water or Neem oil 1500 ppm @ 3ml/L. Apply early morning or late evening. Repeat after 7-10 days if symptoms persist."
                  className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {t('adviser.notesInput', 'Preventive Guidance & Farm Notes')}
                </label>
                <textarea
                  rows={2}
                  value={adviserNotes}
                  onChange={(e) => setAdviserNotes(e.target.value)}
                  placeholder="e.g. Avoid overhead irrigation to minimize leaf wetness. Remove and destroy infected bottom foliage."
                  className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setActiveCase(null)}
                  className="px-4 py-2 border rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t('adviser.submitRemedy', 'Send Advice to Farmer')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flexible Fertilizer Advice Modal (Based on Farmer Decision) */}
      {activeSoilReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-cyan-800 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-emerald-200" />
                  <h3 className="text-lg font-bold">
                    {language === 'te' ? 'రైతుకు ఎరువుల సలహా ఇవ్వండి' : 'Provide Fertilizer Advisory'}
                  </h3>
                </div>
                <p className="text-emerald-100 text-xs mt-0.5">
                  {translateVeg(activeSoilReport.crop_name)} • {activeSoilReport.land_area} • Farmer: {activeSoilReport.farmer_name}
                </p>
              </div>
              <button 
                onClick={() => setActiveSoilReport(null)} 
                className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSoilAdviseSubmit} className="p-6 space-y-4 overflow-y-auto flex-grow text-sm">
              {/* Report Thumbnail and Context */}
              <div className="flex gap-4 p-3 bg-teal-50/60 dark:bg-gray-700/50 rounded-2xl border border-teal-200 dark:border-gray-600 items-start">
                {activeSoilReport.soil_report_image ? (
                  <div 
                    onClick={() => setViewingImage(getImageUrl(activeSoilReport.soil_report_image!))}
                    className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-300 relative cursor-pointer group"
                  >
                    <img 
                      src={getImageUrl(activeSoilReport.soil_report_image)} 
                      alt="Soil report preview" 
                      onError={(e) => { (e.target as HTMLImageElement).src = '/uploads/1789360871472.jpeg'; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-gray-200 flex items-center justify-center shrink-0 text-gray-400">
                    <FlaskConical className="w-8 h-8 opacity-50" />
                  </div>
                )}
                <div className="text-xs space-y-1 overflow-hidden flex-grow">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-900 dark:text-white uppercase tracking-wider text-[10px]">
                      {t('adviser.soilReportPhoto', 'Soil Test & Farm Profile')}:
                    </span>
                    <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300">
                      {activeSoilReport.soil_type || 'General Soil'}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {activeSoilReport.farmer_notes || (language === 'te' ? 'రైతు అదనపు వివరాలు నమోదు చేయలేదు' : 'No previous history provided by farmer.')}
                  </p>
                  <span className="text-[11px] text-gray-500 block pt-1">
                    📞 {activeSoilReport.farmer_mobile} • 📍 {[activeSoilReport.farmer_village, activeSoilReport.farmer_district].filter(Boolean).join(', ') || 'Local Farm'}
                  </span>
                </div>
              </div>

              {/* FARMER'S DECISION BANNER */}
              <div className={`p-3.5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                activeSoilReport.fertilizer_preference === 'ORGANIC'
                  ? 'bg-green-50 border-green-300 text-green-950 dark:bg-green-950/30 dark:border-green-800 dark:text-green-200'
                  : 'bg-purple-50 border-purple-300 text-purple-950 dark:bg-purple-950/30 dark:border-purple-800 dark:text-purple-200'
              }`}>
                <div className="flex items-center gap-2.5">
                  {activeSoilReport.fertilizer_preference === 'ORGANIC' ? (
                    <div className="w-8 h-8 rounded-full bg-green-200/80 dark:bg-green-900 flex items-center justify-center text-green-700 dark:text-green-300 shrink-0">
                      <Leaf className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-200/80 dark:bg-purple-900 flex items-center justify-center text-purple-700 dark:text-purple-300 shrink-0">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                      {t('adviser.farmerDecision', "Farmer's Choice")}
                    </span>
                    <span className="text-sm font-extrabold">
                      {activeSoilReport.fertilizer_preference === 'ORGANIC'
                        ? (language === 'te' ? '🌿 సేంద్రీయ ఎరువులు (Organic Fertilizer)' : '🌿 Organic Fertilizer')
                        : (activeSoilReport.fertilizer_preference === 'CHEMICAL'
                            ? (language === 'te' ? '🧪 రసాయన ఎరువులు (Chemical Fertilizer)' : '🧪 Chemical Fertilizer')
                            : (language === 'te' ? '🌾 సమగ్ర ఎరువులు (Integrated Organic + Chemical)' : '🌾 Integrated (Organic + Chemical)'))}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] bg-white/90 dark:bg-gray-800 px-3 py-1 rounded-lg font-semibold border border-black/5 self-start sm:self-center">
                  {language === 'te' ? 'ఈ ఎంపిక ఆధారంగా సలహా ఇవ్వండి' : 'Prescribe based on this choice'}
                </span>
              </div>

              {/* Free-form typed fertilizer advice */}
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1 flex items-center justify-between">
                  <span>{t('adviser.fertilizerAdviceInput', 'Prescribe Fertilizer Advice (Based on Farmer Choice)')} *</span>
                  <span className="text-[11px] font-medium text-teal-700 dark:text-teal-400">
                    {activeSoilReport.fertilizer_preference === 'ORGANIC' ? '🌿 Organic Advice' : '🧪 Chemical Advice'}
                  </span>
                </label>
                <textarea
                  rows={6}
                  required
                  value={fertilizerAdvice}
                  onChange={(e) => setFertilizerAdvice(e.target.value)}
                  placeholder={
                    activeSoilReport.fertilizer_preference === 'ORGANIC'
                      ? (language === 'te'
                          ? 'సేంద్రీయ ఎరువుల మోతాదు మరియు సమయం రాయండి (ఉదా: 1. ఎకరాకు 4-5 టన్నుల పశువుల ఎరువు నేల తయారీలో వేయండి. 2. నాటిన 30 రోజులకు 100 కేజీల వేపపిండి, 500 కేజీల వర్మీకంపోస్ట్ వేయండి. 3. పూత సమయంలో పంచగవ్య 3% పిచికారీ చేయండి...)'
                          : 'Type organic fertilizer schedule and dosages (e.g. 1. Basal: Apply 4-5 tonnes well-decomposed FYM per acre. 2. 30 DAT: Top-dress 100 kg Neem cake + 500 kg Vermicompost. 3. Spray Panchagavya 3% or Jeevamrutham at flowering to boost fruit set...)')
                      : (language === 'te'
                          ? 'రసాయన ఎరువుల మోతాదు మరియు సమయం రాయండి (ఉదా: 1. నేల తయారీలో 50 కేజీల డీఏపీ + 25 కేజీల ఎంఓపీ వేయండి. 2. నాటిన 30 రోజులకు 35 కేజీల యూరియా వేయండి. 3. పూత దశలో మిగిలిన 35 కేజీల యూరియా + 25 కేజీల ఎంఓపీ వేయండి...)'
                          : 'Type chemical fertilizer schedule and dosages (e.g. 1. Basal: 50 kg DAP + 25 kg MOP per acre. 2. 30 days top-dressing: 35 kg Urea. 3. Flowering & fruit formation: 35 kg Urea + 25 kg MOP. Avoid early nitrogen over-usage...)')
                  }
                  className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs leading-relaxed"
                />
              </div>

              {/* Adviser Agronomic Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {t('adviser.notesInput', 'Adviser Agronomic Notes & Caution')}
                </label>
                <textarea
                  rows={2}
                  value={soilNotes}
                  onChange={(e) => setSoilNotes(e.target.value)}
                  placeholder="e.g. Maintain proper soil moisture during fertilizer application. Do not mix chemical pesticides with bio-fertilizers."
                  className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setActiveSoilReport(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submittingSoil}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingSoil ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {language === 'te' ? 'రైతుకు ఎరువుల సలహా పంపండి' : 'Send Fertilizer Advice to Farmer'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {viewingImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setViewingImage(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={viewingImage}
              alt="Full soil report view"
              onError={(e) => { (e.target as HTMLImageElement).src = '/uploads/1789360871472.jpeg'; }}
              className="max-h-[85vh] w-auto object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
