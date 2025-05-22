import React from 'react';
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-white/10 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-bold text-alpaca-purple">
                Alpaca<span className="text-accent">DN</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-4">
              Community-driven trading insights and strategies for investors of all levels.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-alpaca-purple transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-alpaca-purple transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/notes" className="text-gray-400 hover:text-alpaca-purple transition-colors">
                  Notes
                </Link>
              </li>
              <li>
                <Link to="/chat" className="text-gray-400 hover:text-alpaca-purple transition-colors">
                  Chat
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/discord-connect" className="text-gray-400 hover:text-alpaca-purple transition-colors">
                  Discord
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-alpaca-purple transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-alpaca-purple transition-colors">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-alpaca-purple transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-alpaca-purple transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} AlpacaDN. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;