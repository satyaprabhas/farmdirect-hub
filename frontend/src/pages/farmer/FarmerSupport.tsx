import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Trash2, 
  FileText, 
  Maximize2, 
  X, 
  Sprout, 
  Layers, 
  Leaf, 
  ShieldCheck, 
  Calendar, 
  ChevronRight,
  Send,
  Droplets,
  Check,
  Camera
} from 'lucide-react';
import api, { getImageUrl } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CameraCaptureModal from '../../components/common/CameraCaptureModal';

interface SoilConsultationCase {
  id: number;
  farmer_id: number;
  crop_name: string;
  land_area: string;
  soil_type?: string;
  fertilizer_preference?: 'ORGANIC' | 'CHEMICAL' | 'MIXED';
  soil_report_image?: string;
  farmer_notes?: string;
  status: 'PENDING' | 'ADVISED';
  adviser_id?: number;
  adviser_name?: string;
  adviser_mobile?: string;
  adviser_specialization?: string;
  adviser_qualification?: string;
  fertilizer_advice?: string;
  nitrogen_advice?: string;
  phosphorus_advice?: string;
  potassium_advice?: string;
  micronutrients_advice?: string;
  organic_advice?: string;
  general_prescription?: string;
  adviser_notes?: string;
  created_at: string;
  advised_at?: string;
}

const COMMON_CROPS = [
  'Tomatoes',
  'Chillies',
  'Cotton',
  'Maize',
  'Groundnut',
  'Ladies Finger',
  'Brinjal',
  'Onions',
  'Potatoes',
  'Cabbage',
  'Cauliflower',
  'Sugarcane',
  'Cucumbers',
  'Bottle Gourd'
];

const SOIL_TYPES = [
  { value: 'Red Sandy Loam', en: 'Red Sandy Loam', te: 'ఎర్ర నేలలు (Red Soil)' },
  { value: 'Black Clay Loam', en: 'Black Clay Loam (Regur)', te: 'నల్ల రేగడి నేలలు (Black Cotton Soil)' },
  { value: 'Alluvial Soil', en: 'Alluvial Soil', te: 'ఒండ్రు నేలలు (Alluvial Soil)' },
  { value: 'Laterite Soil', en: 'Laterite Soil', te: 'లాటరైట్ నేలలు (Laterite Soil)' },
  { value: 'Sandy Loam', en: 'Sandy Loam', te: 'ఇసుక నేలలు (Sandy Loam)' },
  { value: 'Clayey Soil', en: 'Heavy Clay Soil', te: 'బంకమట్టి నేలలు (Clay Soil)' },
  { value: 'Other / Mixed', en: 'Other / Mixed', te: 'ఇతర నేల రకం (Other)' }
];

