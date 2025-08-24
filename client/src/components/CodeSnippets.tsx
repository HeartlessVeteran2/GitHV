import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Code, 
  Plus, 
  Search, 
  Star,
  Copy,
  Edit,
  Trash,
  Tag,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

interface CodeSnippetsProps {
  onInsertSnippet: (code: string) => void;
}

export default function CodeSnippets({ onInsertSnippet }: CodeSnippetsProps) {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([
    {
      id: "1",
      title: "React Component Template",
      description: "Basic functional React component with TypeScript",
      code: `interface Props {\n  // Define props here\n}\n\nexport default function ComponentName({ }: Props) {\n  return (\n    <div>\n      {/* Component content */}\n    </div>\n  );\n}`,
      language: "tsx",
      tags: ["react", "typescript", "template"],
      isFavorite: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: "2",
      title: "Express Route Handler",
      description: "Express.js API route with error handling",
      code: `app.get('/api/endpoint', async (req, res) => {\n  try {\n    // Handle request\n    const result = await someAsyncOperation();\n    res.json({ success: true, data: result });\n  } catch (error) {\n    console.error('Error:', error);\n    res.status(500).json({ error: 'Internal server error' });\n  }\n});`,
      language: "javascript",
      tags: ["express", "api", "error-handling"],
      isFavorite: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: "3",
      title: "CSS Flexbox Center",
      description: "Perfect centering with flexbox",
      code: `.center-container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n}`,
      language: "css",
      tags: ["css", "flexbox", "centering"],
      isFavorite: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<CodeSnippet | null>(null);
  const [newSnippet, setNewSnippet] = useState({
    title: "",
    description: "",
    code: "",
    language: "javascript",
    tags: ""
  });
  
  const { toast } = useToast();

  const languages = ["all", "javascript", "typescript", "tsx", "css", "html", "python", "json"];
  
  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = !searchTerm || 
      snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLanguage = selectedLanguage === "all" || snippet.language === selectedLanguage;
    const matchesFavorites = !showFavoritesOnly || snippet.isFavorite;
    
    return matchesSearch && matchesLanguage && matchesFavorites;
  });

  const toggleFavorite = (id: string) => {
    setSnippets(prev => prev.map(snippet => 
      snippet.id === id ? { ...snippet, isFavorite: !snippet.isFavorite } : snippet
    ));
  };

  const copySnippet = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Copied to clipboard",
        description: "Code snippet has been copied to your clipboard"
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const insertSnippet = (snippet: CodeSnippet) => {
    onInsertSnippet(snippet.code);
    // Update last used
    setSnippets(prev => prev.map(s => 
      s.id === snippet.id ? { ...s, lastUsed: new Date() } : s
    ));
    toast({
      title: "Snippet inserted",
      description: `"${snippet.title}" has been inserted into the editor`
    });
  };

  const saveSnippet = () => {
    if (!newSnippet.title || !newSnippet.code) {
      toast({
        title: "Missing required fields",
        description: "Please provide a title and code for the snippet",
        variant: "destructive"
      });
      return;
    }

    const snippet: CodeSnippet = {
      id: editingSnippet?.id || Date.now().toString(),
      title: newSnippet.title,
      description: newSnippet.description,
      code: newSnippet.code,
      language: newSnippet.language,
      tags: newSnippet.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      isFavorite: editingSnippet?.isFavorite || false,
      createdAt: editingSnippet?.createdAt || new Date()
    };

    if (editingSnippet) {
      setSnippets(prev => prev.map(s => s.id === snippet.id ? snippet : s));
    } else {
      setSnippets(prev => [...prev, snippet]);
    }

    setIsDialogOpen(false);
    setEditingSnippet(null);
    setNewSnippet({ title: "", description: "", code: "", language: "javascript", tags: "" });
    
    toast({
      title: editingSnippet ? "Snippet updated" : "Snippet saved",
      description: `"${snippet.title}" has been ${editingSnippet ? 'updated' : 'saved'}`
    });
  };

  const editSnippet = (snippet: CodeSnippet) => {
    setEditingSnippet(snippet);
    setNewSnippet({
      title: snippet.title,
      description: snippet.description,
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags.join(', ')
    });
    setIsDialogOpen(true);
  };

  const deleteSnippet = (id: string) => {
    setSnippets(prev => prev.filter(s => s.id !== id));
    toast({
      title: "Snippet deleted",
      description: "Code snippet has been removed"
    });
  };

  return (
    <Card className="bg-dark-surface border-dark-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>Code Snippets</span>
          </CardTitle>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => {
                setEditingSnippet(null);
                setNewSnippet({ title: "", description: "", code: "", language: "javascript", tags: "" });
              }}>
                <Plus className="h-4 w-4 mr-1" />
                New Snippet
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-dark-surface border-dark-border max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSnippet ? "Edit Snippet" : "Create New Snippet"}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newSnippet.title}
                    onChange={(e) => setNewSnippet(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Snippet title"
                    className="bg-dark-bg border-dark-border"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={newSnippet.description}
                    onChange={(e) => setNewSnippet(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the snippet"
                    className="bg-dark-bg border-dark-border"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Language</label>
                    <select
                      value={newSnippet.language}
                      onChange={(e) => setNewSnippet(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full p-2 rounded bg-dark-bg border border-dark-border text-sm"
                    >
                      {languages.filter(lang => lang !== "all").map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Tags</label>
                    <Input
                      value={newSnippet.tags}
                      onChange={(e) => setNewSnippet(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="tag1, tag2, tag3"
                      className="bg-dark-bg border-dark-border"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Code</label>
                  <Textarea
                    value={newSnippet.code}
                    onChange={(e) => setNewSnippet(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="Enter your code snippet here..."
                    className="bg-dark-bg border-dark-border font-mono min-h-32"
                    rows={10}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveSnippet}>
                    {editingSnippet ? "Update" : "Save"} Snippet
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search snippets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-dark-bg border-dark-border"
            />
          </div>
          
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="p-2 rounded bg-dark-bg border border-dark-border text-sm"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>
                {lang === "all" ? "All Languages" : lang}
              </option>
            ))}
          </select>
          
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Star className="h-4 w-4 mr-1" />
            Favorites
          </Button>
        </div>

        {/* Snippets List */}
        <ScrollArea className="max-h-96">
          <div className="space-y-3">
            {filteredSnippets.map((snippet) => (
              <Card key={snippet.id} className="bg-dark-bg border-dark-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{snippet.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">{snippet.description}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(snippet.id)}
                        className="p-1"
                      >
                        <Star className={`h-4 w-4 ${snippet.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`} />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editSnippet(snippet)}
                        className="p-1"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSnippet(snippet.id)}
                        className="p-1 text-red-400"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {snippet.language}
                    </Badge>
                    {snippet.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <pre className="text-xs bg-black/20 p-2 rounded border overflow-x-auto mb-2">
                    <code>{snippet.code.length > 100 ? snippet.code.slice(0, 100) + "..." : snippet.code}</code>
                  </pre>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{snippet.createdAt.toLocaleDateString()}</span>
                      {snippet.lastUsed && (
                        <span>• Used {snippet.lastUsed.toLocaleDateString()}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copySnippet(snippet.code)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => insertSnippet(snippet)}
                      >
                        Insert
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredSnippets.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Code className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No snippets found</p>
                <p className="text-xs">Try adjusting your search or create a new snippet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}