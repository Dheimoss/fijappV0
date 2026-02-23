import React, { useState, useMemo, useEffect } from 'react';
import { initialGames } from './gamesData';
import { Heart, MapPin, Trophy, Search, Package, CheckCircle2, ExternalLink, Clock, Users, X, Plus, BookOpen, Dices, Share2 } from 'lucide-react';

const App = () => {
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('f_fav') || '[]'));
  const [tested, setTested] = useState(() => JSON.parse(localStorage.getItem('f_tst') || '[]'));
  const [customGames, setCustomGames] = useState(() => JSON.parse(localStorage.getItem('f_cus') || '[]'));
  const [activeTab, setActiveTab] = useState(favorites.length > 0 ? 'mylist' : 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tous');
  const [selectedGame, setSelectedGame] = useState(null);

  // --- IMPORTATION (Favoris et Testés uniquement) ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('share');
    if (s) {
      try {
        const d = JSON.parse(decodeURIComponent(escape(atob(s))));
        if (window.confirm("Importer la liste partagée ?")) {
          if (d.f) setFavorites(d.f);
          if (d.t) setTested(d.t);
          window.history.replaceState({}, '', window.location.pathname);
          setActiveTab('mylist');
        }
      } catch (e) { console.error("Erreur import", e) }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('f_fav', JSON.stringify(favorites));
    localStorage.setItem('f_tst', JSON.stringify(tested));
    localStorage.setItem('f_cus', JSON.stringify(customGames));
  }, [favorites, tested, customGames]);

  // --- PARTAGE COURT (IDs uniquement) ---
  const shareMyList = () => {
    const d = btoa(unescape(encodeURIComponent(JSON.stringify({ f: favorites, t: tested }))));
    const url = `${window.location.origin}${window.location.pathname}?share=${d}`;
    navigator.clipboard.writeText(url);
    alert("Lien de partage copié ! Envoyez ce lien à vos amis pour qu'ils voient vos jeux.");
  };

  const allGames = useMemo(() => [...initialGames, ...customGames], [customGames]);
  const norm = (t) => (t || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const displayData = useMemo(() => {
    const t = norm(searchTerm);
    const filtered = allGames.filter(g => (!t || norm(g.title).includes(t) || norm(g.author).includes(t) || norm(g.stand).includes(t)) && (filterType === 'Tous' || g.type === filterType));
    return {
      items: filtered.filter(g => activeTab === 'all' || (activeTab === 'mylist' && favorites.includes(g.id)) || (activeTab === 'tested' && tested.includes(g.id)) || (activeTab === 'asdor' && g.category === "As d'Or")),
      counts: { mylist: favorites.length, tested: tested.length, all: allGames.length, asdor: allGames.filter(g => g.category === "As d'Or").length }
    };
  }, [allGames, searchTerm, filterType, activeTab, favorites, tested]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 font-sans text-[13px]">
      <header className="bg-white border-b sticky top-0 z-50 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Dices className="text-indigo-600" size={28} /><h1 className="text-xl font-black italic">FIJ <span className="text-indigo-600">2026</span></h1></div>
            <div className="flex gap-2">
              <button onClick={shareMyList} className="bg-slate-100 p-2.5 rounded-xl hover:bg-slate-200"><Share2 size={20} /></button>
              <button className="bg-indigo-600 text-white p-2.5 rounded-xl active:scale-95"><Plus size={20} /></button>
            </div>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Titre, auteur, stand..." className="w-full pl-11 pr-12 py-3 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
            {['Tous', 'Enfants', 'Famille', 'Initié', 'Expert'].map(type => (
              <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all whitespace-nowrap ${filterType === type ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{type}</button>
            ))}
          </div>
          <div className="flex gap-4 border-b border-slate-100 pb-1 overflow-x-auto no-scrollbar">
            {[{id:'mylist', label:'Likes', icon:Heart}, {id:'tested', label:'Testés', icon:CheckCircle2}, {id:'all', label:'Tous', icon:Package}].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 pb-2 border-b-2 font-black text-[10px] uppercase whitespace-nowrap ${activeTab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>
                <t.icon size={14} /> {t.label} ({displayData.counts[t.id]})
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayData.items.map(game => (
          <div key={game.id} onClick={() => setSelectedGame(game)} className="bg-white rounded-[1.5rem] border border-slate-100 p-5 flex flex-col hover:shadow-lg transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-0.5">
              <h3 className="font-black text-lg truncate flex-1 group-hover:text-indigo-600">{game.title}</h3>
              <button onClick={e => { e.stopPropagation(); setFavorites(f => f.includes(game.id) ? f.filter(i => i !== game.id) : [...f, game.id]) }} className={`ml-2 transition-transform active:scale-150 ${favorites.includes(game.id) ? 'text-red-500' : 'text-slate-300'}`}>
                <Heart size={20} fill={favorites.includes(game.id) ? "currentColor" : "none"} />
              </button>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 truncate">{game.author}</p>
            <div className="flex items-center gap-2 text-slate-400 mb-3 font-bold text-[10px]">
              <div className="flex items-center gap-1"><Users size={12} /><span>{game.players}</span></div>
              <div className="flex items-center gap-1"><Clock size={12} /><span>{game.duration}</span></div>
              <div className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-100 font-black flex items-center gap-1">
                <MapPin size={10} />{game.stand}
              </div>
            </div>
            <p className="text-slate-500 text-[11px] italic mb-4 line-clamp-2 leading-relaxed">"{game.description}"</p>
            <div className="mt-auto pt-3 border-t flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-slate-400 truncate max-w-[100px]">{game.publisher}</span>
              <button onClick={e => { e.stopPropagation(); setTested(t => t.includes(game.id) ? t.filter(i => i !== game.id) : [...t, game.id]) }} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex-shrink-0 ${tested.includes(game.id) ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                {tested.includes(game.id) ? 'Fait !' : 'On a test'}
              </button>
            </div>
          </div>
        ))}
      </main>

      {selectedGame && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-indigo-950/60 backdrop-blur-sm" onClick={() => setSelectedGame(null)}>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 relative shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedGame(null)} className="absolute right-6 top-6 bg-slate-100 p-2 rounded-full hover:bg-slate-200"><X size={20}/></button>
            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase mb-2 inline-block">{selectedGame.category}</span>
            <h2 className="text-3xl font-black mb-1 leading-tight">{selectedGame.title}</h2>
            <p className="text-sm font-bold text-slate-400 uppercase mb-6 tracking-wide">Par {selectedGame.author}</p>
            <div className="bg-slate-50 p-5 rounded-3xl mb-8 border border-slate-100 shadow-inner overflow-y-auto max-h-48">
              <div className="text-sm text-slate-700 italic leading-relaxed">{selectedGame.longDescription || selectedGame.description}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <a href={selectedGame.myludoUrl} target="_blank" rel="noreferrer" className="bg-[#364958] text-white py-4 rounded-2xl text-[10px] font-black text-center uppercase flex items-center justify-center gap-2"><ExternalLink size={14}/> MyLudo</a>
              <a href={selectedGame.bggUrl} target="_blank" rel="noreferrer" className="bg-[#FF5100] text-white py-4 rounded-2xl text-[10px] font-black text-center uppercase flex items-center justify-center gap-2"><ExternalLink size={14}/> BGG</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;