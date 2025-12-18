import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Sparkles, Share2, Clock } from "lucide-react";
import heroImage from "@/assets/hero-education.jpg";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Generation",
      description: "Create notes, quizzes, mind maps, and handouts instantly with advanced AI",
    },
    {
      icon: Share2,
      title: "Easy Sharing",
      description: "Share content via QR codes and links with students and colleagues",
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "Reduce preparation time and focus on what matters - teaching",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 mb-4">
                <GraduationCap className="h-12 w-12 text-primary" />
                <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  EduScult
                </h2>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Transform Your
                <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Teaching Experience
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg">
                Generate high-quality educational content in seconds. Create notes, quizzes, 
                mind maps, and handouts with the power of AI.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8"
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              <img
                src={heroImage}
                alt="Educational content generation"
                className="relative rounded-3xl shadow-[var(--shadow-elegant)] w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need to Create
              <span className="block text-primary">Amazing Content</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for educators
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-card border border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all hover:-translate-y-1"
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent p-12 lg:p-20 shadow-[var(--shadow-elegant)]">
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Teaching?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join thousands of educators already using EduScult to create engaging content
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8"
                onClick={() => navigate("/auth")}
              >
                Start Creating Now
              </Button>
            </div>
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
