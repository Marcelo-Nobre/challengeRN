import { useQuery } from '@tanstack/react-query';
import { getWordDetails } from '../dictionary';
import { getCachedWordDetails, setCachedWordDetails } from '../../db';
import type { DictionaryEntry } from '../types';

export const WORD_DETAIL_QUERY_KEY = 'wordDetail';

async function fetchWordDetail(word: string): Promise<DictionaryEntry[] | null> {
  const normalized = word.trim().toLowerCase();
  if (!normalized) return null;

  const cached = getCachedWordDetails(normalized);

  try {
    const fromApi = await getWordDetails(normalized);

    if (fromApi && fromApi.length > 0) {
      setCachedWordDetails(normalized, fromApi);
      return fromApi;
    }

    return cached ?? null;
  } catch {
    if (cached && cached.length > 0) {
      return cached;
    }

    throw new Error('Failed to fetch word details and no local cache is available.');
  }
}

export function useWordDetailsQuery(word: string) {
  const normalized = word.trim().toLowerCase();

  return useQuery({
    queryKey: [WORD_DETAIL_QUERY_KEY, normalized],
    queryFn: () => fetchWordDetail(normalized),
    enabled: normalized.length > 0,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
}
