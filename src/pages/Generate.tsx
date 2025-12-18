import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Share2, Download, FileText } from "lucide-react";
import { downloadAsPDF, downloadAsDOCX } from "@/utils/downloadContent";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ContentDisplay from "@/components/ContentDisplay";
import ShareDialog from "@/components/ShareDialog";

const Generate = () => {
  const { contentType } = useParams<{ contentType: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("school");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [savedContentId, setSavedContentId] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedContent(null);

    toast({
      title: "Generating content...",
      description: "Please wait while we create your educational content with AI.",
    });

    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          contentType,
          topic,
          subject,
          level,
          additionalInfo,
        },
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      setSavedContentId(data.contentId);
      
      toast({
        title: "Content generated!",
        description: "Your educational content has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    const titles: Record<string, string> = {
      notes: "Generate Study Notes",
      quiz: "Generate Quiz",
      mindmap: "Generate Mind Map",
      handout: "Generate Handout",
    };
    return titles[contentType || ""] || "Generate Content";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 py-8">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>{getTitle()}</CardTitle>
              <CardDescription>
                Fill in the details to generate AI-powered content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic *</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Photosynthesis"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Biology"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Syllabus & Curricular</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school">School Level</SelectItem>
                      <SelectItem value="college">College Level</SelectItem>
                      <SelectItem value="placement">Placement Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder="Any specific requirements or focus areas..."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Content
                </Button>
              </form>
            </CardContent>
          </Card>

          <div>
            {generatedContent ? (
              <Card className="shadow-[var(--shadow-card)]">
                <CardHeader>
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <CardTitle>Generated Content</CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadAsPDF(generatedContent, contentType || "", topic)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadAsDOCX(generatedContent, contentType || "", topic)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        DOCX
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShareDialogOpen(true)}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ContentDisplay
                    content={generatedContent}
                    contentType={contentType || ""}
                    topic={topic}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-[var(--shadow-card)] border-dashed">
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center text-muted-foreground">
                    <p>Your generated content will appear here</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {savedContentId && (
          <ShareDialog
            contentId={savedContentId}
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
          />
        )}
      </div>
    </div>
  );
};

export default Generate;