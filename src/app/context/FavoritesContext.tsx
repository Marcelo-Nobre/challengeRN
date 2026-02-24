import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  addFavorite as dbAddFavorite,
  removeFavorite as dbRemoveFavorite,
  getFavorites as dbGetFavorites,
  isFavorite as dbIsFavorite,
} from '../../db';

type FavoritesContextValue = {
  favorites: string[];
  isFavorite: (word: string) => boolean;
  addFavorite: (word: string) => void;
  removeFavorite: (word: string) => void;
  toggleFavorite: (word: string) => void;
  refreshFavorites: () => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  const refreshFavorites = useCallback(() => {
    setFavorites(dbGetFavorites());
  }, []);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const addFavorite = useCallback((word: string) => {
    const w = word.trim().toLowerCase();
    if (!w) return;
    dbAddFavorite(w);
    setFavorites((prev) => {
      if (prev.includes(w)) return prev;
      return [...prev, w].sort();
    });
  }, []);

  const removeFavorite = useCallback((word: string) => {
    const w = word.trim().toLowerCase();
    dbRemoveFavorite(w);
    setFavorites((prev) => prev.filter((x) => x !== w));
  }, []);

  const isFavorite = useCallback(
    (word: string) => favorites.includes(word.trim().toLowerCase()),
    [favorites]
  );

  const toggleFavorite = useCallback((word: string) => {
    const w = word.trim().toLowerCase();
    if (!w) return;
    if (dbIsFavorite(w)) {
      dbRemoveFavorite(w);
      setFavorites((prev) => prev.filter((x) => x !== w));
    } else {
      dbAddFavorite(w);
      setFavorites((prev) => [...prev, w].sort());
    }
  }, []);

  const value: FavoritesContextValue = {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    refreshFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return ctx;
}
