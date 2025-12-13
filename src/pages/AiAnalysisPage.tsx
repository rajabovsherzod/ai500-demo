import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  ScanLine,
  X,
  CheckCircle2,
  AlertTriangle,
  ThermometerSun,
  Sprout,
  RefreshCw,
  Search,
  Zap,
  Activity,
  Cpu,
  ShieldCheck,
  Microscope,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

// --- MOCK DATA ---
const MOCK_RESULT = {
  plantName: "Solanum lycopersicum (Pomidor)",
  healthScore: 78,
  status: "warning",
  disease: "Erta blight (Alternaria solani)",
  confidence: 94.2,
  symptoms: [
    "Barglarda konsentrik halqali dog'lar",
    "Pastki barglarning sarg'ayishi",
    "Fotosintez jarayoni buzilishi",
  ],
  recommendations: [
    "Kasallangan qismlarni steril qaychi bilan kesib tashlang",
    "Mis asosli fungitsidlar (CuSO₄) bilan ishlov berish",
    "Namlikni 60% dan past saqlash (Ventilyatsiya)",
    "Tuproqqa azotli o'g'itlarni vaqtincha to'xtatish",
  ],
};

// --- YORDAMCHI KOMPONENTLAR ---

// 1. Matnni "yozilish" effekti bilan chiqarish
const TypewriterText = ({
  text,
  delay = 0,
}: {
  text: string;
  delay?: number;
}) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
        if (index === text.length) clearInterval(interval);
      }, 30); // Yozish tezligi
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return <span>{displayedText}</span>;
};

// 2. HUD Burchaklari (Futuristik ramka)
const HudCorner = ({ className }: { className?: string }) => (
  <div className={`absolute w-4 h-4 border-emerald-500/50 ${className}`} />
);

