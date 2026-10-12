/**
 * Server-Side Gemini Intelligence Service
 * Uses @google/genai SDK exclusively on the server with process.env.GEMINI_API_KEY.
 */
import { GoogleGenAI } from '@google/genai';

let cachedClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!cachedClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    cachedClient = new GoogleGenAI({ apiKey });
  }
  return cachedClient;
}

export interface AiTaskRequest {
  model?: string;
  task: 'optimize-advice' | 'reskin' | 'auto-parametricize' | 'synthesize-html';
  prompt?: string;
  contextData?: any;
}

export async function executeAiTask(req: AiTaskRequest): Promise<{ result: string; data?: any }> {
  const client = getGeminiClient();
  const selectedModel = req.model || 'gemini-3.8-flash';

  let systemInstruction = `You are OmniCrush AI Designer and AST Optimization Engine.
You specialize in losslessly crushed HTML/CSS/JS AST objects, token efficiency, parametric design, and publication-grade scientific web apps.
Always respond with precise, actionable JSON or code as requested.`;

  let userPrompt = '';

  if (req.task === 'optimize-advice') {
    userPrompt = `Analyze the following OmniCrush compression statistics and AST metadata:
${JSON.stringify(req.contextData, null, 2)}

Provide an expert assessment:
1. Compression efficacy and token reduction rating (A+ to C).
2. Repetitive patterns detected in HTML attributes, CSS declarations, and CDN URLs.
3. Top 3 actionable recommendations to crush this document even further for LLM prompt context caching and web performance.
Keep your analysis structured, insightful, and concise.`;
  } else if (req.task === 'reskin') {
    userPrompt = `The user wants to restyle / re-skin this crushed document.
User prompt: "${req.prompt || 'Modern Clean Scientific Theme'}"

Current variables and color tokens:
${JSON.stringify(req.contextData?.parametrics || [], null, 2)}

Return a strict JSON object with suggested updated parameter values and theme explanation:
{
  "themeName": "Theme Title",
  "explanation": "Why this palette and style fits the user's intent",
  "updatedParameters": [
    { "id": "param_color_1", "currentValue": "#..." },
    { "id": "param_color_2", "currentValue": "#..." }
  ]
}
Return only valid JSON.`;
  } else if (req.task === 'auto-parametricize') {
    userPrompt = `Inspect the following crushed AST summary:
${JSON.stringify(req.contextData, null, 2)}

Identify high-impact parametric variables for an AI designer and templating engine.
Return a strict JSON array of proposed variables:
[
  {
    "id": "param_custom_1",
    "label": "Human Readable Label",
    "type": "color" | "text" | "number",
    "defaultValue": "...",
    "category": "theme" | "typography" | "content" | "layout" | "scientific",
    "description": "What this controls"
  }
]
Return only valid JSON.`;
  } else {
    // synthesize-html
    userPrompt = `Generate a complete, modern, valid single-file HTML document for:
"${req.prompt || 'Interactive Scientific Protein Dashboard'}"

Requirements:
- Clean semantic HTML5 with CSS in <style> and scripts in <script>.
- If scientific, follow publication-grade clean design with UniProt/AlphaFold/PubChem style cards.
- If using external modules, use <script type="importmap"> with ESM CDN (e.g. https://esm.sh/).
- Provide interactive JS logic (counters, toggles, filters) in a clean <script> tag.
- Return ONLY the raw HTML code starting with <!DOCTYPE html>.`;
  }

  const response = await client.models.generateContent({
    model: selectedModel,
    contents: userPrompt,
    config: {
      systemInstruction,
      temperature: req.task === 'reskin' || req.task === 'auto-parametricize' ? 0.2 : 0.7,
    },
  });

  const text = response.text || '';
  let parsedJson: any = null;

  if (req.task === 'reskin' || req.task === 'auto-parametricize') {
    try {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedJson = JSON.parse(cleaned);
    } catch {
      // Return raw text if not parseable
    }
  }

  return {
    result: text,
    data: parsedJson,
  };
}
