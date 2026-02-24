### Visão geral do projeto

Este projeto é um **aplicativo React Native** que funciona como um dicionário inglês, com:

- **Lista de palavras offline** (banco SQLite local).
- **Detalhe da palavra** com definições vindas de uma API pública.
- **Favoritos** persistidos localmente.
- Estratégia **offline-first** para detalhes da palavra (usa cache local e depois rede).

Toda a lógica de dados é centralizada em:

- `src/db/*` → banco SQLite (palavras, favoritos, cache de detalhes).
- `src/api/*` → chamadas HTTP para a API de dicionário.
- `src/modules/*` → telas e stores de UI (lista, detalhe, favoritos).
- `src/app/*` → bootstrap da aplicação (providers, navegação, tema).

---

### Entrada da aplicação (`src/app`)

#### `src/app/index.tsx`

```1:2:src/app/index.tsx
export { App } from './app';
```

- Apenas reexporta o componente `App`, que é usado como raiz pelo `index.js` do React Native.

#### `src/app/app.tsx`

```1:52:src/app/app.tsx
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FavoritesProvider } from './context/FavoritesContext';
import { AppStack } from './routes';
import { theme } from './styles/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24,
      gcTime: 1000 * 60 * 60 * 24 * 7,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <FavoritesProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={theme.colors.surface}
        />
        <NavigationContainer
          theme={{
            dark: false,
            colors: {
              primary: theme.colors.primary,
              background: theme.colors.background,
              card: theme.colors.surface,
              text: theme.colors.text,
              border: theme.colors.border,
              notification: theme.colors.accent,
            },
            fonts: {
              regular: { fontFamily: 'System', fontWeight: '400' },
              medium: { fontFamily: 'System', fontWeight: '500' },
              bold: { fontFamily: 'System', fontWeight: '700' },
              heavy: { fontFamily: 'System', fontWeight: '900' },
            },
          }}
        >
          <AppStack />
        </NavigationContainer>
        </FavoritesProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
```

- **`QueryClientProvider`**: configura o React Query para todo o app, com:
  - `staleTime` de 24h → dados considerados “frescos” por 24h.
  - `gcTime` de 7 dias → dados podem ficar em cache por 7 dias antes de serem descartados.
- **`SafeAreaProvider`**: lida com áreas seguras em iOS/Android.
- **`FavoritesProvider`**: contexto responsável por carregar e persistir favoritos no SQLite.
- **`NavigationContainer` + `AppStack`**:
  - Define a navegação do app (pilha + tabs).
  - Aplica um tema de cores e fontes consistente via `theme`.

---

### Navegação e rotas (`src/app/routes`)

#### `src/app/routes/types.ts`

- Define o tipo `RootStackParamList` para tipar a navegação:
  - Provavelmente algo como:
    - `'MainTabs'`
    - `'WordDetail': { word: string }`

Isso permite:

- `useNavigation<NativeStackNavigationProp<RootStackParamList, 'MainTabs'>>`
- `NativeStackScreenProps<RootStackParamList, 'WordDetail'>`

#### `src/app/routes/AppStack.tsx`

- Cria um **stack navigator** com:
  - Tela principal embutindo as **tabs** (`MainTabs`).
  - Tela de **detalhe da palavra** (`WordDetail`).
- Controla o header, títulos e opções de navegação.

#### `src/app/routes/MainTabs.tsx`

- Define um **tab navigator** com, por exemplo:
  - Tab de **lista de palavras**.
  - Tab de **favoritos**.
- Cada aba aponta para um módulo:
  - `WordListScreen` (lista geral com busca).
  - `FavoritesScreen` (lista de palavras favoritas).

---

### Tema visual (`src/app/styles/theme.ts`)

- Centraliza:
  - **Cores**: `primary`, `background`, `surface`, `text`, `border`, etc.
  - **Tipografia**: estilos como `body`, `bodySmall`, `titleSmall`, `caption`.
  - **Espaçamentos**: `spacing.xs`, `sm`, `md`, `lg`, `xl`, `xxl`, etc.
  - **Radius**: `radius.sm`, `md`, `xl` para bordas.
  - **Sombras**: `shadow.sm`, `shadow.md`, etc.
