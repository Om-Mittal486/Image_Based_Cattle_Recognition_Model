import React, { useState } from 'react';
import UploadForm from './components/UploadForm';
import ResultCard from './components/ResultCard';

const API_URL = "http://localhost:8080/api/classify";

interface ClassificationResult {
  measurements: {
    height: number;
    body_length: number;
    chest_width: number;
    rump_angle: number;
  };
  trait_scores: {
    muscularity: number;
    frame_size: number;
    body_condition: number;
    breed_characteristics: number;
  };
  atc_score: number;
  quality_warnings?: string[];
  confidence: number;
  predicted_class: string;
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
  };

  const handleClassify = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Classification error:', err);
      setError(err instanceof Error ? err.message : 'Failed to classify image. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen relative">
      {/* Pattern overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-slate-50/70 to-blue-50/80 pointer-events-none"></div>
      
      <div className="relative z-10">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-800 text-center">
            Auto-ATC: Cattle & Buffalo Classification
          </h1>
          <p className="text-slate-600 text-center mt-2">
            Advanced AI-powered livestock assessment and scoring system
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Upload Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <UploadForm
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onClassify={handleClassify}
              isLoading={isLoading}
              onReset={handleReset}
            />
          </div>

          {/* Results or Error */}
          {(result || error) && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <ResultCard result={result} error={error} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-slate-500 text-sm">
          Auto-ATC Classification System - Advanced Livestock Assessment Technology
        </div>
      </footer>
      </div>
    </div>
  );
}

export default App;