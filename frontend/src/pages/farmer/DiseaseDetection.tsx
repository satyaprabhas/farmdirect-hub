import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle2, Clock, UserCheck, Stethoscope, Image, Send, ShieldAlert, Sparkles } from 'lucide-react';
import api, { getImageUrl } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface ConsultationCase {
  id: number;
  crop_name: string;
  image_url: string;
  symptoms: string;
  affected_area: string;
  status: 'PENDING' | 'RESOLVED' | 'ANALYZED';
  adviser_name?: string;
  adviser_specialization?: string;
  adviser_qualification?: string;
  disease_name?: string;
  prescription?: string;
  adviser_notes?: string;
  created_at: string;
  advised_at?: string;
}

export default function DiseaseDetection() {
  const { t, translateVeg, language } = useLanguage();
  const { showToast } = useToast();

  const [cases, setCases] = useState<ConsultationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [cropName, setCropName] = useState('Tomatoes');
  const [symptoms, setSymptoms] = useState('');
  const [affectedArea, setAffectedArea] = useState('0.5 acre');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchCases = async () => {
    try {
      const res = await api.get('/farmer/consultations');
      setCases(res.data || []);
    } catch (err) {
      console.error('Failed to load disease consultations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName || !symptoms) {
      showToast(language === 'te' ? 'దయచేసి పంట పేరు మరియు లక్షణాలను నమోదు చేయండి' : 'Please provide crop name and observed symptoms', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('crop_name', cropName);
      formData.append('symptoms', symptoms);
      formData.append('affected_area', affectedArea);
      if (selectedFile) {
        formData.append('crop_image', selectedFile);
      }

      await api.post('/farmer/consultations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast(language === 'te' ? 'పంట ఫోటో మరియు లక్షణాలు సలహాదారునికి విజయవంతంగా పంపబడ్డాయి!' : 'Crop consultation submitted to agricultural adviser successfully!', 'success');
      
      // Reset form
      setSymptoms('');
      setSelectedFile(null);
      setPreviewUrl(null);
      await fetchCases();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to submit consultation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-700 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Stethoscope className="w-4 h-4 text-rose-200" />
            {language === 'te' ? 'నిపుణుల వ్యవసాయ సలహా సేవ' : 'Certified Agronomic Health Service'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('disease.title', 'Crop Disease Detection & Expert Consultation')}
          </h1>
          <p className="text-rose-100 text-sm sm:text-base mt-2 leading-relaxed">
            {t('disease.subtitle', 'Upload photos of diseased crops to receive verified remedies from certified agricultural advisers.')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-rose-600" />
            {t('disease.uploadTitle', 'Submit Affected Crop for Diagnosis')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('disease.cropName', 'Crop Name')} *
              </label>
              <select
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {['Tomatoes', 'Ladies Finger', 'Brinjal', 'Chillies', 'Cabbage', 'Cauliflower', 'Carrot', 'Potatoes', 'Onions', 'Cucumbers', 'Beans', 'Bottle Gourd'].map(v => (
                  <option key={v} value={v}>{translateVeg(v)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('disease.affectedArea', 'Affected Area / Acreage')}
              </label>
              <input
                type="text"
                value={affectedArea}
                onChange={(e) => setAffectedArea(e.target.value)}
                placeholder="e.g., 0.5 acre, 10 gunthas, scattered plants"
                className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('disease.symptoms', 'Observed Symptoms')} *
              </label>
              <textarea
                rows={3}
                required
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder={t('disease.symptomsPlaceholder', 'e.g. Yellow spots on leaves, wilting stems, curling, pest spots...')}
                className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('disease.cropPhoto', 'Crop Photo (Clear close-up)')}
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center hover:border-rose-400 transition-colors">
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Crop preview"
                      className="w-full h-40 object-cover rounded-lg mb-2"
                    />
                    <button
                      type="button"
                      onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                      className="text-xs text-rose-600 hover:underline font-medium"
                    >
                      {language === 'te' ? 'మరొక ఫోటో ఎంచుకోండి' : 'Change photo'}
                    </button>
                  </div>
                ) : (
                  <div>
                    <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <label className="cursor-pointer text-xs font-semibold text-rose-600 hover:text-rose-500">
                      <span>{language === 'te' ? 'ఫోటోను ఎంచుకోండి / కెమెరా ద్వారా తీయండి' : 'Select photo / Take photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t('disease.submitConsultation', 'Send to Adviser for Remedy')}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Consultations List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              {t('disease.myCases', 'My Disease Consultations')}
            </h2>
            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full font-medium">
              {cases.length} {language === 'te' ? 'కేసులు' : 'cases'}
            </span>
          </div>

          {cases.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-700">
              <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                {language === 'te' ? 'ఇంకా ఎటువంటి తెగులు సంప్రదింపులు నమోదు కాలేదు.' : 'No crop disease consultations submitted yet.'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {language === 'te' ? 'మీ పంటలో ఏవైనా తెగుళ్లు లేదా సమస్యలు ఉంటే ఎడమవైపు ఫారమ్ ద్వారా ఫోటో పంపండి.' : 'Whenever your crop experiences pests or symptoms, submit photo for quick remedies.'}
              </p>
            </div>
          ) : (
            cases.map((c) => {
              const isResolved = c.status === 'RESOLVED' || c.status === 'ANALYZED';
              return (
                <div
                  key={c.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {translateVeg(c.crop_name)}
                      </span>
                      <span className="text-xs text-gray-400">• {c.affected_area}</span>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isResolved ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                      {isResolved ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          {t('disease.advised', 'Prescription Provided')}
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          {t('disease.pendingReview', 'Under Adviser Review')}
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    {c.image_url && (
                      <img
                        src={getImageUrl(c.image_url)}
                        alt="Affected Crop"
                        className="w-full sm:w-32 h-28 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shrink-0"
                      />
                    )}
                    <div className="space-y-1 text-xs">
                      <span className="font-semibold text-gray-500 uppercase tracking-wider block">
                        {t('disease.symptoms', 'Symptoms Reported')}
                      </span>
                      <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-750 p-2.5 rounded-lg">
                        {c.symptoms}
                      </p>
                      <span className="text-[11px] text-gray-400 block pt-1">
                        {new Date(c.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Adviser Solution Section */}
                  {isResolved ? (
                    <div className="bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                            {c.adviser_name || 'Agricultural Specialist'}
                          </span>
                          {c.adviser_qualification && (
                            <span className="text-[11px] text-emerald-700 dark:text-emerald-400">({c.adviser_qualification})</span>
                          )}
                        </div>
                        {c.advised_at && (
                          <span className="text-[11px] text-emerald-600">
                            {new Date(c.advised_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="text-xs space-y-1">
                        <span className="font-bold text-emerald-950 dark:text-emerald-100">
                          {t('disease.diagnosis', 'Diagnosed Disease')}: {c.disease_name}
                        </span>
                      </div>

                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900 text-xs space-y-1">
                        <span className="font-semibold text-emerald-800 dark:text-emerald-300 block">
                          💊 {t('disease.prescription', 'Prescription & Treatment')}:
                        </span>
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                          {c.prescription}
                        </p>
                      </div>

                      {c.adviser_notes && (
                        <div className="text-xs text-emerald-800 dark:text-emerald-300">
                          <span className="font-semibold">💡 {t('disease.adviserNotes', 'Adviser Notes')}: </span>
                          <span>{c.adviser_notes}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>{language === 'te' ? 'మీ పంట ఫోటో వ్యవసాయ సలహాదారుల ప్యానెల్‌కు పంపబడింది. త్వరలోనే నిర్ధారణ మరియు మందుల వివరాలు ఇక్కడ కనిపిస్తాయి.' : 'Your crop case has been shared with verified agricultural advisers. Diagnosis and prescription will appear here soon.'}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
