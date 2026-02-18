
// FICHIER GÉNÉRÉ AUTOMATIQUEMENT LE 18/02/2026
const CAT = ["Catalogue", "Nouveauté", "As d'Or", "Perso"];
const TYPE = ["Tout Public", "Initié", "Expert", "Enfant", "Ambiance", "Duel"];

const rawGames = [
  [
    1,
    "Flip 7",
    2,
    4,
    "Catch Up Games",
    "Eric S. Burgess",
    "10.01",
    "3-8",
    "20 min",
    "Stop-ou-encore addictif...",
    "https://www.myludo.fr/#!/game/flip-7-62854",
    "https://boardgamegeek.com/boardgame/420087/flip-7",
    null
  ]
];

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
