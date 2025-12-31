import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InputWithContext } from "@/components/ui/input-with-context";
import { CloudDownload, Info, XCircle, Link, Search, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FetchHistory } from "@/components/FetchHistory";
import type { HistoryItem } from "@/components/FetchHistory";
import { SearchSpotify, SearchSpotifyByType } from "../../wailsjs/go/main/App";
import { backend } from "../../wailsjs/go/models";
import { cn } from "@/lib/utils";

type ResultTab = "tracks" | "albums" | "artists" | "playlists";
type SearchTab = "track-url" | "playlist-url" | "title-search";

const RECENT_SEARCHES_KEY = "spotiflac_recent_searches";
const MAX_RECENT_SEARCHES = 8;
const SEARCH_LIMIT = 15;

interface SearchBarProps {
  url: string;
  loading: boolean;
  onUrlChange: (url: string) => void;
  onFetch: (searchTab?: SearchTab) => void;
  onFetchUrl: (url: string) => Promise<void>;
  history: HistoryItem[];
  onHistorySelect: (item: HistoryItem) => void;
  onHistoryRemove: (id: string) => void;
  hasResult: boolean;
  searchMode: boolean;
  onSearchModeChange: (isSearch: boolean) => void;
  onNewSearch?: () => void;
}

export function SearchBar({
  url,
  loading,
  onUrlChange,
  onFetch,
  onFetchUrl,
  history,
  onHistorySelect,
  onHistoryRemove,
  hasResult,
  searchMode,
  onSearchModeChange,
  onNewSearch,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<backend.SearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastSearchedQuery, setLastSearchedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ResultTab>("tracks");
  const [searchTab, setSearchTab] = useState<SearchTab>("track-url");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);  
  const [currentPage, setCurrentPage] = useState<Record<ResultTab, number>>({
    tracks: 1,
    albums: 1,
    artists: 1,
    playlists: 1,
  });  
  const [hasMore, setHasMore] = useState<Record<ResultTab, boolean>>({
    tracks: false,
    albums: false,
    artists: false,
    playlists: false,
  });

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load recent searches:", error);
    }
  }, []);

  const saveRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save recent searches:", error);
      }
      return updated;
    });
  };

  const removeRecentSearch = (query: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== query);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save recent searches:", error);
      }
      return updated;
    });
  };

  // Manual search function for title search
  const handleTitleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await SearchSpotify({ query: searchQuery, limit: SEARCH_LIMIT });
      setSearchResults(results);
      setLastSearchedQuery(searchQuery.trim());
      saveRecentSearch(searchQuery.trim());
        
      // Reset pagination
      setCurrentPage({
        tracks: 1,
        albums: 1,
        artists: 1,
        playlists: 1,
      });
        
      // Check if there might be more results
      setHasMore({
        tracks: results.tracks.length === SEARCH_LIMIT,
        albums: results.albums.length === SEARCH_LIMIT,
        artists: results.artists.length === SEARCH_LIMIT,
        playlists: results.playlists.length === SEARCH_LIMIT,
      });
      
      // Auto-select first tab with results
      if (results.tracks.length > 0) setActiveTab("tracks");
      else if (results.albums.length > 0) setActiveTab("albums");
      else if (results.artists.length > 0) setActiveTab("artists");
      else if (results.playlists.length > 0) setActiveTab("playlists");
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleNextPage = async () => {
    if (!searchResults || !lastSearchedQuery || isLoadingMore) return;

    const typeMap: Record<ResultTab, string> = {
      tracks: "track",
      albums: "album",
      artists: "artist",
      playlists: "playlist",
    };

    const nextPage = currentPage[activeTab] + 1;
    const offset = (nextPage - 1) * SEARCH_LIMIT;
    
    setIsLoadingMore(true);
    try {
      const newResults = await SearchSpotifyByType({
        query: lastSearchedQuery,
        search_type: typeMap[activeTab],
        limit: SEARCH_LIMIT,
        offset: offset,
      });

      if (newResults.length > 0) {
        setSearchResults((prev) => {
          if (!prev) return prev;
          // Replace the current tab's results with new page results
          const updated = new backend.SearchResponse({
            tracks: activeTab === "tracks" ? newResults : prev.tracks,
            albums: activeTab === "albums" ? newResults : prev.albums,
            artists: activeTab === "artists" ? newResults : prev.artists,
            playlists: activeTab === "playlists" ? newResults : prev.playlists,
          });
          return updated;
        });
        
        setCurrentPage((prev: Record<ResultTab, number>) => ({
          ...prev,
          [activeTab]: nextPage,
        }));
      }

      // Update hasMore for this tab
      setHasMore((prev: Record<ResultTab, boolean>) => ({
        ...prev,
        [activeTab]: newResults.length === SEARCH_LIMIT,
      }));
    } catch (error) {
      console.error("Next page failed:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handlePrevPage = async () => {
    if (!searchResults || !lastSearchedQuery || isLoadingMore || currentPage[activeTab] <= 1) return;

    const typeMap: Record<ResultTab, string> = {
      tracks: "track",
      albums: "album",
      artists: "artist",
      playlists: "playlist",
    };

    const prevPage = currentPage[activeTab] - 1;
    const offset = (prevPage - 1) * SEARCH_LIMIT;
    
    setIsLoadingMore(true);
    try {
      const newResults = await SearchSpotifyByType({
        query: lastSearchedQuery,
        search_type: typeMap[activeTab],
        limit: SEARCH_LIMIT,
        offset: offset,
      });

      setSearchResults((prev) => {
        if (!prev) return prev;
        // Replace the current tab's results with new page results
        const updated = new backend.SearchResponse({
          tracks: activeTab === "tracks" ? newResults : prev.tracks,
          albums: activeTab === "albums" ? newResults : prev.albums,
          artists: activeTab === "artists" ? newResults : prev.artists,
          playlists: activeTab === "playlists" ? newResults : prev.playlists,
        });
        return updated;
      });
      
      setCurrentPage((prev: Record<ResultTab, number>) => ({
        ...prev,
        [activeTab]: prevPage,
      }));
      
      // Always set hasMore to true when going back (unless it's page 1)
      setHasMore((prev: Record<ResultTab, boolean>) => ({
        ...prev,
        [activeTab]: true,
      }));
    } catch (error) {
      console.error("Previous page failed:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleResultClick = (externalUrl: string) => {
    onSearchModeChange(false);
    onFetchUrl(externalUrl);
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const hasAnyResults = searchResults && (
    searchResults.tracks.length > 0 ||
    searchResults.albums.length > 0 ||
    searchResults.artists.length > 0 ||
    searchResults.playlists.length > 0
  );

  const getTabCount = (tab: ResultTab): number => {
    if (!searchResults) return 0;
    switch (tab) {
      case "tracks": return searchResults.tracks.length;
      case "albums": return searchResults.albums.length;
      case "artists": return searchResults.artists.length;
      case "playlists": return searchResults.playlists.length;
    }
  };

  const tabs: { key: ResultTab; label: string }[] = [
    { key: "tracks", label: "Tracks" },
    { key: "albums", label: "Albums" },
    { key: "artists", label: "Artists" },
    { key: "playlists", label: "Playlists" },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {/* Search Type Tabs */}
          <div className="flex items-center bg-muted rounded-md p-1">
            <button
              type="button"
              onClick={() => {
                setSearchTab("track-url");
                onSearchModeChange(false);
              }}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded text-sm font-medium transition-colors cursor-pointer",
                searchTab === "track-url"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Link className="h-3.5 w-3.5" />
              Track URL
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchTab("playlist-url");
                onSearchModeChange(false);
              }}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded text-sm font-medium transition-colors cursor-pointer",
                searchTab === "playlist-url"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Link className="h-3.5 w-3.5" />
              Playlist URL
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchTab("title-search");
                onSearchModeChange(true);
              }}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded text-sm font-medium transition-colors cursor-pointer",
                searchTab === "title-search"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Search className="h-3.5 w-3.5" />
              Title Search
            </button>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="right">
              {searchTab === "track-url" && (
                <>
                  <p>Supports track and album URLs</p>
                  <p className="mt-1">Note: Must be public content</p>
                </>
              )}
              {searchTab === "playlist-url" && (
                <>
                  <p>Supports playlist and artist URLs</p>
                  <p className="mt-1">Note: Playlist must be public (not private)</p>
                </>
              )}
              {searchTab === "title-search" && (
                <p>Search for tracks, albums, artists, or playlists</p>
              )}
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex gap-2">
          {/* New Search button for URL tabs when results exist */}
          {!searchMode && hasResult && onNewSearch && (
            <Button
              variant="outline"
              onClick={onNewSearch}
              className="shrink-0"
            >
              New Search
            </Button>
          )}
          
          <div className="relative flex-1">
            {searchTab !== "title-search" ? (
              <>
                <InputWithContext
                  id="spotify-url"
                  placeholder={
                    searchTab === "track-url" 
                      ? "https://open.spotify.com/track/... or album/..."
                      : "https://open.spotify.com/playlist/... or artist/..."
                  }
                  value={url}
                  onChange={(e) => onUrlChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onFetch(searchTab)}
                  className="pr-8"
                />
                {url && (
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    onClick={() => onUrlChange("")}
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </>
            ) : (
              <>
                <InputWithContext
                  id="spotify-search"
                  placeholder="Search tracks, albums, artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTitleSearch()}
                  className="pr-8"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults(null);
                      setLastSearchedQuery("");
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </>
            )}
          </div>

          {!searchMode && (
            <Button onClick={() => onFetch(searchTab)} disabled={loading}>
              {loading ? (
                <>
                  <Spinner />
                  Fetching...
                </>
              ) : (
                <>
                  <CloudDownload className="h-4 w-4" />
                  Fetch
                </>
              )}
            </Button>
          )}
          
          {searchMode && (
            <Button onClick={handleTitleSearch} disabled={isSearching}>
              {isSearching ? (
                <>
                  <Spinner />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {!searchMode && !hasResult && (
        <FetchHistory
          history={history}
          onSelect={onHistorySelect}
          onRemove={onHistoryRemove}
          tabFilter={searchTab === "track-url" ? "track" : searchTab === "playlist-url" ? "playlist" : undefined}
        />
      )}

      {/* Search Results with Tabs */}
      {searchMode && (
        <div className="space-y-4">
          {/* Recent Searches - show when no query or no results yet */}
          {!searchQuery && !searchResults && recentSearches.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Recent Searches</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((query) => (
                  <div
                    key={query}
                    className="group relative flex items-center px-3 py-1.5 bg-muted hover:bg-accent rounded-full text-sm cursor-pointer transition-colors"
                    onClick={() => setSearchQuery(query)}
                  >
                    <span>{query}</span>
                    <button
                      type="button"
                      className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(query);
                      }}
                    >
                      <X className="h-3 w-3 text-red-900" strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isSearching && (
            <div className="flex items-center justify-center py-8">
              <Spinner />
              <span className="ml-2 text-muted-foreground">Searching...</span>
            </div>
          )}

          {!isSearching && searchQuery && !hasAnyResults && (
            <div className="text-center py-8 text-muted-foreground">
              No results found for "{searchQuery}"
            </div>
          )}

          {!isSearching && hasAnyResults && (
            <>
              {/* Tabs */}
              <div className="flex gap-1 border-b">
                {tabs.map((tab) => {
                  const count = getTabCount(tab.key);
                  if (count === 0) return null;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        "px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px",
                        activeTab === tab.key
                          ? "border-primary text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab.label} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="grid gap-2">
                {/* Tracks */}
                {activeTab === "tracks" && searchResults?.tracks.map((track) => (
                  <button
                    key={track.id}
                    type="button"
                    className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-accent border cursor-pointer text-left transition-colors"
                    onClick={() => handleResultClick(track.external_urls)}
                  >
                    {track.images ? (
                      <img src={track.images} alt="" className="w-12 h-12 rounded object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-muted shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{track.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{track.artists}</p>
                    </div>
                    <span className="text-sm text-muted-foreground shrink-0">
                      {formatDuration(track.duration_ms || 0)}
                    </span>
                  </button>
                ))}

                {/* Albums */}
                {activeTab === "albums" && searchResults?.albums.map((album) => (
                  <button
                    key={album.id}
                    type="button"
                    className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-accent border cursor-pointer text-left transition-colors"
                    onClick={() => handleResultClick(album.external_urls)}
                  >
                    {album.images ? (
                      <img src={album.images} alt="" className="w-12 h-12 rounded object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-muted shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{album.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{album.artists}</p>
                    </div>
                    <span className="text-sm text-muted-foreground shrink-0">
                      {album.total_tracks} tracks
                    </span>
                  </button>
                ))}

                {/* Artists */}
                {activeTab === "artists" && searchResults?.artists.map((artist) => (
                  <button
                    key={artist.id}
                    type="button"
                    className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-accent border cursor-pointer text-left transition-colors"
                    onClick={() => handleResultClick(artist.external_urls)}
                  >
                    {artist.images ? (
                      <img src={artist.images} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{artist.name}</p>
                      <p className="text-sm text-muted-foreground">Artist</p>
                    </div>
                  </button>
                ))}

                {/* Playlists */}
                {activeTab === "playlists" && searchResults?.playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    type="button"
                    className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-accent border cursor-pointer text-left transition-colors"
                    onClick={() => handleResultClick(playlist.external_urls)}
                  >
                    {playlist.images ? (
                      <img src={playlist.images} alt="" className="w-12 h-12 rounded object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-muted shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{playlist.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {playlist.owner} • {playlist.total_tracks} tracks
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Pagination Controls */}
              {(currentPage[activeTab] > 1 || hasMore[activeTab]) && (
                <div className="flex justify-between items-center pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevPage}
                    disabled={isLoadingMore || currentPage[activeTab] <= 1}
                    size="sm"
                  >
                    Previous
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage[activeTab]}
                    {getTabCount(activeTab) > 0 && (
                      <> • {getTabCount(activeTab)} results</>
                    )}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={isLoadingMore || !hasMore[activeTab]}
                    size="sm"
                  >
                    {isLoadingMore ? (
                      <>
                        <Spinner />
                        Loading...
                      </>
                    ) : (
                      "Next"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
