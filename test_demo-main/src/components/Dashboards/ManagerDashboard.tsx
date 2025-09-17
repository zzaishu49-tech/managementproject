import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { ProjectCard } from '../Projects/ProjectCard';
import { ProjectModal } from '../Projects/ProjectModal';
import { TaskCard } from '../Tasks/TaskCard';
import { StorageManager } from '../Storage/StorageManager';
import { CommentManager } from '../Comments/CommentManager';
import { BrochureReview } from '../Brochure/BrochureReview';
import { BrochureDesign } from '../Brochure/BrochureDesign';
import { DocumentDownloadCenter } from '../Documents/DocumentDownloadCenter';
import { ProjectFileStorage } from '../Storage/ProjectFileStorage';
import { StageDetail } from '../Stages/StageDetail';
import { Project, User, Lead } from '../../types';
import { ProjectFileStorageManager } from '../Storage/ProjectFileStorageManager';
import { 
  Plus, 
  Search, 
  Filter, 
  BarChart3, 
  FolderOpen, 
  Layers, 
  CheckSquare, 
  Upload, 
  MessageSquare,
  Users,
  TrendingUp,
  Calendar,
  Eye,
  Edit,
  Trash2,
  X,
  DollarSign,
  Phone,
  Mail,
  FileText,
  Building,
  Briefcase
} from 'lucide-react';

// Mock employees data
const mockEmployees: User[] = [
  { id: '2', name: 'Rakesh Gupta', email: 'employee@xeetrack.com', role: 'employee' },
  { id: '4', name: 'Meera Iyer', email: 'meera@xeetrack.com', role: 'employee' },
  { id: '6', name: 'Amit Patel', email: 'amit@xeetrack.com', role: 'employee' }
];

// Mock clients data
const mockClients: User[] = [
  { id: '3', name: 'Priya Sharma', email: 'client@xeetrack.com', role: 'client' },
  { id: '5', name: 'Rajesh Kumar', email: 'rajesh@xeetrack.com', role: 'client' },
  { id: '7', name: 'Anita Desai', email: 'anita@xeetrack.com', role: 'client' },
  { id: '8', name: 'Vikram Singh', email: 'vikram@xeetrack.com', role: 'client' }
];

interface ManagerDashboardProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function ManagerDashboard({ activeView, onViewChange }: ManagerDashboardProps) {
  const { projects, stages, commentTasks, leads, createLead, updateLead, deleteLead } = useData();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [projectDetailTab, setProjectDetailTab] = useState('brochure');
  