- Usado por todas as telas para manter UI consistente e moderna.

---

### Contexto de favoritos (`src/app/context/FavoritesContext.tsx`)

```1:93:src/app/context/FavoritesContext.tsx
import React, {
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
```

- **Estado `favorites`**: array de palavras favoritas em memória.
- **Carregamento inicial**:
  - `useEffect` chama `refreshFavorites` na montagem.
  - `refreshFavorites` lê do SQLite via `dbGetFavorites()` e joga no estado.
- **Mutations**:
  - `addFavorite`:
    - Normaliza a palavra (trim + lowerCase).
    - Salva no SQLite via `dbAddFavorite`.
    - Atualiza o estado local, evitando duplicatas e mantendo ordenado.
  - `removeFavorite`:
    - Remove do SQLite (`dbRemoveFavorite`) e do estado.
  - `toggleFavorite`:
    - Consulta no banco (`dbIsFavorite`) e alterna entre adicionar/remover.
- **Hook `useFavorites`**:
  - Facilita consumir esse contexto em qualquer tela/estrutura.

---

### Camada de banco de dados (`src/db`)

#### `src/db/init.ts` — inicialização do SQLite

```1:38:src/db/init.ts
import { open, type DB } from '@op-engineering/op-sqlite';

const DB_NAME = 'dictionary.db';

let db: DB | null = null;

export function getDb(): DB {
  if (!db) {
    db = open({ name: DB_NAME });
    createTables(db);
  }
  return db;
}

function createTables(database: DB): void {
  database.executeSync(
    'CREATE TABLE IF NOT EXISTS words (id INTEGER PRIMARY KEY AUTOINCREMENT, word TEXT UNIQUE NOT NULL)'
  );
  database.executeSync(
    'CREATE INDEX IF NOT EXISTS idx_words_word ON words(word)'
  );

  database.executeSync(
    'CREATE TABLE IF NOT EXISTS favorites (word TEXT PRIMARY KEY)'
  );

  database.executeSync(
    "CREATE TABLE IF NOT EXISTS word_cache (word TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER DEFAULT (strftime('%s', 'now')))"
  );
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
```

- **`getDb`**:
  - Abre ou reutiliza uma instância única do banco `dictionary.db`.
  - Chamando `createTables` na primeira abertura para garantir estrutura.
- **Tabelas**:
  - `words`:
    - Guarda a lista enorme de palavras (seedadas a partir de um arquivo remoto).
    - Índice em `word` para buscas rápidas.
  - `favorites`:
    - Apenas uma coluna `word` (PRIMARY KEY) para armazenar favoritos.
  - `word_cache`:
    - `word` (PRIMARY KEY).
    - `data` (JSON com a resposta completa da API de detalhes).
    - `updated_at` (timestamp Unix) para saber quando foi cacheado.

#### `src/db/words.ts` — acesso e seed da lista de palavras

```1:62:src/db/words.ts
import { getDb } from './init';

export function getWordsCount(): number {
  const database = getDb();
  const result = database.executeSync(
    'SELECT COUNT(*) as total FROM words'
  );
  const row = result.rows?.[0];
  return row && typeof row.total === 'number' ? row.total : 0;
}

export function getWordsPaginated(limit: number, offset: number): string[] {
  const database = getDb();
  const result = database.executeSync(
    'SELECT word FROM words ORDER BY word LIMIT ? OFFSET ?',
    [limit, offset]
  );
  const rows = result.rows ?? [];
  return rows.map((r) => String(r.word));
}

export function searchWords(
  searchTerm: string,
  limit: number,
  offset: number
): string[] {
  const database = getDb();
  const term = `%${searchTerm.trim().toLowerCase()}%`;
  const result = database.executeSync(
    'SELECT word FROM words WHERE word LIKE ? ORDER BY word LIMIT ? OFFSET ?',
    [term, limit, offset]
  );
  const rows = result.rows ?? [];
  return rows.map((r) => String(r.word));
}

export function searchWordsCount(searchTerm: string): number {
  const database = getDb();
  const term = `%${searchTerm.trim().toLowerCase()}%`;
  const result = database.executeSync(
    'SELECT COUNT(*) as total FROM words WHERE word LIKE ?',
    [term]
  );
  const row = result.rows?.[0];
  return row && typeof row.total === 'number' ? row.total : 0;
}

export async function insertWordsBatch(words: string[]): Promise<void> {
  const database = getDb();
  const batchSize = 500;
  for (let i = 0; i < words.length; i += batchSize) {
    const chunk = words.slice(i, i + batchSize);
    const placeholders = chunk.map(() => '(?)').join(',');
    const values = chunk.map((w) => w.trim().toLowerCase()).filter(Boolean);
    if (values.length === 0) continue;
    await database.execute(
      `INSERT OR IGNORE INTO words (word) VALUES ${placeholders}`,
      values
    );
  }
}
```

- **`getWordsPaginated`**:
  - Usa `LIMIT` e `OFFSET` para paginação, ordenando alfabeticamente.
  - Retorna um array de strings de palavras.
- **`searchWords` / `searchWordsCount`**:
  - Buscam por `LIKE '%termo%'` em lowerCase.
  - Usados na tela de lista para filtros e contagem de resultados.
- **`insertWordsBatch`**:
  - Insere palavras em lotes de 500 usando `INSERT OR IGNORE`.
  - Serve para popular a tabela a partir da lista remota de palavras.

#### `src/db/cache.ts` — cache de detalhes de palavra (offline-first)

```1:35:src/db/cache.ts
import type { DictionaryEntry } from '../api/types';
import { getDb } from './init';

export function getCachedWordDetails(word: string): DictionaryEntry[] | null {
  const database = getDb();
  const w = word.trim().toLowerCase();
  if (!w) return null;
  const result = database.executeSync(
    'SELECT data FROM word_cache WHERE word = ? LIMIT 1',
    [w]
  );
  const row = result.rows?.[0];
  if (!row || typeof row.data !== 'string') return null;
  try {
    const parsed = JSON.parse(row.data) as DictionaryEntry[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function setCachedWordDetails(
  word: string,
  data: DictionaryEntry[]
): void {
  const database = getDb();
  const w = word.trim().toLowerCase();
  if (!w || !Array.isArray(data) || data.length === 0) return;
  const json = JSON.stringify(data);
  database.executeSync(
    "INSERT OR REPLACE INTO word_cache (word, data, updated_at) VALUES (?, ?, strftime('%s', 'now'))",
    [w, json]
  );
}
```

- **`getCachedWordDetails`**:
  - Busca JSON da tabela `word_cache` por `word`.
  - Faz parse para `DictionaryEntry[]`.
  - Retorna `null` se não existir ou se o JSON estiver inválido.
- **`setCachedWordDetails`**:
  - Atualiza ou insere (`INSERT OR REPLACE`) o JSON da resposta da API.
  - Atualiza o `updated_at` com o timestamp atual.

#### `src/db/favorites.ts` — persistência de favoritos

```1:37:src/db/favorites.ts
import { getDb } from './init';

export function addFavorite(word: string): void {
  const database = getDb();
  const w = word.trim().toLowerCase();
  if (!w) return;
  database.executeSync(
    'INSERT OR REPLACE INTO favorites (word) VALUES (?)',
    [w]
  );
}

export function removeFavorite(word: string): void {
  const database = getDb();
  database.executeSync('DELETE FROM favorites WHERE word = ?', [
    word.trim().toLowerCase(),
  ]);
}

export function isFavorite(word: string): boolean {
  const database = getDb();
  const result = database.executeSync(
    'SELECT 1 FROM favorites WHERE word = ? LIMIT 1',
    [word.trim().toLowerCase()]
  );
  return (result.rows?.length ?? 0) > 0;
}

export function getFavorites(): string[] {
  const database = getDb();
  const result = database.executeSync(
    'SELECT word FROM favorites ORDER BY word'
  );
  const rows = result.rows ?? [];
  return rows.map((r) => String(r.word));
}
```

- Funções simples de CRUD na tabela `favorites`, usadas pelo `FavoritesContext`.

#### `src/db/index.ts` e `src/db/seedWords.ts`

- `src/db/index.ts` provavelmente reexporta funções úteis (`ensureWordsListSeeded`, `getWordsPaginated`, etc.) para facilitar os imports.
- `src/db/seedWords.ts`:
  - Usa `fetchEnglishWordsList` (da camada de API) para buscar a lista bruta de palavras.
  - Chama `insertWordsBatch` para guardar todas as palavras no SQLite local.
  - Garante isso apenas uma vez (checando `getWordsCount` ou algum flag).

---

### Camada de API remota (`src/api`)

#### `src/api/client.ts`

```1:15:src/api/client.ts
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
```

- **`dictionaryClient`**: instância Axios configurada para a API pública de dicionário.
- **`ENGLISH_WORDS_LIST_URL`**: URL do arquivo de texto gigante com palavras em inglês.

#### `src/api/dictionary.ts`

```1:25:src/api/dictionary.ts
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
```

- Faz GET na API para `/word`, retorna um array de `DictionaryEntry` ou `null`.
- Trata 404 como “não encontrado” e lança outros erros de rede para cima.

#### `src/api/words.ts`

```1:13:src/api/words.ts
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
```

- Busca o arquivo de texto com a lista de palavras.
- Normaliza para lowerCase e remove linhas vazias.
- Resultado alimenta a seed do SQLite.

#### `src/api/types.ts`

- Define `DictionaryEntry`, `DictionarySuccessResponse` etc., modelando a resposta da API de dicionário.

#### `src/api/queries/useWordDetailsQuery.ts` — offline-first + fallback de erro

```1:34:src/api/queries/useWordDetailsQuery.ts
import { useQuery } from '@tanstack/react-query';
import { getWordDetails } from '../dictionary';
import { getCachedWordDetails, setCachedWordDetails } from '../../db';
import type { DictionaryEntry } from '../types';

export const WORD_DETAIL_QUERY_KEY = 'wordDetail';

async function fetchWordDetail(word: string): Promise<DictionaryEntry[] | null> {
  const normalized = word.trim().toLowerCase();
  if (!normalized) return null;

  // Sempre tentamos ler o último dado local
  const cached = getCachedWordDetails(normalized);

  try {
    const fromApi = await getWordDetails(normalized);

    if (fromApi && fromApi.length > 0) {
      // Atualiza o cache local com a versão mais recente da API
      setCachedWordDetails(normalized, fromApi);
      return fromApi;
    }

    // Se a API respondeu sem dados úteis (ex.: 404), mantemos o que já existe localmente
    return cached ?? null;
  } catch {
    // Em qualquer erro de rede/API, garantimos que o usuário veja
    // a última atualização local disponível (se existir)
    if (cached && cached.length > 0) {
      return cached;
    }

    // Se não há nada em cache, propagamos o erro para a UI poder tratar
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
```

- **Fluxo offline-first com fallback de erro**:
  - Sempre lê o `cached` primeiro (`getCachedWordDetails`).
  - Tenta chamar a API para obter dados mais recentes:
    - Se a API retorna dados válidos → atualiza o cache e retorna a resposta da API.
    - Se a API retorna `null` (ex.: 404) → retorna o cache se existir, senão `null`.
  - Se ocorrer qualquer **erro de rede**:
    - Se existe cache → retorna o cache (última versão conhecida).
    - Se não existe cache → lança erro, para que a UI possa mostrar uma mensagem adequada.
- **Hook `useWordDetailsQuery`**:
  - Integra com React Query.
  - Usa a palavra normalizada como parte da `queryKey`.
  - Só habilita a consulta se `normalized.length > 0`.

---

### Componentes compartilhados (`src/components`)

#### `src/components/Icon.tsx`

```1:13:src/components/Icon.tsx
import { StyleProp, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function Icon({ name, size = 24, color = '#0F172A', style }: IconProps) {
  return <Ionicons name={name as any} size={size} color={color} style={style} />;
}
```

