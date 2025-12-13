import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Search, Brain } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AiScannerLoaderProps {
  imageSrc?: string | null;
}

const AiScannerLoader: React.FC<AiScannerLoaderProps> = ({ imageSrc }) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState(t("analyze.analyzing.text"));

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 40); // 4 soniyada 100%

    const textInterval = setInterval(() => {
      setProgress((p) => {
        if (p < 30) setText(t("analyze.analyzing.step1"));
        else if (p < 60) setText(t("analyze.analyzing.step2"));
        else if (p < 90) setText(t("analyze.analyzing.step3"));
        else setText(t("analyze.analyzing.step4"));
        return p;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(textInterval);
    };
  }, [t]); // t o'zgarganda (til o'zgarganda) qayta ishlaydi

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[60vh]">
      {/* Scanner Frame */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden border-2 border-primary/30 bg-black/50 backdrop-blur-sm shadow-[0_0_30px_rgba(0,255,127,0.2)]">
        
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt="Scanning" 
            className="w-full h-full object-cover opacity-60" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Brain className="w-32 h-32 text-primary/20" />
          </div>
        )}

        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,127,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,127,0.1)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]" />

        {/* Scanning Laser Line */}
        <motion.div
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_20px_rgba(0,255,127,1)] z-10"
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]" />
        </motion.div>

        {/* Corners */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />

        {/* Center Target */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 border border-primary/50 rounded-full flex items-center justify-center"
          >
            <div className="w-1 h-1 bg-primary rounded-full" />
          </motion.div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-8 text-center space-y-4 max-w-md w-full px-4">
        <div className="flex items-center justify-between text-xs font-mono text-primary/70 mb-1 px-1">
          <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> AI CORE</span>
          <span>{progress}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary shadow-[0_0_10px_rgba(0,255,127,0.5)]"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        {/* Text Animation */}
        <div className="h-6">
          <motion.p
            key={text}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium text-foreground flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4 text-primary animate-pulse" />
            {text}
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default AiScannerLoader;