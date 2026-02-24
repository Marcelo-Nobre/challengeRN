export type RootStackParamList = {
  MainTabs: undefined;
  WordDetail: { word: string };
};

export type MainTabsParamList = {
  WordList: undefined;
  Favorites: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
