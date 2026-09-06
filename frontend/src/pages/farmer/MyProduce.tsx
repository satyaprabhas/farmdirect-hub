import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Edit2, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import api, { getImageUrl } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import PriceDisplay from '../../components/common/PriceDisplay';
import Modal from '../../components/common/Modal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';

const MyProduce: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [produce, setProduce] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [editItem, setEditItem] = useState<any>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProduce = async () => {
    try {
      setLoading(true);
      const response = await api.get('/farmer/produce');
      setProduce(response.data.data || response.data);
    } catch (err) {
      console.error('Error fetching produce:', err);
      setError('Failed to load your produce listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduce();
  }, []);

  const handleEditClick = (item: any) => {
    setEditItem(item);
    setNewQuantity(item.available_quantity);
  };

  const handleUpdateQuantity = async () => {
    try {
      setActionLoading(true);
      await api.put(`/farmer/produce/${editItem.id}`, {
        available_quantity: newQuantity
      });
      showToast('success', 'Quantity updated successfully');
      setEditItem(null);
      fetchProduce();
    } catch (err) {
      console.error('Error updating quantity:', err);
      showToast('error', 'Failed to update quantity');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await api.delete(`/farmer/produce/${deleteItem.id}`);
      showToast('success', 'Produce listing removed');
      setDeleteItem(null);
      fetchProduce();
    } catch (err) {
      console.error('Error deleting produce:', err);
      showToast('error', 'Failed to remove listing');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Produce</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your listed vegetables</p>
        </div>
        <button
          onClick={() => navigate('/farmer/add-produce')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Add New Produce
        </button>
      </div>

      {produce.length === 0 ? (
        <EmptyState 
          icon={Sprout}
          title="You haven't listed any produce yet"
          message="Start by adding your first harvest! It will be visible to consumers looking for fresh vegetables."
          actionLabel="Add Produce"
          onAction={() => navigate('/farmer/add-produce')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produce.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-48 bg-gray-100 dark:bg-gray-700 relative">
                {item.images && item.images.length > 0 ? (
                  <img 
                    src={getImageUrl(item.images[0])} 
                    alt={item.vegetable_name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={48} className="opacity-20 mb-2" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <StatusBadge status={item.status || 'Active'} />
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.vegetable_name}</h3>
                
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Available Qty:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{item.available_quantity} {item.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Your Earning Price:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{Math.round((item.price || item.current_price || 0) * 0.85)}/{item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between bg-green-50 dark:bg-green-900/20 p-2 rounded mt-2">
                    <span className="text-green-700 dark:text-green-400 font-medium">Est. Value:</span>
                    <span className="font-bold text-green-700 dark:text-green-400">
                      ₹{Math.round((item.price || item.current_price || 0) * 0.85 * item.available_quantity)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Listed on: {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                  <button 
                    onClick={() => handleEditClick(item)}
                    className="flex-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-1.5 rounded flex items-center justify-center gap-1 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Edit2 size={16} /> Edit Qty
                  </button>
                  <button 
                    onClick={() => setDeleteItem(item)}
                    className="flex-1 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 py-1.5 rounded flex items-center justify-center gap-1 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Quantity Modal */}
      <Modal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        title={`Update Quantity - ${editItem?.vegetable_name}`}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-300">
            <strong>Note:</strong> Price is fixed by admin at <PriceDisplay amount={editItem?.price || editItem?.current_price} />/{editItem?.unit}. You can only update the available quantity.
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Available Quantity ({editItem?.unit})
            </label>
            <input
              type="number"
              min="0"
              value={newQuantity}
              onChange={(e) => setNewQuantity(Number(e.target.value))}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setEditItem(null)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateQuantity}
              disabled={actionLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              {actionLoading ? <LoadingSpinner size="sm" color="white" /> : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Remove Produce Listing"
        message={`Are you sure you want to remove ${deleteItem?.vegetable_name} from your listings? This action cannot be undone.`}
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default MyProduce;
