// src/components/GameThumbnail.jsx
import React, { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { fetchGameImage } from '../services/bggApi';

const GameThumbnail = ({ bggUrl, title, className }) => {
  const [imgUrl, setImgUrl] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'

  useEffect(() => {
    let mounted = true;
    setStatus('loading');

    fetchGameImage(bggUrl, title)
      .then((url) => {
        if (!mounted) return;
        if (url) {
          setImgUrl(url);
          setStatus('success');
        } else {
          setStatus('error'); // Pas d'image trouvée ou erreur
        }
      })
      .catch(() => {
        if (mounted) setStatus('error');
      });

    return () => { mounted = false; };
  }, [bggUrl, title]);

  // 1. Chargement
  if (status === 'loading') {
    return (
      <div className={`bg-slate-100 flex items-center justify-center animate-pulse ${className}`}>
        <ImageIcon size={20} className="text-slate-300 opacity-50" />
      </div>
    );
  }

  // 2. Succès : Image
  if (status === 'success' && imgUrl) {
    return (
      <img 
        src={imgUrl} 
        alt={title} 
        className={`object-cover w-full h-full transition-opacity duration-500 ${className}`}
        loading="lazy"
      />
    );
  }

  // 3. Erreur ou Pas d'image : Initiales sur fond coloré
  // On génère une petite couleur de fond basée sur le titre pour faire joli
  const getColor = (str) => {
    const colors = ['bg-blue-100 text-blue-500', 'bg-green-100 text-green-500', 'bg-purple-100 text-purple-500', 'bg-orange-100 text-orange-500', 'bg-pink-100 text-pink-500'];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={`flex items-center justify-center border border-slate-100 ${getColor(title || '')} ${className}`}>
      <span className="text-xs font-black uppercase text-center px-2">
        {title ? title.substring(0, 2) : "??"}
      </span>
    </div>
  );
};

export default GameThumbnail;