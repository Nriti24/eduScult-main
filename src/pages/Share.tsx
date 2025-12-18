import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, GraduationCap } from "lucide-react";
import ContentDisplay from "@/components/ContentDisplay";

const Share = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareCode) {
      loadSharedContent();
    }
  }, [shareCode]);

  const loadSharedContent = async () => {
    try {
      const { data, error } = await supabase
        .from("generated_content")
        .select("*")
        .eq("share_code", shareCode)
        .eq("is_public", true)
        .single();

      if (error) throw error;

      if (!data) {
        setError("Content not found or not publicly shared");
      } else {
        setContent(data);
        // Increment views
        await supabase
          .from("generated_content")
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq("id", data.id);
      }
    } catch (error: any) {
      setError("Failed to load shared content");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">{error || "Content not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center mb-8">
          <div className="h-12 w-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mr-3">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            EduScult
          </h1>
        </div>

        <Card className="max-w-4xl mx-auto shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {content.content_type}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {content.views_count || 0} views
              </span>
            </div>
            <CardTitle className="text-2xl">{content.title}</CardTitle>
            {content.subject && (
              <p className="text-muted-foreground">{content.subject}</p>
            )}
          </CardHeader>
          <CardContent>
            <ContentDisplay
              content={content.content}
              contentType={content.content_type}
              topic={content.title}
            />
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Created with EduScult - AI-Powered Educational Content Generator
          </p>
        </div>
      </div>
    </div>
  );
};

export default Share;