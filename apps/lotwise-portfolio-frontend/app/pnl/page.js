"use client";
import { useEffect, useState } from "react";
import { api } from "@/services/api";

export default function PnL() {
  const [pnlData, setPnlData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPnL = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api.getPnL();
      console.log("Fetched P&L data:", data);

      // Ensure we always store an array
      const pnlArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.pnl)
        ? data.pnl
        : [];

      setPnlData(pnlArray);
    } catch (e) {
      console.error("Error fetching P&L:", e);
      setError("Failed to load P&L. Is the backend running on port 3001?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPnL();
  }, []);

  // ✅ Safe reduce — will not throw even if pnlData is empty
  const totalPnL = Array.isArray(pnlData)
    ? pnlData.reduce((sum, r) => sum + parseFloat(r.total_pnl || 0), 0)
    : 0;

  if (loading) {
    return <div className="text-center py-10">Loading P&amp;L...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Realized P&amp;L</h1>
        <button
          onClick={loadPnL}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded shadow p-6 mb-6">
        <h2 className="text-lg text-gray-600 mb-2">Total Realized P&amp;L</h2>
        <p
          className={`text-4xl font-bold ${
            totalPnL >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
        </p>
      </div>

      {pnlData.length === 0 ? (
        <div className="bg-white p-8 rounded shadow text-center text-gray-600">
          No realized P&amp;L yet
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
                  P&amp;L
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Number of Trades
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pnlData.map((row, i) => {
                const pnl = parseFloat(row.total_pnl || 0);
                const isProfit = pnl >= 0;

                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold">{row.symbol}</td>
                    <td
                      className={`px-6 py-4 font-bold ${
                        isProfit ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isProfit ? "+" : ""}${pnl.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">{row.num_trades}</td>
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
