import React from 'react';
import { CheckCircle, AlertTriangle, BarChart3, Ruler, Award, TrendingUp } from 'lucide-react';

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

interface ResultCardProps {
  result: ClassificationResult | null;
  error: string | null;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, error }) => {
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-red-700 mb-2">
          Classification Failed
        </h3>
        <p className="text-red-600 max-w-md mx-auto">
          {error}
        </p>
        <div className="mt-4 p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-red-600">
            Please ensure your backend service is running on the configured endpoint and try again.
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">
          Classification Complete
        </h3>
        <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2">
          <span className="text-slate-600 text-sm">Predicted Class:</span>
          <span className="font-semibold text-slate-800">{result.predicted_class}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(result.confidence)}`}>
            {result.confidence.toFixed(1)}% confidence
          </span>
        </div>
      </div>

      {/* ATC Score */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center border border-blue-200">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Award className="h-6 w-6 text-blue-600" />
          <h4 className="text-lg font-semibold text-blue-800">Final ATC Score</h4>
        </div>
        <div className="flex items-center justify-center gap-4">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold text-white ${getScoreBadgeColor(result.atc_score)}`}>
            {result.atc_score.toFixed(0)}
          </div>
          <div className="text-left">
            <div className="text-3xl font-bold text-slate-800">
              {result.atc_score.toFixed(1)}
            </div>
            <div className="text-sm text-slate-600">out of 100</div>
          </div>
        </div>
      </div>

      {/* Measurements */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Ruler className="h-5 w-5 text-slate-600" />
          <h4 className="text-lg font-semibold text-slate-800">Physical Measurements</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(result.measurements).map(([key, value]) => (
            <div key={key} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 capitalize">
                  {key.replace('_', ' ')}
                </span>
                <span className="font-semibold text-slate-800">
                  {value.toFixed(1)} {key.includes('angle') ? '°' : 'cm'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trait Scores */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-slate-600" />
          <h4 className="text-lg font-semibold text-slate-800">Trait Scores</h4>
        </div>
        <div className="space-y-4">
          {Object.entries(result.trait_scores).map(([key, value]) => (
            <div key={key} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-700 font-medium capitalize">
                  {key.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(value)}`}>
                  {value.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Warnings */}
      {result.quality_warnings && result.quality_warnings.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h4 className="text-lg font-semibold text-slate-800">Quality Warnings</h4>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <ul className="space-y-2">
              {result.quality_warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2 text-amber-800">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Performance Indicator */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
        <div className="flex items-center justify-center gap-2 text-slate-600">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm">
            Analysis completed with {result.confidence.toFixed(1)}% confidence
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;