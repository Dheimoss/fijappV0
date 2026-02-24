import React, { useState, useMemo, useEffect } from 'react';
import { initialGames } from './gamesData';
import { 
  Heart, MapPin, Trophy, Search, 
  Package, CheckCircle2, ExternalLink, 
  Clock, Users, X, Plus, BookOpen, Dices, Share2
} from 'lucide-react';

const App = () => {
  // --- 1. PERSISTANCE & IMPORT ---
  const [favorites, setFavorites] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedFavs = params.get('favs');
    if (sharedFavs && sharedFavs.trim() !== "") {
      const parsed = sharedFavs.split(',').map(Number);
      localStorage.setItem('fij2026_favorites', JSON.stringify(parsed));
      return parsed;
    }
    return JSON.parse(localStorage.getItem('fij2026_favorites') || '[]');
  });
  
  const [tested, setTested] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedTest = params.get('test');
    if (sharedTest && sharedTest.trim() !== "") {
      const parsed = sharedTest.split(',').map(Number);
      localStorage.setItem('fij2026_tested', JSON.stringify(parsed));
      return parsed;
    }
    return JSON.parse(localStorage.getItem('fij2026_tested') || '[]');
  });

  const [customGames, setCustomGames] = useState(() => JSON.parse(localStorage.getItem('fij2026_customGames') || '[]'));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('favs') || params.get('test')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // --- 2. ÉTATS UI ---
  const [activeTab, setActiveTab] = useState(favorites.length > 0 ? 'mylist' : 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tous'); 
  const [selectedGame, setSelectedGame] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const emptyGame = { 
    title: '', publisher: '', author: '', stand: '', 
    type: 'Tout Public', category: 'Nouveauté', 
    description: '', players: '', duration: '' 
  };
  const [newGame, setNewGame] = useState(emptyGame);

  useEffect(() => localStorage.setItem('fij2026_favorites', JSON.stringify(favorites)), [favorites]);
  useEffect(() => localStorage.setItem('fij2026_tested', JSON.stringify(tested)), [tested]);
  useEffect(() => localStorage.setItem('fij2026_customGames', JSON.stringify(customGames)), [customGames]);

  // --- 3. ACTIONS ---
  const handleSaveGame = (e) => {
    e.preventDefault();
    if (!newGame.title) return;
    const gameToSave = { ...newGame, id: Date.now() };
    setCustomGames(prev => [gameToSave, ...prev]);
    setIsAddModalOpen(false);
    setNewGame(emptyGame);
  };

  const toggleFavorite = (id) => setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  
  const toggleTested = (id) => {
    setTested(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      setFavorites(f => f.filter(i => i !== id));
      return [...prev, id];
    });
  };

  const shareMyList = () => {
    const baseUrl = window.location.href.split('?')[0];
    const shareUrl = `${baseUrl}?favs=${favorites.join(',')}&test=${tested.join(',')}`;
    if (navigator.share) {
      navigator.share({ title: 'Ma liste FIJ 2026', url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Lien copié !");
    }
  };

  // --- 4. LOGIQUE FILTRAGE ---
  const allGames = useMemo(() => {
    const gamesMap = new Map();
    initialGames.forEach(g => gamesMap.set(g.id, g));
    customGames.forEach(g => gamesMap.set(g.id, g));
    return Array.from(gamesMap.values());
  }, [customGames]);

  const normalize = (t) => (t || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const displayData = useMemo(() => {
    const term = normalize(searchTerm);
    const activeFilter = normalize(filterType);
    
    const baseFiltered = allGames.filter(g => {
      const matchSearch = normalize(g.title).includes(term) || normalize(g.publisher).includes(term) || normalize(g.author).includes(term) || normalize(g.stand).includes(term);
      const matchType = activeFilter === "tous" || normalize(g.type) === activeFilter;
      return matchSearch && matchType;
    });

    const counts = {
      mylist: baseFiltered.filter(g => favorites.includes(g.id)).length,
      tested: baseFiltered.filter(g => tested.includes(g.id)).length,
      all: baseFiltered.length,
      asdor: baseFiltered.filter(g => normalize(g.category).includes("as d'or")).length
    };

    const finalItems = baseFiltered.filter(g => {
      if (activeTab === 'mylist') return favorites.includes(g.id);
      if (activeTab === 'tested') return tested.includes(g.id);
      if (activeTab === 'asdor') return normalize(g.category).includes("as d'or");
      return true;
    });

    return { finalItems, counts };
  }, [allGames, searchTerm, filterType, activeTab, favorites, tested]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 font-sans">
      <header className="bg-white border-b sticky top-0 z-50 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Dices className="text-indigo-600" size={28} />
              <h1 className="text-xl font-black uppercase italic tracking-tighter">FIJ <span className="text-indigo-600">2026</span></h1>
            </div>
            <div className="flex gap-2">
              <button onClick={shareMyList} className="bg-slate-100 text-slate-600 p-2.5 rounded-xl transition-all shadow-sm"><Share2 size={20} /></button>
              <button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg active:scale-95 transition-transform"><Plus size={20} /></button>
            </div>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Rechercher..." className="w-full pl-11 pr-12 py-3 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="flex flex-wrap gap-2 pb-3 mb-1">
            {["Tous", "Tout Public", "Initié", "Expert", "Enfant", "Ambiance", "Duel"].map(type => (
              <button key={type} onClick={() => setFilterType(type)} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all whitespace-nowrap border-2 ${filterType === type ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-400'}`}>{type}</button>
            ))}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 border-b border-slate-100 pb-1">
            {[{id:'mylist', label:'Mes Likes', icon:Heart}, {id:'tested', label:'Testés', icon:CheckCircle2}, {id:'all', label:'Liste', icon:Package}, {id:'asdor', label:"As d'Or", icon:Trophy}].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 pb-2 border-b-2 font-black text-[10px] uppercase transition-all whitespace-nowrap ${activeTab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>
                <t.icon size={14} /> {t.label} ({displayData.counts[t.id]})
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayData.finalItems.map(game => (
            <div key={game.id} onClick={() => setSelectedGame(game)} className={`bg-white rounded-[1.5rem] border p-5 flex flex-col hover:shadow-xl transition-all cursor-pointer group ${tested.includes(game.id) ? 'bg-green-50/50 border-green-200' : 'border-slate-100'}`}>
              <div className="flex justify-between mb-1">
                <h3 className="font-black text-lg leading-tight flex-1 group-hover:text-indigo-600">{game.title}</h3>
                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(game.id); }} className={`ml-2 transition-transform active:scale-125 ${favorites.includes(game.id) ? 'text-red-500' : 'text-slate-300'}`}>
                  <Heart size={20} fill={favorites.includes(game.id) ? "currentColor" : "none"} />
                </button>
              </div>
              <div className="flex items-center gap-3 text-slate-400 mb-3 font-bold text-[10px]">
                <div className="flex items-center gap-1"><Users size={12} /><span>{game.players}</span></div>
                <div className="flex items-center gap-1"><Clock size={12} /><span>{game.duration}</span></div>
                {/* ICI ON MET LE TYPE EN INDIGO PLUTÔT QUE LA CATÉGORIE */}
                <div className="ml-auto text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase">{game.type}</div>
              </div>
              <p className="text-slate-500 text-[11px] italic mb-4 line-clamp-2 leading-relaxed">"{game.description}"</p>
              <div className="mt-auto pt-3 border-t flex justify-between items-center gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="flex-shrink-0 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">{game.stand}</div>
                  <span className="text-[10px] font-black uppercase text-slate-400 truncate">{game.publisher}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleTested(game.id); }} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 transition-all flex-shrink-0 whitespace-nowrap ${tested.includes(game.id) ? 'bg-green-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                  {tested.includes(game.id) ? 'Fait !' : 'On a test'} <CheckCircle2 size={12} className="flex-shrink-0" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODALE AJOUT JEU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-indigo-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 my-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-indigo-600 uppercase">Ajouter un jeu</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="bg-slate-100 p-2 rounded-full"><X size={20}/></button>
            </div>
            <form onSubmit={handleSaveGame} className="space-y-3">
              <input required placeholder="Titre du jeu *" className="w-full bg-slate-100 p-3 rounded-xl outline-none" value={newGame.title} onChange={e => setNewGame({...newGame, title: e.target.value})} />
              <input placeholder="Auteur" className="w-full bg-slate-100 p-3 rounded-xl outline-none" value={newGame.author} onChange={e => setNewGame({...newGame, author: e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Éditeur" className="bg-slate-100 p-3 rounded-xl outline-none" value={newGame.publisher} onChange={e => setNewGame({...newGame, publisher: e.target.value})} />
                <input placeholder="Stand (ex: 12.01)" className="bg-slate-100 p-3 rounded-xl outline-none" value={newGame.stand} onChange={e => setNewGame({...newGame, stand: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Joueurs (ex: 2-4)" className="bg-slate-100 p-3 rounded-xl outline-none" value={newGame.players} onChange={e => setNewGame({...newGame, players: e.target.value})} />
                <input placeholder="Durée (ex: 30 min)" className="bg-slate-100 p-3 rounded-xl outline-none" value={newGame.duration} onChange={e => setNewGame({...newGame, duration: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select className="bg-slate-100 p-3 rounded-xl outline-none font-bold text-xs" value={newGame.category} onChange={e => setNewGame({...newGame, category: e.target.value})}>
                  {["Nouveauté", "As d'Or", "Catalogue"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="bg-slate-100 p-3 rounded-xl outline-none font-bold text-xs" value={newGame.type} onChange={e => setNewGame({...newGame, type: e.target.value})}>
                  {["Tout Public", "Initié", "Expert", "Enfant", "Ambiance", "Duel"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <textarea placeholder="Petit pitch rapide..." className="w-full bg-slate-100 p-3 rounded-xl outline-none h-20" value={newGame.description} onChange={e => setNewGame({...newGame, description: e.target.value})} />
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase shadow-lg">Enregistrer</button>
            </form>
          </div>
        </div>
      )}

      {/* MODALE DÉTAILS */}
      {selectedGame && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-indigo-950/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedGame(null)}>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 relative animate-in zoom-in-95 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6 text-left">
              <div>
                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase mb-2 inline-block">{selectedGame.category}</span>
                <h2 className="text-4xl font-black text-slate-900 leading-none mb-1">{selectedGame.title}</h2>
                <p className="text-sm font-bold text-slate-400 uppercase">Par {selectedGame.author || "Inconnu"}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleFavorite(selectedGame.id)} className={`p-2 rounded-full transition-all ${favorites.includes(selectedGame.id) ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400'}`}>
                  <Heart size={24} fill={favorites.includes(selectedGame.id) ? "currentColor" : "none"} />
                </button>
                <button onClick={() => setSelectedGame(null)} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-6 text-center text-[10px] font-black">
              <div className="bg-slate-50 p-3 rounded-2xl border"><Users size={16} className="mx-auto mb-1 text-indigo-600"/>{selectedGame.players || "?"} j.</div>
              <div className="bg-slate-50 p-3 rounded-2xl border"><Clock size={16} className="mx-auto mb-1 text-indigo-600"/>{selectedGame.duration || "?"}</div>
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-amber-700 uppercase"><MapPin size={16} className="mx-auto mb-1 text-amber-600"/>{selectedGame.stand || "?"}</div>
            </div>
            <div className="bg-slate-50 p-5 rounded-3xl mb-8 relative border shadow-inner text-sm text-slate-700 leading-relaxed max-h-56 overflow-y-auto italic">
              <BookOpen size={20} className="absolute -top-2 -right-2 text-indigo-600 bg-white rounded-full p-1 shadow-sm border" />
              {selectedGame.longDescription || selectedGame.description || "Pas de description."}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <a href={selectedGame.myludoUrl || `https://www.myludo.fr/#!/search/${selectedGame.title}`} target="_blank" rel="noreferrer" className="bg-[#364958] text-white py-4 rounded-2xl text-[10px] font-black text-center uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"><ExternalLink size={14}/> MyLudo</a>
              <a href={selectedGame.bggUrl || `https://boardgamegeek.com/geeksearch.php?action=search&objecttype=boardgame&q=${selectedGame.title}`} target="_blank" rel="noreferrer" className="bg-[#FF5100] text-white py-4 rounded-2xl text-[10px] font-black text-center uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"><ExternalLink size={14}/> BGG</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;