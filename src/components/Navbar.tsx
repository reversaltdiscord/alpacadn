import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthButton from "./AuthButton";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-lg bg-black/30 border-b border-white/10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-alpaca-purple">
            Alpaca<span className="text-accent">DN</span>
          </span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="text-gray-300 hover:text-alpaca-purple transition">
            Dashboard
          </Link>
          <Link to="/notes" className="text-gray-300 hover:text-alpaca-purple transition">
            Notes
          </Link>
          <Link to="/journals" className="text-gray-300 hover:text-alpaca-purple transition">
            Journals
          </Link>
          <Link to="/discord-connect" className="text-gray-300 hover:text-alpaca-purple transition">
            Discord
          </Link>
          <Link to="/blog" className="text-gray-300 hover:text-alpaca-purple transition">
            Blog
          </Link>
          <Link to="/chat" className="text-gray-300 hover:text-alpaca-purple transition">
            Chat
          </Link>
          <AuthButton />
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-300"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute w-full bg-black/95 backdrop-blur-lg border-b border-white/10">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link 
              to="/dashboard" 
              className="text-gray-300 hover:text-alpaca-purple transition py-2"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/notes" 
              className="text-gray-300 hover:text-alpaca-purple transition py-2"
              onClick={() => setIsOpen(false)}
            >
              Notes
            </Link>
            <Link
              to="/journals"
              className="text-gray-300 hover:text-alpaca-purple transition py-2"
              onClick={() => setIsOpen(false)}
            >
              Journals
            </Link>
            <Link 
              to="/discord-connect" 
              className="text-gray-300 hover:text-alpaca-purple transition py-2"
              onClick={() => setIsOpen(false)}
            >
              Discord
            </Link>
            <Link 
              to="/blog" 
              className="text-gray-300 hover:text-alpaca-purple transition py-2"
              onClick={() => setIsOpen(false)}
            >
              Blog
            </Link>
            <Link 
              to="/chat" 
              className="text-gray-300 hover:text-alpaca-purple transition py-2"
              onClick={() => setIsOpen(false)}
            >
              Chat
            </Link>
            <div className="py-2">
              <AuthButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;