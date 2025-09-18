import React from 'react';
import { BrochureProject, BrochurePage } from '../../types';
import { 
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface BrochurePreviewProps {
  project: BrochureProject;
  pages: BrochurePage[];
  currentPage: number;
  totalPages?: number;
}

export function BrochurePreview({ project, pages, currentPage, totalPages = 1 }: BrochurePreviewProps) {
  const page = pages.find(p => p.page_number === currentPage);
  const content = page?.content || {};

  // Function to render formatted text
  const renderFormattedText = (text: string) => {
    if (!text) return null;
    
    // Split text into lines and process each line
    const lines = text.split('\n');
    const processedLines = lines.map(line => {
      // Handle bullet points
      if (line.trim().startsWith('• ')) {
        return `<li>${line.replace('• ', '')}</li>`;
      }
      // Handle bold text
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Handle italic text
      line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Handle underline
      line = line.replace(/__(.*?)__/g, '<u>$1</u>');
      // Handle highlight
      line = line.replace(/==(.*?)==/g, '<mark style="background-color: #fef08a;">$1</mark>');
      
      return line;
    });
    
    // Group consecutive list items
    let formattedText = '';
    let inList = false;
    
    processedLines.forEach(line => {
      if (line.startsWith('<li>')) {
        if (!inList) {
          formattedText += '<ul>';
          inList = true;
        }
        formattedText += line;
      } else {
        if (inList) {
          formattedText += '</ul>';
          inList = false;
        }
        formattedText += line + '<br>';
      }
    });
    
    if (inList) {
      formattedText += '</ul>';
    }
    
    return (
      <div 
        className="text-gray-700 leading-relaxed"
        style={{ direction: 'ltr', textAlign: 'left' }}
        dangerouslySetInnerHTML={{ __html: formattedText }}
      />
    );
  };
  const renderPage = () => (
    <div className="bg-white rounded-lg p-8 border border-gray-200 min-h-96">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="text-center border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Page {currentPage}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {project.client_name}'s Brochure
          </p>
        </div>

        {/* Text Content */}
        {content.text_content ? (
          <div className="prose max-w-none">
            {renderFormattedText(content.text_content)}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No text content added yet</p>
          </div>
        )}

        {/* Images */}
        {content.images && content.images.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.images.map((image, index) => (
                <div key={index} className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
                  <img 
                    src={image} 
                    alt={`Content image ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : content.text_content ? (
          <div className="text-center py-4 text-gray-400">
            <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm">No images added</p>
          </div>
        ) : null}
      </div>
    </div>
  );

  const renderEmptyPage = () => (
    <div className="bg-gray-50 rounded-lg p-12 border-2 border-dashed border-gray-300 min-h-96">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Page {currentPage} - Empty</h3>
        <p className="text-gray-600">
          Switch to edit mode to add content to this page
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-96">
      {content.text_content || (content.images && content.images.length > 0) ? renderPage() : renderEmptyPage()}
    </div>
  );
}