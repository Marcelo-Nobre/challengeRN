## Desafio React Native – Dicionário de Inglês

Aplicativo em React Native (CLI, TypeScript) que lista palavras em inglês, permite buscar, ver detalhes com áudio de pronúncia e marcar/desmarcar favoritas, com cache e persistência local.

---

## Tecnologias principais

- **React Native CLI** + **TypeScript**
- **React Navigation** (stack + bottom tabs)
- **@tanstack/react-query** (`useQuery`, `useInfiniteQuery`) para dados remotos e paginação
- **SQLite** via `@op-engineering/op-sqlite` para:
  - Lista de palavras (seed do repositório `dwyl/english-words`)
  - Cache de detalhes de palavras (Free Dictionary API)
  - Tabela de favoritos
- **FlashList** (`@shopify/flash-list`) para listas performáticas com scroll infinito
- **React Context** para estado global de favoritos
- **react-native-sound-player** para áudio de pronúncia

---

## Como rodar o projeto

### Pré‑requisitos

- Node na versão suportada no `package.json` (`"node": ">=22.11.0 <23 || >=24"`)
- Ambiente React Native CLI configurado (Android Studio / Xcode, emulador ou device físico)

### Passos

1. Instalar dependências:

   ```bash
   npm install
   ```

2. Rodar Metro bundler (opcional, se não usar o script de plataforma direto):

   ```bash
   npm run start
   ```

3. Executar no Android:

   ```bash
   npm run android
   ```

4. Executar no iOS:

   ```bash
   npm run ios
   ```

Na primeira execução o app faz o **seed da base de palavras** baixando o arquivo de `dwyl/english-words` e gravando em SQLite; isso pode levar alguns segundos.

---

## Arquitetura (alto nível)

- `src/app` – App root, navegação, tema, providers (React Query, Context de favoritos)
- `src/modules/word-list` – Tela de listagem de palavras (busca + infinite scroll)
- `src/modules/word-detail` – Tela de detalhes da palavra (fonética, significados, exemplos, áudio, favorito)
- `src/modules/favorites` – Tela de favoritos
- `src/api` – Clientes HTTP (Free Dictionary API, dwyl words) + React Query hooks
- `src/db` – Acesso ao SQLite (tabelas `words`, `favorites`, `word_cache`)
- `src/components` – Componentes compartilhados (Loading, Empty/Error, ícones, background etc.)

---

## Como cada requisito foi atendido

### 1. Listagem de Palavras

- **Fonte de Dados (dwyl/english-words)**  
  - Usa `ENGLISH_WORDS_LIST_URL` apontando para `words_alpha.txt` do repositório `dwyl/english-words`.
  - `fetchEnglishWordsList` baixa o arquivo, normaliza as palavras e devolve um array de `string`.

- **Persistência da Lista**  
  - Em `ensureWordsListSeeded` a lista é baixada **uma única vez** e persistida em **SQLite** (tabela `words`).
  - Em execuções seguintes, se já houver registros em `words`, o seed é pulado.

- **Scroll Infinito (Infinite Scroll)**  
  - `useWordList` usa **`useInfiniteQuery`** para paginar a leitura da tabela `words`:
    - Lê blocos de `PAGE_SIZE` palavras via `getWordsPaginated` / `searchWords`.
    - Expõe `loadMore` e `hasMore`.
  - A tela `WordListScreen` usa **FlashList** com:
    - `onEndReached={loadMore}`
    - `onEndReachedThreshold={0.4}`
  - Assim, as palavras são carregadas **sob demanda**, conforme o usuário rola.

- **Busca na listagem**  
  - Campo de busca (`TextInput`) ligado em `searchTerm` / `setSearchTerm`.
  - Quando há termo:
    - O `useInfiniteQuery` passa a usar `searchWords` e `searchWordsCount` (filtro direto no SQLite).
    - A tela mostra o total de resultados encontrados.

### 2. Detalhes da Palavra

- **Consumo de API (Free Dictionary API)**  
  - `getWordDetails` usa `dictionaryClient` (base URL `https://api.dictionaryapi.dev/api/v2/entries/en`) para buscar detalhes de uma palavra.
  - `useWordDetailsQuery` (React Query) gerencia o ciclo de request/cache/erro.

- **Informações Exibidas (fonética, significados, definições, exemplos)**  
  - A tela `WordDetailScreen` mostra:
    - Palavra e fonética principal.
    - Lista de significados (agrupados como “As acronym / initialism” e “As word”).
    - Definições numeradas de cada significado.
    - Exemplos quando disponíveis.

- **Player de Áudio**  
  - `useWordDetail` extrai a primeira URL de áudio dos `phonetics` da resposta.
  - Usa `react-native-sound-player` para tocar via `playAudio(url)`.
  - A UI mostra um botão de play / estado “Opening...” enquanto o áudio é reproduzido.

- **Favoritar / Desfavoritar**  
  - `FavoritesContext` gerencia a lista de favoritos em memória e no SQLite (`favorites`).
  - `WordDetailScreen` exibe um botão de estrela que chama `toggleFavorite(word)`:
    - Se não for favorito, adiciona à tabela `favorites`.
    - Se já for, remove.

### 3. Listagem de Favoritos

- Tela `FavoritesScreen`:
  - Usa FlashList para listar todas as palavras favoritas (vindo do `FavoritesContext`/SQLite).
  - Ao tocar em um item, navega para a tela `WordDetail` já com a palavra selecionada.

---

## Sistema de Cache (detalhes da palavra)

- Tabela `word_cache` no SQLite armazena o JSON completo da resposta da Free Dictionary API por palavra.
- `useWordDetailsQuery`:
  - Na **primeira vez**, busca na API, salva em `word_cache` e retorna.
  - Em erros ou 404, tenta ler do `word_cache` e retornar o último dado conhecido.
  - O React Query ainda mantém um cache em memória com `staleTime` configurado, evitando chamadas redundantes em navegações curtas.

---

## Decisões de arquitetura

- **React Query + SQLite**  
  - React Query cuida de status (loading/erro), cache em memória e paginação.
  - SQLite garante persistência da lista base, do cache de detalhes e dos favoritos.

- **FlashList para listas grandes**  
  - Melhor performance que FlatList para a quantidade de palavras envolvida.
  - Combina bem com o modelo de paginação incremental.

- **Context de favoritos**  
  - Interface simples para a UI (`useFavorites`) e implementação desacoplada (SQLite por baixo).

---

## Scripts úteis

- `npm run android` – roda o app no Android.
- `npm run ios` – roda o app no iOS.
- `npm run start` – inicia o Metro bundler.
- `npm run lint` – executa o ESLint.
- `npm test` – executa testes com Jest (quando houver).