- Wrapper pequeno em volta de `Ionicons` para centralizar ícones.

#### `src/components/LoadingState.tsx`, `ErrorState.tsx`, `EmptyState.tsx`

- Componentes visuais reutilizáveis para:
  - Mostrar estado de carregamento com mensagem opcional.
  - Mostrar erros (`ErrorState`) com texto amigável.
  - Mostrar estados vazios (`EmptyState`) com ícone + texto, usados na lista de palavras.

#### `src/components/index.ts`

- Reexporta `Icon`, `LoadingState`, `ErrorState`, `EmptyState` para imports mais limpos:
  - `import { EmptyState, LoadingState, Icon } from '../../../components';`

---

### Módulo: Lista de Palavras (`src/modules/word-list`)

#### Store: `src/modules/word-list/store/useWordList.ts`

```1:77:src/modules/word-list/store/useWordList.ts
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
```

- **Responsabilidade**:
  - Garantir que a lista de palavras foi seedada no SQLite (`ensureWordsListSeeded`).
  - Fornecer palavras paginadas ou filtradas por busca.
  - Controlar estado de paginação (`offset`, `hasMore`) e loading infinito.
- Fluxo:
  - `useQuery` chama `ensureWordsListSeeded`:
    - Se ainda não houver palavras, baixa a lista e insere no SQLite.
    - Isso é feito apenas uma vez, com `staleTime` e `gcTime` infinitos.
  - `useEffect`:
    - Quando `searchTerm` muda e `seeding` termina, reinicializa estado e chama `loadPage`.
  - `loadPage`:
    - Lê diretamente do SQLite (`getWordsPaginated` ou `searchWords`).
    - Atualiza lista e `offset`.
  - `loadMore`:
    - Usado pela `FlashList` para carregar mais quando chega perto do fim.

#### Tela: `src/modules/word-list/screen/WordListScreen.tsx`

```1:198:src/modules/word-list/screen/WordListScreen.tsx
import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/routes/types';
import { EmptyState, LoadingState, Icon } from '../../../components';
import { theme } from '../../../app/styles/theme';
import { useWordList } from '../store/useWordList';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export function WordListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    words,
    searchTerm,
    setSearchTerm,
    loading,
    seeding,
    loadMore,
    totalWhenSearch,
  } = useWordList();

  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={() => navigation.navigate('WordDetail', { word: item })}
      >
        <Text style={styles.wordText} numberOfLines={1}>
          {item}
        </Text>
        <Icon
          name="chevron-forward"
          size={22}
          color={theme.colors.textMuted}
          style={styles.chevronIcon}
        />
      </Pressable>
    ),
    [navigation]
  );

  const keyExtractor = useCallback((item: string) => item, []);

  if (seeding) {
    return (
      <LoadingState
        message="Preparando lista de palavras…"
        submessage="Isso só acontece na primeira vez"
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <Icon
          name="search"
          size={22}
          color={theme.colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar palavra em inglês..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchTerm}
          onChangeText={setSearchTerm}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      {searchTerm.trim() !== '' && totalWhenSearch !== null && (
        <View style={styles.countWrap}>
          <Text style={styles.countHint}>
            {totalWhenSearch} resultado{totalWhenSearch !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
      <FlashList
        data={words}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          loading ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              iconName="book-outline"
              message={
                searchTerm.trim() === ''
                  ? 'Nenhuma palavra na lista'
                  : 'Nenhum resultado para esta busca'
              }
              submessage={
                searchTerm.trim() === ''
                  ? 'A lista será carregada em instantes.'
                  : 'Tente outro termo.'
              }
            />
          ) : null
        }
      />
    </View>
  );
}
```

- Tela responsiva que:
  - Mostra o campo de busca.
  - Mostra contagem de resultados quando há filtro.
  - Usa `FlashList` para lista grande com scroll infinito.
  - Navega para `WordDetail` ao tocar em uma palavra.
  - Trata estado de seed inicial com `LoadingState`.

---

### Módulo: Detalhe da Palavra (`src/modules/word-detail`)

