import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, User, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface NoteCardProps {
  title: string;
  author: string;
  date: string;
  description: string;
  fileUrl?: string;
  externalLink?: string;
}

const NoteCard = ({ title, author, date, description, fileUrl, externalLink }: NoteCardProps) => {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [htmlDataUrl, setHtmlDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (!fileUrl) {
      toast({
        title: "No file available",
        description: "This note doesn't have an attached file.",
      });
      return;
    }

    try {
      setDownloading(true);
      
      // Extract file name from the path
      const fileName = fileUrl.split('/').pop() || 'download.pdf';
      
      // For all files, download them normally
      const { data, error } = await supabase.storage
        .from('notes')
        .download(fileUrl);
      
      if (error) {
        throw error;
      }

      // Create a URL for the downloaded file and trigger download
      if (data) {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
        
        toast({
          title: "Download successful",
          description: `${fileName} has been downloaded.`,
        });
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };
  
  const handleViewFile = async () => {
    console.log("handleViewFile called");
    console.log("fileUrl:", fileUrl);
    console.log("externalLink:", externalLink);

    // Check if it\'s an HTML file first based on fileUrl
    if (fileUrl && (fileUrl.toLowerCase().endsWith('.html') || fileUrl.toLowerCase().endsWith('.htm'))) {
      console.log("File URL indicates HTML, attempting download from storage:", fileUrl);
      try {
        setIsLoading(true);

        const { data, error } = await supabase.storage
          .from('notes')
          .download(fileUrl);

        if (error) {
          console.error("Error downloading HTML file from storage:", error);
          throw error;
        }

        if (data) {
          console.log("HTML file downloaded successfully, attempting to read as text.");
          // Read the file content as text and show in modal
          const content = await data.text();
          console.log("HTML content length:", content.length);
          // Create a data URL for the HTML content
          const blob = new Blob([content], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          setHtmlDataUrl(url);

          setIsDialogOpen(true);
          console.log("setIsDialogOpen(true) called.");
        } else {
           console.log("Download data is null for HTML file.");
        }
      } catch (error) {
        console.error("Caught error in handleViewFile (HTML download):", error);
        toast({
          title: "Error viewing file",
          description: "There was a problem opening the file. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        console.log("setIsLoading(false) called.");
      }
    } else if (externalLink) {
      // If there\'s an external link (and not an uploaded HTML file), open it in a new tab
      console.log("External link exists (and not an uploaded HTML), opening in new tab:", externalLink);
      window.open(externalLink, '_blank');
    } else if (fileUrl) {
      console.log("File URL exists (and not HTML), checking for PDF:", fileUrl);
      // For non-HTML files uploaded as files, check if it's a PDF
      if (fileUrl.toLowerCase().endsWith('.pdf')) {
        console.log("File is PDF, getting public URL:", fileUrl);
        try {
          setIsLoading(true);
           const { data: urlData } = supabase.storage
            .from('notes')
            .getPublicUrl(fileUrl);

          if (urlData) {
            console.log("Public URL obtained for PDF:", urlData.publicUrl);
            setHtmlDataUrl(urlData.publicUrl);
            setIsDialogOpen(true);
            console.log("setIsDialogOpen(true) called for PDF.");
          } else {
             console.log("Public URL data is null for PDF file.");
             toast({
              title: "Error viewing PDF",
              description: "Could not get public URL for PDF file.",
              variant: "destructive",
            });
          }

        } catch (error) {
           console.error("Caught error in handleViewFile (PDF public URL):");
           toast({
            title: "Error viewing PDF",
            description: "There was a problem opening the PDF file. Please try again.",
            variant: "destructive",
          });
        } finally {
           setIsLoading(false);
           console.log("setIsLoading(false) called for PDF.");
        }
      } else { // Handle other non-HTML, non-PDF files
        console.log("File is not HTML or PDF, getting public URL and opening in new tab:", fileUrl);
        try {
          setIsLoading(true);
          const { data: urlData } = supabase.storage
            .from('notes')
            .getPublicUrl(fileUrl);

          if (urlData) {
            console.log("Public URL obtained:", urlData.publicUrl);
            window.open(urlData.publicUrl, '_blank');
          } else {
             console.log("Public URL data is null for non-HTML, non-PDF file.");
          }
        } catch (error) {
           console.error("Caught error in handleViewFile (non-HTML, non-PDF public URL):");
           toast({
            title: "Error viewing file",
            description: "There was a problem opening the file. Please try again.",
            variant: "destructive",
          });
        } finally {
           setIsLoading(false);
           console.log("setIsLoading(false) called.");
        }
      }
    } else {
      console.log("No fileUrl or externalLink available.");
      toast({
        title: "No content available",
        description: "This note doesn't have any viewable content.",
      });
    }
  };

  return (
    <>
      <Card 
        className={`glass-card transition-all duration-300 ${isHovered ? "scale-[1.02] accent-glow" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white">{title}</CardTitle>
          <div className="flex items-center text-sm text-gray-400">
            <User size={14} className="mr-1" />
            <span>{author} • {date}</span>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-gray-300">{description}</p>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-2">
          {(externalLink || fileUrl) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewFile}
              disabled={isLoading}
              className="border-alpaca-purple text-alpaca-purple hover:bg-alpaca-purple/10"
            >
              <ExternalLink size={16} className="mr-2" />
              {isLoading ? "Loading..." : "View Page"}
            </Button>
          )}
          
          {fileUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
              className="border-alpaca-purple text-alpaca-purple hover:bg-alpaca-purple/10"
            >
              <Download size={16} className="mr-2" />
              {downloading ? "Processing..." : "Download"}
            </Button>
          )}
          
          {!fileUrl && !externalLink && (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="opacity-50 cursor-not-allowed border-alpaca-purple text-alpaca-purple"
            >
              <Download size={16} className="mr-2" />
              No resource
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl h-[95vh] overflow-auto p-0 flex flex-col">
          <DialogHeader className="pb-4 px-6">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <div className="flex justify-center items-center h-full flex-grow">Loading...</div>
          ) : (
            htmlDataUrl && (
              <div className="flex-grow">
                <iframe
                  src={htmlDataUrl}
                  title={title}
                  className="w-full h-full border-none"
                />
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NoteCard;
