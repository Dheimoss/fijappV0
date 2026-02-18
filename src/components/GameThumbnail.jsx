// src/components/GameThumbnail.jsx
import React, { useState, useEffect } from 'react';
import { fetchBggThumbnail } from '../services/bggApi';
import { ImageIcon } from 'lucide-react';

const GameThumbnail = ({ bggId, title, className }) => {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const cacheKey = `bgg_v3_${bggId || title}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      setUrl(cached);
      setLoading(false);
      return;
    }

    const loadThumbnail = async () => {
      setLoading(true);
      const thumbUrl = await fetchBggThumbnail(bggId, title);
      
      if (isMounted) {
        if (thumbUrl) {
          localStorage.setItem(cacheKey, thumbUrl);
          setUrl(thumbUrl);
        }
        setLoading(false);
      }
    };

    loadThumbnail();
    return () => { isMounted = false; };
  }, [bggId, title]);

  if (loading) {
    return (
      <div className={`bg-slate-100 flex items-center justify-center animate-pulse ${className}`}>
        <ImageIcon size={20} className="text-slate-300" />
      </div>
    );
  }

  if (url) {
    return <img src={url} alt={title} className={`object-cover ${className}`} loading="lazy" />;
  }

  return (
    <div className={`bg-slate-200 flex items-center justify-center text-slate-400 font-bold uppercase ${className}`}>
      {title ? title.substring(0, 2) : "??"}
    </div>
  );
};

export default GameThumbnail;