import { Button } from "@/components/ui/button";
import { Save, Search, Terminal } from "lucide-react";

interface TouchToolbarProps {
  onSave: () => void;
  onSearch: () => void;
  onToggleTerminal: () => void;
}

export default function TouchToolbar({ onSave, onSearch, onToggleTerminal }: TouchToolbarProps) {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col space-y-2 md:hidden z-50">
      <Button
        size="lg"
        className="w-12 h-12 bg-github-blue hover:bg-blue-600 rounded-full shadow-lg"
        onClick={onSave}
      >
        <Save className="h-5 w-5" />
      </Button>
      <Button
        size="lg"
        variant="secondary"
        className="w-12 h-12 bg-dark-surface hover:bg-dark-border rounded-full shadow-lg"
        onClick={onSearch}
      >
        <Search className="h-5 w-5" />
      </Button>
      <Button
        size="lg"
        variant="secondary"
        className="w-12 h-12 bg-dark-surface hover:bg-dark-border rounded-full shadow-lg"
        onClick={onToggleTerminal}
      >
        <Terminal className="h-5 w-5" />
      </Button>
    </div>
  );
}