#### Store: `src/modules/word-detail/store/useWordDetail.ts`

```1:67:src/modules/word-detail/store/useWordDetail.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import SoundPlayer from 'react-native-sound-player';
import { useFavorites } from '../../../app/context/FavoritesContext';
import { useWordDetailsQuery } from '../../../api';

export function useWordDetail(word: string) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [playingAudio, setPlayingAudio] = useState(false);
  const finishedPlayingRef = useRef<{ remove: () => void } | null>(null);

  const normalized = word.trim().toLowerCase();

  const {
    data,
    isLoading: loading,
    error: queryError,
    refetch: loadDetails,
  } = useWordDetailsQuery(word);

  const error =
    queryError != null
      ? (queryError instanceof Error ? queryError.message : 'Erro ao carregar.')
      : !loading && data === null && normalized.length > 0
        ? 'Palavra não encontrada.'
        : null;

  useEffect(() => {
    finishedPlayingRef.current = SoundPlayer.addEventListener(
      'FinishedPlaying',
      () => setPlayingAudio(false)
    );
    return () => {
      finishedPlayingRef.current?.remove();
    };
  }, []);

  const playAudio = useCallback(async (audioUrl: string) => {
    if (playingAudio) return;
    setPlayingAudio(true);
    try {
      SoundPlayer.setSpeaker(true);
      SoundPlayer.playUrl(audioUrl);
    } catch {
      setPlayingAudio(false);
      Alert.alert('Áudio', 'Não foi possível reproduzir a pronúncia.');
    }
  }, [playingAudio]);

  const favorited = isFavorite(word);
  const entry = data?.[0] ?? null;
  const firstAudioUrl = entry?.phonetics?.find((p) => p.audio)?.audio;

  return {
    data: data ?? null,
    loading,
    error,
    playingAudio,
    entry,
    firstAudioUrl,
    favorited,
    loadDetails,
    playAudio,
    toggleFavorite,
  };
}
```

- **Integra com o offline-first da API**:
  - `useWordDetailsQuery` já faz o fallback para cache em caso de erro.
- **Tratamento de erro**:
  - Se `queryError` existir → mostra mensagem de erro amigável.
  - Se não está carregando, `data === null` e há palavra → `"Palavra não encontrada."`.
- **Áudio**:
  - Usa `react-native-sound-player` para reproduzir a pronúncia.
  - Controla estado `playingAudio`.
  - Adiciona listener para evento `FinishedPlaying` e limpa no unmount.
- **Favoritos**:
  - Usa `useFavorites` para derivar `favorited` e expor `toggleFavorite`.

#### Tela: `src/modules/word-detail/screen/WordDetailScreen.tsx`

