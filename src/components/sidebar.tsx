import { Home, BookOpen, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function Sidebar({ currentPath, onNavigate }: SidebarProps) {
  const navItems = [
    {
      label: "Home",
      path: "/",
      icon: Home,
    },
    {
      label: "Tutorial",
      path: "/tutorial",
      icon: BookOpen,
    },
    {
      label: "Code Editor",
      path: "/editor",
      icon: FileCode,
    },
  ];

  return (
    <div className="flex h-full w-60 flex-col border-r bg-muted/40">
      <div className="p-4">
        <h2 className="text-lg font-semibold">Tauri App</h2>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
