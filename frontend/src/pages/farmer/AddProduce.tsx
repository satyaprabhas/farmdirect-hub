import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, Sprout, MapPin, Camera, ClipboardCheck, ArrowLeft } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import QuantitySelector from '../../components/common/QuantitySelector';
import ImageUploader from '../../components/common/ImageUploader';
import PriceDisplay from '../../components/common/PriceDisplay';

const AddProduce: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [vegetables, setVegetables] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [selectedVeg, setSelectedVeg] = useState<any>(null);
  const [quantity, setQuantity] = useState(10);
  const [unit, setUnit] = useState('kg');
  const [farmName, setFarmName] = useState(user?.farm_name || '');
  const [village, setVillage] = useState(user?.village || '');
  const [district, setDistrict] = useState(user?.district || '');
  const [state, setState] = useState(user?.state || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    const fetchVegetables = async () => {
      try {
        setLoading(true);
        // Fetch active vegetables (using admin endpoint or a generic one)
        const response = await api.get('/farmer/vegetables').catch(() => api.get('/products/vegetables'));
        setVegetables(response.data.data || response.data);
      } catch (error) {
        console.error('Error fetching vegetables:', error);
        // Fallback for UI if API fails
        setVegetables([
          { id: '1', name: 'Tomato', admin_price: 35, unit: 'kg', color: 'bg-red-50 text-red-700 border-red-200' },
          { id: '2', name: 'Onion', admin_price: 25, unit: 'kg', color: 'bg-orange-50 text-orange-700 border-orange-200' },
          { id: '3', name: 'Potato', admin_price: 20, unit: 'kg', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
          { id: '4', name: 'Cabbage', admin_price: 15, unit: 'piece', color: 'bg-green-50 text-green-700 border-green-200' },
          { id: '5', name: 'Carrot', admin_price: 40, unit: 'kg', color: 'bg-orange-50 text-orange-700 border-orange-200' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchVegetables();
  }, []);

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      const produceData = {
        vegetable_id: selectedVeg.id,
        vegetable_name: selectedVeg.name,
        available_quantity: quantity,
        unit,
        farm_name: farmName,
        village,
        district,
        state,
        pincode
      };
      
      // Post basic data
      const response = await api.post('/farmer/produce', produceData);
      const produceId = response.data.id || response.data.data?.id;
      
      // Upload images if any
      if (images.length > 0 && produceId) {
        const formData = new FormData();
        images.forEach(img => {
          formData.append('images', img);
        });
        
        await api.post(`/farmer/produce/${produceId}/images`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      showToast('success', 'Your produce has been listed successfully!');
      navigate('/farmer/produce');
    } catch (error) {
      console.error('Error submitting produce:', error);
      showToast('error', 'Failed to submit produce. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Select Item', icon: Sprout },
    { num: 2, title: 'Add Details', icon: MapPin },
    { num: 3, title: 'Upload Photos', icon: Camera },
    { num: 4, title: 'Review', icon: ClipboardCheck },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div>
        <button onClick={() => navigate('/farmer')} className="flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Add New Produce</h1>
        <p className="text-gray-600 dark:text-gray-300">List your harvest for sale to consumers</p>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-0 rounded-full"></div>
        <div 
          className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 z-0 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>
        
        <div className="flex justify-between relative z-10">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            
            return (
              <div key={step.num} className="flex flex-col items-center gap-2">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                    isActive ? 'bg-green-600 text-white ring-4 ring-green-100 dark:ring-green-900/30' : 
                    isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${
                  isActive || isCompleted ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
        
        {/* Step 1: Select Item */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Select Harvested Crop</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Choose the vegetable you've harvested</p>
            </div>
            
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {vegetables.map(veg => (
                  <div 
                    key={veg.id}
                    onClick={() => setSelectedVeg(veg)}
                    className={`cursor-pointer rounded-xl p-4 border-2 transition-all flex flex-col items-center justify-center text-center gap-2 h-32 ${
                      selectedVeg?.id === veg.id 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md ring-2 ring-green-500/20' 
                        : 'border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner ${veg.color || 'bg-gray-100 text-gray-700'}`}>
                      {veg.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white leading-tight">{veg.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">Your Price: ₹{Math.round((veg.current_price || veg.admin_price) * 0.85)}/{veg.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-700 mt-8">
              <button
                onClick={handleNext}
                disabled={!selectedVeg}
                className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                  selectedVeg 
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Add Details */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Harvest Details</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Tell us about your {selectedVeg?.name} harvest</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white border-b pb-2">Quantity & Pricing</h3>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Your Earning Price</span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      ₹{Math.round((selectedVeg?.current_price || selectedVeg?.admin_price || 0) * 0.85)}/{selectedVeg?.unit}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Includes 15% platform/admin margin.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Available Quantity</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <QuantitySelector 
                        value={quantity} 
                        onChange={setQuantity} 
                        min={1} 
                        max={10000} 
                        step={1}
                      />
                    </div>
                    <select 
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-1/3 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500"
                    >
                      <option value="kg">kg</option>
                      <option value="quintal">Quintal</option>
                      <option value="bunch">Bunch</option>
                      <option value="piece">Piece</option>
                    </select>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                  <div className="flex justify-between items-center">
                    <span className="text-green-800 dark:text-green-300 font-medium">Estimated Total Value</span>
                    <span className="text-xl font-bold text-green-700 dark:text-green-400">
                      <PriceDisplay amount={quantity * (selectedVeg?.admin_price || 0)} />
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white border-b pb-2">Farm Location</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Farm/Place Name</label>
                  <input 
                    type="text" 
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Village/City</label>
                    <input 
                      type="text" 
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
                    <input 
                      type="text" 
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                    <input 
                      type="text" 
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode</label>
                    <input 
                      type="text" 
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-6 border-t border-gray-100 dark:border-gray-700 mt-8">
              <button
                onClick={handleBack}
                className="px-6 py-2.5 rounded-lg font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!quantity || !farmName || !village || !district || !state || !pincode}
                className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                  quantity && farmName && village && district && state && pincode
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Upload Photos */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Upload Photos</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Add clear photos of your {selectedVeg?.name} to attract buyers</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <ImageUploader 
                images={images} 
                onChange={setImages} 
                maxImages={5}
                label="Upload up to 5 photos (Optional but recommended)"
              />
            </div>
            
            <div className="flex justify-between pt-6 border-t border-gray-100 dark:border-gray-700 mt-8">
              <button
                onClick={handleBack}
                className="px-6 py-2.5 rounded-lg font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Review & Submit</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Please verify all details before submitting</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
              <div className="flex flex-col md:flex-row md:items-start gap-8">
                
                {/* Image Preview */}
                <div className="w-full md:w-1/3">
                  {images.length > 0 ? (
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <img 
                        src={URL.createObjectURL(images[0])} 
                        alt="Produce preview" 
                        className="w-full h-full object-cover"
                      />
                      {images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          +{images.length - 1} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400">
                      <Camera size={40} className="mb-2 opacity-50" />
                      <span className="text-sm">No photos added</span>
                    </div>
                  )}
                </div>
                
                {/* Details */}
                <div className="w-full md:w-2/3 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedVeg?.name}</h3>
                    <div className="flex items-center text-green-600 dark:text-green-400 mt-1 font-medium">
                      ₹{Math.round((selectedVeg?.current_price || selectedVeg?.admin_price || 0) * 0.85)}/{selectedVeg?.unit} (Your Price)
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 block mb-1">Available Quantity</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-lg">{quantity} {unit}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 block mb-1">Estimated Value</span>
                      <span className="font-semibold text-green-600 dark:text-green-400 text-lg">
                        ₹{Math.round(quantity * ((selectedVeg?.current_price || selectedVeg?.admin_price || 0) * 0.85))}
                      </span>
                    </div>
                    
                    <div className="col-span-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400 block mb-1">Farm Location</span>
                      <p className="text-gray-900 dark:text-white">
                        <span className="font-medium">{farmName}</span><br />
                        {village}, {district}<br />
                        {state} - {pincode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-6 border-t border-gray-100 dark:border-gray-700 mt-8">
              <button
                onClick={handleBack}
                disabled={submitting}
                className="px-6 py-2.5 rounded-lg font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md disabled:opacity-70"
              >
                {submitting ? (
                  <><LoadingSpinner size="sm" color="white" /> Submitting...</>
                ) : (
                  <><Check size={20} /> Submit Produce</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddProduce;
