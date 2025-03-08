import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Load API Key
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req) {
  try {
    const { messages, salesData } = await req.json();
    console.log("Received Messages:", messages);
    console.log("Received Sales Data:", salesData);

    if (!messages || !Array.isArray(messages)) {
      return new NextResponse("Invalid request format", { status: 400 });
    }

    // Convert salesData to a readable format for AI
    const salesDataText = salesData.map(item =>
      `Year: ${item.year}, Home Sales: ${item.homeSaleCount}, Avg Price: ${item.avgSalePrice}, Median Price: ${item.medSalePrice}`
    ).join("\n");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-pro-exp-02-05",
      systemInstruction: `Answer in a stuctured paragraph without any special characters like * or /. You are an AI assistant specializing in real estate insights and you talk and answer like a human. Converse with the user very naturally so that it resembles a human and give short and consise opinions. Here is the latest sales data:\n${salesDataText}`,
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
