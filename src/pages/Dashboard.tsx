import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, BookOpen, Brain, FileText, List, LogOut, GraduationCap } from "lucide-react";
import ContentHistory from "@/components/ContentHistory";
import type { User } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      } else {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setUserName(data.full_name || "User");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  const contentTypes = [
    {
      type: "notes",
      title: "Generate Notes",
      description: "Create comprehensive study notes on any topic",
      icon: BookOpen,
      color: "from-primary to-primary/80",
    },
    {
      type: "quiz",
      title: "Generate Quiz",
      description: "Create interactive quizzes to test knowledge",
      icon: List,
      color: "from-secondary to-secondary/80",
    },
    {
      type: "mindmap",
      title: "Generate Mind Map",
      description: "Visualize concepts with AI-generated mind maps",
      icon: Brain,
      color: "from-accent to-accent/80",
    },
    {
      type: "handout",
      title: "Generate Handout",
      description: "Create concise handouts for quick reference",
      icon: FileText,
      color: "from-primary/80 to-secondary/80",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-10 w-10 text-primary" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                EduScult
              </h2>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome{userName && `, ${userName}`}
            </h1>
            <p className="text-muted-foreground mt-2">
              Generate AI-powered educational content instantly
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {contentTypes.map((content) => (
            <Card
              key={content.type}
              className="cursor-pointer transition-all hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1"
              onClick={() => navigate(`/generate/${content.type}`)}
            >
              <CardHeader>
                <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${content.color} flex items-center justify-center mb-4`}>
                  <content.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{content.title}</CardTitle>
                <CardDescription>{content.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <ContentHistory userId={user?.id} />
      </div>
    </div>
  );
};

export default Dashboard;