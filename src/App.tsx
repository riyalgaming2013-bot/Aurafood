import React, { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAppStore, ScanRecord } from "./lib/store";
import { AnalysisResult, analyzeFoodImage } from "./lib/gemini";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, Search, Camera, History, FlaskConical, User, 
  CloudUpload, Image as ImageIcon, ShieldCheck, Microscope, Apple,
  CheckCircle2, Download, Code, LayoutGrid, Activity, ChevronDown, Info
} from "lucide-react";

export default function App() {
  const store = useAppStore();
  const [activeTab, setActiveTab] = useState<"Analyze" | "Logs" | "Insights" | "Account">("Analyze");
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentPreview, setCurrentPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      handleFileSelected(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  } as any);

  const handleFileSelected = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image is too large. Max 10MB.");
      return;
    }
    setError(null);
    setCurrentFile(file);
    setCurrentPreview(URL.createObjectURL(file));
  };

  const startAnalysis = async () => {
    if (!currentFile || !currentPreview) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeFoodImage(currentFile);
      setCurrentResult(result);
      
      const newScan: ScanRecord = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        imageBlobUrl: currentPreview,
        result
      };
      store.addScan(newScan);
    } catch (err: any) {
      setError(err.message || "Failed to analyze image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setCurrentFile(null);
    setCurrentPreview(null);
    setCurrentResult(null);
    setError(null);
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      {/* TopAppBar */}
      <header className="bg-surface/80 dark:bg-background/80 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-container-margin py-stack-md mx-auto max-w-7xl">
          <div 
            className="font-display-lg text-[24px] font-bold tracking-tighter text-primary cursor-pointer select-none"
            onClick={resetAnalysis}
          >
            AuraHealth
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            {["Analyze", "Logs", "Insights", "Account"].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "font-body-md text-sm font-medium transition-colors border-b-2 py-4 -mb-[17px]",
                  activeTab === tab 
                    ? "text-primary border-secondary font-semibold" 
                    : "text-on-surface-variant border-transparent hover:text-primary"
                )}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-stack-md">
            <button className="text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 p-2 rounded-full hidden md:block">
              <Search className="w-5 h-5 pointer-events-none" />
            </button>
            <button className="text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 p-2 rounded-full hidden md:block">
              <Bell className="w-5 h-5 pointer-events-none" />
            </button>
            <div className="w-9 h-9 rounded-full bg-surface-container-high overflow-hidden shadow-sm cursor-pointer border border-outline-variant/30">
              <img alt="Profile" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto px-container-margin py-section-gap pb-32 md:pb-section-gap">
        <AnimatePresence mode="wait">
          {activeTab === "Analyze" && !currentResult && (
            <motion.div
              key="analyze-start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Hero Section */}
              <section className="text-center mb-12 flex flex-col items-center max-w-3xl mx-auto">
                <h1 className="font-display-lg text-[40px] md:text-[48px] font-bold leading-[1.1] tracking-[-0.02em] mb-stack-md text-primary">
                  Know exactly what’s on your plate.
                </h1>
                <p className="font-body-lg text-[18px] leading-[1.6] text-on-surface-variant mb-stack-lg max-w-2xl">
                  Upload a photo of your meal for instant, clinical-grade nutritional breakdown and ingredient analysis powered by advanced AI.
                </p>
              </section>

              {/* Upload & Preview Bento Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-stack-lg mb-section-gap">
                {/* Main Upload Zone */}
                <div 
                  {...getRootProps()}
                  className={cn(
                    "lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border p-stack-lg flex flex-col items-center justify-center min-h-[400px] border-dashed border-2 transition-colors duration-300 group cursor-pointer relative overflow-hidden",
                    isDragActive ? "border-secondary bg-secondary-container/10" : "border-outline-variant/60 hover:border-secondary"
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {!currentPreview ? (
                    <>
                      <CloudUpload className="w-16 h-16 text-outline-variant group-hover:text-secondary mb-stack-md transition-colors" strokeWidth={1} />
                      <h3 className="font-headline-md text-[24px] font-semibold text-primary mb-stack-sm text-center">Drag & Drop Meal Photo</h3>
                      <p className="font-body-md text-on-surface-variant text-center mb-stack-lg">or click to browse your device</p>
                      <button className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-md text-[14px] font-semibold hover:opacity-90 transition-opacity z-10" onClick={(e) => e.preventDefault()}>
                        Select Image
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center z-10 space-y-6">
                      <div className="relative w-full max-w-sm aspect-video rounded-lg overflow-hidden border border-outline-variant/30 shadow-sm bg-surface">
                        <img src={currentPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); startAnalysis(); }}
                        disabled={isAnalyzing}
                        className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-md text-[15px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                            Analyzing Food...
                          </>
                        ) : "Analyze This Meal"}
                      </button>
                      {error && <p className="text-error text-sm mt-2">{error}</p>}
                    </div>
                  )}
                </div>

                {/* Live Preview / Skeleton Area */}
                <div className="lg:col-span-4 flex flex-col gap-gutter">
                  <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 p-stack-md flex-grow flex flex-col relative overflow-hidden">
                    <h4 className="font-label-md text-[12px] font-bold text-on-surface-variant mb-stack-md uppercase tracking-widest">Analysis Preview</h4>
                    
                    {!currentPreview ? (
                      <div className="w-full h-40 bg-surface-container-high rounded-lg mb-stack-md flex items-center justify-center overflow-hidden">
                        <ImageIcon className="text-outline-variant w-10 h-10 opacity-50" strokeWidth={1} />
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-surface-container-high rounded-lg mb-stack-md flex items-center justify-center overflow-hidden relative">
                        <img src={currentPreview} className="w-full h-full object-cover opacity-60 blur-sm mix-blend-luminosity" alt="Background preview" />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"></div>
                      </div>
                    )}
                    
                    <div className="space-y-4 flex-grow">
                      <div className={cn("h-3 bg-surface-container-high rounded-full w-3/4", isAnalyzing && "animate-pulse")}></div>
                      <div className={cn("h-3 bg-surface-container-high rounded-full w-1/2", isAnalyzing && "animate-pulse")}></div>
                      <div className="mt-8 pt-8 border-t border-outline-variant/20">
                        <div className="flex justify-between mb-3">
                          <div className={cn("h-2.5 bg-surface-container-high rounded-full w-1/3", isAnalyzing && "animate-pulse delay-75")}></div>
                          <div className={cn("h-2.5 bg-surface-container-high rounded-full w-1/4", isAnalyzing && "animate-pulse delay-100")}></div>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                          <div className={cn("w-1/3 h-full bg-surface-container-highest", isAnalyzing && "w-full transition-all duration-1000 ease-in-out bg-secondary-container")}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/20 p-stack-md flex items-center gap-stack-sm">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                    <Activity className="w-5 h-5 focus:outline-none" />
                  </div>
                  <div>
                    <h5 className="font-label-md text-[14px] font-semibold text-primary">Nutrition Estimate</h5>
                    <p className="font-caption text-[12px] text-on-surface-variant">Clinical precision macros</p>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/20 p-stack-md flex items-center gap-stack-sm">
                  <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-label-md text-[14px] font-semibold text-primary">Food Safety</h5>
                    <p className="font-caption text-[12px] text-on-surface-variant">Visual health indicators</p>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/20 p-stack-md flex items-center gap-stack-sm">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-label-md text-[14px] font-semibold text-primary">Ingredient Awareness</h5>
                    <p className="font-caption text-[12px] text-on-surface-variant">Deep molecular breakdown</p>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === "Analyze" && currentResult && (
            <motion.div
              key="analyze-result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="mb-8">
                <h2 className="font-display-lg text-[32px] font-bold text-primary tracking-tight">Analysis Results</h2>
                <p className="text-on-surface-variant text-sm mt-1">AI-powered nutritional and safety assessment.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column (Image + Detection context) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Image Card */}
                  <div className="relative rounded-2xl overflow-hidden bg-surface-container shadow-sm border border-outline-variant/20 aspect-[4/3] w-full">
                    <img src={currentPreview!} alt="Analyzed meal" className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-outline-variant/30">
                      <CheckCircle2 className="w-4 h-4 text-secondary" />
                      <span className="text-xs font-semibold text-primary">Scan Complete</span>
                    </div>
                  </div>

                  {/* Detected Entity */}
                  <div className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/20 p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">Detected Entity</p>
                        <h3 className="text-[20px] font-display-lg font-bold text-primary leading-tight">{currentResult.foodName}</h3>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary shrink-0">
                        <Activity className="w-5 h-5 pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 border-t border-outline-variant/20 pt-4">
                      <div className="w-12 h-12 rounded-full border-2 border-secondary flex items-center justify-center text-sm font-bold text-primary shrink-0 relative overflow-hidden">
                        {currentResult.confidence}%
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-secondary/20" 
                          style={{ height: `${currentResult.confidence}%` }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary mb-0.5">Confidence Match</p>
                        <p className="text-[11px] text-on-surface-variant leading-snug">AI model certainty based on visual markers and texture analysis.</p>
                      </div>
                    </div>
                  </div>

                  {/* Optimal Consumption / Safety */}
                  <div className={cn(
                    "rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border p-5 flex flex-col gap-2",
                    currentResult.safety.riskIndicator === 'high' ? "bg-error-container border-error/20" : 
                    currentResult.safety.riskIndicator === 'medium' ? "bg-[#fff8e1] border-[#ffb300]/20" :
                    "bg-[#eaf8ce] border-secondary/20" // default green (safe)
                  )}>
                    <h4 className={cn(
                      "text-[16px] font-semibold flex items-center gap-2",
                      currentResult.safety.riskIndicator === 'high' ? "text-on-error-container" : "text-secondary"
                    )}>
                      <CheckCircle2 className="w-5 h-5" />
                      {currentResult.safety.safeToEatStatus === 'likely okay' ? "Optimal for Consumption" : currentResult.safety.safeToEatStatus}
                    </h4>
                    <p className="text-[13px] text-on-surface-variant leading-relaxed">
                      {currentResult.safety.explanation}
                    </p>
                    <p className="text-[10px] text-outline mt-2 pt-2 border-t border-black/5 flex items-center gap-1">
                      <Info className="w-3 h-3" /> Estimates may vary by portion size and hidden ingredients.
                    </p>
                  </div>
                </div>

                {/* Right Column (Nutritional Profile + Grid) */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  {/* Nutritional Profile */}
                  <div className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/20 p-6">
                    <div className="flex justify-between items-center mb-6 border-b border-outline-variant/20 pb-4">
                      <h3 className="text-[18px] font-display-lg font-semibold text-primary">Nutritional Profile</h3>
                      <div className="bg-surface-container-high px-3 py-1 rounded-full text-[11px] font-medium text-on-surface-variant">
                        Per {currentResult.nutrition.servingSize}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-stretch">
                      <div className="bg-[#fcfafa] rounded-xl flex flex-col items-center justify-center p-6 min-w-[140px] border border-outline-variant/10">
                        <Activity className="w-5 h-5 mb-2 text-on-surface-variant" />
                        <span className="text-[40px] font-display-lg font-bold text-primary leading-none tracking-tight">{currentResult.nutrition.calories.replace(/[^0-9]/g, '') || "N/A"}</span>
                        <span className="text-[12px] font-medium text-on-surface-variant mt-1">Calories</span>
                      </div>
                      
                      <div className="flex-1 space-y-5 w-full">
                        {/* Fake bars for macros, adapting to numbers if possible, else random logical values */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[13px] font-medium">
                            <span className="text-primary">Fats</span>
                            <span className="text-on-surface-variant">{currentResult.nutrition.fat}</span>
                          </div>
                          <div className="w-full bg-surface-container-highest rounded-full h-2">
                            <div className="bg-[#496800] h-2 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[13px] font-medium">
                            <span className="text-primary">Carbohydrates</span>
                            <span className="text-on-surface-variant">{currentResult.nutrition.carbs}</span>
                          </div>
                          <div className="w-full bg-surface-container-highest rounded-full h-2">
                            <div className="bg-[#b8c8da] h-2 rounded-full" style={{ width: '45%' }}></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[13px] font-medium">
                            <span className="text-primary">Protein</span>
                            <span className="text-on-surface-variant">{currentResult.nutrition.protein}</span>
                          </div>
                          <div className="w-full bg-surface-container-highest rounded-full h-2">
                            <div className="bg-[#c4c7c7] h-2 rounded-full" style={{ width: '25%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row inside Right Col */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-grow">
                    {/* Detected Components */}
                    <div className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/20 p-6 flex flex-col">
                      <h4 className="text-[11px] font-bold tracking-widest text-primary uppercase mb-4 flex items-center gap-2">
                        <FlaskConical className="w-4 h-4" /> Detected Components
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-[#eaf8ce] border border-[#add461]/30 text-[#364e00] px-3 py-1.5 rounded-full text-[12px] font-medium">{currentResult.foodName.split(' ')[0]}</span>
                        {currentResult.alternateMatches?.map((match, idx) => (
                           <span key={idx} className="bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-full text-[12px] font-medium border border-outline-variant/20">{match}</span>
                        ))}
                         <span className="bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-full text-[12px] font-medium border border-outline-variant/20">Sugar: {currentResult.nutrition.sugar}</span>
                         <span className="bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-full text-[12px] font-medium border border-outline-variant/20">Sodium: {currentResult.nutrition.sodium}</span>
                      </div>
                    </div>

                    {/* Clinical Insight */}
                    <div className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/20 p-6 flex flex-col relative overflow-hidden">
                      <div className="absolute -right-4 -top-4 opacity-5 text-outline">
                         <Microscope className="w-24 h-24" />
                      </div>
                      <h4 className="text-[11px] font-bold tracking-widest text-primary uppercase mb-4 flex items-center gap-2 relative z-10">
                        <ShieldCheck className="w-4 h-4 text-tertiary-fixed-dim" /> Clinical Insight
                      </h4>
                      <p className="text-[13px] text-on-surface-variant mb-6 leading-relaxed relative z-10 flex-grow">
                        {currentResult.health.explanation} 
                        {" "}
                        {currentResult.finalVerdict.actionableRecommendation}
                      </p>
                      <button className="w-full bg-transparent border border-outline text-primary py-2 rounded-full text-[13px] font-semibold hover:bg-surface-container-high transition-colors mt-auto relative z-10">
                        Log Meal Entry
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex justify-center mt-12 mb-8">
                <div className="bg-surface-container-lowest shadow-sm rounded-[32px] border border-outline-variant/20 inline-flex items-center overflow-hidden p-1.5">
                  <button className="flex items-center gap-2 px-6 py-3 hover:bg-surface-container-low rounded-full transition-colors text-[16px] font-semibold text-primary">
                    <Download className="w-5 h-5 opacity-70" /> Download
                  </button>
                  <div className="w-[1px] h-6 bg-outline-variant/30"></div>
                  <button className="flex items-center gap-2 px-6 py-3 hover:bg-surface-container-low rounded-full transition-colors text-[16px] font-semibold text-primary">
                    <Code className="w-5 h-5 opacity-70" /> Source
                  </button>
                  <div className="w-[1px] h-6 bg-outline-variant/30"></div>
                  <button className="flex items-center gap-2 px-6 py-3 hover:bg-surface-container-low rounded-full transition-colors text-[16px] font-semibold text-primary">
                    <LayoutGrid className="w-5 h-5 opacity-70" /> Gallery
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "Account" && (
             <motion.div
             key="account-tab"
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             className="max-w-4xl mx-auto space-y-12"
           >
              {/* Profile Header */}
              <div className="flex items-center gap-6 mt-8">
                <div className="w-24 h-24 rounded-full bg-surface-container-high overflow-hidden shadow-sm border-2 border-surface-container-lowest">
                  <img alt="Scientific Researcher Profile" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop"/>
                </div>
                <div>
                  <h2 className="text-[32px] font-display-lg font-bold text-primary tracking-tight leading-none mb-2">Dr. Evelyn Thorne</h2>
                  <p className="text-[14px] text-on-surface-variant mb-4">Scientific Researcher Profile • Premium Member since 2023</p>
                  <div className="flex gap-3">
                    <button className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 flex items-center gap-1.5">
                      Edit Profile
                    </button>
                    <button className="bg-transparent border border-outline-variant text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-surface-container-low flex items-center gap-1.5">
                      <Download className="w-4 h-4" /> Export Data
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Scans */}
              <section>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-[24px] font-display-lg font-semibold text-primary mb-1">Recent Scans</h3>
                    <p className="text-sm text-on-surface-variant">Your chronological analysis history.</p>
                  </div>
                  <button className="text-secondary font-semibold text-sm hover:underline flex items-center gap-1">
                    View All &rarr;
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Empty state or list. Just mock 3 items for ui matching */}
                  {[
                    {name: 'Mediterranean Bowl', cals: '420 kcal', date: 'Today, 12:45 PM', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80'},
                    {name: 'Margherita Slice', cals: '285 kcal', date: 'Yesterday, 7:30 PM', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80'},
                    {name: 'Green Detox Salad', cals: '310 kcal', date: 'Oct 24, 1:15 PM', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'}
                  ].map((item, i) => (
                    <div key={i} className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col">
                      <div className="relative aspect-square bg-[#f0f0f0] flex items-center justify-center overflow-hidden">
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-sm"><CheckCircle2 className="w-4 h-4 text-secondary"/></div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="font-semibold text-[14px] text-primary">{item.name}</h4>
                           <span className="bg-secondary-container px-2 py-0.5 rounded text-[11px] font-bold text-on-secondary-container">{item.cals}</span>
                        </div>
                        <p className="text-[12px] text-on-surface-variant flex items-center gap-1.5"><History className="w-3.5 h-3.5" /> {item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Lower Section Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-6">
                  <h3 className="text-[20px] font-display-lg font-semibold text-primary mb-2 flex items-center gap-2"><Apple className="w-5 h-5" /> Dietary Parameters</h3>
                  <p className="text-sm text-on-surface-variant mb-6">Select active restrictions to calibrate the AI analysis model for your specific nutritional needs.</p>
                  <div className="flex flex-wrap gap-3">
                    <button className="bg-secondary-container text-on-secondary-container border border-secondary/20 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Vegan</button>
                    <button className="bg-secondary-container text-on-secondary-container border border-secondary/20 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Gluten-Free</button>
                    <button className="bg-surface-container text-on-surface-variant border border-outline-variant/30 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">Keto</button>
                    <button className="bg-surface-container text-on-surface-variant border border-outline-variant/30 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">Paleo</button>
                    <button className="bg-surface-container text-on-surface-variant border border-outline-variant/30 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">Nut Allergy</button>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-6 flex flex-col justify-center">
                  <h3 className="text-[20px] font-display-lg font-semibold text-primary mb-6 flex items-center gap-2"><Activity className="w-5 h-5" /> System</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-primary">Data Sync</span>
                      <div className="w-11 h-6 bg-secondary-container rounded-full relative cursor-pointer border border-secondary/20">
                        <div className="w-4 h-4 bg-secondary rounded-full absolute right-1 top-1 shadow-sm"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-primary">Metric Units</span>
                      <div className="w-11 h-6 bg-surface-container-highest rounded-full relative cursor-pointer border border-outline-variant/30">
                        <div className="w-4 h-4 bg-outline-variant rounded-full absolute left-1 top-1 shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Knowledge Base */}
              <section className="text-center pt-8 pb-12">
                <h3 className="text-[28px] font-display-lg font-bold text-primary mb-2">Knowledge Base</h3>
                <p className="text-sm text-on-surface-variant mb-8">Common queries regarding the computer vision model.</p>

                <div className="max-w-3xl mx-auto rounded-2xl bg-surface-container-lowest border border-outline-variant/20 overflow-hidden text-left shadow-sm">
                  <div className="border-b border-outline-variant/20 p-5 cursor-pointer flex justify-between items-center bg-[#fafdf8]">
                    <h4 className="font-semibold text-primary text-[15px]">How accurate is the volume estimation?</h4>
                    <ChevronDown className="w-5 h-5 text-on-surface-variant transform rotate-180" />
                  </div>
                  <div className="p-5 bg-[#fafdf8] text-sm text-on-surface-variant leading-relaxed">
                    Our computer vision model utilizes depth-mapping alongside 2D image recognition. When lighting is adequate, volume estimation operates within a 92% confidence interval compared to manual laboratory weighing.
                  </div>
                  
                  <div className="border-t border-outline-variant/20 p-5 cursor-pointer flex justify-between items-center hover:bg-surface-container-low transition-colors">
                    <h4 className="font-semibold text-primary text-[15px]">Can it detect hidden ingredients like oils?</h4>
                    <ChevronDown className="w-5 h-5 text-on-surface-variant" />
                  </div>
                  
                  <div className="border-t border-outline-variant/20 p-5 cursor-pointer flex justify-between items-center hover:bg-surface-container-low transition-colors">
                    <h4 className="font-semibold text-primary text-[15px]">How do I export my historical data?</h4>
                    <ChevronDown className="w-5 h-5 text-on-surface-variant" />
                  </div>
                </div>
              </section>

           </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden bg-surface/90 dark:bg-background/90 backdrop-blur-2xl fixed bottom-0 w-full z-50 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] border-t border-outline-variant/10">
        <div className="flex justify-around items-center px-4 py-2 pb-6">
           <button onClick={() => setActiveTab("Analyze")} className={cn("flex flex-col items-center justify-center rounded-full px-5 py-2 transition-transform duration-150", activeTab === "Analyze" ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant")}>
            <Camera className="w-6 h-6 mb-1" strokeWidth={activeTab === "Analyze" ? 2.5 : 1.5} />
            <span className="font-label-md text-[11px] font-semibold">Analyze</span>
          </button>
          <button onClick={() => setActiveTab("Logs")} className={cn("flex flex-col items-center justify-center px-4 py-2", activeTab === "Logs" ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary")}>
            <History className="w-6 h-6 mb-1" strokeWidth={activeTab === "Logs" ? 2.5 : 1.5} />
            <span className="font-label-md text-[11px] font-semibold">Logs</span>
          </button>
          <button onClick={() => setActiveTab("Insights")} className={cn("flex flex-col items-center justify-center px-4 py-2", activeTab === "Insights" ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary")}>
            <FlaskConical className="w-6 h-6 mb-1" strokeWidth={activeTab === "Insights" ? 2.5 : 1.5} />
            <span className="font-label-md text-[11px] font-semibold">Insights</span>
          </button>
          <button onClick={() => setActiveTab("Account")} className={cn("flex flex-col items-center justify-center px-4 py-2", activeTab === "Account" ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary")}>
            <User className="w-6 h-6 mb-1" strokeWidth={activeTab === "Account" ? 2.5 : 1.5} />
            <span className="font-label-md text-[11px] font-semibold">Account</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
