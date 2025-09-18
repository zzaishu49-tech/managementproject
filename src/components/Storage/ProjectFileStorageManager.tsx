import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Upload, 
  Download, 
  Search, 
  Filter, 
  FileText, 
  Image, 
  Video, 
  Archive, 
  FolderOpen,
  Plus,
  Eye,
  Calendar,
  User,
  Tag,
  Trash2,
  Edit3
} from 'lucide-react';

export function ProjectFileStorageManager() {
  const { user } = useAuth();
  const { files, projects, stages, uploadFileFromInput } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [dragActive, setDragActive] = useState(false);
  const [uploadingToProject, setUploadingToProject] = useState<string>('');

  // Get accessible projects based on user role
  const getAccessibleProjects = () => {
    if (user?.role === 'manager') return projects;
    if (user?.role === 'employee') {
      return projects.filter(p => p.assigned_employees.includes(user.id));
    }
    return [];
  };

  const accessibleProjects = getAccessibleProjects();

  // Get files for accessible projects
  const getAccessibleFiles = () => {
    const projectIds = accessibleProjects.map(p => p.id);
    return files.filter(file => projectIds.includes(file.project_id));
  };

  const accessibleFiles = getAccessibleFiles();

  // Apply filters
  const filteredFiles = accessibleFiles.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = selectedProject === 'all' || file.project_id === selectedProject;
    const matchesType = filterType === 'all' || file.file_type === filterType;
    return matchesSearch && matchesProject && matchesType;
  });

  const handleFileUpload = (fileList: FileList | null, projectId: string) => {
    if (!fileList || !projectId) return;
    
    // Get the first stage of the project for file association
    const projectStages = stages.filter(s => s.project_id === projectId);
    const stageId = projectStages.length > 0 ? projectStages[0].id : '';
    
    if (stageId) {
      Array.from(fileList).forEach(file => {
        uploadFileFromInput(stageId, file, user?.name || 'Unknown');
      });
    }
    setUploadingToProject('');
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
    
    if (e.dataTransfer.files && uploadingToProject) {
      handleFileUpload(e.dataTransfer.files, uploadingToProject);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
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
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
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

  const getThemeColors = () => {
    switch (user?.role) {
      case 'manager': return {
        primary: 'bg-blue-600 hover:bg-blue-700',
        secondary: 'bg-blue-50 border-blue-200',
        text: 'text-blue-600'
      };
      case 'employee': return {
        primary: 'bg-green-600 hover:bg-green-700',
        secondary: 'bg-green-50 border-green-200',
        text: 'text-green-600'
      };
      default: return {
        primary: 'bg-gray-600 hover:bg-gray-700',
        secondary: 'bg-gray-50 border-gray-200',
        text: 'text-gray-600'
      };
    }
  };

  const theme = getThemeColors();
  const uniqueFileTypes = [...new Set(accessibleFiles.map(f => f.file_type))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">File Storage</h2>
          <p className="text-gray-600">Upload and manage project files</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Files</p>
              <p className="text-3xl font-bold text-gray-900">{accessibleFiles.length}</p>
            </div>
            <FolderOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projects</p>
              <p className="text-3xl font-bold text-green-600">{accessibleProjects.length}</p>
            </div>
            <FolderOpen className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Downloads</p>
              <p className="text-3xl font-bold text-purple-600">
                {accessibleFiles.reduce((sum, f) => sum + f.download_count, 0)}
              </p>
            </div>
            <Download className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
          <select
            value={uploadingToProject}
            onChange={(e) => setUploadingToProject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a project to upload files</option>
            {accessibleProjects.map(project => (
              <option key={project.id} value={project.id}>{project.title}</option>
            ))}
          </select>
        </div>

        {uploadingToProject && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 bg-gray-50 hover:border-blue-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
            <p className="text-xs text-gray-500 mb-4">Supports all file types up to 10MB</p>
            <label className={`${theme.primary} text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer inline-flex items-center space-x-2`}>
              <Upload className="w-4 h-4" />
              <span>Choose Files</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files, uploadingToProject)}
              />
            </label>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Projects</option>
            {accessibleProjects.map(project => (
              <option key={project.id} value={project.id}>{project.title}</option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All File Types</option>
            {uniqueFileTypes.map(type => (
              <option key={type} value={type}>{type.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Files List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFiles.map(file => {
                const project = projects.find(p => p.id === file.project_id);
                return (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getFileIcon(file.file_type)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{file.filename}</div>
                          {file.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">{file.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {project?.title || 'Unknown Project'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {file.uploader_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(file.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => downloadFile(file)}
                        className={`${theme.text} hover:opacity-75 transition-colors flex items-center space-x-1`}
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-600">
            {accessibleProjects.length === 0 
              ? "No projects assigned to you yet"
              : "Upload files or adjust your search criteria"
            }
          </p>
        </div>
      )}
    </div>
  );
}