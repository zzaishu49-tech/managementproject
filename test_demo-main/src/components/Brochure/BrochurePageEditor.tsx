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
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);

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
    if (!textareaRef || !isEditable) return;
    
    const textarea = textareaRef;
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
          // Add bullet to selected lines
          const selectedLines = selectedText.split('\n');
          const bulletedLines = selectedLines.map(line => line.trim() ? `• ${line.replace(/^• /, '')}` : line);
          newText = `${beforeText}${bulletedLines.join('\n')}${afterText}`;
        } else {
          // Add bullet to current line
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
    
    // Update textarea value
    textarea.value = newText;
    handleInputChange('text_content', newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleFileUpload = (file: File) => {
    if (!isEditable) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    // In a real app, this would upload to a server
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
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Text Content
            {renderTooltip('Add your text content for this page')}
          </label>
          
          {/* Text Formatting Toolbar */}
          {isEditable && (
            <div className="mb-3 flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-xs font-medium text-gray-600">Format:</span>
              <button
                type="button"
                onClick={() => applyTextFormatting('bold')}
                className="p-2 hover:bg-gray-200 rounded transition-colors border border-gray-300"
                title="Bold (select text first)"
              >
                <Bold className="w-4 h-4 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={() => applyTextFormatting('italic')}
                className="p-2 hover:bg-gray-200 rounded transition-colors border border-gray-300"
                title="Italic (select text first)"
              >
                <Italic className="w-4 h-4 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={() => applyTextFormatting('underline')}
                className="p-2 hover:bg-gray-200 rounded transition-colors border border-gray-300"
                title="Underline (select text first)"
              >
                <Underline className="w-4 h-4 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={() => applyTextFormatting('highlight')}
                className="p-2 hover:bg-gray-200 rounded transition-colors border border-gray-300"
                title="Highlight (select text first)"
              >
                <Highlighter className="w-4 h-4 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={() => applyTextFormatting('bullet')}
                className="p-2 hover:bg-gray-200 rounded transition-colors border border-gray-300"
                title="Bullet Points (select text first)"
              >
                <List className="w-4 h-4 text-gray-700" />
              </button>
              <div className="text-xs text-gray-500 ml-4">
                Select text and click formatting buttons
              </div>
            </div>
          )}
          
          {/* Rich Text Editor */}
          <textarea
            ref={(el) => setTextareaRef(el)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-32 resize-none"
            value={localData.text_content || ''}
            onChange={(e) => handleInputChange('text_content', e.target.value)}
            placeholder="Enter your text content here..."
            disabled={!isEditable}
            dir="ltr"
            style={{
              direction: 'ltr',
              textAlign: 'left',
              unicodeBidi: 'normal'
            }}
          />
          
          <p className="text-xs text-gray-500 mt-1">
            Write paragraphs, descriptions, and any text content for this page. Select text and use formatting buttons above to style your content.
          </p>
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

        {/* Help Text */}
        {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Page Guidelines:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Add your main content in the text area above</li>
            <li>• Use the formatting toolbar to style your text (bold, italic, underline, highlight)</li>
            <li>• Images are optional but can help illustrate your content</li>
            <li>• Keep your content clear and concise</li>
            <li>• You can preview your page using the preview mode</li>
          </ul>
        </div> */}
      </div>
    </div>
  );
}