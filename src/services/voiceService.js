/**
 * LiviVoice™ AI Service 
 * Connects to Hugging Face Inference API for high-precision Wolof/French speech recognition.
 */

// Specialized Wolof Whisper model
const HF_MODEL = "dofbi/wolof-asr"; 
const API_TOKEN = import.meta.env.VITE_HF_API_TOKEN || ""; 

// Internal "Phonetic Brain" - Loaded from storage to allow learning
let learnedAliases = JSON.parse(localStorage.getItem('livipro_phonetic_brain') || '{}');

export async function transcribeWolofAI(audioBlob) {
  if (!API_TOKEN) {
    console.warn("⚠️ LiviPro Warning: Missing VITE_HF_API_TOKEN. Using Local fallback.");
    return null; // Triggers the 'Dites par exemple...' or text-input fallback
  }

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
      method: "POST", body: audioBlob,
    });
    const result = await response.json();
    return result.text || "";
  } catch (error) {
    console.error("LiviVoice AI Error:", error);
    return null;
  }
}

/**
 * Teaches LiviPro a new association between a sound and a product/action.
 * This is the core of the self-enriching system.
 */
export const learnPhonetic = (transcript, target) => {
  const norm = transcript.toLowerCase();
  learnedAliases[norm] = target;
  localStorage.setItem('livipro_phonetic_brain', JSON.stringify(learnedAliases));
  console.log(`🧠 LiviPro Learned: "${norm}" -> "${target}"`);
};

export const phoneticSearch = (text) => {
  const normalized = text.toLowerCase();
  
  // 1. Check learned aliases first (Self-Enrichment)
  for (const [alias, target] of Object.entries(learnedAliases)) {
    if (normalized.includes(alias)) return target;
  }

  // 2. Hardcoded defaults for Wolof
  if (normalized.includes("ceeb") || normalized.includes("thieb")) return "riz";
  if (normalized.includes("souk") || normalized.includes("soukeur")) return "sucre";
  if (normalized.includes("diwline")) return "huile";
  if (normalized.includes("khaalis")) return "wallet";
  
  return normalized;
};
