import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2, Eye, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import ShareDialog from "./ShareDialog";

interface ContentHistoryProps {
  userId?: string;
}

const ContentHistory = ({ userId }: ContentHistoryProps) => {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchContent();
    }
  }, [userId]);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from("generated_content")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setContents(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load content history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("generated_content")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setContents(contents.filter((c) => c.id !== id));
      toast({
        title: "Deleted",
        description: "Content has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
    }
  };

  const handleShare = (contentId: string) => {
    setSelectedContentId(contentId);
    setShareDialogOpen(true);
  };

  const getContentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      notes: "bg-primary/10 text-primary border-primary/20",
      quiz: "bg-secondary/10 text-secondary border-secondary/20",
      mindmap: "bg-accent/10 text-accent border-accent/20",
      handout: "bg-primary/10 text-primary border-primary/20",
    };
    return colors[type] || "bg-muted text-muted-foreground";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle>Recent Content</CardTitle>
          <CardDescription>Your recently generated educational materials</CardDescription>
        </CardHeader>
        <CardContent>
          {contents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No content generated yet. Start creating!
            </div>
          ) : (
            <div className="space-y-4">
              {contents.map((content) => (
                <div
                  key={content.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={getContentTypeColor(content.content_type)}>
                        {content.content_type}
                      </Badge>
                      {content.is_public && (
                        <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                          <Eye className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg truncate">{content.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {content.subject && `${content.subject} • `}
                      {formatDistanceToNow(new Date(content.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare(content.id)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(content.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedContentId && (
        <ShareDialog
          contentId={selectedContentId}
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
        />
      )}
    </>
  );
};

export default ContentHistory;