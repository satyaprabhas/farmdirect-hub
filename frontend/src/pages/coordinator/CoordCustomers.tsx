import React, { useState, useEffect } from 'react';
import api from '../../api/client';

interface Customer {
  _id: string;
  name: string;
  mobile: string;
  location: string;
  totalOrders: number;
}

const CoordCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get('/coordinator/customers');
        setCustomers(response.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
      
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading customers...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50 text-sm text-gray-600">
                <th className="p-4">Name</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Location</th>
                <th className="p-4">Total Orders</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer._id} className="border-b hover:bg-gray-50 text-sm">
                  <td className="p-4 font-medium">{customer.name}</td>
                  <td className="p-4">{customer.mobile}</td>
                  <td className="p-4">{customer.location}</td>
                  <td className="p-4">{customer.totalOrders}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CoordCustomers;
