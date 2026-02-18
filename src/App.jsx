import React, { useState, useMemo, useEffect } from 'react';
import { initialGames } from './gamesData';
import { 
  Heart, MapPin, Trophy, Search, 
  Package, Layers, Plus, 
  CheckCircle2, Share2, ExternalLink, 
  Clock, Users, X
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tous');
  
  // --- ÉTATS AVEC PERSISTANCE (Locale au navigateur) ---
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('fij2026_favorites') || '[]'));
  const [tested, setTested] = useState(() => JSON.parse(localStorage.getItem('fij2026_tested') || '[]'));
  const [customGames, setCustomGames] = useState(() => JSON.parse(localStorage.getItem('fij2026_customGames') || '[]'));

  // --- ÉTATS UI ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null); 
  
  // --- SYNC LOCALSTORAGE ---
  useEffect(() => localStorage.setItem('fij2026_favorites', JSON.stringify(favorites)), [favorites]);
  useEffect(() => localStorage.setItem('fij2026_tested', JSON.stringify(tested)), [tested]);
  useEffect(() => localStorage.setItem('fij2026_customGames', JSON.stringify(customGames)), [customGames]);

  // --- PARTAGE ---
  const shareMyList = () => {
    const data = { f: favorites, t: tested, c: customGames };
    const encodedData = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodedData}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Lien de partage copié ! Envoyez ce lien à vos amis pour qu'ils voient vos jeux.");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('share');
    if (sharedData) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(escape(atob(sharedData))));
        if (window.confirm("Importer la liste partagée (écrase vos données actuelles) ?")) {
          if (decodedData.f) setFavorites(decodedData.f);
          if (decodedData.t) setTested(decodedData.t);
          if (decodedData.c) setCustomGames(decodedData.c);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (e) { console.error("Erreur import", e); }
    }
  }, []);

  // --- GESTION DU NOUVEAU JEU ---
  const emptyGame = { 
    title: '', publisher: '', author: '', stand: '', 
    type: 'Tout Public', category: 'Perso', 
    description: '', players: '', duration: '',
    myludoUrl: '', bggUrl: '' 
  };
  const [newGame, setNewGame] = useState(emptyGame);

  const handleSaveGame = (e) => {
    e.preventDefault();
    if (!newGame.title) return alert("Le titre est obligatoire");

    const gameToSave = { 
        ...newGame, 
        id: `custom-${Date.now()}`,
        // Génération auto des liens si non remplis
        myludoUrl: newGame.myludoUrl || `https://www.myludo.fr/#!/search/${encodeURIComponent(newGame.title)}`,
        bggUrl: newGame.bggUrl || `https://boardgamegeek.com/geeksearch.php?action=search&objecttype=boardgame&q=${encodeURIComponent(newGame.title)}`
    };

    setCustomGames(prev => [gameToSave, ...prev]);
    setIsEditModalOpen(false);
    setNewGame(emptyGame);
  };

  // --- LOGIQUE DE FILTRAGE ---
  const normalizeText = (text) => (text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const allGames = useMemo(() => {
    const baseWithEdits = initialGames.map(bg => customGames.find(cg => cg.id === bg.id) || bg);
    const trulyNew = customGames.filter(cg => !initialGames.find(bg => bg.id === cg.id));
    return [...baseWithEdits, ...trulyNew];
  }, [customGames]);

  const filteredGames = useMemo(() => {
    const term = normalizeText(searchTerm);
    return allGames.filter(g => {
      const matchSearch = 
        normalizeText(g.title).includes(term) || 
        normalizeText(g.publisher).includes(term) || 
        normalizeText(g.stand).includes(term) ||
        normalizeText(g.author).includes(term);

      const matchFilter = filterType === "Tous" || g.type === filterType;

      if (activeTab === 'asdor') return matchSearch && matchFilter && g.category === "As d'Or";
      if (activeTab === 'mylist') return matchSearch && favorites.includes(g.id);
      if (activeTab === 'tested') return matchSearch && tested.includes(g.id);
      return matchSearch && matchFilter;
    });
  }, [searchTerm, activeTab, favorites, tested, filterType, allGames]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 font-sans">
      <header className="bg-white border-b sticky top-0 z-50 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg"><Layers size={24} /></div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-tighter leading-none">FIJ CANNES <span className="text-indigo-600">2026</span></h1>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button onClick={shareMyList} title="Partager ma liste" className="bg-slate-100 text-slate-600 p-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                <Share2 size={20} />
              </button>
              <button onClick={() => { setNewGame(emptyGame); setIsEditModalOpen(true); }} className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
                <Plus size={20} /><span className="hidden sm:inline text-xs font-black uppercase">Ajouter un jeu</span>
              </button>
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un jeu, un auteur, un stand..." 
              className="w-full pl-11 pr-4 py-3 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'Catalogue', icon: Package }, 
              { id: 'asdor', label: "As d'Or", icon: Trophy }, 
              { id: 'mylist', label: 'Ma Liste', icon: Heart },
              { id: 'tested', label: 'Testés', icon: CheckCircle2 }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 pb-2 border-b-2 font-black text-xs uppercase transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}><tab.icon size={14} />{tab.label}</button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map(game => (
            <div 
              key={game.id} 
              onClick={() => setSelectedGame(game)} 
              className={`bg-white rounded-[1.5rem] border p-5 flex flex-col group hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer relative ${tested.includes(game.id) ? 'border-green-200 bg-green-50/30' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 pr-2">
                  <h3 className="font-black text-lg leading-tight mb-1">{game.title}</h3>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{game.author}</div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setTested(prev => prev.includes(game.id) ? prev.filter(t => t !== game.id) : [...prev, game.id]) }} 
                    className={`p-2 rounded-full transition-colors ${tested.includes(game.id) ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}`}
                  >
                    <CheckCircle2 size={18} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFavorites(prev => prev.includes(game.id) ? prev.filter(f => f !== game.id) : [...prev, game.id]) }} 
                    className={`p-2 rounded-full transition-colors ${favorites.includes(game.id) ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}`}
                  >
                    <Heart size={18} fill={favorites.includes(game.id) ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
              <p className="text-slate-500 text-xs italic mb-4 line-clamp-3">"{game.description}"</p>
              <div className="mt-auto pt-4 border-t flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-indigo-600 font-black text-[11px] uppercase">{game.publisher}</span>
                  <span className="text-amber-600 font-bold text-[10px]">Stand {game.stand}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- MODALE DE DÉTAILS --- */}
      {selectedGame && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-indigo-950/60 backdrop-blur-sm" onClick={() => setSelectedGame(null)} />
            <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl p-6 relative z-10 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                            {selectedGame.category} / {selectedGame.type}
                        </span>
                        <h2 className="text-3xl font-black text-slate-900 leading-tight">{selectedGame.title}</h2>
                        <div className="text-sm font-bold text-slate-500 uppercase mt-1">De {selectedGame.author}</div>
                    </div>
                    <button onClick={() => setSelectedGame(null)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 text-slate-500">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex gap-4 mb-6">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs font-bold text-slate-600">
                        <Users size={14} /> {selectedGame.players || "?"}
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs font-bold text-slate-600">
                        <Clock size={14} /> {selectedGame.duration || "?"}
                    </div>
                    <div className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 ml-auto">
                        <MapPin size={14} /> Stand {selectedGame.stand || "N/A"}
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl mb-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase mb-2">Description</h3>
                    <p className="text-slate-700 text-sm leading-relaxed">{selectedGame.description || "Aucune description."}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <a href={selectedGame.myludoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#364958] text-white py-3 rounded-xl font-bold text-sm hover:opacity-90">
                        <ExternalLink size={16} /> MyLudo
                    </a>
                    <a href={selectedGame.bggUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#FF5100] text-white py-3 rounded-xl font-bold text-sm hover:opacity-90">
                        <ExternalLink size={16} /> BGG
                    </a>
                </div>
            </div>
        </div>
      )}

      {/* --- MODALE D'AJOUT COMPLÈTE --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-indigo-950/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[1.5rem] shadow-2xl p-6 my-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black uppercase">Ajouter un nouveau jeu</h3>
                <button onClick={() => setIsEditModalOpen(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSaveGame} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-2">Titre du jeu *</label>
                    <input required placeholder="Nom du jeu" className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500/20" value={newGame.title} onChange={e => setNewGame({...newGame, title: e.target.value})} />
                </div>
                
                <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-2">Auteur</label>
                    <input placeholder="Ex: Bruno Cathala" className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none" value={newGame.author} onChange={e => setNewGame({...newGame, author: e.target.value})} />
                </div>

                <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-2">Éditeur</label>
                    <input placeholder="Ex: Iello" className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none" value={newGame.publisher} onChange={e => setNewGame({...newGame, publisher: e.target.value})} />
                </div>

                <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-2">Stand</label>
                    <input placeholder="Ex: 12.01" className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none" value={newGame.stand} onChange={e => setNewGame({...newGame, stand: e.target.value})} />
                </div>

                <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-2">Type de public</label>
                    <select className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none" value={newGame.type} onChange={e => setNewGame({...newGame, type: e.target.value})}>
                        {["Tout Public", "Initié", "Expert", "Enfant", "Ambiance", "Duel"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-2">Joueurs</label>
                    <input placeholder="Ex: 2-4" className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none" value={newGame.players} onChange={e => setNewGame({...newGame, players: e.target.value})} />
                </div>

                <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-2">Durée</label>
                    <input placeholder="Ex: 30 min" className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none" value={newGame.duration} onChange={e => setNewGame({...newGame, duration: e.target.value})} />
                </div>

                <div className="md:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-2">Description</label>
                    <textarea rows="3" placeholder="Résumé du jeu..." className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none" value={newGame.description} onChange={e => setNewGame({...newGame, description: e.target.value})} />
                </div>

                <div className="md:col-span-2 flex gap-3 mt-4">
                    <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase shadow-lg hover:bg-indigo-700 transition-colors">
                        Sauvegarder le jeu
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;