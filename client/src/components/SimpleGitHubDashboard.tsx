import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  GitPullRequest, GitBranch, Bug, Package, Star, GitFork, 
  Eye, Users, Code, ExternalLink, Plus, Search, User
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SimpleGitHubDashboardProps {
  owner: string;
  repo: string;
}

export default function SimpleGitHubDashboard({ owner, repo }: SimpleGitHubDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

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

  return (
    <div className="p-6 space-y-6">
      {/* Repository Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Code className="h-6 w-6" />
            <span>{owner}/{repo}</span>
          </h1>
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
                <Users className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-400">Contributors</p>
                  <p className="text-xl font-bold text-white">{stats.contributors?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-surface border-dark-border">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-400">Stars</p>
                  <p className="text-xl font-bold text-white">{stats.repository.stars}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-dark-bg">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pulls">Pull Requests</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
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
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
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
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pull Requests Tab */}
        <TabsContent value="pulls" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Pull Requests</h2>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New PR
            </Button>
          </div>

          <div className="space-y-3">
            {pullRequests?.map((pr: any) => (
              <Card key={pr.id} className="bg-dark-surface border-dark-border">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <GitPullRequest className="h-4 w-4 text-green-500 mt-1" />
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
                    <div className="h-6 w-6 rounded-full bg-gray-600 flex items-center justify-center">
                      <User className="h-3 w-3" />
                    </div>
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
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Issue
            </Button>
          </div>

          <div className="space-y-3">
            {issues?.map((issue: any) => (
              <Card key={issue.id} className="bg-dark-surface border-dark-border">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Bug className="h-4 w-4 text-red-500 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-medium text-white mb-1">{issue.title}</h3>
                      <p className="text-sm text-gray-400 mb-2">
                        #{issue.number} opened {formatDistanceToNow(new Date(issue.created_at))} ago by {issue.user.login}
                      </p>
                      <div className="flex items-center space-x-2">
                        {issue.labels?.slice(0, 3).map((label: any) => (
                          <Badge key={label.name} variant="outline" className="text-xs">
                            {label.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-gray-600 flex items-center justify-center">
                      <User className="h-3 w-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}