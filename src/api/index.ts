export { dictionaryClient, ENGLISH_WORDS_LIST_URL } from './client';
export { getWordDetails } from './dictionary';
export { fetchEnglishWordsList } from './words';
export { useWordDetailsQuery } from './queries/useWordDetailsQuery';
export type {
  DictionaryEntry,
  DictionarySuccessResponse,
  DictionaryErrorResponse,
  Phonetic,
  Meaning,
  Definition,
} from './types';
