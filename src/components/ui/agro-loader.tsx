import React from "react";
import { motion } from "framer-motion";
import { Leaf, Sprout } from "lucide-react";

interface AgroLoaderProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

const AgroLoader: React.FC<AgroLoaderProps> = ({
  text = "Yuklanmoqda...",
  size = "md",
  fullScreen = false,
}) => {
  const sizeConfig = {
    sm: { container: 80, leaf: 18, center: 24, text: "text-sm" },
    md: { container: 120, leaf: 24, center: 36, text: "text-base" },
    lg: { container: 160, leaf: 32, center: 48, text: "text-lg" },
  };

  const config = sizeConfig[size];
  const radius = config.container / 2 - config.leaf / 2 - 8;

  // 8 ta barg - har biri 45 gradusda
  const leafCount = 8;
  const leaves = Array.from({ length: leafCount }, (_, i) => ({
    angle: (360 / leafCount) * i,
    delay: i * 0.1,
  }));

  const loaderContent = (
    <div className="flex flex-col items-center justify-center">
      {/* Main rotating container */}
      <div
        className="relative"
        style={{
          width: config.container,
          height: config.container,
        }}
      >
        {/* Outer glow ring */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.05, 1],
          }}
          transition={{
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute inset-0 rounded-full border border-primary/20"
          style={{
            boxShadow: "0 0 30px rgba(0, 255, 255, 0.15), inset 0 0 30px rgba(0, 255, 255, 0.05)",
          }}
        />

        {/* Rotating leaves container */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0"
        >
          {leaves.map((leaf, index) => {
            const x = Math.cos((leaf.angle * Math.PI) / 180) * radius;
            const y = Math.sin((leaf.angle * Math.PI) / 180) * radius;

            return (
              <motion.div
                key={index}
                className="absolute"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                }}
                animate={{
                  scale: [0.8, 1.1, 0.8],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: leaf.delay,
                }}
              >
                <Leaf
                  size={config.leaf}
                  className="text-primary"
                  style={{
                    transform: `rotate(${leaf.angle + 45}deg)`,
                    filter: "drop-shadow(0 0 6px hsl(var(--primary)))",
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Center icon - stationary */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="rounded-full bg-background/80 backdrop-blur-sm border border-primary/30 flex items-center justify-center"
            style={{
              width: config.center,
              height: config.center,
              boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)",
            }}
          >
            <Sprout
              size={config.center * 0.5}
              className="text-primary"
              style={{
                filter: "drop-shadow(0 0 4px hsl(var(--primary)))",
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Loading text */}
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`mt-6 font-display ${config.text} text-primary tracking-widest uppercase`}
      >
        {text}
      </motion.p>

      {/* Animated underline */}
      <div className="mt-2 h-0.5 w-24 bg-primary/20 rounded-full overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="h-full w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
        />
      </div>
    </div>
  );

  // Full screen centered wrapper
  if (fullScreen) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      {loaderContent}
    </div>
  );
}

  // Regular centered in container
  return (
  <div 
    className="flex items-center justify-center w-full"
    style={{ minHeight: "calc(100vh - 80px)" }}
  >
    {loaderContent}
  </div>
);
};

export default AgroLoader;