import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Download, 
  ArrowLeft, 
  FileText, 
  Printer,
  Loader,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

interface ReportData {
  id: string;
  idea: {
    description: string;
    category: string;
    targetAudience: string;
    problemSolved: string;
  };
  fullReport: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'error';
}

const ReportPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!analysisId) return;
      
      try {
        const response = await axios.get(`/api/report/${analysisId}`);
        setReportData(response.data);
        setLoading(false);
      } catch (err: any) {
        setError('Failed to load report');
        setLoading(false);
      }
    };

    fetchReport();
  }, [analysisId]);

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.get(`/api/report/${analysisId}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `startup-analysis-${analysisId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download PDF:', err);
    }
  };

  const handleDownloadMarkdown = async () => {
    try {
      const response = await axios.get(`/api/report/${analysisId}/markdown`);
      const blob = new Blob([response.data], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `startup-analysis-${analysisId}.md`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download Markdown:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading Report
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we prepare your detailed analysis report...
          </p>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Report Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'We couldn\'t find the requested report.'}
          </p>
          <Link
            to="/submit"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Submit New Idea
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - Hidden in print */}
      <div className="print:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to={`/results/${analysisId}`}
                className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Results
              </Link>
              
              <div className="border-l border-gray-300 dark:border-gray-600 pl-4">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Full Analysis Report
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {reportData.idea.category} • {new Date(reportData.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </button>
              
              <button
                onClick={handleDownloadMarkdown}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <FileText className="h-4 w-4 mr-2" />
                Download MD
              </button>
              
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:py-0 print:max-w-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 shadow-lg print:shadow-none print:bg-white rounded-xl print:rounded-none"
        >
          {/* Report Header */}
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 print:border-gray-300">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white print:text-black mb-2">
                Startup Idea Analysis Report
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 print:text-gray-600 mb-4">
                Comprehensive AI-Powered Validation
              </p>
              <div className="flex justify-center items-center space-x-8 text-sm text-gray-500 dark:text-gray-400 print:text-gray-500">
                <div>
                  <span className="font-medium">Category:</span> {reportData.idea.category}
                </div>
                <div>
                  <span className="font-medium">Generated:</span> {new Date(reportData.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Report ID:</span> {reportData.id.slice(0, 8)}
                </div>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 print:border-gray-300">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white print:text-black mb-4">
              Executive Summary
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 print:bg-blue-50 border border-blue-200 dark:border-blue-800 print:border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 print:text-blue-900 mb-2">
                Your Startup Idea
              </h3>
              <p className="text-blue-800 dark:text-blue-200 print:text-blue-800 leading-relaxed">
                {reportData.idea.description}
              </p>
            </div>
          </div>

          {/* Full Report Content */}
          <div className="px-8 py-6">
            <div className="prose prose-lg dark:prose-invert print:prose-black max-w-none">
              {reportData.fullReport ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: reportData.fullReport }}
                  className="space-y-6"
                />
              ) : (
                <div className="text-center py-12">
                  <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Your comprehensive report is being generated...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Report Footer */}
          <div className="px-8 py-6 border-t border-gray-200 dark:border-gray-700 print:border-gray-300 bg-gray-50 dark:bg-gray-900/50 print:bg-gray-50 rounded-b-xl print:rounded-none">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 print:text-gray-500">
              <p className="mb-2">
                This report was generated by <strong>IdeaHub</strong> - AI-Powered Startup Validation Platform
              </p>
              <p>
                Powered by Gemini AI, Tavily Search, and Qloo Cultural Intelligence
              </p>
              <div className="mt-4 print:hidden">
                <p className="text-xs">
                  For questions or support, visit{' '}
                  <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                    startupbuddy.com/support
                  </a>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:py-0 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:text-black {
            color: black !important;
          }
          .print\\:text-gray-600 {
            color: #4b5563 !important;
          }
          .print\\:text-gray-500 {
            color: #6b7280 !important;
          }
          .print\\:border-gray-300 {
            border-color: #d1d5db !important;
          }
          .print\\:bg-blue-50 {
            background-color: #eff6ff !important;
          }
          .print\\:border-blue-200 {
            border-color: #bfdbfe !important;
          }
          .print\\:text-blue-900 {
            color: #1e3a8a !important;
          }
          .print\\:text-blue-800 {
            color: #1e40af !important;
          }
          .prose-black {
            color: black;
          }
          .prose-black h1,
          .prose-black h2,
          .prose-black h3,
          .prose-black h4,
          .prose-black h5,
          .prose-black h6 {
            color: black;
          }
          .prose-black strong {
            color: black;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportPage;