export default function FarmerSupport() {
  const { t, translateVeg, language } = useLanguage();
  const { showToast } = useToast();

  const [reports, setReports] = useState<SoilConsultationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [cropName, setCropName] = useState('Tomatoes');
  const [isCustomCrop, setIsCustomCrop] = useState(false);
  const [customCropName, setCustomCropName] = useState('');
  const [landArea, setLandArea] = useState('2 Acres');
  const [soilType, setSoilType] = useState('Red Sandy Loam');
  const [fertilizerPreference, setFertilizerPreference] = useState<'ORGANIC' | 'CHEMICAL' | 'MIXED'>('ORGANIC');
  const [farmerNotes, setFarmerNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Modal for previewing photo
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      const res = await api.get('/farmer/soil-reports');
      setReports(res.data || []);
    } catch (err) {
      console.error('Failed to load soil reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const handleDeleteCase = async (id: number) => {
    if (!window.confirm(language === 'te' ? 'ఈ నేల పరీక్ష అభ్యర్థనను ఖచ్చితంగా తొలగించాలనుకుంటున్నారా?' : 'Are you sure you want to delete this soil report request?')) {
      return;
    }
    try {
      await api.delete(`/farmer/soil-reports/${id}`);
      showToast(language === 'te' ? 'అభ్యర్థన విజయవంతంగా తొలగించబడింది' : 'Report request deleted successfully', 'success');
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to delete report', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCrop = isCustomCrop ? customCropName.trim() : cropName;
    if (!finalCrop) {
      showToast(language === 'te' ? 'దయచేసి సాగు చేయబోయే పంట పేరును నమోదు చేయండి' : 'Please select or enter the crop name', 'error');
      return;
    }
    if (!landArea.trim()) {
      showToast(language === 'te' ? 'దయచేసి సాగు విస్తీర్ణాన్ని నమోదు చేయండి' : 'Please provide cultivation land area', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('crop_name', finalCrop);
      formData.append('land_area', landArea);
      formData.append('soil_type', soilType);
      formData.append('fertilizer_preference', fertilizerPreference);
      formData.append('farmer_notes', farmerNotes);
      if (selectedFile) {
        formData.append('soil_report_image', selectedFile);
      }

      await api.post('/farmer/soil-reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast(
        language === 'te' 
          ? 'నేల పరీక్ష నివేదిక మరియు ఎరువుల ఎంపిక వ్యవసాయ నిపుణుడికి విజయవంతంగా పంపబడ్డాయి!' 
          : 'Soil report submitted successfully! An agricultural adviser will analyze and recommend fertilizer advice tailored to your choice.',
        'success'
      );

      // Reset form
      setFarmerNotes('');
      handleClearFile();
      if (isCustomCrop) {
        setIsCustomCrop(false);
        setCustomCropName('');
      }
      await fetchReports();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to submit soil report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <FlaskConical className="w-4 h-4 text-emerald-200" />
            {language === 'te' ? 'రైతు మద్దతు: నేల & ఎరువుల సలహా' : 'Farmer Support: Soil Health & Fertilizer Advisory'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('support.title', 'Farmer Support: Soil Health & Nutrient Advisory')}
          </h1>
          <p className="mt-2 text-emerald-100 text-sm sm:text-base leading-relaxed">
            {language === 'te'
              ? 'మీరు సాగు చేయదలచిన పంట, విస్తీర్ణం మరియు మీరు వాడదలచిన ఎరువుల రకాన్ని (సేంద్రీయ / రసాయన) ఎంచుకోండి. వ్యవసాయ నిపుణులు మీ నేల రిపోర్టును పరిశీలించి మీరు ఎంచుకున్న పద్ధతికి తగిన ఎరువుల మోతాదును సూచిస్తారు.'
              : 'Choose the crop to cultivate, land area, and your preferred fertilizer type (Organic or Chemical). Certified agricultural advisers will analyze your soil report and provide custom fertilizer advice directly based on your choice.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              <Leaf className="w-4 h-4 text-emerald-300" />
              <span>{language === 'te' ? 'సేంద్రీయ / రసాయన ఎంపిక' : 'Organic or Chemical Choice'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              <ShieldCheck className="w-4 h-4 text-cyan-300" />
              <span>{language === 'te' ? 'ఎరువుల వ్యర్థాలు నివారణ' : 'Prevent Chemical Over-Usage'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              <Sprout className="w-4 h-4 text-teal-300" />
              <span>{language === 'te' ? 'దిగుబడి పెంపు' : 'Maximize Crop Yield'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Submit Soil Report Form */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6">
          <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-emerald-600" />
              {t('support.submitTitle', 'Submit Soil Report for Nutrient Prescription')}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {language === 'te'
                ? 'పంట, నేల రిపోర్టు మరియు మీ ఎరువుల ప్రాధాన్యతను అందించండి'
                : 'Select crop, upload soil test, and choose fertilizer preference'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Target Crop Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  {t('disease.cropName', 'Crop to Harvest / Cultivate')} *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCrop(!isCustomCrop)}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
                >
                  {isCustomCrop 
                    ? (language === 'te' ? 'జాబితా నుండి ఎంచుకోండి' : 'Choose from list')
                    : (language === 'te' ? 'ఇతర పంటను నమోదు చేయండి' : 'Type custom crop')}
                </button>
              </div>

              {!isCustomCrop ? (
                <select
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {COMMON_CROPS.map((c) => (
                    <option key={c} value={c}>
                      {translateVeg(c)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={customCropName}
                  onChange={(e) => setCustomCropName(e.target.value)}
                  placeholder={language === 'te' ? 'ఉదా: పత్తి, మొక్కజొన్న, మిరప, పసుపు...' : 'e.g. Cotton, Maize, Sunflower, Turmeric...'}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              )}
            </div>

            {/* Cultivation Land Area */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                {t('support.landArea', 'Cultivation Land Area')} *
              </label>
              <input
                type="text"
                value={landArea}
                onChange={(e) => setLandArea(e.target.value)}
                placeholder={t('support.landAreaPlaceholder', 'e.g., 2.5 Acres, 1 Hectare, 50 Cents')}
                required
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['0.5 Acre', '1 Acre', '2 Acres', '3 Acres', '5 Acres', '10 Acres'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setLandArea(preset)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-gray-600 dark:text-gray-300 hover:text-emerald-700 border border-gray-200 dark:border-gray-600 transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* FERTILIZER PREFERENCE SELECTION (Organic vs Chemical) */}
            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 space-y-2">
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                {t('support.fertilizerPref', 'Fertilizer Preference')} *
              </label>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                {language === 'te'
                  ? 'మీరు మీ పంటకు ఏ రకమైన ఎరువుల సలహా పొందాలనుకుంటున్నారో ఎంచుకోండి:'
                  : 'Choose the fertilizer type you want the agricultural adviser to prescribe:'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* Organic Option */}
                <div
                  onClick={() => setFertilizerPreference('ORGANIC')}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-2.5 ${
                    fertilizerPreference === 'ORGANIC'
                      ? 'border-emerald-600 bg-emerald-100/70 dark:bg-emerald-900/40 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    fertilizerPreference === 'ORGANIC' ? 'bg-emerald-600 text-white' : 'border border-gray-300'
                  }`}>
                    {fertilizerPreference === 'ORGANIC' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1">
                      <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                      {t('support.organicFertilizer', 'Organic Fertilizer')}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block mt-0.5">
                      {language === 'te' ? 'సేంద్రీయ ఎరువులు (FYM, వేపపిండి, వర్మీకంపోస్ట్)' : 'Compost, Neem cake, Vermicompost, Bio-fertilizers'}
                    </span>
                  </div>
                </div>

                {/* Chemical Option */}
                <div
                  onClick={() => setFertilizerPreference('CHEMICAL')}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-2.5 ${
                    fertilizerPreference === 'CHEMICAL'
                      ? 'border-purple-600 bg-purple-100/70 dark:bg-purple-900/40 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    fertilizerPreference === 'CHEMICAL' ? 'bg-purple-600 text-white' : 'border border-gray-300'
                  }`}>
                    {fertilizerPreference === 'CHEMICAL' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1">
                      <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
                      {t('support.chemicalFertilizer', 'Chemical Fertilizer')}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block mt-0.5">
                      {language === 'te' ? 'రసాయన ఎరువులు (యూరియా, డీఏపీ, ఎంఓపీ, ఎస్‌ఎస్‌పీ)' : 'Urea, DAP, MOP, SSP, balanced NPK'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Integrated Option */}
              <div
                onClick={() => setFertilizerPreference('MIXED')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                  fertilizerPreference === 'MIXED'
                    ? 'border-teal-600 bg-teal-100/70 dark:bg-teal-900/40 font-semibold text-teal-950 dark:text-teal-200'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-teal-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  fertilizerPreference === 'MIXED' ? 'bg-teal-600 text-white' : 'border border-gray-300'
                }`}>
                  {fertilizerPreference === 'MIXED' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span className="text-xs">
                  {t('support.bothFertilizer', 'Integrated (Both Organic + Chemical Balanced)')}
                </span>
              </div>
            </div>

            {/* Soil Type Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                {t('support.soilType', 'Soil Type (if known)')}
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {SOIL_TYPES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {language === 'te' ? st.te : st.en}
                  </option>
                ))}
              </select>
            </div>

            {/* Soil Report Photo Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                {t('support.soilPhoto', 'Soil Test Report Photo / Soil Health Card')}
              </label>

              {!previewUrl ? (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Take Photo with Camera Button */}
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="p-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl flex items-center justify-center gap-2 shadow-sm font-semibold text-xs sm:text-sm transition-all cursor-pointer group active:scale-[0.98]"
                    >
                      <Camera className="w-5 h-5 group-hover:scale-110 transition-transform text-white" />
                      <span>{language === 'te' ? 'కెమెరాతో ఫోటో తీయండి' : 'Take Photo with Camera'}</span>
                    </button>

                    {/* Upload from Device Button */}
                    <label className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-2 border-dashed border-emerald-300 dark:border-emerald-700/60 rounded-2xl flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm transition-all cursor-pointer group">
                      <Upload className="w-5 h-5 group-hover:scale-110 transition-transform text-emerald-600 dark:text-emerald-400" />
                      <span>{language === 'te' ? 'డివైస్ నుండి ఎంచుకోండి' : 'Choose from Device'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-gray-500 text-center">
                    {language === 'te' ? 'నేల పరీక్ష పత్రం లేదా కార్డు ఫోటోను స్పష్టంగా తీయండి / అప్‌లోడ్ చేయండి (గరిష్టంగా 10MB)' : 'JPG, PNG, WEBP up to 10MB • Capture clear photo of your Soil Health Card'}
                  </p>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md group">
                  <img
                    src={previewUrl}
                    alt="Soil test report preview"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/uploads/1789360871472.jpeg'; }}
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setViewingImage(previewUrl)}
                      className="p-2 bg-white/90 text-gray-800 rounded-full hover:bg-white cursor-pointer"
                      title="Preview full size"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded">
                    {selectedFile?.name || 'Captured Photo'}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Farmer Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                {t('support.notes', 'Additional Notes / Previous Crop')}
              </label>
              <textarea
                rows={2}
                value={farmerNotes}
                onChange={(e) => setFarmerNotes(e.target.value)}
                placeholder={t('support.notesPlaceholder', 'e.g., Previous crop was cotton, soil pH is 7.2, water source is borewell...')}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>{language === 'te' ? 'పంపుతోంది...' : 'Submitting to Adviser...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t('support.submitBtn', 'Request Fertilizer & Nutrient Advice')}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: History & Prescriptions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                {t('support.myReports', 'My Soil & Nutrient Consultations')}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {reports.length} {language === 'te' ? 'అభ్యర్థనలు నమోదు చేయబడ్డాయి' : 'consultation requests logged'}
              </p>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
              <FlaskConical className="w-12 h-12 text-emerald-300 dark:text-emerald-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">
                {t('support.noReports', 'No soil reports submitted yet.')}
              </h3>
              <p className="text-gray-500 text-xs max-w-sm mx-auto mt-1 leading-relaxed">
                {language === 'te'
                  ? 'మీ నేల పరీక్ష ఫోటోను అప్‌లోడ్ చేసి, మీ ఎరువుల ప్రాధాన్యతను (సేంద్రీయ/రసాయన) ఎంచుకొని నిపుణుల సలహా పొందండి.'
                  : 'Submit your soil test report, choose Organic or Chemical fertilizer preference, and get tailored advice from agricultural advisers.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((r) => {
                const isAdvised = r.status === 'ADVISED';
                const isOrganic = r.fertilizer_preference === 'ORGANIC';
                const isChemical = r.fertilizer_preference === 'CHEMICAL';

                return (
                  <div
                    key={r.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md"
                  >
                    {/* Header */}
                    <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                          <Sprout className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                              {translateVeg(r.crop_name)}
                            </h3>
                            <span className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-semibold">
                              {r.land_area}
                            </span>

                            {/* Fertilizer Preference Badge */}
                            {isOrganic && (
                              <span className="text-[11px] bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-green-200">
                                <Leaf className="w-3 h-3 text-green-600" />
                                {t('support.organicFertilizer', 'Organic')}
                              </span>
                            )}
                            {isChemical && (
                              <span className="text-[11px] bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-purple-200">
                                <FlaskConical className="w-3 h-3 text-purple-600" />
                                {t('support.chemicalFertilizer', 'Chemical')}
                              </span>
                            )}
                            {r.fertilizer_preference === 'MIXED' && (
                              <span className="text-[11px] bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 px-2 py-0.5 rounded-full font-bold border border-teal-200">
                                {t('support.bothFertilizer', 'Integrated')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span>{r.soil_type || 'General Soil'}</span>
                            <span>•</span>
                            <span>{new Date(r.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            isAdvised
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                          }`}
                        >
                          {isAdvised ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {t('support.advised', 'Advice Prescribed')}
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              {t('support.pending', 'Under Adviser Analysis')}
                            </>
                          )}
                        </span>

                        <button
                          onClick={() => handleDeleteCase(r.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          title="Delete request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 sm:p-5 space-y-4">
                      {/* Photo and Farmer Notes */}
                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                        {r.soil_report_image && (
                          <div
                            onClick={() => setViewingImage(getImageUrl(r.soil_report_image!))}
                            className="relative w-full sm:w-32 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200 cursor-pointer group"
                          >
                            <img
                              src={getImageUrl(r.soil_report_image)}
                              alt="Soil report"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/uploads/1789360871472.jpeg'; }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Maximize2 className="w-4 h-4" />
                            </div>
                            <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.2 rounded">
                              {language === 'te' ? 'రిపోర్టు ఫోటో' : 'Report'}
                            </span>
                          </div>
                        )}

                        <div className="text-xs text-gray-600 dark:text-gray-300 flex-grow space-y-1">
                          {r.farmer_notes && (
                            <p className="bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                              <span className="font-semibold text-gray-700 dark:text-gray-200 uppercase text-[10px] block mb-0.5">
                                {t('support.notes', 'Farmer Notes')}:
                              </span>
                              {r.farmer_notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Prescribed Fertilizer Advice Section (When status is ADVISED) */}
                      {isAdvised && (
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 dark:from-emerald-950/30 dark:to-teal-950/20 rounded-2xl p-4 sm:p-5 border border-emerald-200 dark:border-emerald-800/40 space-y-3.5">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/70 dark:border-emerald-800/40 pb-2.5">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-emerald-600" />
                              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wide">
                                {t('support.fertilizerAdvice', 'Prescribed Fertilizer Advice')}
                              </span>
                            </div>
                            {r.adviser_name && (
                              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                                {t('disease.advisedBy', 'Advised by')}: <strong>{r.adviser_name}</strong> {r.adviser_specialization && `(${r.adviser_specialization})`}
                              </span>
                            )}
                          </div>

                          {/* Adviser Typed Fertilizer Advice */}
                          <div className="bg-white dark:bg-gray-800/90 p-4 rounded-xl border border-teal-200 dark:border-teal-900/40 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5 uppercase text-[11px]">
                                {isOrganic ? (
                                  <>
                                    <Leaf className="w-4 h-4 text-emerald-600" />
                                    {language === 'te' ? 'సేంద్రీయ ఎరువుల ప్రణాళిక & మోతాదు' : 'Prescribed Organic Fertilizer Schedule'}
                                  </>
                                ) : (
                                  <>
                                    <FlaskConical className="w-4 h-4 text-purple-600" />
                                    {language === 'te' ? 'రసాయన ఎరువుల ప్రణాళిక & మోతాదు' : 'Prescribed Chemical Fertilizer Schedule'}
                                  </>
                                )}
                              </span>
                              <span className="text-[11px] px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-semibold">
                                {language === 'te' ? 'రైతు ఎంపిక ఆధారంగా' : 'Tailored to Farmer Choice'}
                              </span>
                            </div>

                            <p className="text-xs text-gray-800 dark:text-gray-200 font-medium whitespace-pre-line leading-relaxed">
                              {r.fertilizer_advice || r.general_prescription || (language === 'te' ? 'సలహా అందించబడింది.' : 'Fertilizer advice provided.')}
                            </p>
                          </div>

                          {/* Adviser Agronomic Notes */}
                          {r.adviser_notes && (
                            <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs space-y-1">
                              <span className="font-bold text-gray-700 dark:text-gray-300 uppercase text-[10px] block">
                                {language === 'te' ? 'జాగ్రత్తలు & వ్యవసాయ సూచనలు' : 'Adviser Guidance & Precautions'}:
                              </span>
                              <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic">
                                💡 {r.adviser_notes}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

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
              alt="Full soil report"
              onError={(e) => { (e.target as HTMLImageElement).src = '/uploads/1789360871472.jpeg'; }}
              className="max-h-[85vh] w-auto object-contain mx-auto"
            />
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file, dataUrl) => {
          setSelectedFile(file);
          setPreviewUrl(dataUrl);
        }}
        title={language === 'te' ? 'నేల పరీక్ష పత్రం ఫోటో తీయండి' : 'Capture Soil Health Card / Report'}
      />
    </div>
  );
}
