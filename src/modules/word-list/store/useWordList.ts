import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ensureWordsListSeeded,
  getWordsPaginated,
  searchWords,
  searchWordsCount,
} from '../../../db';

const PAGE_SIZE = 50;
const SEED_QUERY_KEY = 'seedWords';

export function useWordList() {
  const [words, setWords] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);

  const { isLoading: seeding } = useQuery({
    queryKey: [SEED_QUERY_KEY],
    queryFn: ensureWordsListSeeded,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });

  const loadPage = useCallback(
    (currentOffset: number, append: boolean, term: string) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      try {
        const chunk =
          term.trim() === ''
            ? getWordsPaginated(PAGE_SIZE, currentOffset)
            : searchWords(term.trim(), PAGE_SIZE, currentOffset);
        setWords((prev) => (append ? [...prev, ...chunk] : chunk));
        setHasMore(chunk.length === PAGE_SIZE);
        setOffset(currentOffset + chunk.length);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (seeding) return;
    setOffset(0);
    setWords([]);
    setHasMore(true);
    loadingRef.current = false;
    setLoading(false);
    loadPage(0, false, searchTerm);
  }, [searchTerm, seeding, loadPage]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) loadPage(offset, true, searchTerm);
  }, [loading, hasMore, offset, searchTerm, loadPage]);

  const totalWhenSearch =
    searchTerm.trim() === '' ? null : searchWordsCount(searchTerm.trim());

  return {
    words,
    searchTerm,
    setSearchTerm,
    loading,
    seeding,
    hasMore,
    loadMore,
    totalWhenSearch,
  };
}
