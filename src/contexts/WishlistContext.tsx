import { createContext, useContext, useState, useEffect } from 'react';

export interface SkillTarget {
  id:   string;
  want: number;
}

interface WishlistCtx {
  targets:      SkillTarget[];
  setTarget:    (id: string, want: number) => void;
  removeTarget: (id: string) => void;
  clearAll:     () => void;
}

const Ctx = createContext<WishlistCtx | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [targets, setTargets] = useState<SkillTarget[]>(() => {
    try {
      const raw = localStorage.getItem('mhw-wishlist');
      return raw ? (JSON.parse(raw) as SkillTarget[]) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('mhw-wishlist', JSON.stringify(targets));
  }, [targets]);

  const setTarget = (id: string, want: number) =>
    setTargets(prev => {
      const idx = prev.findIndex(t => t.id === id);
      if (idx >= 0) return prev.map((t, i) => i === idx ? { ...t, want } : t);
      return [...prev, { id, want }];
    });

  const removeTarget = (id: string) =>
    setTargets(prev => prev.filter(t => t.id !== id));

  const clearAll = () => setTargets([]);

  return (
    <Ctx.Provider value={{ targets, setTarget, removeTarget, clearAll }}>
      {children}
    </Ctx.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
}
