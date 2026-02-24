import axios, { AxiosInstance } from 'axios';

const DICTIONARY_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

export const dictionaryClient: AxiosInstance = axios.create({
  baseURL: DICTIONARY_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ENGLISH_WORDS_LIST_URL =
  'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt';
