import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Play, Award, Clock, Star, ChevronRight } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  progress: number;
  rating: number;
  category: string;
  thumbnail: string;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  readTime: string;
  category: string;
  publishDate: string;
  featured: boolean;
}

const FinancialEducation = () => {
  const [activeTab, setActiveTab] = useState("courses");

  const courses: Course[] = [
    {
      id: "1",
      title: "Budgeting Basics for Beginners",
      description: "Learn the fundamentals of creating and maintaining a personal budget that works for your lifestyle.",
      duration: "2 hours",
      difficulty: "Beginner",
      progress: 75,
      rating: 4.8,
      category: "Budgeting",
      thumbnail: "https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: "2",
      title: "Investment Strategies for Nigerians",
      description: "Discover investment opportunities in Nigeria and learn how to build a diversified portfolio.",
      duration: "3.5 hours",
      difficulty: "Intermediate",
      progress: 30,
      rating: 4.9,
      category: "Investing",
      thumbnail: "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: "3",
      title: "Understanding Credit Scores",
      description: "Learn how credit scores work in Nigeria and strategies to improve your creditworthiness.",
      duration: "1.5 hours",
      difficulty: "Beginner",
      progress: 0,
      rating: 4.7,
      category: "Credit",
      thumbnail: "https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: "4",
      title: "Advanced Portfolio Management",
      description: "Master advanced techniques for managing and optimizing your investment portfolio.",
      duration: "4 hours",
      difficulty: "Advanced",
      progress: 0,
      rating: 4.6,
      category: "Investing",
      thumbnail: "https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ];

  const articles: Article[] = [
    {
      id: "1",
      title: "5 Money-Saving Tips Every Nigerian Should Know",
      excerpt: "Discover practical strategies to reduce expenses and increase your savings rate in today's economy.",
      readTime: "5 min read",
      category: "Saving",
      publishDate: "2025-01-10",
      featured: true
    },
    {
      id: "2",
      title: "How to Start Investing with ₦10,000",
      excerpt: "A beginner's guide to making your first investment with a small amount of money.",
      readTime: "7 min read",
      category: "Investing",
      publishDate: "2025-01-08",
      featured: true
    },
    {
      id: "3",
      title: "Understanding Nigerian Banking Fees",
      excerpt: "Learn about common banking fees and how to minimize them to keep more money in your pocket.",
      readTime: "4 min read",
      category: "Banking",
      publishDate: "2025-01-05",
      featured: false
    },
    {
      id: "4",
      title: "Emergency Fund: How Much Do You Really Need?",
      excerpt: "Calculate the right emergency fund size for your situation and learn how to build it effectively.",
      readTime: "6 min read",
      category: "Saving",
      publishDate: "2025-01-03",
      featured: false
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Financial Education Center
          </CardTitle>
          <p className="text-muted-foreground">
            Enhance your financial knowledge with our comprehensive learning resources
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
            </TabsList>
            
            <TabsContent value="courses" className="space-y-6">
              <div className="grid gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="flex flex-col md:flex-row gap-4 p-6 border rounded-lg bg-card/50 hover:bg-card transition-colors">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full md:w-48 h-32 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{course.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(course.rating)}
                          <span className="text-sm text-muted-foreground ml-1">({course.rating})</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </div>
                        <Badge className={getDifficultyColor(course.difficulty)}>
                          {course.difficulty}
                        </Badge>
                        <Badge variant="outline">{course.category}</Badge>
                      </div>
                      
                      {course.progress > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold text-foreground">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button className="bg-gradient-primary">
                          <Play className="w-4 h-4 mr-2" />
                          {course.progress > 0 ? 'Continue' : 'Start Course'}
                        </Button>
                        <Button variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="articles" className="space-y-6">
              <div className="grid gap-4">
                {articles.map((article) => (
                  <div key={article.id} className={`p-6 border rounded-lg bg-card/50 hover:bg-card transition-colors ${
                    article.featured ? 'border-primary bg-primary/5' : ''
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {article.featured && (
                            <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                          )}
                          <Badge variant="outline">{article.category}</Badge>
                          <span className="text-sm text-muted-foreground">{article.readTime}</span>
                        </div>
                        
                        <h3 className="font-semibold text-lg text-foreground mb-2">{article.title}</h3>
                        <p className="text-muted-foreground mb-3">{article.excerpt}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Published: {new Date(article.publishDate).toLocaleDateString()}
                          </span>
                          <Button variant="ghost" size="sm">
                            Read More
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="quiz" className="space-y-6">
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">Financial Knowledge Quiz</h3>
                <p className="text-muted-foreground mb-6">
                  Test your financial knowledge and earn badges for your achievements
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                    <h4 className="font-semibold text-foreground mb-2">Budgeting Basics</h4>
                    <p className="text-sm text-muted-foreground mb-4">10 questions • 5 minutes</p>
                    <Button className="w-full bg-gradient-primary">Start Quiz</Button>
                  </Card>
                  
                  <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                    <h4 className="font-semibold text-foreground mb-2">Investment Fundamentals</h4>
                    <p className="text-sm text-muted-foreground mb-4">15 questions • 8 minutes</p>
                    <Button className="w-full bg-gradient-primary">Start Quiz</Button>
                  </Card>
                  
                  <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                    <h4 className="font-semibold text-foreground mb-2">Debt Management</h4>
                    <p className="text-sm text-muted-foreground mb-4">12 questions • 6 minutes</p>
                    <Button className="w-full bg-gradient-primary">Start Quiz</Button>
                  </Card>
                  
                  <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                    <h4 className="font-semibold text-foreground mb-2">Saving Strategies</h4>
                    <p className="text-sm text-muted-foreground mb-4">8 questions • 4 minutes</p>
                    <Button className="w-full bg-gradient-primary">Start Quiz</Button>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialEducation;