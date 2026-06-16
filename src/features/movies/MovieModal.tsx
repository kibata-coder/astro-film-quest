// Just replace the handleServerSelect function inside src/features/movies/MovieModal.tsx with this:

  const handleServerSelect = (index: number) => {
    const selectedProvider = streamProviders[index];
    const isAnime = isAnimeMedia(movie as unknown as Parameters<typeof isAnimeMedia>[0]);

    // INTERCEPTION GUARD: Block 4Animo if they try to click it on a normal movie
    if (selectedProvider?.id === '4animo' && !isAnime) {
      toast({
        variant: "destructive",
        title: "Anime Server Only",
        description: "This server is exclusive to Japanese Anime streams. Please pick Server 1, 2, or 3 for standard movies!",
      });
      return;
    }

    try {
      window.localStorage.setItem(PROVIDER_STORAGE_KEY, String(index));
    } catch {}
    setShowServerDialog(false);
    onPlay();
  };
