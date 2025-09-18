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
  List,
  Eye,
  Edit
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
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setLocalData(pageData);
  }, [pageData]);

  const handleInputChange = (field: string, value: any) => {
    if (!isEditable) return;
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onDataChange(newData);
  };

  const applyTextFormatting = (format: string) => {
    if (!isEditable) return;
    
    const textarea = document.getElementById(`textarea-${pageNumber}`) as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);
    
    let newText = '';
    let newCursorPos = start;
    
    switch (format) {
      case 'bold':
        if (selectedText) {
          newText = `${beforeText}**${selectedText}**${afterText}`;
          newCursorPos = start + 2 + selectedText.length + 2;
        } else {
          newText = `${beforeText}****${afterText}`;
          newCursorPos = start + 2;
        }
        break;
      case 'italic':
        if (selectedText) {
          newText = `${beforeText}*${selectedText}*${afterText}`;
          newCursorPos = start + 1 + selectedText.length + 1;
        } else {
          newText = `${beforeText}**${afterText}`;
          newCursorPos = start + 1;
        }
        break;
      case 'underline':
        if (selectedText) {
          newText = `${beforeText}__${selectedText}__${afterText}`;
          newCursorPos = start + 2 + selectedText.length + 2;
        } else {
          newText = `${beforeText}____${afterText}`;
          newCursorPos = start + 2;
        }
        break;
      case 'highlight':
        if (selectedText) {
          newText = `${beforeText}==${selectedText}==${afterText}`;
          newCursorPos = start + 2 + selectedText.length + 2;
        } else {
          newText = `${beforeText}====${afterText}`;
          newCursorPos = start + 2;
        }
        break;
      case 'bullet':
        const lines = textarea.value.split('\n');
        const currentLineIndex = textarea.value.substring(0, start).split('\n').length - 1;
        
        if (selectedText) {
          const selectedLines = selectedText.split('\n');
          const bulletedLines = selectedLines.map(line => line.trim() ? `• ${line.replace(/^• /, '')}` : line);
          newText = `${beforeText}${bulletedLines.join('\n')}${afterText}`;
        } else {
          const currentLine = lines[currentLineIndex];
          if (currentLine && !currentLine.trim().startsWith('• ')) {
            lines[currentLineIndex] = `• ${currentLine}`;
            newText = lines.join('\n');
            newCursorPos = start + 2;
          } else {
            newText = `${beforeText}• ${afterText}`;
            newCursorPos = start + 2;
          }
        }
        break;
      default:
        return;
    }
    
    textarea.value = newText;
    handleInputChange('text_content', newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const renderFormattedText = (text: string) => {
    if (!text) return <p className="text-gray-500 italic">No content added yet</p>;
    
    const lines = text.split('\n');
    const processedLines = lines.map(line => {
      if (line.trim().startsWith('• ')) {
        return `<li>${line.replace('• ', '')}</li>`;
      }
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
      line = line.replace(/__(.*?)__/g, '<u>$1</u>');
      line = line.replace(/==(.*?)==/g, '<mark style="background-color: #fef08a;">$1</mark>');
      return line;
    });
    
    let formattedText = '';
    let inList = false;
    
    processedLines.forEach(line => {
      if (line.startsWith('<li>')) {
        if (!inList) {
          formattedText += '<ul style="list-style-type: disc; margin-left: 1.5em; padding-left: 0.5em;">';
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
        dangerouslySetInnerHTML={{ __html: formattedText }}
      />
    );
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

      <div className="space-y-6">
        {/* Text Content Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Text Content
              {renderTooltip('Add your text content for this page')}
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {showPreview ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showPreview ? 'Edit' : 'Preview'}</span>
            </button>
          </div>
          
          {!showPreview ? (
            <>
              {/* Text Formatting Toolbar */}
              {isEditable && (
                <div className="mb-3 flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-xs font-medium text-gray-600">Format:</span>
                  <button
                    type="button"
                    onClick={() => applyTextFormatting('bold')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors border border-gray-300"
                    title="Bold (**text**)"
                  >
                    <Bold className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTextFormatting('italic')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors border border-gray-300"
                    title="Italic (*text*)"
                  >
                    <Italic className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTextFormatting('underline')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors border border-gray-300"
                    title="Underline (__text__)"
                  >
                    <Underline className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTextFormatting('highlight')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors border border-gray-300"
                    title="Highlight (==text==)"
                  >
                    <Highlighter className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTextFormatting('bullet')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors border border-gray-300"
                    title="Bullet Points (• text)"
                  >
                    <List className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              )}
              
              {/* Simple Textarea */}
              <textarea
                id={`textarea-${pageNumber}`}
                value={localData.text_content || ''}
                onChange={(e) => handleInputChange('text_content', e.target.value)}
                placeholder="Enter your text content here. Use the formatting buttons above to style selected text."
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                style={{ direction: 'ltr', textAlign: 'left' }}
                disabled={!isEditable}
              />
              
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <p>Formatting guide: **bold**, *italic*, __underline__, ==highlight==, • bullet points</p>
                <p>Select text and use formatting buttons, or type the formatting directly</p>
              </div>
            </>
          ) : (
            <div className="min-h-32 p-4 border border-gray-300 rounded-lg bg-gray-50">
              {renderFormattedText(localData.text_content || '')}
            </div>
          )}
        </div>

        {/* Images Section */}
        <div>
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
    </div>
  );
}