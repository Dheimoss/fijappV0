// src/services/bggApi.js

const BGG_ROOT = "https://boardgamegeek.com/xmlapi2/";
const PROXY = "https://api.allorigins.win/get?url=";

export const fetchBggThumbnail = async (bggId, title) => {
  const parser = new DOMParser();
  let finalId = bggId;

  try {
    // ÉTAPE 1 : Si on n'a pas d'ID, on fait une recherche par titre
    if (!finalId && title) {
      const searchUrl = `${BGG_ROOT}search?query=${encodeURIComponent(title)}&type=boardgame&exact=1`;
      const searchRes = await fetch(`${PROXY}${encodeURIComponent(searchUrl)}`);
      const searchData = await searchRes.json();
      const searchXml = parser.parseFromString(searchData.contents, "text/xml");
      
      const item = searchXml.querySelector("item");
      if (item) {
        finalId = item.getAttribute("id");
      }
    }

    if (!finalId) return null;

    // ÉTAPE 2 : Récupération de l'image avec l'ID final
    const thingUrl = `${BGG_ROOT}thing?id=${finalId}`;
    const thingRes = await fetch(`${PROXY}${encodeURIComponent(thingUrl)}`);
    const thingData = await thingRes.json();
    const thingXml = parser.parseFromString(thingData.contents, "text/xml");
    
    const thumbnail = thingXml.querySelector("thumbnail")?.textContent;
    return thumbnail || null;
  } catch (error) {
    console.error(`Erreur BGG pour ${title || bggId}:`, error);
    return null;
  }
};