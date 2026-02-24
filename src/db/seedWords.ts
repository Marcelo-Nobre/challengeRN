import { fetchEnglishWordsList } from '../api';
import { getWordsCount, insertWordsBatch } from './words';

export async function ensureWordsListSeeded(): Promise<boolean> {
  const count = getWordsCount();
  if (count > 0) return true;

  const words = await fetchEnglishWordsList();
  if (words.length === 0) return false;

  await insertWordsBatch(words);
  return true;
}
