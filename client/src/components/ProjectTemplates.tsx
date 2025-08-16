import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Folder, 
  Plus, 
  Search, 
  Star,
  Download,
  Code,
  Palette,
  Database,
  Globe,
  Smartphone,
  Server
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  icon: any;
  popularity: number;
  files: TemplateFile[];
  dependencies: string[];
  scripts: Record<string, string>;
}

interface TemplateFile {
  path: string;
  content: string;
  type: 'file' | 'directory';
}

interface ProjectTemplatesProps {
  onCreateProject: (template: ProjectTemplate, projectName: string) => void;
}

export default function ProjectTemplates({ onCreateProject }: ProjectTemplatesProps) {
  const [templates] = useState<ProjectTemplate[]>([
    {
      id: "react-ts-app",
      name: "React TypeScript App",
      description: "Modern React application with TypeScript, Vite, and Tailwind CSS",
      category: "Frontend",
      tags: ["react", "typescript", "vite", "tailwind"],
      icon: Code,
      popularity: 95,
      files: [
        {
          path: "src/App.tsx",
          content: `import { useState } from 'react'\nimport './App.css'\n\nfunction App() {\n  const [count, setCount] = useState(0)\n\n  return (\n    <div className="App">\n      <h1>React TypeScript App</h1>\n      <button onClick={() => setCount(count + 1)}>\n        Count: {count}\n      </button>\n    </div>\n  )\n}\n\nexport default App`,
          type: 'file'
        },
        {
          path: "src/main.tsx",
          content: `import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App.tsx'\nimport './index.css'\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n)`,
          type: 'file'
        }
      ],
      dependencies: ["react", "react-dom", "@types/react", "@types/react-dom", "typescript", "vite", "tailwindcss"],
      scripts: {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
      }
    },
    {
      id: "express-api",
      name: "Express API Server",
      description: "RESTful API server with Express.js, TypeScript, and database integration",
      category: "Backend",
      tags: ["express", "typescript", "api", "database"],
      icon: Server,
      popularity: 88,
      files: [
        {
          path: "src/index.ts",
          content: `import express from 'express';\nimport cors from 'cors';\n\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\napp.use(cors());\napp.use(express.json());\n\napp.get('/api/health', (req, res) => {\n  res.json({ status: 'OK', message: 'Server is running!' });\n});\n\napp.listen(PORT, () => {\n  console.log(\`Server running on port \${PORT}\`);\n});`,
          type: 'file'
        },
        {
          path: "src/routes/users.ts",
          content: `import { Router } from 'express';\n\nconst router = Router();\n\nrouter.get('/', (req, res) => {\n  res.json({ users: [] });\n});\n\nrouter.post('/', (req, res) => {\n  const user = req.body;\n  res.status(201).json(user);\n});\n\nexport default router;`,
          type: 'file'
        }
      ],
      dependencies: ["express", "@types/express", "typescript", "cors", "@types/cors", "nodemon"],
      scripts: {
        "dev": "nodemon src/index.ts",
        "build": "tsc",
        "start": "node dist/index.js"
      }
    },
    {
      id: "mobile-app",
      name: "React Native App",
      description: "Cross-platform mobile app with React Native and Expo",
      category: "Mobile",
      tags: ["react-native", "expo", "mobile", "typescript"],
      icon: Smartphone,
      popularity: 82,
      files: [
        {
          path: "App.tsx",
          content: `import React from 'react';\nimport { StyleSheet, Text, View } from 'react-native';\n\nexport default function App() {\n  return (\n    <View style={styles.container}>\n      <Text style={styles.title}>Welcome to React Native!</Text>\n    </View>\n  );\n}\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    backgroundColor: '#fff',\n    alignItems: 'center',\n    justifyContent: 'center',\n  },\n  title: {\n    fontSize: 20,\n    fontWeight: 'bold',\n  },\n});`,
          type: 'file'
        }
      ],
      dependencies: ["expo", "react", "react-native", "@types/react", "@types/react-native"],
      scripts: {
        "start": "expo start",
        "android": "expo start --android",
        "ios": "expo start --ios"
      }
    },
    {
      id: "nextjs-app",
      name: "Next.js Full-Stack App",
      description: "Full-stack web application with Next.js, TypeScript, and API routes",
      category: "Full-Stack",
      tags: ["nextjs", "typescript", "react", "ssr"],
      icon: Globe,
      popularity: 90,
      files: [
        {
          path: "pages/index.tsx",
          content: `import type { NextPage } from 'next'\nimport Head from 'next/head'\nimport styles from '../styles/Home.module.css'\n\nconst Home: NextPage = () => {\n  return (\n    <div className={styles.container}>\n      <Head>\n        <title>Next.js App</title>\n        <meta name="description" content="Generated by create next app" />\n        <link rel="icon" href="/favicon.ico" />\n      </Head>\n\n      <main className={styles.main}>\n        <h1 className={styles.title}>\n          Welcome to Next.js!\n        </h1>\n      </main>\n    </div>\n  )\n}\n\nexport default Home`,
          type: 'file'
        },
        {
          path: "pages/api/hello.ts",
          content: `import type { NextApiRequest, NextApiResponse } from 'next'\n\ntype Data = {\n  name: string\n}\n\nexport default function handler(\n  req: NextApiRequest,\n  res: NextApiResponse<Data>\n) {\n  res.status(200).json({ name: 'John Doe' })\n}`,
          type: 'file'
        }
      ],
      dependencies: ["next", "react", "react-dom", "@types/react", "@types/react-dom", "@types/node", "typescript"],
      scripts: {
        "dev": "next dev",
        "build": "next build",
        "start": "next start"
      }
    },
    {
      id: "vue-app",
      name: "Vue.js Application",
      description: "Modern Vue.js application with TypeScript and Vite",
      category: "Frontend",
      tags: ["vue", "typescript", "vite", "composition-api"],
      icon: Palette,
      popularity: 75,
      files: [
        {
          path: "src/App.vue",
          content: `<template>\n  <div id="app">\n    <h1>{{ message }}</h1>\n    <button @click="increment">Count: {{ count }}</button>\n  </div>\n</template>\n\n<script setup lang="ts">\nimport { ref } from 'vue'\n\nconst message = ref('Hello Vue 3!')\nconst count = ref(0)\n\nconst increment = () => {\n  count.value++\n}\n</script>\n\n<style>\n#app {\n  text-align: center;\n  margin-top: 60px;\n}\n</style>`,
          type: 'file'
        },
        {
          path: "src/main.ts",
          content: `import { createApp } from 'vue'\nimport App from './App.vue'\n\ncreateApp(App).mount('#app')`,
          type: 'file'
        }
      ],
      dependencies: ["vue", "@vitejs/plugin-vue", "typescript", "vite"],
      scripts: {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
      }
    },
    {
      id: "python-api",
      name: "Python FastAPI",
      description: "High-performance Python API with FastAPI and async support",
      category: "Backend",
      tags: ["python", "fastapi", "async", "api"],
      icon: Database,
      popularity: 85,
      files: [
        {
          path: "main.py",
          content: `from fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI(title="My API", version="1.0.0")\n\nclass Item(BaseModel):\n    name: str\n    description: str = None\n    price: float\n    tax: float = None\n\n@app.get("/")\nasync def root():\n    return {"message": "Hello World"}\n\n@app.post("/items/")\nasync def create_item(item: Item):\n    return item\n\n@app.get("/items/{item_id}")\nasync def read_item(item_id: int):\n    return {"item_id": item_id}`,
          type: 'file'
        },
        {
          path: "requirements.txt",
          content: `fastapi==0.104.1\nuvicorn[standard]==0.24.0\npydantic==2.5.0`,
          type: 'file'
        }
      ],
      dependencies: ["fastapi", "uvicorn", "pydantic"],
      scripts: {
        "dev": "uvicorn main:app --reload",
        "start": "uvicorn main:app --host 0.0.0.0 --port 8000"
      }
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [projectName, setProjectName] = useState("");
  
  const { toast } = useToast();

  const categories = ["all", "Frontend", "Backend", "Full-Stack", "Mobile"];
  
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => b.popularity - a.popularity);

  const handleCreateProject = () => {
    if (!selectedTemplate || !projectName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a project name",
        variant: "destructive"
      });
      return;
    }

    onCreateProject(selectedTemplate, projectName.trim());
    setIsDialogOpen(false);
    setSelectedTemplate(null);
    setProjectName("");
    
    toast({
      title: "Project Created",
      description: `${projectName} has been created from ${selectedTemplate.name} template`
    });
  };

  const openCreateDialog = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setProjectName(`my-${template.id}`);
    setIsDialogOpen(true);
  };

  const getPopularityColor = (popularity: number) => {
    if (popularity >= 90) return "text-green-400";
    if (popularity >= 80) return "text-yellow-400";
    return "text-gray-400";
  };

  return (
    <Card className="bg-dark-surface border-dark-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Folder className="h-5 w-5" />
          <span>Project Templates</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-dark-bg border-dark-border"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 rounded bg-dark-bg border border-dark-border text-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>
        </div>

        {/* Templates Grid */}
        <ScrollArea className="max-h-96">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="bg-dark-bg border-dark-border hover:border-gray-600 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-dark-surface rounded">
                        <template.icon className="h-6 w-6 text-github-blue" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{template.name}</h3>
                        <p className="text-xs text-gray-400">{template.category}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Star className={`h-4 w-4 ${getPopularityColor(template.popularity)}`} />
                      <span className={`text-xs ${getPopularityColor(template.popularity)}`}>
                        {template.popularity}%
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                    {template.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {template.files.length} files • {template.dependencies.length} deps
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => openCreateDialog(template)}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredTemplates.length === 0 && (
              <div className="col-span-2 text-center py-8 text-gray-400">
                <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No templates found</p>
                <p className="text-xs">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Create Project Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-dark-surface border-dark-border">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-dark-bg rounded">
                <selectedTemplate.icon className="h-8 w-8 text-github-blue" />
                <div>
                  <h3 className="font-medium">{selectedTemplate.name}</h3>
                  <p className="text-sm text-gray-400">{selectedTemplate.description}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Project Name</label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="bg-dark-bg border-dark-border"
                />
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Includes:</h4>
                <div className="space-y-2">
                  <div className="text-xs text-gray-400">
                    <strong>Files:</strong> {selectedTemplate.files.map(f => f.path).join(', ')}
                  </div>
                  <div className="text-xs text-gray-400">
                    <strong>Dependencies:</strong> {selectedTemplate.dependencies.join(', ')}
                  </div>
                  <div className="text-xs text-gray-400">
                    <strong>Scripts:</strong> {Object.keys(selectedTemplate.scripts).join(', ')}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProject}>
                  <Download className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}