```1:260:src/modules/word-detail/screen/WordDetailScreen.tsx
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/routes/types';
import { ErrorState, LoadingState, Icon } from '../../../components';
import { theme } from '../../../app/styles/theme';
import { useWordDetail } from '../store/useWordDetail';

type Props = NativeStackScreenProps<RootStackParamList, 'WordDetail'>;

export function WordDetailScreen({ route }: Props) {
  const { word } = route.params;
  const {
    loading,
    error,
    entry,
    firstAudioUrl,
    playingAudio,
    favorited,
    playAudio,
    toggleFavorite,
  } = useWordDetail(word);

  if (loading) {
    return <LoadingState message="Carregando..." />;
  }

  if (error || !entry) {
    return (
      <ErrorState message={error ?? 'Palavra não encontrada.'} />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Text style={styles.word}>{entry.word}</Text>
        {entry.phonetic && (
          <View style={styles.phoneticWrap}>
            <Text style={styles.phonetic}>{entry.phonetic}</Text>
          </View>
        )}
        <View style={styles.actions}>
          {firstAudioUrl && (
            <Pressable
              style={({ pressed }) => [
                styles.audioBtn,
                playingAudio && styles.audioBtnDisabled,
                pressed && !playingAudio && styles.btnPressed,
              ]}
              onPress={() => playAudio(firstAudioUrl)}
              disabled={playingAudio}
            >
              <Icon
                name={playingAudio ? 'hourglass-outline' : 'play'}
                size={20}
                color="#fff"
                style={styles.audioBtnIcon}
              />
              <Text style={styles.audioBtnText}>
                {playingAudio ? 'Abrindo...' : 'Ouvir pronúncia'}
              </Text>
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.favBtn,
              favorited && styles.favBtnActive,
              pressed && styles.btnPressed,
            ]}
            onPress={() => toggleFavorite(word)}
          >
            <Icon
              name={favorited ? 'star' : 'star-outline'}
              size={20}
              color={favorited ? theme.colors.accent : theme.colors.text}
              style={styles.favBtnIcon}
            />
            <Text style={[styles.favBtnText, favorited && styles.favBtnTextActive]}>
              {favorited ? 'Favorita' : 'Favoritar'}
            </Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Significados</Text>

      {entry.meanings?.map((meaning, idx) => (
        <View key={idx} style={styles.section}>
          <View style={styles.partOfSpeechBadge}>
            <Text style={styles.partOfSpeech}>{meaning.partOfSpeech}</Text>
          </View>
          <View style={styles.definitions}>
            {meaning.definitions?.slice(0, 6).map((def, i, arr) => (
              <View
                key={i}
                style={[styles.definition, i === arr.length - 1 && styles.definitionLast]}
              >
                <Text style={styles.definitionText}>{def.definition}</Text>
                {def.example && (
                  <Text style={styles.example}>«{def.example}»</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
```

- UI rica para exibir:
  - Palavra, fonética, botão de áudio.
  - Botão de favoritar (estado visual ativo/inativo).
  - Lista de significados, parte do discurso, definições e exemplos.
- Usa o `ErrorState` quando não há entry ou acontece erro.

---

### Módulo: Favoritos (`src/modules/favorites`)

#### Store: `src/modules/favorites/store/useFavoritesList.ts`

```1:7:src/modules/favorites/store/useFavoritesList.ts
import { useFavorites } from '../../../app/context/FavoritesContext';

export function useFavoritesList() {
  const { favorites } = useFavorites();
  return { favorites };
}
```

- Apenas reexpõe a lista de favoritos do contexto, facilitando o uso pelas telas.

#### Tela: `src/modules/favorites/screen/FavoritesScreen.tsx`

- Usa `useFavoritesList` para obter as palavras favoritas.
- Renderiza uma lista (similar à lista principal) mas só com itens favoritados.
- Ao tocar em um item, navega para `WordDetail` com a palavra correspondente.

---

### Fluxo offline-first resumido

- **Lista de palavras**:
  - Seed inicial:
    - `ensureWordsListSeeded` busca o arquivo de palavras remoto e salva tudo no SQLite.
    - Depois disso, toda navegação e busca na lista é **100% offline**, usando queries SQL locais.
- **Detalhe da palavra**:
  - Ao abrir a tela:
    - `useWordDetailsQuery` tenta:
      1. Ler o cache local (`getCachedWordDetails`).
      2. Chamar a API:
         - Se sucesso → atualiza cache e usa resposta da API.
         - Se 404 → cai para cache (se existir) ou `null`.
         - Se erro de rede → se existe cache, usa o cache; se não, lança erro.
  - Resultado:
    - O usuário sempre vê a **última versão salva localmente** quando há algum problema de rede.
- **Favoritos**:
  - Sempre lidos e gravados no SQLite.
  - Totalmente funcionais mesmo sem internet.

---

### Como o usuário percebe isso na prática

- Primeira abertura:
  - O app baixa a lista de palavras e popula o banco local.
  - O usuário vê a mensagem “Preparando lista de palavras… Isso só acontece na primeira vez”.
- Depois disso:
  - A lista abre rápido, pois vem diretamente do SQLite.
  - Buscar palavras na lista é instantâneo e offline.
  - Ao abrir o detalhe de uma palavra já consultada:
    - Se estiver sem internet, o app ainda mostra o último detalhe salvo.
  - Favoritar/desfavoritar sempre funciona, online ou offline.

