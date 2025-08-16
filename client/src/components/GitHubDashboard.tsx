import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  GitPullRequest, GitBranch, Bug, Package, Star, GitFork, 
  Eye, Calendar, Users, Code, ExternalLink, Plus, Search,
  Tag, Download, AlertCircle, CheckCircle, Clock, User
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface GitHubDashboardProps {
  owner: string;
  repo: string;
}

export default function GitHubDashboard({ owner, repo }: GitHubDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch repository stats
  const { data: stats } = useQuery({
    queryKey: ["/api/github", owner, repo, "stats"],
    retry: false
  });

  // Fetch pull requests
  const { data: pullRequests } = useQuery({
    queryKey: ["/api/github", owner, repo, "pulls"],
    retry: false
  });

  // Fetch issues
  const { data: issues } = useQuery({
    queryKey: ["/api/github", owner, repo, "issues"],
    retry: false
  });

  // Fetch releases
  const { data: releases } = useQuery({
    queryKey: ["/api/github", owner, repo, "releases"],
    retry: false
  });

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-red-500" />;
      case 'merged':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      JavaScript: 'bg-yellow-500',
      TypeScript: 'bg-blue-500',
      Python: 'bg-green-500',
      Java: 'bg-red-500',
      'C++': 'bg-pink-500',
      Go: 'bg-cyan-500',
      Rust: 'bg-orange-500',
      PHP: 'bg-purple-500',
      Ruby: 'bg-red-600',
      Swift: 'bg-orange-600'
    };
    return colors[language] || 'bg-gray-500';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Repository Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Code className="h-6 w-6" />
            <span>{owner}/{repo}</span>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </h1>
          {stats?.repository.description && (
            <p className="text-gray-400 mt-2">{stats.repository.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4 mr-1" />
            {stats?.repository.stars || 0}
          </Button>
          <Button variant="outline" size="sm">
            <GitFork className="h-4 w-4 mr-1" />
            {stats?.repository.forks || 0}
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            {stats?.repository.watchers || 0}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-dark-surface border-dark-border">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <GitPullRequest className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-400">Open PRs</p>
                  <p className="text-xl font-bold text-white">{pullRequests?.filter((pr: any) => pr.state === 'open').length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-surface border-dark-border">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bug className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-400">Open Issues</p>
                  <p className="text-xl font-bold text-white">{stats.repository.issues}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-surface border-dark-border">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-400">Releases</p>
                  <p className="text-xl font-bold text-white">{releases?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-surface border-dark-border">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-400">Contributors</p>
                  <p className="text-xl font-bold text-white">{stats.contributors?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 bg-dark-bg">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pulls">Pull Requests</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="releases">Releases</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Languages */}
            {stats?.languages && (
              <Card className="bg-dark-surface border-dark-border">
                <CardHeader>
                  <CardTitle className="text-white">Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.languages)
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .slice(0, 5)
                      .map(([lang, bytes]) => {
                        const total = Object.values(stats.languages).reduce((sum: number, val) => sum + (val as number), 0);
                        const percentage = Math.round(((bytes as number) / total) * 100);
                        return (
                          <div key={lang} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${getLanguageColor(lang)}`} />
                              <span className="text-sm text-gray-300">{lang}</span>
                            </div>
                            <span className="text-sm text-gray-400">{percentage}%</span>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Contributors */}
            {stats?.contributors && (
              <Card className="bg-dark-surface border-dark-border">
                <CardHeader>
                  <CardTitle className="text-white">Top Contributors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.contributors.slice(0, 5).map((contributor: any) => (
                      <div key={contributor.login} className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={contributor.avatar_url} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{contributor.login}</p>
                          <p className="text-xs text-gray-400">{contributor.contributions} contributions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Activity */}
          <Card className="bg-dark-surface border-dark-border">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pullRequests?.slice(0, 3).map((pr: any) => (
                  <div key={pr.id} className="flex items-center space-x-3 p-3 rounded-lg bg-dark-bg">
                    <GitPullRequest className="h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{pr.title}</p>
                      <p className="text-xs text-gray-400">
                        #{pr.number} by {pr.user.login} • {formatDistanceToNow(new Date(pr.created_at))} ago
                      </p>
                    </div>
                    <Badge variant={pr.state === 'open' ? 'default' : 'secondary'}>
                      {pr.state}
                    </Badge>
                  </div>
                ))}

                {issues?.slice(0, 3).map((issue: any) => (
                  <div key={issue.id} className="flex items-center space-x-3 p-3 rounded-lg bg-dark-bg">
                    <Bug className="h-4 w-4 text-red-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{issue.title}</p>
                      <p className="text-xs text-gray-400">
                        #{issue.number} by {issue.user.login} • {formatDistanceToNow(new Date(issue.created_at))} ago
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {issue.labels.slice(0, 2).map((label: any) => (
                        <Badge key={label.name} variant="outline" className="text-xs">
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pull Requests Tab */}
        <TabsContent value="pulls" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Pull Requests</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search pull requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-dark-surface border-dark-border text-white"
                />
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New PR
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {pullRequests?.map((pr: any) => (
              <Card key={pr.id} className="bg-dark-surface border-dark-border">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {getStateIcon(pr.state)}
                    <div className="flex-1">
                      <h3 className="font-medium text-white mb-1">{pr.title}</h3>
                      <p className="text-sm text-gray-400 mb-2">
                        #{pr.number} opened {formatDistanceToNow(new Date(pr.created_at))} ago by {pr.user.login}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{pr.head.ref} → {pr.base.ref}</span>
                        <Badge variant="outline" className="text-xs">
                          {pr.state}
                        </Badge>
                      </div>
                    </div>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={pr.user.avatar_url} />
                      <AvatarFallback>
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Issues</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-dark-surface border-dark-border text-white"
                />
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Issue
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {issues?.map((issue: any) => (
              <Card key={issue.id} className="bg-dark-surface border-dark-border">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {getStateIcon(issue.state)}
                    <div className="flex-1">
                      <h3 className="font-medium text-white mb-1">{issue.title}</h3>
                      <p className="text-sm text-gray-400 mb-2">
                        #{issue.number} opened {formatDistanceToNow(new Date(issue.created_at))} ago by {issue.user.login}
                      </p>
                      <div className="flex items-center space-x-2">
                        {issue.labels.map((label: any) => (
                          <Badge 
                            key={label.name} 
                            variant="outline" 
                            className="text-xs"
                            style={{ borderColor: `#${label.color}` }}
                          >
                            {label.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={issue.user.avatar_url} />
                      <AvatarFallback>
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Releases Tab */}
        <TabsContent value="releases" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Releases</h2>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Release
            </Button>
          </div>

          <div className="space-y-4">
            {releases?.map((release: any) => (
              <Card key={release.id} className="bg-dark-surface border-dark-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Tag className="h-4 w-4 text-green-500" />
                        <h3 className="font-semibold text-white">{release.name}</h3>
                        {release.prerelease && (
                          <Badge variant="secondary" className="text-xs">Pre-release</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        Released {formatDistanceToNow(new Date(release.published_at))} ago
                      </p>
                      {release.body && (
                        <div className="text-sm text-gray-300 mb-3 max-h-20 overflow-y-auto">
                          {release.body.split('\n').slice(0, 3).map((line: string, i: number) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                      )}
                      {release.assets.length > 0 && (
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Download className="h-3 w-3" />
                            <span>{release.assets.reduce((sum: number, asset: any) => sum + asset.download_count, 0)} downloads</span>
                          </div>
                          <span>{release.assets.length} assets</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Repository Info */}
            {stats?.repository && (
              <Card className="bg-dark-surface border-dark-border">
                <CardHeader>
                  <CardTitle className="text-white">Repository Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created</span>
                    <span className="text-white">{new Date(stats.repository.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last updated</span>
                    <span className="text-white">{formatDistanceToNow(new Date(stats.repository.updated_at))} ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Default branch</span>
                    <Badge variant="outline">{stats.repository.default_branch}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Repository size</span>
                    <span className="text-white">{Math.round(stats.repository.size / 1024)} MB</span>
                  </div>
                  {stats.repository.license && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">License</span>
                      <Badge variant="outline">{stats.repository.license}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}