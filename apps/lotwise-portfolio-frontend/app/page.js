"use client";
import { useState } from 'react';
import { api } from '@/services/api';

export default function Home() {
const [formData, setFormData] = useState({
symbol: '',
quantity: '',
price: '',
timestamp: new Date().toISOString().slice(0, 16),
});
const [message, setMessage] = useState('');
const [loading, setLoading] = useState(false);

const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

const handleSubmit = async (e) => {
e.preventDefault();
setLoading(true);
setMessage('');
try {
const trade = {
symbol: formData.symbol.toUpperCase(),
quantity: parseFloat(formData.quantity),
price: parseFloat(formData.price),
timestamp: new Date(formData.timestamp).toISOString(),
};
await api.addTrade(trade);
setMessage('✅ Trade added successfully!');
setFormData({
symbol: '',
quantity: '',
price: '',
timestamp: new Date().toISOString().slice(0, 16),
});
} catch (err) {
setMessage('❌ Error: ' + (err.response?.data?.error || err.message));
} finally {
setLoading(false);
}
};

return (
<div className="max-w-2xl mx-auto">
<h1 className="text-3xl font-bold mb-6">Add New Trade</h1>


  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-blue-800 text-sm">
    Tip: Quantity is positive for BUY (e.g., 10) and negative for SELL (e.g., -5)
  </div>

  <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mb-4">
    <div className="mb-4">
      <label className="block text-sm font-bold mb-2">Symbol *</label>
      <input
        type="text"
        name="symbol"
        value={formData.symbol}
        onChange={handleChange}
        placeholder="AAPL"
        required
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-bold mb-2">Quantity *</label>
      <input
        type="number"
        name="quantity"
        value={formData.quantity}
        onChange={handleChange}
        placeholder="10 (buy) or -5 (sell)"
        step="0.01"
        required
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <p className="text-xs text-gray-500 mt-1">Positive = BUY, Negative = SELL</p>
    </div>

    <div className="mb-4">
      <label className="block text-sm font-bold mb-2">Price *</label>
      <input
        type="number"
        name="price"
        value={formData.price}
        onChange={handleChange}
        placeholder="150.50"
        step="0.01"
        required
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div className="mb-6">
      <label className="block text-sm font-bold mb-2">Date & Time *</label>
      <input
        type="datetime-local"
        name="timestamp"
        value={formData.timestamp}
        onChange={handleChange}
        required
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <button
      type="submit"
      disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md disabled:bg-gray-400"
    >
      {loading ? 'Adding Trade...' : 'Add Trade'}
    </button>
  </form>

  {message && (
    <div className={`p-4 rounded-lg ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {message}
    </div>
  )}
</div>
);
}