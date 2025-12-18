import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Copy, QrCode, Link2 } from "lucide-react";
import QRCode from "qrcode";

interface ShareDialogProps {
  contentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ShareDialog = ({ contentId, open, onOpenChange }: ShareDialogProps) => {
  const [shareCode, setShareCode] = useState<string>("");
  const [isPublic, setIsPublic] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (open && contentId) {
      loadShareInfo();
    }
  }, [open, contentId]);

  const loadShareInfo = async () => {
    try {
      const { data, error } = await supabase
        .from("generated_content")
        .select("share_code, is_public")
        .eq("id", contentId)
        .single();

      if (error) throw error;

      if (data.share_code) {
        setShareCode(data.share_code);
        setIsPublic(data.is_public);
        await generateQRCode(data.share_code);
      } else {
        await generateShareCode();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load share information",
        variant: "destructive",
      });
    }
  };

  const generateShareCode = async () => {
    try {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const { error } = await supabase
        .from("generated_content")
        .update({ share_code: code, is_public: true })
        .eq("id", contentId);

      if (error) throw error;

      setShareCode(code);
      setIsPublic(true);
      await generateQRCode(code);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate share code",
        variant: "destructive",
      });
    }
  };

  const generateQRCode = async (code: string) => {
    const shareUrl = `${window.location.origin}/share/${code}`;
    try {
      const qrDataUrl = await QRCode.toDataURL(shareUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: "#1e40af",
          light: "#ffffff",
        },
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error("QR Code generation failed:", error);
    }
  };

  const togglePublic = async () => {
    try {
      const newPublicState = !isPublic;
      const { error } = await supabase
        .from("generated_content")
        .update({ is_public: newPublicState })
        .eq("id", contentId);

      if (error) throw error;

      setIsPublic(newPublicState);
      toast({
        title: newPublicState ? "Made public" : "Made private",
        description: newPublicState
          ? "Content is now publicly accessible"
          : "Content is now private",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update visibility",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Share link copied to clipboard",
    });
  };

  const shareUrl = `${window.location.origin}/share/${shareCode}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Content</DialogTitle>
          <DialogDescription>
            Share your educational content with students and colleagues
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="public-toggle">Make content public</Label>
            <Switch
              id="public-toggle"
              checked={isPublic}
              onCheckedChange={togglePublic}
            />
          </div>

          {isPublic && shareCode && (
            <>
              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(shareUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Share Code</Label>
                <div className="flex gap-2">
                  <Input value={shareCode} readOnly className="font-mono" />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(shareCode)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {qrCodeUrl && (
                <div className="space-y-2">
                  <Label>QR Code</Label>
                  <div className="flex justify-center p-4 bg-muted rounded-lg">
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.download = `qr-code-${shareCode}.png`;
                      link.href = qrCodeUrl;
                      link.click();
                    }}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Download QR Code
                  </Button>
                </div>
              )}
            </>
          )}

          {!isPublic && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Enable public sharing to generate a share link and QR code
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;