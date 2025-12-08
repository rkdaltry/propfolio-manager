

import { GoogleGenAI } from "@google/genai";
import { Property, Payment } from "../types";

// Helper to safely initialize the client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const askPortfolioAssistant = async (
  query: string,
  properties: Property[]
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Please configure your API Key to use the AI Assistant.";

  // Minify data to save tokens, removing image URLs
  const contextData = properties.map(p => ({
    address: p.address,
    type: p.type,
    mortgage: p.mortgage,
    insurance: p.buildingsInsurance,
    license: p.hmoLicence,
    tenants: p.tenants.map(t => ({ name: t.name, rent: t.rentAmount, end: t.tenancyEndDate })),
    renewals: [
        { item: "Mortgage", date: p.mortgage?.fixedRateExpiry },
        { item: "Insurance", date: p.buildingsInsurance?.renewalDate },
        { item: "HMO License", date: p.hmoLicence?.renewalDate }
    ]
  }));

  const prompt = `
    You are an expert property management assistant.
    Here is the current portfolio data in JSON format:
    ${JSON.stringify(contextData)}

    User Query: "${query}"

    Instructions:
    1. Analyze the data to answer the user's specific question.
    2. Be concise and professional.
    3. If the user asks for a draft (email/letter), write it out.
    4. If listing dates, use a friendly format.
    5. If the answer isn't in the data, say so.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error processing your request.";
  }
};

export const analyzeDocument = async (
  fileBase64: string,
  mimeType: string
): Promise<string> => {
   const ai = getAiClient();
   if (!ai) return "API Key missing.";

   try {
     const response = await ai.models.generateContent({
       model: 'gemini-2.5-flash',
       contents: {
         parts: [
           {
             inlineData: {
               mimeType: mimeType,
               data: fileBase64
             }
           },
           {
             text: "Analyze this document. Identify what kind of property document it is (e.g., Tenancy Agreement, Insurance Certificate, Bill). Extract key dates (renewal, expiry), amounts, and names. Return a brief summary."
           }
         ]
       }
     });
     return response.text || "Could not analyze document.";
   } catch (error) {
     console.error("Document analysis failed", error);
     return "Failed to analyze the document.";
   }
};

export const extractDocumentDetails = async (
  fileBase64: string,
  mimeType: string
): Promise<{ category: string; expiryDate: string | null; summary: string } | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  const prompt = `
    Analyze the attached document image. 
    1. Identify the document category. Choose best from: 'Tenancy Agreement', 'ID / Passport', 'Right to Rent', 'Guarantor', 'Correspondence', 'Other'.
    2. Extract the expiry date or relevant end date if present (format YYYY-MM-DD). If not present, use null.
    3. Provide a short 1-sentence summary of the content.
    
    Return strictly valid JSON in the following format (do not add markdown code blocks):
    { 
      "category": "string", 
      "expiryDate": "string" | null, 
      "summary": "string" 
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: fileBase64
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    let text = response.text || "";
    // Clean markdown if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Structured document analysis failed", error);
    return null;
  }
};

export const generateRentIncreaseLetter = async (
  tenantName: string,
  propertyAddress: string,
  currentRent: number,
  newRent: number
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "API Key missing. Cannot generate letter.";

  const prompt = `
    Write a formal, polite, and professional rent increase letter (Section 13 notice style or general notice depending on context, but keep it general professional) for a tenant.
    
    Details:
    - Tenant Name: ${tenantName}
    - Property Address: ${propertyAddress}
    - Current Rent: £${currentRent}
    - New Rent: £${newRent}
    - Effective Date: 1 month from today (calculate the date approximately).

    The letter should be empathetic but professional, mentioning that the rent review is part of the standard annual review process.
    Keep the tone helpful.
    Output ONLY the body of the letter.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate letter.";
  } catch (error) {
    console.error("Letter generation failed", error);
    return "Failed to generate letter.";
  }
};

export const generatePaymentReminder = async (
  tenantName: string,
  amountOwed: number,
  propertyAddress: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "API Key missing.";

  const prompt = `
    Write a polite but firm email reminder to a tenant regarding overdue rent.
    
    Tenant: ${tenantName}
    Property: ${propertyAddress}
    Amount Owed: £${amountOwed}

    Tone: Professional, firm but polite. Assume this is the first reminder.
    Ask them to clear the outstanding balance immediately or contact to discuss payment plan.
    Output ONLY the email body.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate reminder.";
  } catch (error) {
    return "Failed to generate reminder.";
  }
};

export const analyzePaymentHistory = async (
  history: Payment[],
  rentAmount: number
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "";

  // Provide simpler context
  const context = history.map(h => `${h.date}: £${h.amount} (${h.type})`).join('\n');
  
  const prompt = `
    Analyze this payment history for a tenant paying £${rentAmount}/month.
    History:
    ${context}
    
    Provide a very short (1 sentence) assessment of their payment reliability (e.g. "Consistently pays on time", "Often late", "Irregular amounts").
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    return "";
  }
};
