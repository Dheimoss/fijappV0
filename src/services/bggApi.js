// src/services/bggApi.js

/**
 * Utilise l'API BGG-JSON pour récupérer les données du jeu, 
 * incluant l'image de haute qualité.
 */
export const fetchGameData = async (bggId) => {
  if (!bggId) return null;

  try {
    // Cette API transforme le XML de BGG en JSON proprement
    const response = await fetch(`https://bgg-json.azurewebsites.net/thing/${bggId}`);
    
    if (!response.ok) throw new Error("Erreur BGG-JSON");
    
    const data = await response.json();
    
    // L'API renvoie 'image' ou 'thumbnail'
    return data.image || data.thumbnail || null;
  } catch (error) {
    console.error(`Erreur BGG-JSON pour l'ID ${bggId}:`, error);
    return null;
  }
};