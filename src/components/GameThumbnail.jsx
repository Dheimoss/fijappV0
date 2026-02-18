// src/components/GameThumbnail.jsx
import React, { useState, useEffect } from 'react';
import { fetchGameData } from '../services/bggApi';
import { ImageIcon } from 'lucide-react';

const GameThumbnail = ({ bggId, title, className }) => {
  const [imgUrl, setImgUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    if (!bggId) {
      setLoading(false);
      return;
    }

    // Vérification du cache local
    const cacheKey = `bgg_json_v1_${bggId}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      setImgUrl(cached);
      setLoading(false);
      return;
    }

    const load = async () => {
      const url = await fetchGameData(bggId);
      if (mounted) {
        if (url) {
          localStorage.setItem(cacheKey, url);
          setImgUrl(url);
        }
        setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [bggId]);

  if (loading) {
    return (
      <div className={`bg-slate-100 flex items-center justify-center animate-pulse ${className}`}>
        <ImageIcon size={20} className="text-slate-300" />
      </div>
    );
  }

  if (error || !imgUrl) {
    return (
      <div className={`bg-slate-200 flex items-center justify-center text-slate-400 font-bold uppercase text-xs ${className}`}>
        {title ? title.substring(0, 2) : "??"}
      </div>
    );
  }

  return (
    <img 
      src={imgUrl} 
      alt={title} 
      className={`object-cover ${className}`} 
      onError={() => setError(true)}
      loading="lazy"
    />
  );
};

export default GameThumbnail;