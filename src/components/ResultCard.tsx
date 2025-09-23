import { CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface ResultCardProps {
  result: ClassificationResult | string;
  isError?: boolean;
}

export const ResultCard = ({ result, isError = false }: ResultCardProps) => {
  if (isError) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <span>Classification Error</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {typeof result === 'string' ? result : 'Failed to classify the image. Please try again.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Type guard to ensure result is ClassificationResult
  if (typeof result === 'string') {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Result Card */}
      <Card className="border-primary/20 bg-gradient-subtle">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-primary" />
            <span>Classification Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Prediction and Confidence */}
          {(result.prediction || result.confidence) && (
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Prediction</p>
                <p className="text-xl font-semibold text-card-foreground">
                  {result.prediction || 'Classification Complete'}
                </p>
              </div>
              {result.confidence && (
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {(result.confidence * 100).toFixed(1)}% confidence
                </Badge>
              )}
            </div>
          )}

          {/* ATC Score */}
          {result.atc_score && (
            <div className="text-center p-6 bg-accent/10 rounded-lg border border-accent/20">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-muted-foreground">Final ATC Score</span>
              </div>
              <div className="text-4xl font-bold text-accent mb-2">
                {result.atc_score.toFixed(2)}
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-accent h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(result.atc_score * 10, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Measurements */}
          {result.measurements && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(result.measurements).map(([key, value]) => (
                <div key={key} className="p-4 bg-card rounded-lg border shadow-soft">
                  <p className="text-sm text-muted-foreground capitalize mb-1">
                    {key.replace('_', ' ')}
                  </p>
                  <p className="text-lg font-semibold text-card-foreground">
                    {typeof value === 'number' ? value.toFixed(2) : String(value)}
                    {key.includes('angle') ? '°' : 'cm'}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Trait Scores */}
          {result.trait_scores && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-card-foreground">Individual Trait Scores</h3>
              <div className="grid gap-3">
                {Object.entries(result.trait_scores).map(([trait, score]) => (
                  <div key={trait} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                    <span className="text-sm font-medium text-card-foreground capitalize">
                      {trait.replace('_', ' ')}
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min((typeof score === 'number' ? score : 0) * 20, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-primary min-w-[3rem]">
                        {typeof score === 'number' ? score.toFixed(2) : String(score)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quality Warnings */}
          {result.quality_warnings && result.quality_warnings.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-card-foreground flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span>Quality Warnings</span>
              </h3>
              <div className="space-y-2">
                {result.quality_warnings.map((warning, index) => (
                  <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">{warning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Data (for debugging) */}
          {typeof result === 'object' && Object.keys(result).length > 0 && (
            <details className="mt-6">
              <summary className="text-sm text-muted-foreground cursor-pointer hover:text-card-foreground">
                View Raw Response Data
              </summary>
              <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-60">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
};