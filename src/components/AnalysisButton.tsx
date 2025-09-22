import React, { useState } from 'react';
import { Brain, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface AnalysisButtonProps {
  onAnalyze: () => Promise<void>;
  loading: boolean;
  disabled?: boolean;
}

export const AnalysisButton: React.FC<AnalysisButtonProps> = ({
  onAnalyze,
  loading,
  disabled = false
}) => {
  return (
    <div className="mt-8 border-t pt-6">
      <div className="flex items-center justify-center">
        <Button
          onClick={onAnalyze}
          disabled={loading || disabled}
          className="bg-gradient-to-r from-caat-blue to-caat-green text-white px-8 py-3 text-lg font-medium rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-5 w-5" />
              Analyze with AI
            </>
          )}
        </Button>
      </div>
    </div>
  );
};