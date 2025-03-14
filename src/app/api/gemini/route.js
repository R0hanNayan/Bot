import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Load API Key
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req) {
  try {
    const { messages, propertyData } = await req.json();
    console.log("Received Messages:", messages);
    console.log("Received Property Data:", propertyData);

    if (!messages || !Array.isArray(messages)) {
      return new NextResponse("Invalid request format", { status: 400 });
    }

    // Convert propertyData to a readable format for AI
    const propertyText = propertyData
      ? `
      Address: ${propertyData.address?.oneLine}
      Type: ${propertyData.summary?.propertyType}
      Year Built: ${propertyData.summary?.yearbuilt}
      Bedrooms: ${propertyData.building?.rooms?.beds}
      Bathrooms: ${propertyData.building?.rooms?.bathstotal}
      Living Area: ${propertyData.building?.size?.livingsize} sqft
      Lot Size: ${propertyData.lot?.lotsize1} acres
      Garage: ${propertyData.building?.parking?.garagetype}
    `
      : "No property details available.";

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-pro-exp-02-05",
      systemInstruction: `You are an AI assistant specializing in real estate insights. Answer in a structured paragraph without any special characters like * or /. Provide natural, concise, and human-like responses. Here is the property data:\n${propertyText}. Give consultations regarding this property and current market trends.`,
    });

    const chatSession = model.startChat({
      generationConfig: {
        temperature: 0.75,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      },
      history: messages, // ✅ Already formatted in frontend
    });

    // ✅ Fix: Await the response properly
    const result = await chatSession.sendMessage(messages[messages.length - 1].parts[0].text);

    // Ensure the response is properly extracted
    const reply = result.response ? result.response.text() : "I'm sorry, I couldn't generate a response.";

    console.log("AI Response:", reply);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error in Gemini API:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
