"use client"

import { useState } from "react";
import axios from "axios";
import SalesChart from "../components/SalesChart";
import AIBot from "../components/AIBot";

export default function Home() {
  const [geoId, setGeoId] = useState("");
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const fetchSalesTrends = async () => {
    if (!geoId) return;
    setLoading(true);
    setError("");
    setSalesData([]);

    try {
      const attomApiKey = process.env.NEXT_PUBLIC_ATTOM_API_KEY;
      const url = `https://api.gateway.attomdata.com/v4/transaction/salestrend?geoIdV4=${geoId}&interval=yearly&startyear=2018&endyear=2022`;

      const response = await axios.get(url, {
        headers: { apikey: attomApiKey, Accept: "application/json" },
      });

      const formattedData = response.data.salesTrends.map((trend) => ({
        year: trend.dateRange.start,
        homeSaleCount: trend.salesTrend.homeSaleCount,
        avgSalePrice: trend.salesTrend.avgSalePrice,
        medSalePrice: trend.salesTrend.medSalePrice,
      }));

      setSalesData(formattedData);
    } catch (err) {
      setError("Failed to fetch sales trends. Check the geoId or API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6 text-black">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Sales Trends Analyzer</h1>

      <input
        type="text"
        className="border p-2 w-96 rounded-lg"
        placeholder="Enter GeoID (e.g., 6828b00047035292dd47fe020e636bb3)"
        value={geoId}
        onChange={(e) => setGeoId(e.target.value)}
      />

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4"
        onClick={fetchSalesTrends}
        disabled={loading}
      >
        {loading ? "Loading..." : "Analyze Trends"}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {salesData.length > 0 && (
        <>
          <div className="mt-6 w-full max-w-3xl">
            <SalesChart data={salesData} />
          </div>
          {
            isOpen ? (
              <div className="mt-6">
                <button
                  className="z-10 absolute bottom-10 right-10 flex justify-center items-center bg-gray-500 text-white px-4 py-2 rounded-full mt-4 h-15 w-15"
                  onClick={() => setIsOpen(false)}
                >
                  ❌
                </button>
                <div className="z-10 absolute bottom-35 right-25">
                  <AIBot salesData={salesData} />
                </div>
              </div>
            ) : (
              <button
                className="z-10 absolute bottom-10 right-10 flex justify-center items-center bg-gray-500 text-white px-4 py-2 rounded-full mt-4 h-15 w-15"
                onClick={() => setIsOpen(true)}
              >
                🤖
              </button>
            )
          }
        </>
      )}
    </div>
  );
}
