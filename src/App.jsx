import React, { useState, useMemo, useEffect } from 'react';
import { initialGames } from './gamesData'; 
import GameThumbnail from './components/GameThumbnail'; 
import { 
  Heart, MapPin, Trophy, Search, 
  Package, Layers, Plus, 
  CheckCircle2, Share2, ExternalLink, 
  Clock, Users, X
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('fij2026_favorites') || '[]'));
  const [tested, setTested] = useState(() => JSON.parse(localStorage.getItem('fij2026_tested') || '[]'));
  const [customGames, setCustomGames] = useState(() => JSON.parse(localStorage.getItem('fij2026_customGames') || '[]'));
  const [selectedGame, setSelectedGame] = useState(null); 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => localStorage.setItem('fij2026_favorites', JSON.stringify(favorites)), [favorites]);
  useEffect(() => localStorage.setItem('fij2026_tested', JSON.stringify(tested)), [tested]);
  useEffect(() => localStorage.setItem('fij2026_customGames', JSON.stringify(customGames)), [customGames]);

  const normalizeText = (t) => (t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const allGames = useMemo(() => {
    const base = initialGames.map(bg => customGames.find(cg => cg.id === bg.id) || bg);
    const trulyNew = customGames.filter(cg => !initialGames.find(bg => bg.id === cg.id));
    return [...base, ...trulyNew];
  }, [customGames]);

  const filteredGames = useMemo(() => {
    const term = normalizeText(searchTerm);
    return allGames.filter(g => {
      const matchSearch = normalizeText(g.title).includes(term) || normalizeText(g.author).includes(term) || normalizeText(g.publisher).includes(term);
      if (activeTab === 'asdor') return matchSearch && g.category === "As d'Or";
      if (activeTab === 'mylist') return matchSearch && favorites.includes(g.id);
      if (activeTab === 'tested') return matchSearch && tested.includes(g.id);
      return matchSearch;
    });
  }, [searchTerm, activeTab, favorites, tested, allGames]);

  const getBggId = (url) => {
    if (!url) return null;
    // Gère les formats : /boardgame/123 ou /boardgame/123/nom-du-jeu
    const match = url.match(/boardgame\/(\d+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32">
      <header className="bg-white border-b sticky top-0 z-50 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white"><Layers size={24} /></div>
              <h1 className="text-xl font-black uppercase">FIJ <span className="text-indigo-600">2026</span></h1>
            </div>
            <button onClick={() => setIsEditModalOpen(true)} className="bg-indigo-600 text-white p-2.5 rounded-xl"><Plus size={20}/></button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Rechercher..." className="w-full pl-11 pr-4 py-3 bg-slate-100 rounded-2xl outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {['all', 'asdor', 'mylist', 'tested'].map(id => (
              <button key={id} onClick={() => setActiveTab(id)} className={`pb-2 border-b-2 font-black text-xs uppercase ${activeTab === id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>
                {id === 'all' ? 'Catalogue' : id === 'asdor' ? "As d'Or" : id === 'mylist' ? 'Ma Liste' : 'Testés'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGames.map(game => (
          <div key={game.id} onClick={() => setSelectedGame(game)} className="bg-white rounded-[1.5rem] border p-4 hover:shadow-xl transition-all cursor-pointer overflow-hidden">
            <div className="w-full h-32 mb-4 rounded-xl overflow-hidden bg-slate-100 relative">
              <GameThumbnail bggId={getBggId(game.bggUrl)} title={game.title} className="w-full h-full" />
              <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded-lg text-[10px] font-black text-indigo-900 shadow-sm">{game.type}</div>
            </div>
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 pr-2">
                <h3 className="font-black text-lg leading-tight">{game.title}</h3>
                <div className="text-[10px] font-bold text-slate-400 uppercase">{game.author}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setFavorites(prev => prev.includes(game.id) ? prev.filter(f => f !== game.id) : [...prev, game.id]) }} className={`p-2 rounded-full ${favorites.includes(game.id) ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-300'}`}>
                <Heart size={18} fill={favorites.includes(game.id) ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        ))}
      </main>

      {selectedGame && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-indigo-950/60 backdrop-blur-sm" onClick={() => setSelectedGame(null)}>
          <div className="bg-white w-full max-w-lg rounded-[2rem] p-6 relative animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedGame(null)} className="absolute top-4 right-4 bg-slate-100 p-2 rounded-full text-slate-500"><X size={20}/></button>
            <div className="w-full h-48 rounded-2xl overflow-hidden mb-6 bg-slate-100">
              <GameThumbnail bggId={getBggId(selectedGame.bggUrl)} title={selectedGame.title} className="w-full h-full" />
            </div>
            <h2 className="text-3xl font-black mb-2">{selectedGame.title}</h2>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">{selectedGame.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <a href={selectedGame.myludoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#364958] text-white py-3 rounded-xl font-bold text-sm hover:opacity-90">MyLudo</a>
              <a href={selectedGame.bggUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#FF5100] text-white py-3 rounded-xl font-bold text-sm hover:opacity-90">BGG</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;