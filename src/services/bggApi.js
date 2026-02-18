// src/services/bggApi.js

// Petit cache pour ne pas rappeler l'API 50 fois pour le même jeu
const imageCache = {};

export const fetchGameImage = async (bggUrl, title) => {
  const cacheKey = bggUrl || title;
  
  // 1. Vérifier le cache
  if (imageCache[cacheKey]) return imageCache[cacheKey];

  // NOUVEAU PROXY : corsproxy.io (plus fiable que allorigins)
  const proxyUrl = "https://corsproxy.io/?";
  
  try {
    let gameId = null;

    // ÉTAPE A : Essayer de trouver l'ID depuis l'URL fournie (C'est le plus fiable)
    if (bggUrl) {
      const match = bggUrl.match(/\/boardgame\/(\d+)/);
      if (match) {
        gameId = match[1];
      }
    }

    // ÉTAPE B : Si pas d'ID, faire une recherche par titre (Plan B, plus lent)
    // On utilise encodeURIComponent pour sécuriser l'URL dans le proxy
    if (!gameId && title) {
      const searchUrl = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(title)}&type=boardgame&exact=1`;
      const fullUrl = proxyUrl + encodeURIComponent(searchUrl);

      const searchRes = await fetch(fullUrl);
      if (!searchRes.ok) throw new Error("Erreur Proxy Search");

      // MODIFICATION : corsproxy renvoie du texte XML directement (pas de JSON wrapping)
      const searchXmlText = await searchRes.text();
      
      const parser = new DOMParser();
      const searchXml = parser.parseFromString(searchXmlText, "text/xml");
      const item = searchXml.querySelector("item");
      
      if (item) gameId = item.getAttribute("id");
    }

    if (!gameId) return null; // Impossible de trouver le jeu

    // ÉTAPE C : Récupération de l'image via l'ID
    const thingUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${gameId}`;
    const fullThingUrl = proxyUrl + encodeURIComponent(thingUrl);

    const thingRes = await fetch(fullThingUrl);
    if (!thingRes.ok) throw new Error("Erreur Proxy Thing");

    // MODIFICATION : Lecture en tant que texte
    const thingXmlText = await thingRes.text();
    
    const parser = new DOMParser();
    const thingXml = parser.parseFromString(thingXmlText, "text/xml");
    
    // On cherche l'image (thumbnail)
    const thumbNode = thingXml.querySelector("thumbnail"); 

    if (thumbNode) {
      const url = thumbNode.textContent;
      imageCache[cacheKey] = url; // Mise en cache
      return url;
    }
    
    return null;

  } catch (err) {
    // On garde le silence dans la console pour ne pas avoir de rouge partout si ça échoue
    // console.warn("Erreur BGG pour : " + title); 
    return null;
  }
};