import React, { useState } from 'react';
import { Stage } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { CheckCircle, XCircle, Clock, MessageSquare, FileText } from 'lucide-react';

interface StageApprovalProps {
  stage: Stage;
}

export function StageApproval({ stage }: StageApprovalProps) {
  const { user } = useAuth();
  const { updateStageApproval, files, commentTasks } = useData();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comment, setComment] = useState('');

  const stageFiles = files.filter(file => file.stage_id === stage.id);
  const stageComments = commentTasks.filter(comment => comment.stage_id === stage.id);

  const handleApproval = (status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !comment.trim()) {
      setShowCommentForm(true);
      return; 
    }
    
    updateStageApproval(stage.id, status, comment.trim() || undefined);
    setComment('');
    setShowCommentForm(false); 
  };

  const getStatusDisplay = () => {
    switch (stage.approval_status) {
      case 'approved':
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-500" />,
          text: 'Approved',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-6 h-6 text-red-500" />,
          text: 'Rejected',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: <Clock className="w-6 h-6 text-orange-500" />,
          text: 'Pending Review',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className={`rounded-lg border ${status.borderColor} ${status.bgColor} p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {status.icon}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{stage.name}</h3>
            <p className="text-sm text-gray-600">{status.text}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{stage.progress_percentage}% Complete</p>
          <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
            <div
              className="h-2 bg-red-600 rounded-full transition-all duration-300"
              style={{ width: `${stage.progress_percentage}%` }}
            />
          </div>
        </div>
      </div>

      {stage.notes && (
        <p className="text-gray-700 mb-4">{stage.notes}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FileText className="w-4 h-4" />
          <span>{stageFiles.length} file(s) uploaded</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MessageSquare className="w-4 h-4" />
          <span>{stageComments.length} comment(s)</span>
        </div>
      </div>

      {user?.role === 'client' && stage.approval_status === 'pending' && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          {!showCommentForm ? (
            <div className="flex space-x-3">
              <button
                onClick={() => handleApproval('approved')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => setShowCommentForm(true)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Request Changes</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Please explain what changes are needed:
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe the changes needed for this stage..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => handleApproval('rejected')}
                  disabled={!comment.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Submit Feedback
                </button>
                <button
                  onClick={() => {
                    setShowCommentForm(false);
                    setComment('');
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}