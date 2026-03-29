/**
 * LiviPro™ Idle Discovery Service
 * Autonomously enriches linguistic knowledge in the background.
 */

const HF_SEARCH_URL = "https://huggingface.co/api/models?search=wolof&sort=downloads";

export async function backgroundDiscovery() {
  console.log("🌙 LiviPro Idle Mode: Searching for linguistic updates...");
  
  try {
    // 1. Scan for new specialized models or datasets
    const response = await fetch(HF_SEARCH_URL);
    const models = await response.json();
    
    // 2. Locate the most promising recent Wolof models
    const topModel = models[0];
    if (topModel) {
      console.log(`✨ Discovery: New AI Soul found -> ${topModel.modelId}`);
      // Notify admin or log for auto-update simulation
      localStorage.setItem('livipro_latest_ai_discovery', topModel.modelId);
    }
    
    // 3. Simulated Phonetic Vocabulary Cloud Sync
    // We fetch a shared dictionary of Senegalese slang/nicknames for products
    // Ex: "Thieb" = "Riz", "Galsen" = "Senegal"
    const newAliases = {
      "galsen": "senegal",
      "daara": "shop",
      "derren": "wallet"
    };
    
    const brain = JSON.parse(localStorage.getItem('livipro_phonetic_brain') || '{}');
    let enriched = false;
    
    Object.keys(newAliases).forEach(alias => {
        if (!brain[alias]) {
            brain[alias] = newAliases[alias];
            enriched = true;
        }
    });
    
    if (enriched) {
        localStorage.setItem('livipro_phonetic_brain', JSON.stringify(brain));
        console.log("🧠 Phonetic Brain Enriched with Cloud Data (Background Sync)");
    }

  } catch (err) {
    console.warn("Background Discovery paused: Network limit or offline.", err);
  }
}

/**
 * Initializes the Idle detection (5 min rest)
 */
export function initIdleDiscovery() {
  let idleTimer;
  
  const resetTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(backgroundDiscovery, 300000); // 5 minutes
  };

  window.addEventListener('mousemove', resetTimer);
  window.addEventListener('keypress', resetTimer);
  window.addEventListener('touchstart', resetTimer);

  resetTimer();
}
