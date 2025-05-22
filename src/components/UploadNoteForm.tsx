
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UploadNoteFormProps {
  onNoteAdded: () => void;
}

const UploadNoteForm = ({ onNoteAdded }: UploadNoteFormProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [externalLink, setExternalLink] = useState("");
  const [uploadType, setUploadType] = useState<"file" | "link">("file");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !author || !description) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (uploadType === "file" && !file && !externalLink) {
      toast({
        title: "Missing file",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    if (uploadType === "link" && !externalLink) {
      toast({
        title: "Missing link",
        description: "Please provide a link to your HTML page",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setUploading(true);
      
      // Handle file upload if file is selected and we're in file mode
      let filePath = null;
      let fileName = null;
      let htmlUrl = null;
      
      if (uploadType === "file" && file) {
        fileName = `${uuidv4()}-${file.name}`;
        filePath = `${fileName}`;
        
        // Special handling for HTML files
        if (file.type === "text/html" || file.name.endsWith('.html')) {
          // Upload HTML file to Supabase storage
          const { error: uploadError, data } = await supabase.storage
            .from('notes')
            .upload(filePath, file, {
              contentType: 'text/html',
              upsert: false
            });
          
          if (uploadError) {
            throw uploadError;
          }
          
          // Get public URL for the HTML file
          const { data: urlData } = supabase.storage
            .from('notes')
            .getPublicUrl(filePath);
            
          if (urlData) {
            htmlUrl = urlData.publicUrl;
          }
        } else {
          // Upload regular file to Supabase storage
          const { error: uploadError } = await supabase.storage
            .from('notes')
            .upload(filePath, file);
          
          if (uploadError) {
            throw uploadError;
          }
        }
      }
      
      // Insert note data into database
      const { error: insertError } = await supabase
        .from('notes')
        .insert({
          title,
          author,
          description,
          file_name: fileName,
          file_path: filePath,
          external_link: uploadType === "link" ? externalLink : htmlUrl
        });
      
      if (insertError) {
        throw insertError;
      }
      
      // Success
      toast({
        title: "Note uploaded successfully",
        description: "Your note has been added to the collection",
      });
      
      // Reset form and close dialog
      setTitle("");
      setAuthor("");
      setDescription("");
      setFile(null);
      setExternalLink("");
      setOpen(false);
      
      // Notify parent component to refresh notes
      onNoteAdded();
      
    } catch (error) {
      console.error("Error uploading note:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-alpaca-purple to-accent hover:opacity-90">
          <Upload size={16} className="mr-2" />
          Upload Note
        </Button>
      </DialogTrigger>
      
      <DialogContent className="glass-card bg-alpaca-dark/90">
        <DialogHeader>
          <DialogTitle>Upload Trading Note</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="E.g., Technical Analysis of ETH/USD"
              className="bg-white/5 border-white/10 focus:border-alpaca-purple"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="Your name"
              className="bg-white/5 border-white/10 focus:border-alpaca-purple"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of your note..."
              className="bg-white/5 border-white/10 focus:border-alpaca-purple"
            />
          </div>
          
          <Tabs defaultValue="file" value={uploadType} onValueChange={(value) => setUploadType(value as "file" | "link")} className="w-full">
            <TabsList className="grid grid-cols-2 mb-2">
              <TabsTrigger value="file">Upload File</TabsTrigger>
              <TabsTrigger value="link">Add Link</TabsTrigger>
            </TabsList>
            
            <TabsContent value="file" className="space-y-2">
              <Label htmlFor="file">HTML or PDF File</Label>
              <Input
                id="file"
                type="file"
                accept=".html,.pdf,.doc,.docx"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="bg-white/5 border-white/10"
              />
              <p className="text-xs text-gray-400">Upload HTML files to automatically generate a viewable link</p>
            </TabsContent>
            
            <TabsContent value="link" className="space-y-2">
              <Label htmlFor="link">External Link</Label>
              <Input
                id="link"
                type="url"
                value={externalLink}
                onChange={e => setExternalLink(e.target.value)}
                placeholder="https://your-static-site.com/research.html"
                className="bg-white/5 border-white/10 focus:border-alpaca-purple"
              />
            </TabsContent>
          </Tabs>
          
          <Button 
            type="submit"
            disabled={uploading}
            className="bg-gradient-to-r from-alpaca-purple to-accent hover:opacity-90 w-full"
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadNoteForm;