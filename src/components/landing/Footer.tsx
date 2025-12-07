import React from "react";
import { Leaf } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="py-12 border-t border-primary/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/40">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-lg font-bold tracking-wider text-primary">
              AgroAi
            </span>
          </div>

          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Documentation
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Support
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AgroAi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
