"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

export default function Positions() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPositions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api.getPositions();
      console.log("Fetched positions:", data);

      // Handle cases where API returns object like { positions: [...] }
      const positionsData = Array.isArray(data)
        ? data
        : Array.isArray(data?.positions)
        ? data.positions
        : [];

      setPositions(positionsData);
    } catch (e) {
      console.error("Error fetching positions:", e);
      setError("Failed to load positions. Is the backend running on port 3001?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPositions();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading positions...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Open Positions</h1>
        <button
          onClick={loadPositions}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Refresh
        </button>
      </div>

      {positions.length === 0 ? (
        <div className="bg-white p-8 rounded shadow text-center text-gray-600">
          No open positions
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Avg Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Total Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {positions.map((p, i) => {
                const qty = parseFloat(p.total_quantity) || 0;
                const avg = parseFloat(p.avg_price) || 0;
                const total = qty * avg;

                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold">{p.symbol}</td>
                    <td className="px-6 py-4">{qty.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      ${isNaN(avg) ? "0.00" : avg.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      ${isNaN(total) ? "0.00" : total.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