  // Lead management state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [leadForm, setLeadForm] = useState({
    name: '',
    contact_info: '',
    estimated_amount: 0,
    notes: ''
  });

  // Employee management state
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    role: 'employee' as 'employee' | 'client'
  });
  const [employees, setEmployees] = useState<User[]>(mockEmployees);
  const [clients, setClients] = useState<User[]>(mockClients);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    const matchesEmployee = filterEmployee === 'all' || project.assigned_employees.includes(filterEmployee);
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
    return matchesSearch && matchesFilter && matchesEmployee && matchesPriority;
  });

  const getProjectStats = () => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const avgProgress = projects.reduce((sum, p) => sum + p.progress_percentage, 0) / total || 0;
    
    return { total, active, completed, avgProgress: Math.round(avgProgress) };
  };

  const stats = getProjectStats();
  const allTasks = commentTasks.filter(task => task.status !== 'done');

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setShowProjectDetail(true);
    setProjectDetailTab('brochure');
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLead) {
      updateLead(editingLead.id, leadForm);
    } else {
      createLead(leadForm);
    }
    
    setIsLeadModalOpen(false);
    setEditingLead(null);
    setLeadForm({ name: '', contact_info: '', estimated_amount: 0, notes: '' });
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setLeadForm({
      name: lead.name,
      contact_info: lead.contact_info,
      estimated_amount: lead.estimated_amount,
      notes: lead.notes
    });
    setIsLeadModalOpen(true);
  };

  const handleDeleteLead = (leadId: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      deleteLead(leadId);
    }
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEmployee: User = {
      id: Date.now().toString(),
      name: employeeForm.name,
      email: employeeForm.email,
      role: employeeForm.role
    };
    
    if (employeeForm.role === 'employee') {
      setEmployees(prev => [...prev, newEmployee]);
    } else {
      setClients(prev => [...prev, newEmployee]);
    }
    
    setIsEmployeeModalOpen(false);
    setEmployeeForm({ name: '', email: '', role: 'employee' });
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600 text-lg">Comprehensive overview of all projects and activities</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700">Total Projects</p>
              <p className="text-3xl font-bold text-blue-800">{stats.total}</p>
            </div>
            <div className="bg-blue-600 p-3 rounded-full">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-700">Active Projects</p>
              <p className="text-3xl font-bold text-green-800">{stats.active}</p>
            </div>
            <div className="bg-green-600 p-3 rounded-full">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-700">Completed</p>
              <p className="text-3xl font-bold text-purple-800">{stats.completed}</p>
            </div>
            <div className="bg-purple-600 p-3 rounded-full">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm border border-orange-200 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-700">Avg Progress</p>
              <p className="text-3xl font-bold text-orange-800">{stats.avgProgress}%</p>
            </div>
            <div className="bg-orange-600 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.slice(0, 6).map(project => (
            <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
                 onClick={() => handleProjectClick(project)}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900 truncate">{project.title}</h4>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4 font-medium">{project.client_name}</p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress_percentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 font-medium">{project.progress_percentage}% Complete</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Project Management</h2>
          <p className="text-gray-600 text-lg">Manage all projects and team assignments</p>
        </div>
        <button
          onClick={() => setIsProjectModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-xl p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
            className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
          >
            <option value="all">All Employees</option>
            {mockEmployees.map(employee => (
              <option key={employee.id} value={employee.id}>{employee.name}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {/* Projects List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Assigned</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Deadline</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProjects.map(project => {
                const assignedEmployeeNames = mockEmployees
                  .filter(emp => project.assigned_employees.includes(emp.id))
                  .map(emp => emp.name);

                return (
                  <tr key={project.id} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-base font-bold text-gray-900">{project.title}</div>
                        <div className="text-sm text-gray-600 line-clamp-2 max-w-xs">{project.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{project.client_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        project.status === 'active' ? 'bg-green-100 text-green-800' :
                        project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {project.priority && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          project.priority === 'high' ? 'bg-red-100 text-red-800' :
                          project.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.priority}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {assignedEmployeeNames.slice(0, 2).map(name => (
                          <span key={name} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {name}
                          </span>
                        ))}
                        {assignedEmployeeNames.length > 2 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{assignedEmployeeNames.length - 2} more
                          </span>
                        )}
                        {assignedEmployeeNames.length === 0 && (
                          <span className="text-sm text-gray-500">Unassigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-3" style={{ width: '100px' }}>
                          <div
                            className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress_percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 min-w-[40px]">{project.progress_percentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleProjectClick(project)}
                        className="text-blue-600 hover:text-blue-900 hover:bg-blue-100 px-3 py-1 rounded-lg transition-all duration-200 flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        employees={employees}
        clients={clients}
      />
    </div>
  );

  const renderEmployees = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Employee Management</h2>
          <p className="text-gray-600 text-lg">Manage employees and track their assignments</p>
        </div>
        <button
          onClick={() => setIsEmployeeModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee/Client</span>
        </button>
      </div>

      {/* Employee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700">Total Employees</p>
              <p className="text-3xl font-bold text-blue-800">{employees.length}</p>
            </div>
            <div className="bg-blue-600 p-3 rounded-full">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-700">Total Clients</p>
              <p className="text-3xl font-bold text-green-800">{clients.length}</p>
            </div>
            <div className="bg-green-600 p-3 rounded-full">
              <Building className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-700">Active Projects</p>
              <p className="text-3xl font-bold text-purple-800">{projects.filter(p => p.status === 'active').length}</p>
            </div>
            <div className="bg-purple-600 p-3 rounded-full">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Assigned Projects</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Overall Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...employees, ...clients].map(person => {
                const assignedProjects = person.role === 'employee' 
                  ? projects.filter(p => p.assigned_employees.includes(person.id))
                  : projects.filter(p => p.client_id === person.id);
                const avgProgress = assignedProjects.length > 0 
                  ? Math.round(assignedProjects.reduce((sum, p) => sum + p.progress_percentage, 0) / assignedProjects.length)
                  : 0;

                return (
                  <tr key={person.id} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 bg-gradient-to-br ${
                          person.role === 'employee' ? 'from-blue-500 to-blue-600' : 'from-green-500 to-green-600'
                        } rounded-full flex items-center justify-center shadow-md`}>
                          <span className="text-white font-bold text-sm">
                            {person.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-base font-bold text-gray-900">{person.name}</div>
                          <div className="text-sm text-gray-600 font-medium">{person.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        person.role === 'employee' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {person.role === 'employee' ? 'Employee' : 'Client'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {assignedProjects.map(project => (
                          <span key={project.id} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">
                            {project.title}
                          </span>
                        ))}
                        {assignedProjects.length === 0 && (
                          <span className="text-sm text-gray-500 font-medium">
                            {person.role === 'employee' ? 'No projects assigned' : 'No projects'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-3 mr-3" style={{ width: '120px' }}>
                          <div
                            className="h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${avgProgress}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-900 min-w-[40px]">{avgProgress}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee/Client Modal */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-900">Add New Employee/Client</h3>
              <button
                onClick={() => setIsEmployeeModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-white hover:bg-opacity-50 p-2 rounded-full transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={employeeForm.name}
                  onChange={(e) => setEmployeeForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) => setEmployeeForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                <select
                  value={employeeForm.role}
                  onChange={(e) => setEmployeeForm(prev => ({ ...prev, role: e.target.value as 'employee' | 'client' }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                >
                  <option value="employee">Employee</option>
                  <option value="client">Client</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Add {employeeForm.role === 'employee' ? 'Employee' : 'Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderLeads = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Lead Management</h2>
          <p className="text-gray-600 text-lg">Track and manage potential clients</p>
        </div>
        <button
          onClick={() => {
            setEditingLead(null);
            setLeadForm({ name: '', contact_info: '', estimated_amount: 0, notes: '' });
            setIsLeadModalOpen(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>New Lead</span>
        </button>
      </div>

      {/* Leads Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700">Total Leads</p>
              <p className="text-3xl font-bold text-blue-800">{leads.length}</p>
            </div>
            <div className="bg-blue-600 p-3 rounded-full">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-700">Total Value</p>
              <p className="text-3xl font-bold text-green-800">
                ${leads.reduce((sum, lead) => sum + lead.estimated_amount, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-green-600 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-700">Average Value</p>
              <p className="text-3xl font-bold text-purple-800">
                ${leads.length > 0 ? Math.round(leads.reduce((sum, lead) => sum + lead.estimated_amount, 0) / leads.length).toLocaleString() : 0}
              </p>
            </div>
            <div className="bg-purple-600 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Estimated Amount</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Notes</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads.map(lead => (
                <tr key={lead.id} className="hover:bg-blue-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base font-bold text-gray-900">{lead.name}</div>
                    <div className="text-sm text-gray-600 font-medium">Added {new Date(lead.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">{lead.contact_info}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base font-bold text-green-700">${lead.estimated_amount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate font-medium">{lead.notes || 'No notes'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditLead(lead)}
                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-all duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {leads.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
            <p className="text-gray-600">Add your first lead to get started</p>
          </div>
        )}
      </div>

      {/* Lead Modal */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-900">
                {editingLead ? 'Edit Lead' : 'Add New Lead'}
              </h3>
              <button
                onClick={() => setIsLeadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-white hover:bg-opacity-50 p-2 rounded-full transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleLeadSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Contact Info</label>
                <input
                  type="text"
                  value={leadForm.contact_info}
                  onChange={(e) => setLeadForm(prev => ({ ...prev, contact_info: e.target.value }))}
                  placeholder="Email, phone, or other contact details"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Estimated Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={leadForm.estimated_amount}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, estimated_amount: parseInt(e.target.value) || 0 }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Notes</label>
                <textarea
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200 resize-none"
                  placeholder="Additional notes about this lead..."
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsLeadModalOpen(false)}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  {editingLead ? 'Update' : 'Add'} Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderProjectDetail = () => {
    if (!selectedProject) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowProjectDetail(false)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Projects
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedProject.title}</h2>
              <p className="text-gray-600">{selectedProject.description}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            selectedProject.status === 'active' ? 'bg-green-100 text-green-800' :
            selectedProject.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {selectedProject.status}
          </span>
        </div>

        {/* Project Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Client</h4>
              <p className="text-gray-600">{selectedProject.client_name}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Deadline</h4>
              <p className="text-gray-600">{new Date(selectedProject.deadline).toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Progress</h4>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-blue-600 rounded-full"
                    style={{ width: `${selectedProject.progress_percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{selectedProject.progress_percentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'brochure', label: 'Brochure Review', icon: FileText },
              { id: 'brochure-design', label: 'Brochure Design', icon: Edit },
              { id: 'files', label: 'File Storage', icon: Upload },
              { id: 'tasks', label: 'Tasks', icon: CheckSquare },
              { id: 'stages', label: 'Stages', icon: Layers }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setProjectDetailTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    projectDetailTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {projectDetailTab === 'brochure' && <BrochureReview />}
          {projectDetailTab === 'brochure-design' && <BrochureDesign />}
          {projectDetailTab === 'files' && <ProjectFileStorage project={selectedProject} />}
          {projectDetailTab === 'tasks' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Project Tasks</h3>
              {allTasks.filter(task => task.project_id === selectedProject.id).map(task => (
                <TaskCard key={task.id} task={task} showProject={false} />
              ))}
              {allTasks.filter(task => task.project_id === selectedProject.id).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No tasks for this project</p>
                </div>
              )}
            </div>
          )}
          {projectDetailTab === 'stages' && <StageDetail project={selectedProject} onBack={() => setShowProjectDetail(false)} />}
        </div>
      </div>
    );
  };

  // Show project detail if selected
  if (showProjectDetail && selectedProject) {
    return (
      <div className="p-6">
        {renderProjectDetail()}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Content based on active section */}
      {activeView === 'dashboard' && renderDashboard()}
      {activeView === 'projects' && renderProjects()}
      {activeView === 'employees' && renderEmployees()}
      {activeView === 'leads' && renderLeads()}
      {activeView === 'file-storage' && <ProjectFileStorageManager />}
    </div>
  );
}