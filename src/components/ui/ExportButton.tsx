import React, { useState } from 'react';
import { Download, FileText, FileCode } from 'lucide-react';
import { exportDashboard } from '../../utils/exportUtils';

interface ExportButtonProps {
  elementId: string;
  fileName?: string;
  title?: string;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  elementId,
  fileName = 'dashboard-export',
  title = 'Dashboard Export',
  className = ''
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'pdf' | 'html') => {
    setIsExporting(true);
    setShowMenu(false);
    
    try {
      await exportDashboard(elementId, {
        fileName,
        format,
        title,
        timestamp: true
      });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        className={`flex items-center gap-2 px-4 py-2 bg-white text-[#005C84] border border-[#005C84] rounded-lg hover:bg-[#005C84] hover:text-white transition-colors ${className}`}
      >
        <Download className="h-4 w-4" />
        <span className="font-medium">Export</span>
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-2">
              <button
                onClick={() => handleExport('pdf')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <FileText className="h-4 w-4 text-red-600" />
                <span>Export as PDF</span>
              </button>
              
              <button
                onClick={() => handleExport('html')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <FileCode className="h-4 w-4 text-blue-600" />
                <span>Export as HTML</span>
              </button>
            </div>
          </div>
        </>
      )}

      {isExporting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005C84]"></div>
              <span className="text-gray-700">Generating export...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};