import React from 'react';

const TaskTable = ({ tasks }) => {
  // Calculate days remaining and status
  const getTaskStatus = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'overdue', color: 'text-red-600 bg-red-50' };
    if (diffDays <= 2) return { status: 'urgent', color: 'text-orange-600 bg-orange-50' };
    if (diffDays <= 7) return { status: 'upcoming', color: 'text-blue-600 bg-blue-50' };
    return { status: 'scheduled', color: 'text-green-600 bg-green-50' };
  };

  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900">Tasks</h3>
        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
          View All Tasks
        </button>
      </div>
      
      {/* Mobile Card View (hidden on medium screens and up) */}
      <div className="md:hidden space-y-3">
        {tasks.map((task, index) => {
          const { color } = getTaskStatus(task.dueDate);
          return (
            <div key={index} className="border rounded-lg p-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="font-medium text-sm text-gray-800">{task.task}</div>
                <div className={`text-xs px-2 py-0.5 rounded-full ${color} font-medium ml-2`}>
                  {getTaskStatus(task.dueDate).status}
                </div>
              </div>
              
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="flex flex-col">
                  <span className="text-gray-500">Due Date</span>
                  <span className="font-medium">{task.dueDate}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Assigned To</span>
                  <span className="font-medium">{task.assignedTo}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Assigned By</span>
                  <span className="font-medium">{task.assignedBy}</span>
                </div>
                <div className="flex justify-end items-end">
                  <button className="text-blue-600 hover:text-blue-800">
                    <span className="text-lg">⋮</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Desktop Table View (hidden on small screens) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-full">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-200">
              <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
              <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned By</th>
              <th className="relative py-2 px-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map((task, index) => {
              const { color } = getTaskStatus(task.dueDate);
              return (
                <tr 
                  key={index}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="py-2.5 px-3 text-sm font-medium text-gray-800">{task.task}</td>
                  <td className="py-2.5 px-3 text-sm text-gray-600">{task.dueDate}</td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex text-xs px-2 py-0.5 rounded-full ${color} font-medium`}>
                      {getTaskStatus(task.dueDate).status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-sm text-gray-600">{task.assignedTo}</td>
                  <td className="py-2.5 px-3 text-sm text-gray-600">{task.assignedBy}</td>
                  <td className="py-2.5 px-3 text-sm text-right">
                    <button className="text-gray-400 hover:text-gray-600">
                      <span className="text-lg">⋮</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Empty state - show when there are no tasks */}
      {tasks.length === 0 && (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">📋</div>
          <h4 className="text-gray-500 text-sm">No tasks found</h4>
          <button className="mt-2 text-xs text-blue-600">+ Create a Task</button>
        </div>
      )}
      
      {/* Pagination for larger task lists */}
      {tasks.length > 5 && (
        <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
          <span>Showing 1-{Math.min(5, tasks.length)} of {tasks.length} tasks</span>
          <div className="flex space-x-1">
            <button className="px-2 py-1 border rounded hover:bg-gray-50">Previous</button>
            <button className="px-2 py-1 border rounded bg-blue-50 text-blue-600">1</button>
            <button className="px-2 py-1 border rounded hover:bg-gray-50">2</button>
            <button className="px-2 py-1 border rounded hover:bg-gray-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTable;