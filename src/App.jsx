import React, { useState, useMemo, useEffect } from 'react';
import { initialGames } from './gamesData';
import { 
  Heart, MapPin, Trophy, Search, 
  Package, CheckCircle2, ExternalLink, 
  Clock, Users, X, Plus, BookOpen, Dices, Share2
} from 'lucide-react';

const App = () => {
  // --- PERSISTANCE SÉCURISÉE (Favoris & Testés) ---
  const [favorites, setFavorites] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('favs');
    if (shared && shared.trim() !== "") return shared.split(',').map(Number);
    return JSON.parse(localStorage.getItem('fij2026_favorites') || '[]');
  });
  
  const [tested, setTested] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedTested = params.get('test');
    if (sharedTested && sharedTested.trim() !== "") return sharedTested.split(',').map(Number);
    return JSON.parse(localStorage.getItem('fij2026_tested') || '[]');
  });

  const [customGames, setCustomGames] = useState(() => JSON.parse(localStorage.getItem('fij2026_customGames') || '[]'));
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => localStorage.setItem('fij2026_favorites', JSON.stringify(favorites)), [favorites]);
  useEffect(() => localStorage.setItem('fij2026_tested', JSON.stringify(tested)), [tested]);
  useEffect(() => localStorage.setItem('fij2026_customGames', JSON.stringify(customGames)), [customGames]);

  // --- PARTAGE ---
  const shareMyList = () => {
    const baseUrl = window.location.href.split('?')[0];
    const shareUrl = `${baseUrl}?favs=${favorites.join(',')}&test=${tested.join(',')}`;
    if (navigator.share) {
      navigator.share({ title: 'Ma liste FIJ 2026', url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Lien copié dans le presse-papier !");
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
      if (!term) return true;
      return normalize(g.title).includes(term) || normalize(g.publisher).includes(term) || 
             normalize(g.author).includes(term) || normalize(g.stand).includes(term);
    });

    const counts = {
      mylist: searched.filter(g => favorites.includes(g.id)).length,
      tested: searched.filter(g => tested.includes(g.id)).length,
      all: searched.length,
      asdor: searched.filter(g => g.category.includes("As d'Or")).length
    };

    const finalItems = searched.filter(g => {
      if (activeTab === 'mylist') return favorites.includes(g.id);
      if (activeTab === 'tested') return tested.includes(g.id);
      if (activeTab === 'asdor') return g.category.includes("As d'Or");
      return true;
    });

    return { finalItems, counts };
  }, [allGames, searchTerm, activeTab, favorites, tested]);

  const toggleFavorite = (id) => setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleTested = (id) => setTested(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

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
              <button onClick={shareMyList} className="bg-slate-100 text-slate-600 p-2.5 rounded-xl hover:bg-indigo-50 transition-all"><Share2 size={20} /></button>
              <button className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg active:scale-95 transition-transform"><Plus size={20} /></button>
            </div>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Rechercher..." className="w-full pl-11 pr-12 py-3 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><X size={18}/></button>}
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
                <div className="ml-auto text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase">{game.type}</div>
              </div>

              <p className="text-slate-500 text-[11px] italic mb-4 line-clamp-2 leading-relaxed">"{game.description}"</p>
              
              <div className="mt-auto pt-3 border-t flex justify-between items-center gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="flex-shrink-0 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                    {game.stand}
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 truncate">
                    {game.publisher}
                  </span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleTested(game.id); }} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 transition-all flex-shrink-0 whitespace-nowrap ${tested.includes(game.id) ? 'bg-green-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                  {tested.includes(game.id) ? 'Fait !' : 'On a test'} <CheckCircle2 size={12} className="flex-shrink-0" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

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
                <button onClick={() => toggleFavorite(selectedGame.id)} className={`p-2 rounded-full transition-all active:scale-125 ${favorites.includes(selectedGame.id) ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400'}`}>
                  <Heart size={24} fill={favorites.includes(selectedGame.id) ? "currentColor" : "none"} />
                </button>
                <button onClick={() => setSelectedGame(null)} className="bg-slate-100 p-2 rounded-full text-slate-500"><X size={24} /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-6 text-center">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100"><Users size={16} className="mx-auto mb-1 text-indigo-600"/><span className="text-[10px] font-black block">{selectedGame.players} j.</span></div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100"><Clock size={16} className="mx-auto mb-1 text-indigo-600"/><span className="text-[10px] font-black block">{selectedGame.duration}</span></div>
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100"><MapPin size={16} className="mx-auto mb-1 text-amber-600"/><span className="text-[10px] font-black block text-amber-700 uppercase">{selectedGame.stand}</span></div>
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