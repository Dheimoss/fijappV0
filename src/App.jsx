import React, { useState, useMemo, useEffect } from 'react';
import { initialGames } from './gamesData';
import { 
  Heart, MapPin, Trophy, Search, 
  Package, CheckCircle2, ExternalLink, 
  Clock, Users, X, Plus, BookOpen, Dices, Share2
} from 'lucide-react';

const App = () => {
  // --- ÉTATS ---
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('fij2026_favorites') || '[]'));
  const [tested, setTested] = useState(() => JSON.parse(localStorage.getItem('fij2026_tested') || '[]'));
  const [customGames, setCustomGames] = useState(() => JSON.parse(localStorage.getItem('fij2026_customGames') || '[]'));
  
  const [activeTab, setActiveTab] = useState(() => favorites.length > 0 ? 'mylist' : 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tous');
  const [selectedGame, setSelectedGame] = useState(null);

  // --- LOGIQUE D'IMPORTATION (Base64 + Confirmation) ---
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
          
          // Nettoyage de l'URL pour éviter les imports en boucle
          window.history.replaceState({}, document.title, window.location.pathname);
          alert("Importation réussie !");
        }
      } catch (err) {
        console.error("Erreur d'importation :", err);
      }
    }
  }, []);

  // --- PERSISTANCE ---
  useEffect(() => localStorage.setItem('fij2026_favorites', JSON.stringify(favorites)), [favorites]);
  useEffect(() => localStorage.setItem('fij2026_tested', JSON.stringify(tested)), [tested]);
  useEffect(() => localStorage.setItem('fij2026_customGames', JSON.stringify(customGames)), [customGames]);

  // --- LOGIQUE DE PARTAGE (Identique à ton ancienne version) ---
  const shareMyList = () => {
    try {
      const data = {
        f: favorites,
        t: tested,
        c: customGames
      };
      
      const encodedData = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodedData}`;
      
      navigator.clipboard.writeText(shareUrl);
      alert("Lien de partage copié ! Envoyez ce lien à vos amis pour qu'ils voient vos jeux.");
      
      // Optionnel : Tentative de partage natif si mobile
      if (navigator.share) {
        navigator.share({
          title: 'Ma liste FIJ 2026',
          url: shareUrl,
        }).catch(() => {});
      }
    } catch (err) {
      alert("Erreur lors de la création du lien.");
    }
  };

  // --- FUSION ET FILTRAGE ---
  const allGames = useMemo(() => {
    const gamesMap = new Map();
    initialGames.forEach(g => gamesMap.set(g.id, g));
    customGames.forEach(g => gamesMap.set(g.id, g));
    return Array.from(gamesMap.values());
  }, [customGames]);

  const normalize = (t) => (t || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const displayData = useMemo(() => {
    const term = normalize(searchTerm);
    const searched = allGames.filter(g => {
      const matchText = !term || normalize(g.title).includes(term) || normalize(g.publisher).includes(term) || normalize(g.author).includes(term) || normalize(g.stand).includes(term);
      const matchType = filterType === 'Tous' || g.type === filterType;
      return matchText && matchType;
    });

    const counts = {
      mylist: searched.filter(g => favorites.includes(g.id)).length,
      tested: searched.filter(g => tested.includes(g.id)).length,
      all: searched.length,
      asdor: searched.filter(g => g.category === "As d'Or").length
    };

    const finalItems = searched.filter(g => {
      if (activeTab === 'mylist') return favorites.includes(g.id);
      if (activeTab === 'tested') return tested.includes(g.id);
      if (activeTab === 'asdor') return g.category === "As d'Or";
      return true;
    });

    return { finalItems, counts };
  }, [allGames, searchTerm, filterType, activeTab, favorites, tested]);

  const toggleFavorite = (id) => setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleTested = (id) => setTested(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      setFavorites(f => f.filter(i => i !== id));
      return [...prev, id];
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 font-sans text-[13px]">
      <header className="bg-white border-b sticky top-0 z-50 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Dices className="text-indigo-600" size={28} />
              <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">FIJ <span className="text-indigo-600">2026</span></h1>
            </div>
            <div className="flex gap-2">
              <button onClick={shareMyList} className="bg-slate-100 text-slate-600 p-2.5 rounded-xl transition-all active:scale-90 hover:bg-slate-200">
                <Share2 size={20} />
              </button>
              <button className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg active:scale-95 transition-transform">
                <Plus size={20} />
              </button>
            </div>
          </div>
          
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Titre, auteur, stand..." className="w-full pl-11 pr-12 py-3 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><X size={18}/></button>}
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
            {['Tous', 'Enfants', 'Famille', 'Initié', 'Expert'].map(type => (
              <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all whitespace-nowrap ${filterType === type ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                {type}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 border-b border-slate-100 pb-1">
            {[{id:'mylist', label:'Likes', icon:Heart}, {id:'tested', label:'Testés', icon:CheckCircle2}, {id:'all', label:'Tous', icon:Package}, {id:'asdor', label:"As d'Or", icon:Trophy}].map(t => (
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
            <div key={game.id} onClick={() => setSelectedGame(game)} className={`bg-white rounded-[1.5rem] border p-5 flex flex-col hover:shadow-xl transition-all cursor-pointer group ${tested.includes(game.id) ? 'bg-green-50/50 border-green-200 opacity-80' : 'border-slate-100'}`}>
              <div className="flex justify-between items-start mb-0.5">
                <h3 className="font-black text-lg leading-tight flex-1 group-hover:text-indigo-600 transition-colors truncate">{game.title}</h3>
                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(game.id); }} className={`ml-2 transition-transform active:scale-150 ${favorites.includes(game.id) ? 'text-red-500' : 'text-slate-300'}`}>
                  <Heart size={20} fill={favorites.includes(game.id) ? "currentColor" : "none"} />
                </button>
              </div>
              
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3 truncate">
                {game.author}
              </p>

              <div className="flex items-center gap-2 text-slate-400 mb-3 font-bold text-[10px]">
                <div className="flex items-center gap-1 flex-shrink-0"><Users size={12} /><span>{game.players}</span></div>
                <div className="flex items-center gap-1 flex-shrink-0"><Clock size={12} /><span>{game.duration}</span></div>
                <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg border border-amber-100 font-black tracking-tighter whitespace-nowrap">
                  <MapPin size={10} /><span>St {game.stand}</span>
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase tracking-widest">{game.type}</span>
              </div>

              <p className="text-slate-500 text-[11px] italic mb-4 line-clamp-2 leading-relaxed">"{game.description}"</p>
              
              <div className="mt-auto pt-3 border-t flex justify-between items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-400 truncate min-w-0">{game.publisher}</span>
                <button onClick={(e) => { e.stopPropagation(); toggleTested(game.id); }} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 transition-all flex-shrink-0 whitespace-nowrap ${tested.includes(game.id) ? 'bg-green-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                  {tested.includes(game.id) ? 'Fait !' : 'On a test'} <CheckCircle2 size={12} className="flex-shrink-0" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODALE DÉTAILS */}
      {selectedGame && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-indigo-950/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedGame(null)}>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 relative animate-in zoom-in-95 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase mb-2 inline-block tracking-widest">{selectedGame.category}</span>
                <h2 className="text-4xl font-black text-slate-900 leading-none mb-1 tracking-tight">{selectedGame.title}</h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Par {selectedGame.author}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleFavorite(selectedGame.id)} className={`p-2 rounded-full transition-all active:scale-125 ${favorites.includes(selectedGame.id) ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400'}`}><Heart size={24} fill={favorites.includes(selectedGame.id) ? "currentColor" : "none"} /></button>
                <button onClick={() => setSelectedGame(null)} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200"><X size={24} /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100"><Users size={16} className="mx-auto mb-1 text-indigo-600"/><span className="text-[10px] font-black block">{selectedGame.players} j.</span></div>
              <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100"><Clock size={16} className="mx-auto mb-1 text-indigo-600"/><span className="text-[10px] font-black block">{selectedGame.duration}</span></div>
              <div className="bg-amber-50 p-3 rounded-2xl text-center border border-amber-100"><MapPin size={16} className="mx-auto mb-1 text-amber-600"/><span className="text-[10px] font-black block text-amber-700 uppercase tracking-tighter font-bold">St {selectedGame.stand}</span></div>
            </div>

            <div className="bg-slate-50 p-5 rounded-3xl mb-8 relative border border-slate-100 shadow-inner">
              <BookOpen size={20} className="absolute -top-2 -right-2 text-indigo-600 bg-white rounded-full p-1 shadow-sm border" />
              <h4 className="text-[10px] font-black uppercase text-indigo-400 mb-2 tracking-widest">Le pitch complet</h4>
              <div className="text-sm text-slate-700 leading-relaxed max-h-56 overflow-y-auto pr-2 custom-scrollbar italic font-medium">{selectedGame.longDescription || selectedGame.description}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <a href={selectedGame.myludoUrl} target="_blank" rel="noreferrer" className="bg-[#364958] text-white py-4 rounded-2xl text-[10px] font-black text-center uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"><ExternalLink size={14}/> MyLudo</a>
              <a href={selectedGame.bggUrl} target="_blank" rel="noreferrer" className="bg-[#FF5100] text-white py-4 rounded-2xl text-[10px] font-black text-center uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"><ExternalLink size={14}/> BGG</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;