import gamesRaw from './gamesData.json';

export const initialGames = gamesRaw.map(game => ({
  ...game,
  // Correction pour MyLudo avec le paramètre ?query=
  myludoUrl: `https://www.myludo.fr/#!/search?query=${encodeURIComponent(game.title)}`,
  // BGG Standard search
  bggUrl: `https://boardgamegeek.com/geeksearch.php?action=search&objecttype=boardgame&q=${encodeURIComponent(game.title)}`
}));