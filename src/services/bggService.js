// src/services/bggService.js
const PROXY = "https://api.allorigins.win/get?url=";
const BGG_ROOT = "https://boardgamegeek.com/xmlapi2/";

export const fetchBggThumbnail = async (title) => {
  if (!title) return null;

  try {
    // ÉTAPE 1 : Recherche de l'ID par le nom du jeu
    const searchUrl = `${BGG_ROOT}search?query=${encodeURIComponent(title)}&type=boardgame&exact=1`;
    const searchRes = await fetch(`${PROXY}${encodeURIComponent(searchUrl)}`);
    const searchJson = await searchRes.json();
    
    const parser = new DOMParser();
    const searchXml = parser.parseFromString(searchJson.contents, "text/xml");
    const item = searchXml.querySelector("item");
    
    if (!item) return null;
    const bggId = item.getAttribute("id");

    // ÉTAPE 2 : Récupération du thumbnail avec l'ID
    const thingUrl = `${BGG_ROOT}thing?id=${bggId}`;
    const thingRes = await fetch(`${PROXY}${encodeURIComponent(thingUrl)}`);
    const thingJson = await thingRes.json();
    
    const thingXml = parser.parseFromString(thingJson.contents, "text/xml");
    const thumbNode = thingXml.querySelector("thumbnail");

    return thumbNode ? thumbNode.textContent : null;
  } catch (error) {
    console.warn(`Erreur BGG pour ${title}:`, error);
    return null;
  }
};