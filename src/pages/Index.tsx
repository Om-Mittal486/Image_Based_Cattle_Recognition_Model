import { useState } from 'react';
import { UploadForm } from '@/components/UploadForm';
import { ResultCard } from '@/components/ResultCard';
import { useToast } from '@/hooks/use-toast';

// Configurable API endpoint
const API_URL = "http://localhost:8080/api/classify";

interface ClassificationResult {
  measurements?: {
    height?: number;
    body_length?: number;
    chest_width?: number;
    rump_angle?: number;
  };
  trait_scores?: {
    [key: string]: number;
  };
  atc_score?: number;
  quality_warnings?: string[];
  prediction?: string;
  confidence?: number;
  [key: string]: any;
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageSelect = (file: File | null) => {
    setSelectedImage(file);
    setResult(null);
    setError(null);
  };

  const handleClassify = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please select an image before classifying.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      
      toast({
        title: "Classification complete",
        description: "Your animal has been successfully analyzed.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Classification failed",
        description: "Failed to classify the image. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-card-foreground mb-2">
              Auto-ATC
            </h1>
            <p className="text-muted-foreground text-lg">
              AI-powered analysis for cattle and buffalo classification
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Upload Section */}
        <section className="text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-card-foreground">
              Upload Animal Image
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload a clear image of cattle or buffalo for accurate classification. 
              Our AI will analyze physical measurements and provide detailed trait scoring.
            </p>
          </div>
          
          <UploadForm
            onImageSelect={handleImageSelect}
            onClassify={handleClassify}
            selectedImage={selectedImage}
            isLoading={isLoading}
          />
        </section>

        {/* Results Section */}
        {(result || error) && (
          <section className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-card-foreground">
                Analysis Results
              </h2>
            </div>
            
            {error ? (
              <ResultCard result={error} isError={true} />
            ) : result ? (
              <ResultCard result={result} />
            ) : null}
          </section>
        )}

        {/* Instructions */}
        {!result && !error && (
          <section className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-6 bg-card rounded-lg border shadow-soft">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-xl">1</span>
                </div>
                <h3 className="font-semibold text-card-foreground mb-2">Upload Image</h3>
                <p className="text-sm text-muted-foreground">
                  Select a high-quality image of your cattle or buffalo
                </p>
              </div>
              
              <div className="p-6 bg-card rounded-lg border shadow-soft">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-xl">2</span>
                </div>
                <h3 className="font-semibold text-card-foreground mb-2">Analyze</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI processes the image and extracts key measurements
                </p>
              </div>
              
              <div className="p-6 bg-card rounded-lg border shadow-soft">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-xl">3</span>
                </div>
                <h3 className="font-semibold text-card-foreground mb-2">Get Results</h3>
                <p className="text-sm text-muted-foreground">
                  Review detailed trait scores and ATC classification
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            API Endpoint: <code className="bg-muted px-2 py-1 rounded text-xs">{API_URL}</code>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;