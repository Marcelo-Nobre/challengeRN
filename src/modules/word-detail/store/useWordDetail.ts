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
      ? (queryError instanceof Error ? queryError.message : 'Error loading.')
      : !loading && data === null && normalized.length > 0
        ? 'Word not found.'
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
      Alert.alert('Audio', 'Could not play pronunciation.');
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
