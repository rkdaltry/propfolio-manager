import { GoogleGenAI, Type } from "@google/genai";
import { Property, Payment } from "../types";

// Helper to safely initialize the client
const getAiClient = () => {
  // Use the env vars mapped by vite.config.ts
  const apiKey = (process.env as any).GEMINI_API_KEY || (process.env as any).API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key not found in process.env. Check your .env file or vite.config.ts mapping.");
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

export const extractTenantData = async (
  content: string | string[],
  contentType: 'text' | 'image' | 'images',
  mimeType: string = 'image/jpeg'
): Promise<any> => {
  const ai = getAiClient();
  if (!ai) return null;

  const apiKey = (process.env as any).GEMINI_API_KEY || (process.env as any).API_KEY;
  console.log(`[AI Extraction] Using API Key starting with: ${apiKey?.substring(0, 7)}...`);
  console.log(`[AI Extraction] Starting extraction. Type: ${contentType}, MIME: ${mimeType}`);

  const systemInstruction = `
    You are analyzing a UK NRLA Assured Shorthold Tenancy Agreement document.
    The document may span multiple pages - look across ALL provided images for the required information.
    
    CRITICAL DOCUMENT STRUCTURE:
    - First, the document says "This agreement is between us, the landlord" followed by the LANDLORD's name
    - Then it says "and you, the tenant" followed by the TENANT's name
    - The tenant's email is often found in a table on page 2 under "If we need to contact you via email"
    
    YOUR TASK: Extract ONLY the TENANT's name (the person AFTER "and you, the tenant").
    DO NOT include the landlord's name. The landlord is the person BEFORE "and you, the tenant".
    
    Look for the tenant's email in the contact details table (usually on page 2).
    
    Extract:
    - name: ONLY the name that appears AFTER "and you, the tenant"
    - email: Tenant's email from the contact table (look for their name row with email address)
    - phone: Tenant's phone if present
    - startDate: Date after "begins on" in YYYY-MM-DD format
    - rentAmount: Monthly rent (number after "£")
    - depositAmount: Deposit amount 
    - propertyAddress: Address after "We will let out the room"
  `;

  const MAX_RETRIES = 3;
  const INITIAL_DELAY_MS = 2000;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Using @google/genai SDK pattern with simple prompting
      const extractionPrompt = `${systemInstruction}

Return ONLY a valid JSON object:
{
  "name": "the name appearing AFTER 'and you, the tenant' ONLY",
  "email": "tenant email from the contact details table",
  "phone": "tenant phone or empty string", 
  "startDate": "YYYY-MM-DD format",
  "rentAmount": number,
  "depositAmount": number,
  "propertyAddress": "full property address"
}

IMPORTANT: For the "name" field, return ONLY the tenant's name (like "Lina Mouhakkik"), 
NOT the landlord's name (like "Rashed Khan") and NOT both names combined.
Look for the tenant's email in a table that lists tenant names with their email addresses.

Do not include any text before or after the JSON.`;

      let contents: any;
      if (contentType === 'text') {
        contents = {
          parts: [{ text: `${extractionPrompt}\n\nDocument content:\n${content}` }]
        };
      } else if (contentType === 'images' && Array.isArray(content)) {
        // Multiple images (multi-page PDF)
        const imageParts = content.map((imgData, idx) => ({
          inlineData: { mimeType: mimeType, data: imgData }
        }));
        console.log(`[AI Extraction] Sending ${content.length} page images to Gemini`);
        contents = {
          parts: [
            ...imageParts,
            { text: extractionPrompt }
          ]
        };
      } else {
        // Single image
        contents = {
          parts: [
            { inlineData: { mimeType: mimeType, data: content as string } },
            { text: extractionPrompt }
          ]
        };
      }

      console.log(`[AI Extraction] Attempt ${attempt + 1}/${MAX_RETRIES}...`);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents
      });

      if (response.text) {
        console.log("[AI Extraction] Raw response:", response.text);
        // Clean any markdown formatting
        let cleanText = response.text.trim();
        if (cleanText.includes('```')) {
          cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();
        }
        const firstBrace = cleanText.indexOf('{');
        const lastBrace = cleanText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          cleanText = cleanText.substring(firstBrace, lastBrace + 1);
        }
        const parsed = JSON.parse(cleanText);
        console.log("[AI Extraction] Successfully parsed data:", parsed);
        return parsed;
      }

      return null;
    } catch (error: any) {
      const is503 = error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('overloaded');
      const is429 = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Quota exceeded') || error?.message?.includes('RESOURCE_EXHAUSTED');

      if ((is503 || is429) && attempt < MAX_RETRIES - 1) {
        // For rate limits (429), use much longer delays
        const baseDelay = is429 ? 30000 : INITIAL_DELAY_MS; // 30s for rate limit, 2s for overload
        const delay = baseDelay * (attempt + 1);
        const errorType = is429 ? 'Rate limited (429)' : 'Model overloaded (503)';
        console.warn(`[AI Extraction] ${errorType}. Retrying in ${delay / 1000}s... (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      console.error("Gemini tenant extraction failed:", error);

      // Give user a more helpful error message for rate limits
      if (is429) {
        console.error("[AI Extraction] You've exceeded the Gemini API rate limit. Please wait a few minutes before trying again.");
      }

      return null;
    }
  }

  return null;
};
