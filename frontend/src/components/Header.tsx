interface HeaderProps {
  version: string;
  hasUpdate: boolean;
  releaseDate?: string | null;
}

export function Header({ hasUpdate }: HeaderProps) {
  return (
    <div className="relative">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <img
            src="/icon.png"
            alt="SpotiMeow"
            className="w-12 h-12 cursor-pointer"
            onClick={() => window.location.reload()}
          />
          <h1
            className="text-4xl font-bold cursor-pointer"
            onClick={() => window.location.reload()}
          >
            SpotiMeow
          </h1>
          <div className="relative">
        
            {hasUpdate && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            )}
          </div>
        </div>
        <p className="text-muted-foreground">
          Spotify tracks in FLAC from Tidal, Qobuz & Amazon Music.
        </p>
      </div>
    </div>
  );
}
