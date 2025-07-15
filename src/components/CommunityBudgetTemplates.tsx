import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Heart, Download, Share, Search, Filter, Star, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/utils/currencies";

interface BudgetTemplate {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar: string;
  category: string;
  likes: number;
  downloads: number;
  rating: number;
  tags: string[];
  monthlyIncome: number;
  allocations: {
    category: string;
    percentage: number;
    amount: number;
  }[];
  isLiked: boolean;
  isPopular: boolean;
}

const CommunityBudgetTemplates = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [templates, setTemplates] = useState<BudgetTemplate[]>([
    {
      id: '1',
      title: 'University Student Budget (Lagos)',
      description: 'Perfect for students in Lagos universities. Covers accommodation, food, transport, and some fun money.',
      author: 'Adebayo O.',
      authorAvatar: 'AO',
      category: 'Student',
      likes: 234,
      downloads: 1200,
      rating: 4.8,
      tags: ['student', 'lagos', 'university', 'accommodation'],
      monthlyIncome: 50000,
      allocations: [
        { category: 'Accommodation', percentage: 35, amount: 17500 },
        { category: 'Food', percentage: 25, amount: 12500 },
        { category: 'Transportation', percentage: 15, amount: 7500 },
        { category: 'Books & Supplies', percentage: 10, amount: 5000 },
        { category: 'Entertainment', percentage: 10, amount: 5000 },
        { category: 'Savings', percentage: 5, amount: 2500 }
      ],
      isLiked: false,
      isPopular: true
    },
    {
      id: '2',
      title: 'NYSC Allowance Plan',
      description: 'Optimized budget for corps members. Maximizes savings while covering essentials during service year.',
      author: 'Fatima A.',
      authorAvatar: 'FA',
      category: 'NYSC',
      likes: 189,
      downloads: 890,
      rating: 4.6,
      tags: ['nysc', 'corps', 'allowance', 'savings'],
      monthlyIncome: 33000,
      allocations: [
        { category: 'Accommodation', percentage: 30, amount: 9900 },
        { category: 'Food', percentage: 30, amount: 9900 },
        { category: 'Transportation', percentage: 15, amount: 4950 },
        { category: 'Personal Care', percentage: 10, amount: 3300 },
        { category: 'Emergency Fund', percentage: 10, amount: 3300 },
        { category: 'Savings', percentage: 5, amount: 1650 }
      ],
      isLiked: true,
      isPopular: true
    },
    {
      id: '3',
      title: 'Young Professional (Entry Level)',
      description: 'For fresh graduates starting their career. Balances lifestyle with aggressive savings.',
      author: 'Chidi M.',
      authorAvatar: 'CM',
      category: 'Professional',
      likes: 156,
      downloads: 670,
      rating: 4.5,
      tags: ['professional', 'entry-level', 'career', 'savings'],
      monthlyIncome: 120000,
      allocations: [
        { category: 'Rent', percentage: 25, amount: 30000 },
        { category: 'Food', percentage: 20, amount: 24000 },
        { category: 'Transportation', percentage: 10, amount: 12000 },
        { category: 'Utilities', percentage: 8, amount: 9600 },
        { category: 'Entertainment', percentage: 12, amount: 14400 },
        { category: 'Savings', percentage: 25, amount: 30000 }
      ],
      isLiked: false,
      isPopular: false
    },
    {
      id: '4',
      title: 'Freelancer Budget Template',
      description: 'Designed for irregular income. Includes emergency buffer and tax provisions.',
      author: 'Kemi S.',
      authorAvatar: 'KS',
      category: 'Freelancer',
      likes: 98,
      downloads: 445,
      rating: 4.7,
      tags: ['freelancer', 'irregular-income', 'tax', 'emergency'],
      monthlyIncome: 80000,
      allocations: [
        { category: 'Fixed Expenses', percentage: 40, amount: 32000 },
        { category: 'Variable Expenses', percentage: 20, amount: 16000 },
        { category: 'Tax Provision', percentage: 15, amount: 12000 },
        { category: 'Emergency Buffer', percentage: 15, amount: 12000 },
        { category: 'Savings', percentage: 10, amount: 8000 }
      ],
      isLiked: false,
      isPopular: false
    },
    {
      id: '5',
      title: 'Family Budget (2 Kids)',
      description: 'Comprehensive family budget covering education, healthcare, and family activities.',
      author: 'Tunde & Bisi',
      authorAvatar: 'TB',
      category: 'Family',
      likes: 267,
      downloads: 1100,
      rating: 4.9,
      tags: ['family', 'kids', 'education', 'healthcare'],
      monthlyIncome: 300000,
      allocations: [
        { category: 'Housing', percentage: 30, amount: 90000 },
        { category: 'Food', percentage: 20, amount: 60000 },
        { category: 'Education', percentage: 15, amount: 45000 },
        { category: 'Healthcare', percentage: 8, amount: 24000 },
        { category: 'Transportation', percentage: 7, amount: 21000 },
        { category: 'Family Activities', percentage: 5, amount: 15000 },
        { category: 'Savings', percentage: 15, amount: 45000 }
      ],
      isLiked: true,
      isPopular: true
    }
  ]);

  const categories = ['all', 'Student', 'NYSC', 'Professional', 'Freelancer', 'Family'];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularTemplates = templates.filter(t => t.isPopular).slice(0, 3);

  const handleLike = (templateId: string) => {
    setTemplates(prev => prev.map(template => {
      if (template.id === templateId) {
        return {
          ...template,
          isLiked: !template.isLiked,
          likes: template.isLiked ? template.likes - 1 : template.likes + 1
        };
      }
      return template;
    }));
  };

  const handleDownload = (templateId: string) => {
    setTemplates(prev => prev.map(template => {
      if (template.id === templateId) {
        return { ...template, downloads: template.downloads + 1 };
      }
      return template;
    }));
    // In a real app, this would download or apply the template
    alert('Template downloaded! You can now customize it in your budget section.');
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Community Budget Templates
          </CardTitle>
          <p className="text-muted-foreground">
            Discover and share budget templates created by the SmartSpend community. Learn from others' financial strategies!
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="browse" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="browse">Browse Templates</TabsTrigger>
              <TabsTrigger value="popular">Popular This Week</TabsTrigger>
              <TabsTrigger value="my-templates">My Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="browse" className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search templates, tags, or authors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category === 'all' ? 'All' : category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Templates Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-6 bg-card/50 hover:bg-card transition-colors">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {template.authorAvatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-foreground">{template.title}</h3>
                            <p className="text-sm text-muted-foreground">by {template.author}</p>
                          </div>
                        </div>
                        {template.isPopular && (
                          <Badge className="bg-gradient-primary text-primary-foreground">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground">{template.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Budget Preview */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Monthly Income:</span>
                          <span className="font-semibold">
                            {formatCurrency(template.monthlyIncome, profile?.currency || 'NGN')}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {template.allocations.slice(0, 3).map((allocation, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{allocation.category}:</span>
                              <span>{allocation.percentage}% ({formatCurrency(allocation.amount, profile?.currency || 'NGN')})</span>
                            </div>
                          ))}
                          {template.allocations.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{template.allocations.length - 3} more categories
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{template.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            <span>{template.downloads}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(template.id)}
                            className={`p-1 ${template.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                          >
                            <Heart className={`w-4 h-4 ${template.isLiked ? 'fill-current' : ''}`} />
                            <span className="ml-1">{template.likes}</span>
                          </Button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDownload(template.id)}
                          className="flex-1 bg-gradient-primary gap-2"
                          size="sm"
                        >
                          <Download className="w-4 h-4" />
                          Use Template
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Share className="w-4 h-4" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="popular" className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">🔥 Trending This Week</h3>
                <p className="text-muted-foreground">Most downloaded and liked templates by the community</p>
              </div>
              
              <div className="space-y-4">
                {popularTemplates.map((template, index) => (
                  <div key={template.id} className="flex items-center gap-4 p-4 border rounded-lg bg-card/50">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-primary text-primary-foreground rounded-full font-bold">
                      {index + 1}
                    </div>
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {template.authorAvatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{template.title}</h4>
                      <p className="text-sm text-muted-foreground">by {template.author}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {template.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {template.downloads}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {template.rating}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDownload(template.id)}
                      size="sm"
                      className="bg-gradient-primary"
                    >
                      Use Template
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="my-templates" className="space-y-6">
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Share Your Budget Wisdom</h3>
                <p className="text-muted-foreground mb-6">
                  Help others by sharing your successful budget templates with the community
                </p>
                <Button className="bg-gradient-primary gap-2">
                  <Share className="w-4 h-4" />
                  Create & Share Template
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityBudgetTemplates;