const fs = require('fs');

// 1. TA LISTE DE JEUX COMPLETE
// Format: [ID, Titre, CatIndex, TypeIndex, Editeur, Auteur, Stand, Joueurs, Temps, Description, UrlMyLudo, UrlBGG]
const rawGames = [
  // --- COPIE COLLE TOUTES TES DONNEES ICI ---
  [1, "Flip 7", 2, 4, "Catch Up Games", "Eric S. Burgess", "10.01", "3-8", "20 min", "Stop-ou-encore addictif...", "https://www.myludo.fr/#!/game/flip-7-62854", "https://boardgamegeek.com/boardgame/420087/flip-7"],
  // ... Ajoute tout le reste
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchBggImage(bggUrl, title) {
  if (!bggUrl) return null;
  const match = bggUrl.match(/\/boardgame\/(\d+)/);
  const id = match ? match[1] : null;
  if (!id) return null;

  try {
    const url = `https://boardgamegeek.com/xmlapi2/thing?id=${id}`;
    const res = await fetch(url);
    if (!res.ok) {
        if (res.status === 429) console.log("⚠️ Limite API atteinte, ralentissement...");
        return null;
    }
    const txt = await res.text();
    const thumbMatch = txt.match(/<thumbnail>(.*?)<\/thumbnail>/);
    return thumbMatch ? thumbMatch[1] : null;
  } catch (e) {
    return null;
  }
}

async function run() {
  console.log("🚀 Démarrage de la récupération des images...");
  console.log("☕ Cela va prendre environ 2 à 3 secondes par jeu pour éviter d'être banni par BGG.");

  const enrichedGames = [];

  for (const game of rawGames) {
    const title = game[1];
    const bggUrl = game[11];
    
    process.stdout.write(`⏳ Récupération : ${title}... `);
    
    const imageUrl = await fetchBggImage(bggUrl, title);
    
    // On ajoute l'URL de l'image comme 13ème colonne (index 12)
    enrichedGames.push([...game, imageUrl]);

    if (imageUrl) console.log("✅");
    else console.log("❌");

    // Pause de 2.5 secondes pour rester sous les radars de BGG
    await sleep(2500);
  }

  const fileContent = `
// FICHIER GÉNÉRÉ AUTOMATIQUEMENT LE ${new Date().toLocaleDateString()}
const CAT = ["Catalogue", "Nouveauté", "As d'Or", "Perso"];
const TYPE = ["Tout Public", "Initié", "Expert", "Enfant", "Ambiance", "Duel"];

const rawGames = ${JSON.stringify(enrichedGames, null, 2)};

export const initialGames = rawGames.map(g => ({
  id: g[0],
  title: g[1],
  category: CAT[g[2]],
  type: TYPE[g[3]],
  publisher: g[4],
  author: g[5],
  stand: g[6],
  players: g[7],
  duration: g[8],
  description: g[9],
  myludoUrl: g[10],
  bggUrl: g[11],
  imageUrl: g[12]
}));
`;

  fs.writeFileSync('src/gamesDataFixed.js', fileContent);
  console.log("\n🎉 TERMINÉ ! Nouveau fichier créé : src/gamesDataFixed.js");
}

run();