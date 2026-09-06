import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { Plus, Pencil, Power } from 'lucide-react';

interface Vegetable {
  id: string;
  name: string;
  current_price: number;
  unit: string;
  is_active: boolean;
  updated_at: string;
}

const PriceManagement: React.FC = () => {
  const { showToast } = useToast();
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVeg, setEditingVeg] = useState<Vegetable | null>(null);
  const [formData, setFormData] = useState({ name: '', current_price: '', unit: 'kg' });

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'price' | 'toggle', veg: Vegetable | null, newPrice?: number } | null>(null);

  useEffect(() => {
    fetchVegetables();
  }, []);

  const fetchVegetables = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/vegetables');
      setVegetables(response.data);
    } catch (error) {
      showToast('Failed to load vegetables', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (veg?: Vegetable) => {
    if (veg) {
      setEditingVeg(veg);
      setFormData({ name: veg.name, current_price: veg.current_price.toString(), unit: veg.unit });
    } else {
      setEditingVeg(null);
      setFormData({ name: '', current_price: '', unit: 'kg' });
    }
    setIsModalOpen(true);
  };

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVeg && Number(formData.current_price) !== editingVeg.current_price) {
      setConfirmAction({ type: 'price', veg: editingVeg, newPrice: Number(formData.current_price) });
      setIsConfirmOpen(true);
      setIsModalOpen(false);
    } else if (editingVeg) {
      saveVegetable(editingVeg.id, formData);
    } else {
      addVegetable(formData);
    }
  };

  const addVegetable = async (data: any) => {
    try {
      await api.post('/admin/vegetables', {
        name: data.name,
        current_price: Number(data.current_price),
        unit: data.unit
      });
      showToast('Vegetable added successfully', 'success');
      setIsModalOpen(false);
      fetchVegetables();
    } catch (error) {
      showToast('Failed to add vegetable', 'error');
    }
  };

  const saveVegetable = async (id: string, data: any) => {
    try {
      await api.put(`/admin/vegetables/${id}`, {
        current_price: Number(data.current_price),
        unit: data.unit,
        is_active: data.is_active !== undefined ? data.is_active : true
      });
      showToast('Vegetable updated successfully', 'success');
      setIsModalOpen(false);
      fetchVegetables();
    } catch (error) {
      showToast('Failed to update vegetable', 'error');
    }
  };

  const handleToggleActive = (veg: Vegetable) => {
    setConfirmAction({ type: 'toggle', veg });
    setIsConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction?.veg) return;

    try {
      if (confirmAction.type === 'price') {
        await saveVegetable(confirmAction.veg.id, { ...formData });
      } else if (confirmAction.type === 'toggle') {
        await api.put(`/admin/vegetables/${confirmAction.veg.id}`, {
          is_active: !confirmAction.veg.is_active
        });
        showToast(`Vegetable ${confirmAction.veg.is_active ? 'deactivated' : 'activated'} successfully`, 'success');
        fetchVegetables();
      }
    } finally {
      setIsConfirmOpen(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vegetable Price Management</h1>
          <p className="text-gray-500">Control prices for all vegetables in the marketplace</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vegetable</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto p-6">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-lg">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Vegetable</th>
                <th className="px-4 py-3">Current Price (₹)</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Last Updated</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vegetables.map((veg, index) => (
                <tr key={veg.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{veg.name}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">₹{veg.current_price}</td>
                  <td className="px-4 py-3">{veg.unit}</td>
                  <td className="px-4 py-3">{new Date(veg.updated_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${veg.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {veg.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => handleOpenModal(veg)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleToggleActive(veg)} className={`p-1.5 rounded-lg transition-colors ${veg.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`} title="Toggle Status">
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingVeg ? "Edit Vegetable" : "Add New Vegetable"}>
        <form onSubmit={handleSubmitModal} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vegetable Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              disabled={!!editingVeg}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
            <input
              type="number"
              value={formData.current_price}
              onChange={(e) => setFormData({...formData, current_price: e.target.value})}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="kg">kg</option>
              <option value="bunch">bunch</option>
              <option value="piece">piece</option>
              <option value="dozen">dozen</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">Save</button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        title="Confirm Action"
        message={
          confirmAction?.type === 'price'
            ? `Change price of ${confirmAction.veg?.name} from ₹${confirmAction.veg?.current_price} to ₹${confirmAction.newPrice}? This will affect all active listings.`
            : `Are you sure you want to ${confirmAction?.veg?.is_active ? 'deactivate' : 'activate'} ${confirmAction?.veg?.name}?`
        }
        confirmText="Confirm"
        type={confirmAction?.type === 'toggle' && confirmAction?.veg?.is_active ? 'danger' : 'primary'}
      />
    </div>
  );
};

export default PriceManagement;
