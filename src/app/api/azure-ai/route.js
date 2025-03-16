import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.AZURE_AI_KEY; // Use the correct Azure API Key

export async function POST(req) {
    try {
        const { messages, propertyData } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response("Invalid request format", { status: 400 });
        }

        const client = ModelClient(
            "https://models.inference.ai.azure.com",
            new AzureKeyCredential(token)
        );

        // Convert propertyData into a readable format
        const propertyText = propertyData
            ? `Address: ${propertyData.address?.oneLine}
               Type: ${propertyData.summary?.propertyType}
               Year Built: ${propertyData.summary?.yearbuilt}
               Bedrooms: ${propertyData.building?.rooms?.beds}
               Bathrooms: ${propertyData.building?.rooms?.bathstotal}
               Living Area: ${propertyData.building?.size?.livingsize} sqft
               Lot Size: ${propertyData.lot?.lotsize1} acres
               Garage: ${propertyData.building?.parking?.garagetype}`
            : "No property details available.";

        const response = await client.path("/chat/completions").post({
            body: {
                messages: [
                    { role: "system", content: `You are an AI assistant specializing in real estate. Use the following property data for insights: ${propertyText}. Keep the Answers very short and concise just like a human conversation. Avoid using any Markdown syntax` },
                    ...messages, 
                    { role: "assistant", content: propertyText } 
                ],
                model: "Llama-3.3-70B-Instruct",
                temperature: 0.8,
                max_tokens: 2048,
                top_p: 0.1
            }
        });

        if (isUnexpected(response)) {
            throw response.body.error;
        }

        return new Response(JSON.stringify({ reply: response.body.choices[0].message.content }), { status: 200 });

    } catch (error) {
        console.error("Error in Azure AI API:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
