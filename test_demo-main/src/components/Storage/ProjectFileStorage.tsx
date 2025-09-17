import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Project } from '../../types';
import { 
  Upload, 
  Download, 
  Search, 
  FileText, 
  Image, 
  Video, 
  Archive, 
  Trash2,
  Eye,
  Calendar,
  User,
  FolderOpen
} from 'lucide-react';

interface ProjectFileStorageProps {
  project: Project;
}

export function ProjectFileStorage({ project }: ProjectFileStorageProps) {
  const { user } = useAuth();
  const { files, uploadFileFromInput, stages } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Get files for this project
  const projectFiles = files.filter(file => file.project_id === project.id);
  
  // Filter files based on search
  const filteredFiles = projectFiles.filter(file =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = (fileList: FileList | null) => {
    if (!fileList) return;
    
    // Get the first stage of the project for file association
    const projectStages = stages.filter(s => s.project_id === project.id);
    const stageId = projectStages.length > 0 ? projectStages[0].id : '';
    
    if (stageId) {
      Array.from(fileList).forEach(file => {
        uploadFileFromInput(stageId, file, user?.name || 'Unknown');
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <Image className="w-5 h-5 text-blue-500" />;
      case 'mp4':
      case 'mov':
      case 'avi':
        return <Video className="w-5 h-5 text-purple-500" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive className="w-5 h-5 text-orange-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadFile = (file: any) => {
    const link = document.createElement('a');
    link.href = file.file_url;
    link.download = file.filename;
    link.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FolderOpen className="w-5 h-5 mr-2 text-red-600" />
            Project File Storage
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Upload and manage files for this project. Files are accessible to all team members.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {projectFiles.length} file(s)
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors mb-6 ${
          dragActive 
            ? 'border-red-400 bg-red-50' 
            : 'border-gray-300 bg-gray-50 hover:border-red-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
        <p className="text-xs text-gray-500 mb-4">Supports all file types up to 10MB</p>
        <label className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer inline-flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Choose Files</span>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </label>
      </div>

      {/* Files List */}
      <div className="space-y-3">
        {filteredFiles.map(file => (
          <div key={file.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                {getFileIcon(file.filename)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{file.filename}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>{formatFileSize(file.size)}</span>
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{file.uploader_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(file.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => downloadFile(file)}
                  className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-100 rounded"
                  title="Download file"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredFiles.length === 0 && projectFiles.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No files match your search</p>
          </div>
        )}
        
        {projectFiles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No files uploaded yet</p>
            <p className="text-sm">Upload files to get started</p>
          </div>
        )}
      </div>

      {/* File Storage Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">File Storage Guidelines:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Upload project requirements, references, and assets</li>
          <li>• All team members can access uploaded files</li>
          <li>• Maximum file size: 10MB per file</li>
          <li>• Supported formats: Documents, images, videos, archives</li>
        </ul>
      </div>
    </div>
  );
}