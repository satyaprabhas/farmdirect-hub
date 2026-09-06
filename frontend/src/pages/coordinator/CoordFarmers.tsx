import React, { useState, useEffect } from 'react';
import api from '../../api/client';

interface Farmer {
  _id: string;
  name: string;
  mobile: string;
  location: string;
  produceCount: number;
}

const CoordFarmers: React.FC = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const response = await api.get('/coordinator/farmers');
        setFarmers(response.data);
      } catch (error) {
        console.error('Error fetching farmers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmers();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Farmers</h1>
      
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading farmers...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50 text-sm text-gray-600">
                <th className="p-4">Name</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Location</th>
                <th className="p-4">Active Produce Items</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map(farmer => (
                <tr key={farmer._id} className="border-b hover:bg-gray-50 text-sm">
                  <td className="p-4 font-medium">{farmer.name}</td>
                  <td className="p-4">{farmer.mobile}</td>
                  <td className="p-4">{farmer.location}</td>
                  <td className="p-4">{farmer.produceCount}</td>
                </tr>
              ))}
              {farmers.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">No farmers found in your region.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CoordFarmers;
