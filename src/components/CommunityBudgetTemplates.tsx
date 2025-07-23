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
  const [templates, setTemplates] = useState<BudgetTemplate[]>([]);

  const categories = ["all", "Student", "Professional", "Family", "Freelancer"];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         template.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const popularTemplates = filteredTemplates.filter(t => t.isPopular);

  const handleLike = (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isLiked: !template.isLiked, likes: template.isLiked ? template.likes - 1 : template.likes + 1 }
        : template
    ));
  };

  const handleDownload = (template: BudgetTemplate) => {
    // In a real app, this would integrate with the budget creation system
    console.log('Downloading template:', template.title);
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, downloads: t.downloads + 1 }
        : t
    ));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Community Budget Templates</h2>
        <p className="text-muted-foreground">
          Discover and share budget templates with the community
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search templates, tags, or authors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Community Templates Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Be the first to share your budget template with the community. Help others manage their finances better!
              </p>
              <Button className="gap-2">
                <Share className="w-4 h-4" />
                Share Your Budget Template
              </Button>
            </div>
          ) : (
            <>
              {/* Popular Templates Section */}
              {popularTemplates.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Popular This Week</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {popularTemplates.slice(0, 3).map((template) => (
                      <TemplateCard 
                        key={template.id} 
                        template={template} 
                        onLike={handleLike}
                        onDownload={handleDownload}
                        userCurrency={profile?.currency || 'USD'}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Templates */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  All Templates ({filteredTemplates.length})
                </h3>
                {filteredTemplates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTemplates.map((template) => (
                      <TemplateCard 
                        key={template.id} 
                        template={template} 
                        onLike={handleLike}
                        onDownload={handleDownload}
                        userCurrency={profile?.currency || 'USD'}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No templates found matching your search criteria.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Template Card Component
interface TemplateCardProps {
  template: BudgetTemplate;
  onLike: (id: string) => void;
  onDownload: (template: BudgetTemplate) => void;
  userCurrency: string;
}

const TemplateCard = ({ template, onLike, onDownload, userCurrency }: TemplateCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs">{template.authorAvatar}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-sm leading-tight">{template.title}</h4>
              <p className="text-xs text-muted-foreground">by {template.author}</p>
            </div>
          </div>
          {template.isPopular && (
            <Badge variant="secondary" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {template.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{template.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            <span>{template.downloads}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {template.category}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Monthly Income</span>
            <span className="text-sm font-semibold">
              {formatCurrency(template.monthlyIncome, userCurrency)}
            </span>
          </div>
          
          <div className="space-y-1">
            {template.allocations.slice(0, 3).map((allocation, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{allocation.category}</span>
                <span>{allocation.percentage}% ({formatCurrency(allocation.amount, userCurrency)})</span>
              </div>
            ))}
            {template.allocations.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{template.allocations.length - 3} more categories
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1"
            onClick={() => onDownload(template)}
          >
            <Download className="w-3 h-3" />
            Use Template
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`p-1 ${template.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
            onClick={() => onLike(template.id)}
          >
            <Heart className={`w-4 h-4 ${template.isLiked ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityBudgetTemplates;