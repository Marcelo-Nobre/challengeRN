import { useFavorites } from '../../../app/context/FavoritesContext';

export function useFavoritesList() {
  const { favorites } = useFavorites();
  return { favorites };
}
