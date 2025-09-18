import React, { useState } from 'react';
import { Project, User } from '../../types';
import { X, Calendar, Users, Plus, Building, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  employees: User[];
  clients: User[];
}

export function ProjectModal({ isOpen, onClose, project, employees, clients }: ProjectModalProps) {
  const { user } = useAuth();
  const { createProject, updateProject } = useData();
  
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    client_id: project?.client_id || '',
    client_name: project?.client_name || '',
    deadline: project?.deadline || '',
    assigned_employees: project?.assigned_employees || [],
    priority: project?.priority || 'medium',
    project_type: project?.project_type || 'website'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find selected client name
    const selectedClient = clients.find(c => c.id === formData.client_id);
    const clientName = selectedClient ? selectedClient.name : formData.client_name;
    
    if (project) {
      updateProject(project.id, {
        ...formData,
        client_name: clientName,
        progress_percentage: project.progress_percentage,
        status: project.status
      });
    } else {
      createProject({
        ...formData,
        client_name: clientName,
        progress_percentage: 0,
        status: 'active'
      });
    }
    
    onClose();
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_employees: prev.assigned_employees.includes(employeeId)
        ? prev.assigned_employees.filter(id => id !== employeeId)
        : [...prev.assigned_employees, employeeId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {project ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Project Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
              Client
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                id="client"
                value={formData.client_id}
                onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name} ({client.email})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="project_type" className="block text-sm font-medium text-gray-700 mb-2">
              Project Type
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                id="project_type"
                value={formData.project_type}
                onChange={(e) => setFormData(prev => ({ ...prev, project_type: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="website">Website Development</option>
                <option value="mobile_app">Mobile Application</option>
                <option value="web_app">Web Application</option>
                <option value="ecommerce">E-commerce Platform</option>
                <option value="brochure">Brochure Design</option>
                <option value="logo_design">Logo Design</option>
                <option value="marketing">Marketing Campaign</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
              Deadline
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                id="deadline"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {user?.role === 'manager' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Assign Employees
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {employees.filter(emp => emp.role === 'employee').map(employee => (
                  <label key={employee.id} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.assigned_employees.includes(employee.id)}
                      onChange={() => handleEmployeeToggle(employee.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{employee.name} ({employee.email})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Project Priority
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {project ? 'Update' : 'Create'} Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}