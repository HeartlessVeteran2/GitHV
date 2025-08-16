import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Github, Smartphone, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg">
      {/* Header */}
      <header className="border-b border-dark-border bg-dark-surface/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-github-blue text-xl">
              <Code className="h-8 w-8" />
            </div>
            <span className="font-bold text-xl text-dark-text">GitHV</span>
          </div>
          <Button
            onClick={() => window.location.href = "/api/login"}
            className="bg-github-blue hover:bg-blue-600"
          >
            <Github className="h-4 w-4 mr-2" />
            Sign in with GitHub
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-dark-text mb-6">
            Code on the go with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-github-blue to-blue-400">
              GitHV
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            A tablet-optimized coding environment with GitHub integration. 
            Edit your repositories, write code, and manage projects from anywhere.
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = "/api/login"}
            className="bg-github-blue hover:bg-blue-600 text-lg px-8 py-4"
          >
            <Github className="h-5 w-5 mr-2" />
            Get Started with GitHub
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-4">
            Everything you need to code on mobile
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Built specifically for tablet and mobile development with touch-friendly 
            interface and professional coding features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-dark-surface border-dark-border">
            <CardHeader>
              <div className="h-12 w-12 bg-github-blue/10 rounded-lg flex items-center justify-center mb-4">
                <Github className="h-6 w-6 text-github-blue" />
              </div>
              <CardTitle className="text-dark-text">GitHub Integration</CardTitle>
              <CardDescription>
                Seamlessly connect with your GitHub repositories. Browse, edit, and commit 
                changes directly from your tablet.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-dark-surface border-dark-border">
            <CardHeader>
              <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-green-400" />
              </div>
              <CardTitle className="text-dark-text">Monaco Editor</CardTitle>
              <CardDescription>
                Powered by VS Code's Monaco Editor with syntax highlighting, 
                IntelliSense, and all the features you love.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-dark-surface border-dark-border">
            <CardHeader>
              <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-blue-400" />
              </div>
              <CardTitle className="text-dark-text">Touch Optimized</CardTitle>
              <CardDescription>
                Designed for touch interfaces with gesture support, floating toolbars, 
                and mobile-first responsive design.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-dark-surface border-dark-border">
            <CardHeader>
              <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
              <CardTitle className="text-dark-text">Fast & Lightweight</CardTitle>
              <CardDescription>
                Optimized for performance on mobile devices with efficient 
                resource usage and fast loading times.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-dark-surface border-dark-border">
            <CardHeader>
              <div className="h-12 w-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-orange-400" />
              </div>
              <CardTitle className="text-dark-text">Multi-Language Support</CardTitle>
              <CardDescription>
                Support for JavaScript, TypeScript, Python, Go, and many more 
                programming languages with syntax highlighting.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-dark-surface border-dark-border">
            <CardHeader>
              <div className="h-12 w-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <Github className="h-6 w-6 text-red-400" />
              </div>
              <CardTitle className="text-dark-text">Git Operations</CardTitle>
              <CardDescription>
                Built-in Git support for committing, pushing, pulling, and 
                managing branches directly from the interface.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-6">
            Ready to start coding on your tablet?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Sign in with your GitHub account and start editing your repositories 
            in seconds.
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = "/api/login"}
            className="bg-github-blue hover:bg-blue-600 text-lg px-8 py-4"
          >
            <Github className="h-5 w-5 mr-2" />
            Sign in with GitHub
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border bg-dark-surface/50">
        <div className="container mx-auto px-4 py-8 text-center text-gray-400">
          <p>&copy; 2024 GitHV. Built for mobile developers.</p>
        </div>
      </footer>
    </div>
  );
}
