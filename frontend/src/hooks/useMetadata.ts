import { useState } from "react";
import { fetchSpotifyMetadata } from "@/lib/api";
import { toastWithSound as toast } from "@/lib/toast-with-sound";
import { logger } from "@/lib/logger";
import type { SpotifyMetadataResponse } from "@/types/api";

export function useMetadata() {
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<SpotifyMetadataResponse | null>(null);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const [timeoutValue, setTimeoutValue] = useState(60);
  const [pendingUrl, setPendingUrl] = useState("");
  const [showAlbumDialog, setShowAlbumDialog] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<{
    id: string;
    name: string;
    external_urls: string;
  } | null>(null);
  const [pendingArtistName, setPendingArtistName] = useState<string | null>(null);

  const getUrlType = (url: string): string => {
    if (url.includes("/track/")) return "track";
    if (url.includes("/album/")) return "album";
    if (url.includes("/playlist/")) return "playlist";
    if (url.includes("/artist/")) return "artist";
    return "unknown";
  };

  const isTrackOrAlbumUrl = (url: string): boolean => {
    const type = getUrlType(url);
    return type === "track" || type === "album";
  };

  const isPlaylistOrArtistUrl = (url: string): boolean => {
    const type = getUrlType(url);
    return type === "playlist" || type === "artist";
  };

  const fetchMetadataDirectly = async (url: string, expectedType?: "track" | "playlist") => {
    // Validate URL type matches expected tab if specified
    if (expectedType === "track" && !isTrackOrAlbumUrl(url)) {
      const urlType = getUrlType(url);
      const message = urlType === "playlist" ? 
        "This appears to be a playlist URL. Please use the 'Playlist URL' tab to fetch playlists." :
        urlType === "artist" ?
        "This appears to be an artist URL. Please use the 'Playlist URL' tab to fetch artist discographies." :
        "This URL is not supported in the Track URL tab. Please use tracks or albums only.";
      logger.warning(`URL type mismatch: expected track/album, got ${urlType}`);
      toast.error(message);
      return;
    }

    if (expectedType === "playlist" && !isPlaylistOrArtistUrl(url)) {
      const urlType = getUrlType(url);
      const message = urlType === "track" ?
        "This appears to be a track URL. Please use the 'Track URL' tab to fetch individual tracks." :
        urlType === "album" ?
        "This appears to be an album URL. Please use the 'Track URL' tab to fetch albums." :
        "This URL is not supported in the Playlist URL tab. Please use playlists or artists only.";
      logger.warning(`URL type mismatch: expected playlist/artist, got ${urlType}`);
      toast.error(message);
      return;
    }
    const urlType = getUrlType(url);
    logger.info(`fetching ${urlType} metadata...`);
    logger.debug(`url: ${url}`);
    
    setLoading(true);
    setMetadata(null);

    try {
      const startTime = Date.now();
      const data = await fetchSpotifyMetadata(url);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      
      setMetadata(data);
      
      // Log detailed info based on type
      if ("track" in data) {
        logger.success(`fetched track: ${data.track.name} - ${data.track.artists}`);
        logger.debug(`isrc: ${data.track.isrc}, duration: ${data.track.duration_ms}ms`);
      } else if ("album_info" in data) {
        logger.success(`fetched album: ${data.album_info.name}`);
        logger.debug(`${data.track_list.length} tracks, released: ${data.album_info.release_date}`);
      } else if ("playlist_info" in data) {
        logger.success(`fetched playlist: ${data.track_list.length} tracks`);
        logger.debug(`by ${data.playlist_info.owner.display_name || data.playlist_info.owner.name}`);
      } else if ("artist_info" in data) {
        logger.success(`fetched artist: ${data.artist_info.name}`);
        logger.debug(`${data.album_list.length} albums, ${data.track_list.length} tracks`);
      }
      
      logger.info(`fetch completed in ${elapsed}s`);
      toast.success("Metadata fetched successfully");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch metadata";
      logger.error(`fetch failed: ${errorMsg}`);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchMetadata = async (url: string, expectedType?: "track" | "playlist") => {
    if (!url.trim()) {
      logger.warning("empty url provided");
      toast.error("Please enter a Spotify URL");
      return;
    }

    // Validate URL type matches expected tab
    if (expectedType === "track" && !isTrackOrAlbumUrl(url)) {
      const urlType = getUrlType(url);
      const message = urlType === "playlist" ? 
        "This appears to be a playlist URL. Please use the 'Playlist URL' tab to fetch playlists." :
        urlType === "artist" ?
        "This appears to be an artist URL. Please use the 'Playlist URL' tab to fetch artist discographies." :
        "This URL is not supported in the Track URL tab. Please use tracks or albums only.";
      logger.warning(`URL type mismatch: expected track/album, got ${urlType}`);
      toast.error(message);
      return;
    }

    if (expectedType === "playlist" && !isPlaylistOrArtistUrl(url)) {
      const urlType = getUrlType(url);
      const message = urlType === "track" ?
        "This appears to be a track URL. Please use the 'Track URL' tab to fetch individual tracks." :
        urlType === "album" ?
        "This appears to be an album URL. Please use the 'Track URL' tab to fetch albums." :
        "This URL is not supported in the Playlist URL tab. Please use playlists or artists only.";
      logger.warning(`URL type mismatch: expected playlist/artist, got ${urlType}`);
      toast.error(message);
      return;
    }

    let urlToFetch = url.trim();
    const isArtistUrl = urlToFetch.includes("/artist/");

    if (isArtistUrl && !urlToFetch.includes("/discography")) {
      urlToFetch = urlToFetch.replace(/\/$/, "") + "/discography/all";
      logger.debug("converted to discography url");
    }

    if (isArtistUrl) {
      logger.info("artist url detected, showing timeout dialog");
      setPendingUrl(urlToFetch);
      setPendingArtistName(null); // Clear artist name for URL input
      setShowTimeoutDialog(true);
    } else {
      await fetchMetadataDirectly(urlToFetch, expectedType);
    }

    return urlToFetch;
  };

  const handleConfirmFetch = async () => {
    setShowTimeoutDialog(false);
    logger.info(`fetching artist discography (timeout: ${timeoutValue}s)...`);
    logger.debug(`url: ${pendingUrl}`);
    
    setLoading(true);
    setMetadata(null);

    try {
      const startTime = Date.now();
      const data = await fetchSpotifyMetadata(pendingUrl, true, 1.0, timeoutValue);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      
      setMetadata(data);
      
      if ("artist_info" in data) {
        logger.success(`fetched artist: ${data.artist_info.name}`);
        logger.debug(`${data.album_list.length} albums, ${data.track_list.length} tracks`);
      }
      
      logger.info(`fetch completed in ${elapsed}s`);
      toast.success("Metadata fetched successfully");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch metadata";
      logger.error(`fetch failed: ${errorMsg}`);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAlbumClick = (album: {
    id: string;
    name: string;
    external_urls: string;
  }) => {
    logger.debug(`album clicked: ${album.name}`);
    setSelectedAlbum(album);
    setShowAlbumDialog(true);
  };

  const handleArtistClick = async (artist: {
    id: string;
    name: string;
    external_urls: string;
  }) => {
    logger.debug(`artist clicked: ${artist.name}`);
    const artistUrl = artist.external_urls.replace(/\/$/, "") + "/discography/all";
    setPendingUrl(artistUrl);
    setPendingArtistName(artist.name);
    setShowTimeoutDialog(true);
    return artistUrl;
  };

  const handleConfirmAlbumFetch = async () => {
    if (!selectedAlbum) return;

    const albumUrl = selectedAlbum.external_urls;
    logger.info(`fetching album: ${selectedAlbum.name}...`);
    logger.debug(`url: ${albumUrl}`);
    
    setShowAlbumDialog(false);
    setLoading(true);
    setMetadata(null);

    try {
      const startTime = Date.now();
      const data = await fetchSpotifyMetadata(albumUrl);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      
      setMetadata(data);
      
      if ("album_info" in data) {
        logger.success(`fetched album: ${data.album_info.name}`);
        logger.debug(`${data.track_list.length} tracks, released: ${data.album_info.release_date}`);
      }
      
      logger.info(`fetch completed in ${elapsed}s`);
      toast.success("Album metadata fetched successfully");
      return albumUrl;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch album metadata";
      logger.error(`fetch failed: ${errorMsg}`);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setSelectedAlbum(null);
    }
  };

  const clearMetadata = () => {
    setMetadata(null);
  };

  return {
    loading,
    metadata,
    showTimeoutDialog,
    setShowTimeoutDialog,
    timeoutValue,
    setTimeoutValue,
    showAlbumDialog,
    setShowAlbumDialog,
    selectedAlbum,
    pendingArtistName,
    handleFetchMetadata,
    handleConfirmFetch,
    handleAlbumClick,
    handleConfirmAlbumFetch,
    handleArtistClick,
    clearMetadata,
  };
}
