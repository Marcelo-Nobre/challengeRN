import { useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  ensureWordsListSeeded,
  getWordsPaginated,
  searchWords,
  searchWordsCount,
} from '../../../db';

const PAGE_SIZE = 20;
const SEED_QUERY_KEY = 'seedWords';
const WORD_LIST_QUERY_KEY = 'wordList';

export function useWordList() {
  const [searchTerm, setSearchTerm] = useState('');

  const { isLoading: seeding } = useQuery({
    queryKey: [SEED_QUERY_KEY],
    queryFn: ensureWordsListSeeded,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: [WORD_LIST_QUERY_KEY, normalizedSearch],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const offset = pageParam as number;
      const term = normalizedSearch;
      const chunk =
        term === ''
          ? getWordsPaginated(PAGE_SIZE, offset)
          : searchWords(term, PAGE_SIZE, offset);
      return {
        items: chunk,
        nextOffset: offset + chunk.length,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.items.length === PAGE_SIZE ? lastPage.nextOffset : undefined,
    enabled: !seeding,
  });

  const words =
    data?.pages.flatMap((page) => page.items) ?? [];

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const loading = isLoading || isFetchingNextPage;
  const hasMore = !!hasNextPage;

  const totalWhenSearch =
    normalizedSearch === '' ? null : searchWordsCount(normalizedSearch);

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