const AiAnalysisPage: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<typeof MOCK_RESULT | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---
  const handleFile = (selectedFile?: File) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    } else if (selectedFile) {
      toast.error("Faqat rasm fayllari (JPG, PNG)");
    }
  };

  const startAnalysis = () => {
    if (!file) return;
    setIsAnalyzing(true);
    // Simulyatsiya
    setTimeout(() => {
      setIsAnalyzing(false);
      setResult(MOCK_RESULT);
      toast.success("AI Tahlil yakunlandi");
    }, 4000);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-emerald-50 pt-24 pb-12 px-4 relative overflow-hidden font-sans selection:bg-emerald-500/30">
      {/* --- BACKGROUND GRID & EFFECTS --- */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto relative z-10"
      >
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between mb-8 border-b border-emerald-500/20 pb-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <Cpu className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-mono tracking-widest uppercase">
                AgroAi Neural Engine v2.4
              </span>
            </div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">
              {t("analyze.title")}
            </h1>
          </div>
          <div className="hidden md:flex gap-4 text-xs font-mono text-emerald-500/60">
            <span>SYS: ONLINE</span>
            <span>DB: CONNECTED</span>
            <span>LATENCY: 12ms</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STATE 1: UPLOAD & PREVIEW */}
          {!result && !isAnalyzing && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center min-h-[50vh]"
            >
              <div className="relative group w-full max-w-2xl">
                {/* Neon Frame */}
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />

                <div
                  onClick={() => !preview && fileInputRef.current?.click()}
                  className={`
                    relative bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 rounded-xl 
                    p-8 md:p-12 text-center transition-all duration-300 overflow-hidden
                    ${
                      !preview
                        ? "cursor-pointer hover:bg-slate-900/90 hover:border-emerald-500/60"
                        : ""
                    }
                  `}
                >
                  {/* Grid Animation inside card */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                  {preview ? (
                    <div className="relative">
                      <div className="relative rounded-lg overflow-hidden border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                        <img
                          src={preview}
                          alt="Upload"
                          className="w-full h-64 md:h-80 object-cover"
                        />

                        {/* Scanning Overlay Effect */}
                        <div className="absolute inset-0 bg-emerald-500/10 z-10" />
                        <motion.div
                          animate={{ top: ["0%", "100%", "0%"] }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)] z-20"
                        />

                        {/* HUD Corners */}
                        <HudCorner className="top-2 left-2 border-t-2 border-l-2" />
                        <HudCorner className="top-2 right-2 border-t-2 border-r-2" />
                        <HudCorner className="bottom-2 left-2 border-b-2 border-l-2" />
                        <HudCorner className="bottom-2 right-2 border-b-2 border-r-2" />
                      </div>

                      <div className="mt-8 flex gap-4 justify-center relative z-30">
                        <Button
                          variant="ghost"
                          onClick={reset}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4 mr-2" /> Bekor qilish
                        </Button>
                        <Button
                          variant="neon"
                          size="lg"
                          onClick={startAnalysis}
                          className="min-w-[200px]"
                        >
                          <Zap className="w-4 h-4 mr-2" /> ANALIZNI BOSHLASH
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12">
                      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-10 h-10 text-emerald-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Rasmni yuklang
                      </h3>
                      <p className="text-emerald-500/60 font-mono text-sm mb-6">
                        JPG yoki PNG format • Maksimal 5MB
                      </p>
                      <Button
                        variant="outline"
                        className="border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400"
                      >
                        Faylni tanlash
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFile(e.target.files?.[0])}
                accept="image/*"
                className="hidden"
              />
            </motion.div>
          )}

          {/* STATE 2: ANALYZING (Futuristic Loader) */}
          {isAnalyzing && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Rotating Rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-t-2 border-b-2 border-emerald-500/30"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 rounded-full border-l-2 border-r-2 border-cyan-500/30"
                />
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center backdrop-blur-md border border-emerald-500/50"
                >
                  <Cpu className="w-12 h-12 text-emerald-400" />
                </motion.div>
              </div>
              <div className="mt-8 space-y-2 text-center font-mono">
                <p className="text-emerald-400 text-lg animate-pulse">
                  TAHLIL QILINMOQDA...
                </p>
                <div className="flex flex-col text-xs text-emerald-500/50 gap-1">
                  <TypewriterText
                    text="> Pattern matching algorithms... OK"
                    delay={500}
                  />
                  <TypewriterText
                    text="> Checking leaf structure... OK"
                    delay={1500}
                  />
                  <TypewriterText
                    text="> Comparing database... OK"
                    delay={2500}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STATE 3: RESULTS DASHBOARD */}
          {result && !isAnalyzing && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* --- LEFT PANEL: VISUAL DATA --- */}
              <div className="lg:col-span-4 space-y-6">
                {/* Image Monitor */}
                <div className="bg-slate-900/80 border border-emerald-500/30 p-1 rounded-xl relative overflow-hidden">
                  <img
                    src={preview!}
                    alt="Analyzed"
                    className="w-full h-64 object-cover rounded-lg opacity-80"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_2px,rgba(0,0,0,0.5)_3px)] bg-[size:100%_4px] pointer-events-none opacity-30" />
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1 text-xs font-mono text-emerald-400 border border-emerald-500/30 rounded">
                    IMG_SOURCE: UPLOADED
                  </div>
                </div>

                {/* Score Circle */}
                <div className="bg-slate-900/60 border border-emerald-500/20 p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs font-mono mb-1">
                      HEALTH SCORE
                    </p>
                    <div className="text-4xl font-bold text-white font-display">
                      {result.healthScore}
                      <span className="text-lg text-slate-500">/100</span>
                    </div>
                  </div>
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="rgba(16,185,129,0.1)"
                        strokeWidth="6"
                        fill="transparent"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="#10b981"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray="226"
                        strokeDashoffset={
                          226 - (226 * result.healthScore) / 100
                        }
                        strokeLinecap="round"
                      />
                    </svg>
                    <Activity className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="bg-slate-900/60 border border-emerald-500/20 p-6 rounded-2xl">
                  <div className="flex justify-between text-xs font-mono text-emerald-400 mb-2">
                    <span>AI CONFIDENCE</span>
                    <span>{result.confidence}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
                    />
                  </div>
                </div>
              </div>

              {/* --- RIGHT PANEL: DATA & REPORT --- */}
              <div className="lg:col-span-8 space-y-6">
                {/* Main Diagnosis Card */}
                <div className="bg-slate-900/80 border-l-4 border-l-yellow-500 border-t border-r border-b border-white/5 p-6 rounded-r-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Microscope size={120} />
                  </div>
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <AlertTriangle className="w-8 h-8 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-yellow-500 text-xs font-mono mb-1">
                        DETECTED PATHOGEN
                      </p>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {result.disease}
                      </h2>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {result.symptoms.map((sym, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-white/5 border border-white/10 rounded text-sm text-slate-300 flex items-center"
                          >
                            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2" />
                            {sym}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations (Terminal Style) */}
                <div className="bg-black/40 border border-emerald-500/30 rounded-xl p-6 font-mono text-sm relative">
                  <div className="absolute top-3 right-4 flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                  </div>
                  <h3 className="text-emerald-400 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> PROTOCOLS & TREATMENT
                  </h3>
                  <div className="space-y-3">
                    {result.recommendations.map((rec, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="flex gap-3 text-slate-300"
                      >
                        <span className="text-emerald-500 shrink-0">{`[0${
                          i + 1
                        }]`}</span>
                        <span>{rec}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 text-xs text-slate-500">
                    <span className="animate-pulse">_</span> END OF REPORT
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={reset}
                    className="flex-1 border-white/10 hover:bg-white/5 text-white h-12"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> YANGI TEKSHIRUV
                  </Button>
                  <Button
                    variant="neon"
                    onClick={() => toast.info("Saqlandi")}
                    className="flex-1 h-12"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> HISOBOTNI SAQLASH
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AiAnalysisPage;