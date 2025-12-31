import { FileMusic, FilePen } from "lucide-react";
import { HomeIcon } from "@/components/ui/home";
import { SettingsIcon } from "@/components/ui/settings";
import { ActivityIcon } from "@/components/ui/activity";
import { TerminalIcon } from "@/components/ui/terminal";
import { Button } from "@/components/ui/button";

export type PageType = "main" | "settings" | "debug" | "audio-analysis" | "audio-converter" | "file-manager";

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <div className="fixed left-0 top-0 h-full w-48 bg-card border-r border-border flex flex-col pt-4 pb-14 z-30 px-3">
      {/* Logo and subtitle section */}
      <div className="text-center space-y-2 mb-6 pb-4 border-b border-border">
        <div className="flex flex-col items-center justify-center gap-1">
          <img
            src="/icon.png"
            alt="SpotiMeow"
            className="w-20 h-20 cursor-pointer"
            onClick={() => window.location.reload()}
          />
          <h1
            className="text-lg font-bold cursor-pointer"
            onClick={() => window.location.reload()}
          >
            SpotiMeow
          </h1>
        </div>
        <p className="text-xs text-muted-foreground leading-tight">
          Spotify tracks in FLAC
        </p>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {/* Home */}
        <Button
          variant={currentPage === "main" ? "secondary" : "ghost"}
          className="h-10 justify-start gap-3"
          onClick={() => onPageChange("main")}
        >
          <HomeIcon size={20} />
          <span>Home</span>
        </Button>

        {/* Audio Analysis */}
        <Button
          variant={currentPage === "audio-analysis" ? "secondary" : "ghost"}
          className="h-10 justify-start gap-3"
          onClick={() => onPageChange("audio-analysis")}
        >
          <ActivityIcon size={20} />
          <span>Audio Analyzer</span>
        </Button>

        {/* Audio Converter */}
        <Button
          variant={currentPage === "audio-converter" ? "secondary" : "ghost"}
          className="h-10 justify-start gap-3"
          onClick={() => onPageChange("audio-converter")}
        >
          <FileMusic className="h-5 w-5" />
          <span>Audio Converter</span>
        </Button>

        {/* File Manager */}
        <Button
          variant={currentPage === "file-manager" ? "secondary" : "ghost"}
          className="h-10 justify-start gap-3"
          onClick={() => onPageChange("file-manager")}
        >
          <FilePen className="h-5 w-5" />
          <span>File Manager</span>
        </Button>
      
      </div>
      {/* Bottom menu */}
      <div className="mt-auto flex flex-col gap-2 border-t border-border pt-1">
        {/* Settings */}
        <Button
          variant={currentPage === "settings" ? "secondary" : "ghost"}
          className="h-10 justify-start gap-3"
          onClick={() => onPageChange("settings")}
        >
          <SettingsIcon size={20} />
          <span>Settings</span>
        </Button>

        {/* Debug */}
        <Button
          variant={currentPage === "debug" ? "secondary" : "ghost"}
          className="h-10 justify-start gap-3"
          onClick={() => onPageChange("debug")}
        >
          <TerminalIcon size={20} />
          <span>Debug</span>
        </Button>
      </div>
    </div>
  );
}
