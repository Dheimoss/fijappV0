import React, { useState, useMemo, useEffect } from 'react';
import { initialGames } from './gamesData';
import { 
  Heart, MapPin, Trophy, Search, 
  Package, Layers, X, Plus, 
  Clock, Users, PenTool, Edit2, CheckCircle2 
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  // NOUVEAU : État pour stocker les jeux testés
  const [tested, setTested] = useState([]); 
  const [filterType, setFilterType] = useState('Tous');
  
  const [customGames, setCustomGames] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGameId, setEditingGameId] = useState(null);

  const emptyGame = {
    title: '', publisher: '', author: '', stand: '', type: 'Tout Public',
    description: '', players: '', duration: ''
  };

  const [newGame, setNewGame] = useState(emptyGame);

  useEffect(() => {
    if (!document.getElementById('tailwindcss-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwindcss-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }
  }, []);

  const normalizeText = (text) => 
    (text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const allGames = useMemo(() => {
    const baseWithEdits = initialGames.map(bg => {
      const edited = customGames.find(cg => cg.id === bg.id);
      return edited || bg;
    });
    const trulyNew = customGames.filter(cg => !initialGames.find(bg => bg.id === cg.id));
    return [...baseWithEdits, ...trulyNew];
  }, [customGames]);

  const filteredGames = useMemo(() => {
    const term = normalizeText(searchTerm);
    return allGames.filter(g => {
      const matchSearch = normalizeText(g.title).includes(term) || 
                          normalizeText(g.publisher).includes(term) ||
                          normalizeText(g.author).includes(term) ||
                          normalizeText(g.stand).includes(term);
      const matchFilter = filterType === "Tous" || g.type === filterType;
      
      if (activeTab === 'asdor') return matchSearch && matchFilter && g.category === "As d'Or";
      if (activeTab === 'news') return matchSearch && matchFilter && g.category === "Nouveauté";
      if (activeTab === 'mylist') return matchSearch && favorites.includes(g.id);
      // Optionnel : Si vous voulez un onglet pour les jeux testés, on pourrait l'ajouter ici
      return matchSearch && matchFilter;
    });
  }, [searchTerm, activeTab, favorites, filterType, allGames]);

  const openEditModal = (game, e) => {
    e.stopPropagation();
    setNewGame({...game});
    setEditingGameId(game.id);
    setIsModalOpen(true);
  };

  const handleSaveGame = (e) => {
    e.preventDefault();
    if (!newGame.title) return;

    const gameToSave = { 
      ...newGame, 
      id: editingGameId || `custom-${Date.now()}`, 
      category: editingGameId ? newGame.category : 'Perso' 
    };

    if (editingGameId) {
      setCustomGames(prev => prev.map(g => g.id === editingGameId ? gameToSave : g));
    } else {
      setCustomGames(prev => [gameToSave, ...prev]);
    }
    
    setIsModalOpen(false);
    setEditingGameId(null);
    setNewGame(emptyGame);
  };

  // Fonction pour basculer l'état "Testé"
  const toggleTested = (id) => {
    setTested(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 font-sans selection:bg-indigo-100">
      <header className="bg-white border-b sticky top-0 z-50 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg"><Layers size={24} /></div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-tighter leading-none">FIJ CANNES <span className="text-indigo-600">2026</span></h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{allGames.length} Jeux</p>
              </div>
            </div>
            <button onClick={() => { setEditingGameId(null); setNewGame(emptyGame); setIsModalOpen(true); }} className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95">
              <Plus size={20} /><span className="hidden sm:inline text-xs font-black uppercase">Ajouter</span>
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Rechercher..." className="w-full pl-11 pr-4 py-3 bg-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="flex gap-6 overflow-x-auto no-scrollbar pt-1">
            {[{ id: 'all', label: 'Catalogue', icon: Package }, { id: 'asdor', label: "As d'Or", icon: Trophy }, { id: 'mylist', label: 'Ma Liste', icon: Heart }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 pb-2 border-b-2 font-black text-xs uppercase transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}><tab.icon size={14} />{tab.label}</button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar justify-center">
          {["Tous", "Tout Public", "Initié", "Expert", "Enfant", "Ambiance", "Duel"].map(t => (
            <button key={t} onClick={() => setFilterType(t)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${filterType === t ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200'}`}>{t}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map(game => (
            <div key={game.id} className={`bg-white rounded-[1.5rem] border p-5 flex flex-col group hover:shadow-xl transition-all relative ${tested.includes(game.id) ? 'border-green-200 bg-green-50/30' : ''}`}>
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 pr-2">
                  <h3 className="font-black text-lg leading-tight mb-1">{game.title}</h3>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate"><PenTool size={12} /> {game.author || "Anonyme"}</div>
                </div>
                
                {/* ACTIONS (Coeur, Testé, Edit) */}
                <div className="flex gap-1 shrink-0">
                  {/* BOUTON TESTÉ */}
                  <button 
                    onClick={() => toggleTested(game.id)} 
                    title="Marquer comme testé"
                    className={`p-2 rounded-full transition-all ${tested.includes(game.id) ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-300 hover:text-green-500'}`}
                  >
                    <CheckCircle2 size={18} />
                  </button>

                  <button onClick={() => setFavorites(prev => prev.includes(game.id) ? prev.filter(f => f !== game.id) : [...prev, game.id])} className={`p-2 rounded-full transition-all ${favorites.includes(game.id) ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-300 hover:text-red-400'}`}>
                    <Heart size={18} fill={favorites.includes(game.id) ? "currentColor" : "none"} />
                  </button>
                  <button onClick={(e) => openEditModal(game, e)} className="p-2 rounded-full bg-slate-50 text-slate-300 hover:text-indigo-600 transition-all">
                    <Edit2 size={18} />
                  </button>
                </div>
              </div>
              
              <p className="text-slate-500 text-xs line-clamp-3 italic mb-4 leading-relaxed">"{game.description}"</p>
              
              <div className="mt-auto pt-4 border-t flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-indigo-600 font-black text-[11px] uppercase tracking-widest truncate max-w-[120px]">{game.publisher}</span>
                  <span className="text-amber-600 font-bold text-[10px] flex items-center gap-1 uppercase tracking-tighter"><MapPin size={10}/> Stand {game.stand}</span>
                </div>
                
                {/* INFO JOUEURS ET DURÉE */}
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase">
                    <Users size={12}/> {game.players}
                  </div>
                  {/* AJOUT DURÉE ICI */}
                  <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase">
                    <Clock size={12}/> {game.duration}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-indigo-950/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-[2rem] md:rounded-[1.5rem] shadow-2xl flex flex-col">
            <div className="px-6 py-5 bg-indigo-600 text-white flex justify-between items-center shrink-0">
              <h3 className="text-lg font-black uppercase tracking-tight">{editingGameId ? "Modifier" : "Nouveau Jeu"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveGame} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Titre *</label>
                <input required className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" value={newGame.title} onChange={e => setNewGame({...newGame, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Auteur</label>
                  <input className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" value={newGame.author} onChange={e => setNewGame({...newGame, author: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Stand</label>
                  <input className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" value={newGame.stand} onChange={e => setNewGame({...newGame, stand: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Éditeur</label>
                  <input className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" value={newGame.publisher} onChange={e => setNewGame({...newGame, publisher: e.target.value})} />
                </div>
                
                {/* Groupe Joueurs + Durée */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Joueurs</label>
                    <input className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="2-4" value={newGame.players} onChange={e => setNewGame({...newGame, players: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Durée</label>
                    <input className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="30 min" value={newGame.duration} onChange={e => setNewGame({...newGame, duration: e.target.value})} />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Description</label>
                <textarea className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none h-24 resize-none focus:ring-2 focus:ring-indigo-500" value={newGame.description} onChange={e => setNewGame({...newGame, description: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase shadow-xl transition-all active:scale-95">
                {editingGameId ? "Mettre à jour" : "Ajouter au catalogue"}
              </button>
            </form>
          </div>
        </div>
      )}
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default App;