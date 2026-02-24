import axios from 'axios';
import { ENGLISH_WORDS_LIST_URL } from './client';

export async function fetchEnglishWordsList(): Promise<string[]> {
  const { data } = await axios.get<string>(ENGLISH_WORDS_LIST_URL, {
    timeout: 60000,
    responseType: 'text',
  });
  return data
    .split(/\r?\n/)
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean);
}
