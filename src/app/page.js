"use client";

import { useState } from "react";
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import axios from "axios";
import AIBot from "../components/AIBot";

export default function Home() {
  const [attomId, setAttomId] = useState("");
  const [propertyData, setPropertyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const fetchPropertyDetails = async () => {
    if (!attomId) return;
    setLoading(true);
    setError("");
    setPropertyData(null);

    try {
      const attomApiKey = process.env.NEXT_PUBLIC_ATTOM_API_KEY;
      const url = `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail?attomid=${attomId}`;

      const response = await axios.get(url, {
        headers: { apikey: attomApiKey, Accept: "application/json" },
      });

      setPropertyData(response.data.property[0]); // Extracting the first property
    } catch (err) {
      setError("Failed to fetch property details. Check the Attom ID or API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-black px-6 py-10 text-white">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Property Details Lookup</h1>

      <input
        type="text"
        className="text-lg border-2 border-white sm:border-4 p-2 sm:p-3 w-full sm:w-96 rounded-lg text-white"
        placeholder="Enter Attom ID (e.g., 184713191)"
        value={attomId}
        onChange={(e) => setAttomId(e.target.value)}
      />

      <button
        className="bg-white text-black font-bold px-3 py-2 sm:px-4 sm:py-2 rounded-lg mt-4 w-full sm:w-auto"
        onClick={fetchPropertyDetails}
        disabled={loading}
      >
        {loading ? "Loading..." : "Get Property Details"}
      </button>

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

      {propertyData && (
        <div className="mt-6 w-full sm:w-[80%] md:w-[70%] lg:w-[50%] max-w-2xl p-4 sm:p-5 bg-white shadow-md rounded-lg text-black">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Property Details</h2>
          <p><strong>Address:</strong> {propertyData.address.oneLine}</p>
          <p><strong>Property Type:</strong> {propertyData.summary.propertyType}</p>
          <p><strong>Year Built:</strong> {propertyData.summary.yearbuilt}</p>
          <p><strong>Bedrooms:</strong> {propertyData.building.rooms.beds}</p>
          <p><strong>Bathrooms:</strong> {propertyData.building.rooms.bathstotal}</p>
          <p><strong>Living Area:</strong> {propertyData.building.size.livingsize} sqft</p>
          <p><strong>Lot Size:</strong> {propertyData.lot.lotsize1} acres</p>
          <p><strong>Garage:</strong> {propertyData.building.parking.garagetype}</p>
        </div>
      )}

      {propertyData && ( isOpen ? (
        <div className="fixed bottom-20 right-6 sm:right-10 flex flex-col items-end">
          <button
            className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 bg-red-300 text-white w-12 h-12 flex items-center justify-center rounded-full shadow-lg"
            onClick={() => setIsOpen(false)}
          >
            ❌
          </button>
          <div className="w-[90%] sm:w-auto">
            <AIBot propertyData={propertyData} />
          </div>
        </div>
      ) : (
        <button
          className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 bg-blue-600 text-white w-12 h-12 flex items-center justify-center rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <SmartToyRoundedIcon fontSize="large" />
        </button>
      ))}
    </div>
  );
}
