import axios from 'axios';
import { dictionaryClient } from './client';
import type {
  DictionaryEntry,
  DictionarySuccessResponse,
} from './types';

export async function getWordDetails(
  word: string
): Promise<DictionaryEntry[] | null> {
  const normalized = word.trim().toLowerCase();
  if (!normalized) return null;

  try {
    const { data } = await dictionaryClient.get<DictionarySuccessResponse>(
      `/${encodeURIComponent(normalized)}`
    );
    return Array.isArray(data) ? data : null;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null;
    }
    throw err;
  }
}
