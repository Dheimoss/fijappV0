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
              <Plus size={20