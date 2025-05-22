import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Link } from 'react-router-dom';

interface JournalCardProps {
  journal: {
    id: string;
    user_id: string;
    title: string;
    content: string | null;
    created_at: string;
    updated_at: string;
    profiles: { username: string | null } | null;
  };
}

const JournalCard = ({ journal }: JournalCardProps) => {
  // Function to truncate content for snippet
  const truncateContent = (content: string | null, wordLimit: number) => {
    if (!content) return "No content";
    const words = content.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + ''; // Added ellipsis for truncated text.
    }
    return content;
  };

  // Format date for display
  const formattedDate = new Date(journal.created_at).toLocaleDateString();

  return (
    // We will add a Link component here later for navigation
    <Link to={`/journals/${journal.id}`} className="block">
    <Card className="glass-card transition-all duration-300 hover:scale-[1.02] accent-glow">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-white">{journal.title}</CardTitle>
        <div className="flex items-center text-sm text-gray-400">
          <User size={14} className="mr-1" />
          <span>{journal.profiles?.username || 'Anonymous'} • {formattedDate}</span>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-300">{truncateContent(journal.content, 50)}</p> {/* Displaying content snippet */}
      </CardContent>

      <CardFooter className="flex justify-end">
        {/* This button will eventually navigate to the full journal page */}
        <Button variant="outline" size="sm" className="border-alpaca-purple text-alpaca-purple hover:bg-alpaca-purple/10">
          Read More
        </Button>
      </CardFooter>
    </Card>
    </Link>
  );
};

export default JournalCard; 