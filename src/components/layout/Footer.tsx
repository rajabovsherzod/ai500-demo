import React from "react";
import { Leaf } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-primary/20 bg-background/80 backdrop-blur-xl py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Chap tomon: AgroAi */}
        <div className="flex items-center gap-2 select-none">
          <Leaf className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-lg tracking-wider text-foreground">
            AgroAi
          </span>
        </div>

        {/* O'ng tomon: Powered by */}
        <div className="text-sm text-muted-foreground font-mono">
          Powered by <span className="text-primary font-semibold">0xDEAD</span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;