import React, { useState } from 'react';
import { UploadedFile, AnalysisResult, AppState } from './types';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import { analyzeDocument } from './services/geminiService';
import { LayoutDashboard, MessageSquare, ArrowLeft, FileText, AlertCircle, PieChart, Download, Loader2 } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat'>('dashboard');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleFileUpload = async (uploadedFile: UploadedFile) => {
    setFile(uploadedFile);
    setAppState(AppState.ANALYZING);
    try {
      const result = await analyzeDocument(uploadedFile);
      setAnalysisData(result);
      setAppState(AppState.DASHBOARD);
    } catch (e) {
      console.error(e);
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setFile(null);
    setAnalysisData(null);
    setActiveTab('dashboard');
  };

  const handleDownload = () => {
    if (!file) return;
    setIsDownloading(true);

    // Give React a moment to render the header and expand the container
    setTimeout(() => {
      const element = document.getElementById('report-container');
      const opt = {
        margin: [0.5, 0.5], // Top, Left, Bottom, Right
        filename: `FinSight_Report_${file.name.split('.')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      // @ts-ignore
      if (window.html2pdf) {
        // @ts-ignore
        window.html2pdf().set(opt).from(element).save().then(() => {
          setIsDownloading(false);
        }).catch((err: any) => {
          console.error("PDF generation failed", err);
          setIsDownloading(false);
        });
      } else {
        // Fallback to native print if library fails
        window.print();
        setIsDownloading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center cursor-pointer" onClick={handleReset}>
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                FinSight AI
              </span>
            </div>
            {appState === AppState.DASHBOARD && (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-wait"
                  title="Download PDF Report"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Report
                    </>
                  )}
                </button>
                <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>
                <button 
                  onClick={handleReset}
                  className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Upload New
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 main-container">
        
        {/* State: Upload & Analyzing */}
        {(appState === AppState.IDLE || appState === AppState.ANALYZING || appState === AppState.ERROR) && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center mb-8 max-w-2xl">
              <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Financial Intelligence, <span className="text-blue-600">Simplified</span>
              </h1>
              <p className="text-lg text-slate-600">
                Upload your financial reports (PDF, Excel, CSV) to instantly generate visual summaries, key metrics, and chat with your data.
              </p>
            </div>
            
            <FileUpload 
              onFileUpload={handleFileUpload} 
              isAnalyzing={appState === AppState.ANALYZING} 
            />

            {appState === AppState.ERROR && (
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 max-w-md animate-bounce-short">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Analysis Failed</p>
                  <p className="text-sm">Something went wrong while processing your document. Please try again with a clear PDF or Excel file.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* State: Dashboard & Chat */}
        {appState === AppState.DASHBOARD && analysisData && file && (
          <div className="flex flex-col h-full">
            
            {/* Tab Navigation (Mobile/Tablet) */}
            <div className="lg:hidden mb-6 flex space-x-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit mx-auto no-print">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'dashboard' 
                    ? 'bg-blue-100 text-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'chat' 
                    ? 'bg-blue-100 text-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat AI
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-full">
              {/* Dashboard Column - Target for PDF Generation */}
              <div 
                id="report-container"
                className={`flex-1 dashboard-wrapper ${activeTab === 'dashboard' ? 'block' : 'hidden lg:block'}`}
                style={isDownloading ? { overflow: 'visible', height: 'auto', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 50, background: 'white', padding: '20px' } : { overflowY: 'auto' }}
              >
                 {/* Report Header (Visible only during download/print) */}
                {(isDownloading) && (
                  <div className="mb-8 p-6 bg-white border-b-2 border-slate-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <PieChart className="w-8 h-8 text-white" />
                      </div>
                      <h1 className="text-3xl font-bold text-slate-900">FinSight AI Analysis</h1>
                    </div>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                         <p className="text-slate-500 uppercase tracking-wider text-xs font-semibold mb-1">Document</p>
                         <p className="font-medium text-slate-900 text-lg">{file.name}</p>
                      </div>
                      <div>
                         <p className="text-slate-500 uppercase tracking-wider text-xs font-semibold mb-1">Generated On</p>
                         <p className="font-medium text-slate-900 text-lg">{new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Dashboard data={analysisData} />
                
                {isDownloading && (
                  <div className="mt-8 pt-6 border-t border-slate-100 text-center text-slate-400 text-sm">
                    Generated by FinSight AI - Powered by Gemini
                  </div>
                )}
              </div>

              {/* Chat Column */}
              <div className={`w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 h-[600px] lg:h-[calc(100vh-140px)] sticky top-24 no-print chat-interface-container ${activeTab === 'chat' ? 'block' : 'hidden lg:block'}`}>
                <ChatInterface file={file} />
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}