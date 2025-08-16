import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, CloudUpload, RefreshCw } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
  onPush: () => void;
  onSync: () => void;
}

export default function Header({ onToggleSidebar, onPush, onSync }: HeaderProps) {
  const { user, isLoading } = useAuth();

  return (
    <header className="bg-dark-surface border-b border-dark-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 hover:bg-dark-bg"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-2">
          <div className="text-github-blue text-xl">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <span className="font-semibold text-lg">CodeTab</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button 
          onClick={onPush}
          className="bg-success-green hover:bg-green-600 text-white"
          size="sm"
        >
          <CloudUpload className="h-4 w-4 mr-2" />
          Push
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSync}
          className="hover:bg-dark-bg"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-2 px-3 py-2 bg-dark-bg rounded-lg">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImageUrl || undefined} alt="User avatar" />
            <AvatarFallback className="text-xs">
              {user?.firstName?.[0] || user?.email?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">
            {user?.firstName || user?.email?.split('@')[0] || "User"}
          </span>
        </div>
      </div>
    </header>
  );
}
