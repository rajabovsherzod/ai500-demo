import React, { useState, useRef } from "react";
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
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import AiScannerLoader from "@/components/ui/ai-scanner-loader";
import { useTranslation } from "react-i18next";

// MOCK DATA (Lekin tarjimaga moslashgan)
// Haqiqiy loyihada bular API dan tilga mos kelib keladi.
// Hozircha statik text bo'lgani uchun, hardcode qilib turibmiz.
const MOCK_RESULT = {
  plantName: "Pomidor (Solanum lycopersicum)",
  healthScore: 78,
  status: "warning", // 'healthy' | 'warning' | 'critical'
  disease: "Erta blight (Alternaria solani)",
  confidence: 94.2,
  symptoms: [
    "Barglarda konsentrik halqali jigarrang dog'lar",
    "Pastki barglarning sarg'ayishi",
    "Barglarning to'kilishi"
  ],
  recommendations: [
    "Kasallangan barglarni darhol olib tashlang",
    "Fungitsidlar bilan ishlov berish (mis asosli)",
    "Havo aylanishini yaxshilash uchun butalarni siyraklashtiring",
    "Suv berganda barglarga suv tegishidan saqlaning"
  ]
};

const AiAnalysisPage: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<typeof MOCK_RESULT | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith("image/")) {
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setResult(null); 
      } else {
        toast.error(t("analyze.error.invalidFile"));
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const selectedFile = e.dataTransfer.files?.[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const startAnalysis = () => {
    if (!file) return;

    setIsAnalyzing(true);
    
    // 4.5 soniya kutamiz
    setTimeout(() => {
      setIsAnalyzing(false);
      setResult(MOCK_RESULT);
      toast.success(t("analyze.analyzing.success"));
    }, 4500); 
  };

  const resetAnalysis = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Status tarjimasini olish uchun yordamchi
  const getStatusText = (score: number) => {
    if (score > 80) return t("analyze.results.healthStatus.excellent");
    if (score > 50) return t("analyze.results.healthStatus.average");
    return t("analyze.results.healthStatus.critical");
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-12 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3 flex items-center justify-center gap-3">
            <ScanLine className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            <span className="text-foreground">{t("analyze.title")}</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("analyze.subtitle")}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* STATE 1: LOADING */}
          {isAnalyzing ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AiScannerLoader imageSrc={preview} />
            </motion.div>
          ) : !result ? (
            /* STATE 2: UPLOAD */
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="border-dashed border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-8 md:p-12 flex flex-col items-center justify-center text-center">
                  
                  {preview ? (
                    <div className="relative group max-w-md w-full mb-6">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="relative w-full h-64 object-cover rounded-xl shadow-2xl"
                      />
                      <button 
                        onClick={resetAnalysis}
                        className="absolute top-2 right-2 p-1.5 bg-destructive/90 text-white rounded-full hover:bg-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      className="w-full max-w-md h-64 rounded-xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center cursor-pointer mb-6"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-lg font-medium mb-1">{t("analyze.uploadTitle")}</p>
                      <p className="text-sm text-muted-foreground">{t("analyze.uploadSubtitle")}</p>
                      <p className="text-xs text-muted-foreground mt-4 bg-muted px-3 py-1 rounded-full">
                        {t("analyze.uploadFormat")}
                      </p>
                    </div>
                  )}

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />

                  <div className="flex gap-4">
                    {!preview && (
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        {t("analyze.selectBtn")}
                      </Button>
                    )}
                    
                    {preview && (
                      <Button 
                        size="lg" 
                        variant="neon" 
                        onClick={startAnalysis}
                        className="px-8"
                      >
                        <ScanLine className="w-5 h-5 mr-2" />
                        {t("analyze.startBtn")}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* STATE 3: RESULTS */
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Left Column: Image & Score */}
              <div className="space-y-6">
                <Card className="overflow-hidden border-primary/30 shadow-[0_0_30px_rgba(0,255,127,0.1)]">
                  <div className="relative h-72 md:h-96">
                    <img 
                      src={preview!} 
                      alt="Analyzed Plant" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-sm text-primary/80 font-mono mb-1">{t("analyze.results.identified")}</p>
                          <h2 className="text-2xl font-bold text-white">{result.plantName}</h2>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-white/60 mb-1">{t("analyze.results.confidence")}</p>
                          <p className="text-xl font-bold text-primary">{result.confidence}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Health Meter */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ThermometerSun className="w-5 h-5 text-primary" />
                      {t("analyze.results.healthScore")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold">{result.healthScore}/100</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.healthScore > 80 ? "bg-green-500/20 text-green-500" :
                        result.healthScore > 50 ? "bg-yellow-500/20 text-yellow-500" :
                        "bg-red-500/20 text-red-500"
                      }`}>
                        {getStatusText(result.healthScore)}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${result.healthScore}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full ${
                          result.healthScore > 80 ? "bg-green-500" :
                          result.healthScore > 50 ? "bg-yellow-500" :
                          "bg-red-500"
                        }`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Diagnosis & Recommendations */}
              <div className="space-y-6">
                {/* Diagnosis */}
                <Card className={`border-l-4 ${
                   result.status === 'healthy' ? 'border-l-green-500' :
                   result.status === 'warning' ? 'border-l-yellow-500' : 'border-l-red-500'
                }`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className={`w-5 h-5 ${
                         result.status === 'healthy' ? 'text-green-500' :
                         result.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                      }`} />
                      {t("analyze.results.diagnosis")}: {result.disease}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Search className="w-4 h-4 text-muted-foreground" />
                      {t("analyze.results.symptoms")}:
                    </h4>
                    <ul className="space-y-2 mb-0">
                      {result.symptoms.map((sym, idx) => (
                        <motion.li 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + idx * 0.1 }}
                          className="flex items-start gap-2 text-sm text-muted-foreground bg-secondary/30 p-2 rounded-lg"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          {sym}
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sprout className="w-5 h-5 text-primary" />
                      {t("analyze.results.recommendations")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.recommendations.map((rec, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + idx * 0.1 }}
                          className="flex gap-3"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary text-xs font-bold">
                            {idx + 1}
                          </div>
                          <p className="text-sm">{rec}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={resetAnalysis}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t("analyze.results.newScan")}
                  </Button>
                  <Button 
                    variant="neon" 
                    className="w-full"
                    onClick={() => toast.info(t("analyze.results.reportSaved"))}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {t("analyze.results.saveReport")}
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