import type { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const TEXT_MODEL = 'gemini-2.5-flash-preview-09-2025';

// Enhanced system instruction for comprehensive pet education
const SYSTEM_INSTRUCTION = `You are 'Dr. PetBot', a comprehensive and expert pet education advisor. Your primary role is to educate pet owners thoroughly on ALL aspects of pet care, health, behavior, nutrition, training, and wellbeing.

EDUCATION GOALS:
- Empower pet owners with detailed, evidence-based knowledge to make informed decisions
- Provide thorough explanations that help owners understand the 'why' behind recommendations
- Cover multiple perspectives and breed/species-specific considerations
- Help owners recognize when professional veterinary care is needed

RESPONSE STYLE - ALWAYS DETAILED:
- Provide comprehensive answers that go beyond surface-level information
- Include specific examples, breeds, or scenarios to illustrate points
- Structure responses with clear sections (e.g., Overview, Causes, Solutions, Prevention, When to See a Vet)
- Explain both short-term and long-term implications
- When applicable, include age-specific guidance (puppy/kitten, adult, senior)
- Mention species and breed differences where relevant

EDUCATIONAL CONTENT AREAS:
1. HEALTH & NUTRITION - Detailed nutritional requirements, breed-specific health predispositions, weight management, common health conditions with symptoms and prevention, dental health, vaccinations, parasite prevention, age-appropriate care, food allergies and special diets

2. BEHAVIOR & TRAINING - Detailed behavioral analysis, positive reinforcement training techniques with step-by-step instructions, common behavioral issues with causes and solutions, socialization windows, anxiety and fear-based behaviors, body language and communication, breed-specific behavioral traits

3. WELLNESS & PREVENTATIVE CARE - Vaccination schedules, parasite control strategies, grooming requirements, environmental enrichment, exercise guidelines, stress management, environmental adaptation

4. LIFE STAGES - Detailed guidance for newborn/young pets, adolescent challenges, adult maintenance, senior pet care, age-related changes, end-of-life care

5. SPECIAL TOPICS - Introducing new pets, travel and relocation, cost-effective vs. premium care, pet insurance, emergency preparedness, breed selection

RESPONSE FORMAT:
- Start with a clear overview summarizing the key point
- Provide detailed explanations with scientific backing
- Include practical, actionable steps or examples
- Offer alternatives and considerations
- Address both common and less obvious aspects
- Conclude with preventative measures or long-term strategies
- Always note when a veterinarian should be consulted

IMPORTANT BOUNDARIES:
- Always prioritize pet safety and wellbeing
- Recommend professional veterinary consultation for medical concerns, diagnoses, and prescription treatments
- When discussing medical conditions, clearly state this is educational and not a diagnosis
- Acknowledge when pet behavior may need professional trainer or behaviorist consultation
- Provide balanced information when there are differing expert opinions
- State when emergency veterinary care is needed for acute symptoms

TONE:
- Professional yet approachable and warm
- Encouraging and supportive of pet owners' efforts
- Non-judgmental about past pet care decisions
- Enthusiastic about helping owners learn and improve their pet care
- Respectful of different cultural and individual approaches to pet ownership

Your goal is to be the most thorough and helpful pet education resource available, ensuring every response significantly increases the owner's understanding and capability to care for their pet.`;

export async function chatHandler(req: Request, res: Response) {
  const { history } = req.body;
  if (!history) return res.status(400).json({ error: 'Missing chat history in request body.' });

  // Check if API key is configured BEFORE trying to call the API
  if (!GEMINI_API_KEY) {
    console.error('[ERROR] GEMINI_API_KEY is not set in environment variables!');
    return res.status(500).json({ 
      error: 'Server misconfiguration: GEMINI_API_KEY is not set in backend .env. Please configure it and restart the server.' 
    });
  }

  try {
    // DEBUG: Log the API key presence and format
    const keyPresent = !!GEMINI_API_KEY;
    const keyLength = GEMINI_API_KEY?.length || 0;
    const keyPrefix = GEMINI_API_KEY?.substring(0, 6) || 'NONE';
    console.log(`[DEBUG] chatHandler: API key present=${keyPresent}, length=${keyLength}, prefix=${keyPrefix}...`);

    const url = `${API_BASE}/${TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    console.log(`[DEBUG] chatHandler: Requesting URL: ${url.replace(GEMINI_API_KEY || '', 'REDACTED')}`);
    
    const payload = { 
      contents: history,
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }]
      },
      tools: [{ googleSearch: {} }] 
    };
    console.log(`[DEBUG] chatHandler: Payload:`, JSON.stringify(payload).substring(0, 200) + '...');

    const apiRes = await fetch(url, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    });

    console.log(`[DEBUG] chatHandler: Response status=${apiRes.status}, ok=${apiRes.ok}`);

    const result = await apiRes.json();
    console.log(`[DEBUG] chatHandler: Response body (first 500 chars):`, JSON.stringify(result).substring(0, 500));

    if (!apiRes.ok) {
      console.error(`[ERROR] Generative Language API returned status ${apiRes.status}:`, result);
      if (apiRes.status === 401) {
        console.error(`[ERROR] 401 Unauthorized - API key may be invalid, expired, or lack permissions`);
        return res.status(502).json({ 
          error: 'Generative Language API unauthorized (401). Check API key and permissions.', 
          details: result,
          debug: { keyLength, keyPrefix }
        });
      }
      return res.status(502).json({ 
        error: 'Generative Language API returned an error', 
        details: result,
        debug: { status: apiRes.status, keyLength, keyPrefix }
      });
    }

    const candidate = result?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || 'Sorry, I could not generate a detailed response.';
    let sources: any[] = [];
    const groundingMetadata = candidate?.groundingMetadata;
    if (groundingMetadata?.groundingAttributions) {
      sources = groundingMetadata.groundingAttributions.map((a: any) => ({ uri: a.web?.uri, title: a.web?.title })).filter((s: any) => s.uri && s.title);
    }
    return res.json({ text, sources });
  } catch (error: any) {
    console.error('Chat handler error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to process chat request.', details: error?.message });
  }
}

// export async function imageHandler(req: Request, res: Response) {
//   const { prompt } = req.body;
//   if (!prompt) return res.status(400).json({ error: 'Missing prompt for image generation.' });
//   try {
//     // Helpful server-side check: fail fast if API key is missing
//     if (!GEMINI_API_KEY) {
//       console.error('GEMINI_API_KEY is not configured on the server.');
//       return res.status(500).json({ error: 'Server misconfiguration: GEMINI_API_KEY is not set. Please set GEMINI_API_KEY in backend .env and restart the server.' });
//     }
//     const IMAGEN_API_URL = `${API_BASE}/${IMAGE_MODEL}:predict?key=${GEMINI_API_KEY}`;
//     const imagePrompt = `Detailed, safe, and friendly depiction of pet care: ${prompt}. Cute, realistic illustration style.`;
//     const payload = { instances: { prompt: imagePrompt }, parameters: { sampleCount: 1, aspectRatio: '1:1' } };
//     const response = await fetch(IMAGEN_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
//     const result = await response.json();
//     if (!response.ok) {
//       console.error('Imagen API returned error:', response.status, result);
//       // forward the error details to frontend for clearer messaging
//       if (response.status === 401) {
//         return res.status(502).json({ error: 'Imagen API unauthorized (401). Check GEMINI_API_KEY configuration and permissions.', details: result });
//       }
//       return res.status(502).json({ error: 'Imagen API error', details: result });
//     }
//     const base64Data = result?.predictions?.[0]?.bytesBase64Encoded;
//     if (base64Data) return res.json({ imageUrl: `data:image/png;base64,${base64Data}` });
//     console.error('Imagen returned no image data:', result);
//     return res.status(500).json({ error: 'Image generation failed to return data.' });
//   } catch (error: any) {
//     console.error('Imagen API Error:', error?.message || error);
//     return res.status(500).json({ error: 'Failed to process image request.', details: error?.message });
//   }
// }
