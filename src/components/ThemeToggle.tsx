
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-[1.2rem] w-[1.2rem] text-amber-500" />;
      case 'dark':
        return <Moon className="h-[1.2rem] w-[1.2rem] text-blue-400" />;
      default:
        return <Monitor className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="theme-transition hover:bg-accent hover:text-accent-foreground"
        >
          {getThemeIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card border-border">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Sun className="h-4 w-4 text-amber-500" />
          Light
          {theme === 'light' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Moon className="h-4 w-4 text-blue-400" />
          Dark
          {theme === 'dark' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Monitor className="h-4 w-4 text-muted-foreground" />
          System
          {theme === 'system' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
