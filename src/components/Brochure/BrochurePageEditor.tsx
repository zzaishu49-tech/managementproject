import React, { useState, useEffect } from 'react';
import { BrochurePage } from '../../types';
import { 
  Upload, 
  Trash2, 
  Image as ImageIcon,
  FileText,
  HelpCircle,
  Bold,
  Italic,
  Underline,
  Highlighter,
  List
} from 'lucide-react';

interface BrochurePageEditorProps {
  projectId: string;
  pageNumber: number;
  pageData: BrochurePage['content'];
  onDataChange: (data: BrochurePage['content']) => void;
  isEditable?: boolean;
}

export function BrochurePageEditor({ 
  projectId, 
  pageNumber, 
  pageData, 
  onDataChange,
  isEditable = true
}: BrochurePageEditorProps) {
  const [localData, setLocalData] = useState<BrochurePage['content']>(pageData);
  const [textContent, setTextContent] = useState(pageData.text_content || '');

  useEffect(() => {
    setLocalData(pageData);
    setTextContent(pageData.text_content || '');
  }, [pageData]);

  const handleInputChange = (field: string, value: any) => {
    if (!isEditable) return;
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onDataChange(newData);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isEditable) return;
    const value = e.target.value;
    setTextContent(value);
    handleInputChange('text_content', value);
  };

  const applyTextFormatting = (format: string) => {
    if (!isEditable) return;
    
    const textarea = document.querySelector('.text-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textContent.substring(start, end);
    
    if (!selectedText) return;
    
    let formattedText = '';
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'highlight':
        formattedText = `==${selectedText}==`;
        break;
      default:
        return;
    }
    
    const newText = textContent.substring(0, start) + formattedText + textContent.substring(end);
    setTextContent(newText);
    handleInputChange('text_content', newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  const applyBulletPoint = () => {
    if (!isEditable) return;
    
    const textarea = document.querySelector('.text-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textContent.substring(start, end);
    
    if (selectedText) {
      const lines = selectedText.split('\n');
      const bulletedLines = lines.map(line => line.trim() ? `• ${line.replace(/^• /, '')}` : line);
      const formattedText = bulletedLines.join('\n');
      
      const newText = textContent.substring(0, start) + formattedText + textContent.substring(end);
      setTextContent(newText);
      handleInputChange('text_content', newText);
    } else {
      // Insert bullet point at cursor
      const newText = textContent.substring(0, start) + '• ' + textContent.substring(end);
      setTextContent(newText);
      handleInputChange('text_content', newText);
      
      // Move cursor after the bullet
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    }
  };

  const renderFormattedText = (text: string) => {
    if (!text) return <div className="text-gray-400 italic">Type your content here...</div>;
    
    // Split text into lines and process each line
    const lines = text.split('\n');
    const processedLines = lines.map((line, index) => {
      // Handle bullet points
      if (line.trim().startsWith('• ')) {
        return <li key={index}>{line.replace('• ', '')}</li>;
      }
      
      // Process inline formatting
      let processedLine = line;
      
      // Handle bold text
      processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Handle italic text
      processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Handle underline
      processedLine = processedLine.replace(/__(.*?)__/g, '<u>$1</u>');
      // Handle highlight
      processedLine = processedLine.replace(/==(.*?)==/g, '<mark style="background-color: #fef08a;">$1</mark>');
      
      return (
        <div 
          key={index} 
          dangerouslySetInnerHTML={{ __html: processedLine || '<br>' }}
        />
      );
    });
    
    // Group consecutive list items
    const groupedElements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];
    
    processedLines.forEach((element, index) => {
      if (React.isValidElement(element) && element.type === 'li') {
        currentList.push(element);
      } else {
        if (currentList.length > 0) {
          groupedElements.push(<ul key={`list-${index}`} className="list-disc ml-6 space-y-1">{currentList}</ul>);
          currentList = [];
        }
        groupedElements.push(element);
      }
    });
    
    if (currentList.length > 0) {
      groupedElements.push(<ul key="final-list" className="list-disc ml-6 space-y-1">{currentList}</ul>);
    }
    
    return <div className="space-y-2">{groupedElements}</div>;
  };

  const handleFileUpload = (file: File) => {
    if (!isEditable) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    const url = URL.createObjectURL(file);
    const images = (localData.images || []);
    handleInputChange('images', [...images, url]);
  };

  const removeImage = (index: number) => {
    if (!isEditable) return;
    const images = localData.images || [];
    const newImages = images.filter((_, i) => i !== index);
    handleInputChange('images', newImages);
  };

  const renderTooltip = (text: string) => (
    <div className="group relative inline-block ml-2">
      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {text}
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${!isEditable ? 'opacity-60 pointer-events-none' : ''}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-red-600" />
        Page {pageNumber}
        {!isEditable && <span className="ml-2 text-sm text-yellow-600">(🔒 Locked)</span>}
      </h3>

      {/* Text Editor Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Text Content
          {renderTooltip('Type your content and select text to apply formatting')}
        </label>
        
        {/* Text Formatting Toolbar */}
        {isEditable && (
          <div className="mb-3 flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-xs font-medium text-gray-600">Format:</span>
            <button
              type="button"
              onClick={() => applyTextFormatting('bold')}
              className="p-2 hover:bg-gray-200 rounded transition-colors border border-gray-300"
              title="Bold"
            >
              <Bold className="w-4 h-4 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={() => applyTextFormatting('italic')}
              className="p-2 hover:bg-gray-200 rounded transition-colors border border-gray-300"
              title="Italic"
            >
              <Italic className="w-4 h-4 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={() => applyTextFormatting('underline')}
              className="p-2 hover:bg-gray-200 rounded transition-colors border border-gray-300"
              title="Underline"
            >
              <Underline className="w-4 h-4 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={() => applyTextFormatting('highlight')}
              className="p-2 hover:bg-gray-200 rounded transition-colors border border-gray-300"
              title="Highlight"
            >
              <Highlighter className="w-4 h-4 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={applyBulletPoint}
              className="p-2 hover:bg-gray-200 rounded transition-colors border border-gray-300"
              title="Bullet Points"
            >
              <List className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Text Input */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Editor</label>
            <textarea
              className="text-editor-textarea w-full h-80 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none text-gray-700 leading-relaxed font-mono text-sm resize-none"
              value={textContent}
              onChange={handleTextChange}
              disabled={!isEditable}
              placeholder={isEditable ? "Type your content here. Select text and use formatting buttons above to apply styles." : "No content added yet"}
              style={{
                direction: 'ltr',
                textAlign: 'left',
                unicodeBidi: 'normal',
                writingMode: 'horizontal-tb',
                transform: 'none'
              }}
              dir="ltr"
            />
          </div>
          
          {/* Live Preview */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Preview</label>
            <div className="w-full h-80 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 overflow-y-auto text-gray-700 leading-relaxed">
              {renderFormattedText(textContent)}
            </div>
          </div>
        </div>
        
        {isEditable && (
          <div className="mt-2 text-xs text-gray-500">
            <p>Select text in the editor and use formatting buttons to apply bold, italic, underline, highlight, or bullet points. See the live preview on the right.</p>
          </div>
        )}
      </div>

      {/* Images Section */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <ImageIcon className="w-4 h-4 mr-2" />
          Images (Optional)
          {renderTooltip('Upload images to support your content (max 5MB each)')}
        </label>
        
        {/* Existing Images */}
        {(localData.images || []).length > 0 && (
          <div className="space-y-3 mb-4">
            {(localData.images || []).map((image, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                <img src={image} alt={`Image ${index + 1}`} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Image {index + 1}</p>
                  <p className="text-xs text-gray-500">Click to view full size</p>
                </div>
                {isEditable && (
                  <button
                    onClick={() => removeImage(index)}
                    className="text-red-600 hover:text-red-800 transition-colors p-1"
                    title="Remove image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload Area */}
        {isEditable && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
            <label className="cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-1">Click to upload image</p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </label>
          </div>
        )}

        {!isEditable && (localData.images || []).length === 0 && (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
            <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No images uploaded</p>
          </div>
        )}
      </div>
    </div>
  );
}