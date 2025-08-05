import React from 'react';

const TaskTable = ({ tasks, loading = false }) => {
  // Calculate days remaining and status
  const getTaskStatus = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { 
      status: 'overdue', 
      color: 'text-red-700 bg-red-100 border-red-200',
      label: 'Overdue task'
    };
    if (diffDays <= 2) return { 
      status: 'urgent', 
      color: 'text-orange-700 bg-orange-100 border-orange-200',
      label: 'Urgent task'
    };
    if (diffDays <= 7) return { 
      status: 'upcoming', 
      color: 'text-blue-700 bg-blue-100 border-blue-200',
      label: 'Upcoming task'
    };
    return { 
      status: 'scheduled', 
      color: 'text-green-700 bg-green-100 border-green-200',
      label: 'Scheduled task'
    };
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="md:hidden border border-gray-200 rounded-lg p-3">
            <div className="flex justify-between items-start mb-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="flex space-x-4 py-3">
              <div className="h-4 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 id="tasks-table-title" className="text-base md:text-lg font-semibold text-gray-900">
          Tasks ({loading ? '...' : tasks.length})
        </h3>
        <button 
          className="text-xs text-blue-700 hover:text-blue-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-2 py-1"
          aria-label="View all tasks"
        >
          View All Tasks
        </button>
      </div>
      
      {/* Loading State */}
      {loading && <LoadingSkeleton />}
      
      {/* Mobile Card View (hidden on medium screens and up) */}
      {!loading && (
        <div className="md:hidden space-y-3" role="list" aria-labelledby="tasks-table-title">
          {tasks.map((task, index) => {
            const statusInfo = getTaskStatus(task.dueDate);
            return (
              <div 
                key={task.id || index} 
                className="border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                role="listitem"
              >
                <div className="flex items-start justify-between">
                  <div className="font-medium text-sm text-gray-900 flex-1 mr-2">
                    {task.task}
                  </div>
                  <span 
                    className={`text-xs px-2 py-1 rounded-full border ${statusInfo.color} font-medium flex-shrink-0`}
                    aria-label={statusInfo.label}
                  >
                    {statusInfo.status}
                  </span>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div className="flex flex-col">
                    <span className="text-gray-600 font-medium">Due Date</span>
                    <time className="font-medium text-gray-900" dateTime={task.rawDueDate}>
                      {task.dueDate}
                    </time>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600 font-medium">Assigned To</span>
                    <span className="font-medium text-gray-900">{task.assignedTo}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600 font-medium">Assigned By</span>
                    <span className="font-medium text-gray-900">{task.assignedBy}</span>
                  </div>
                  <div className="flex justify-end items-end">
                    <button 
                      className="text-gray-600 hover:text-gray-900 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`More actions for ${task.task}`}
                    >
                      <span className="text-lg" aria-hidden="true">⋮</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Desktop Table View (hidden on small screens) */}
      {!loading && (
        <div className="hidden md:block overflow-x-auto">
          <table 
            className="w-full min-w-full"
            role="table"
            aria-labelledby="tasks-table-title"
          >
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200">
                <th 
                  scope="col"
                  className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Task
                </th>
                <th 
                  scope="col"
                  className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Due Date
                </th>
                <th 
                  scope="col"
                  className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Status
                </th>
                <th 
                  scope="col"
                  className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Assigned To
                </th>
                <th 
                  scope="col"
                  className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Assigned By
                </th>
                <th scope="col" className="relative py-3 px-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((task, index) => {
                const statusInfo = getTaskStatus(task.dueDate);
                return (
                  <tr 
                    key={task.id || index}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="py-3 px-3 text-sm font-medium text-gray-900">
                      {task.task}
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-700">
                      <time dateTime={task.rawDueDate}>{task.dueDate}</time>
                    </td>
                    <td className="py-3 px-3">
                      <span 
                        className={`inline-flex text-xs px-2 py-1 rounded-full border ${statusInfo.color} font-medium`}
                        aria-label={statusInfo.label}
                      >
                        {statusInfo.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-700">{task.assignedTo}</td>
                    <td className="py-3 px-3 text-sm text-gray-700">{task.assignedBy}</td>
                    <td className="py-3 px-3 text-sm text-right">
                      <button 
                        className="text-gray-600 hover:text-gray-900 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={`More actions for ${task.task}`}
                      >
                        <span className="text-lg" aria-hidden="true">⋮</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Empty state - show when there are no tasks */}
      {!loading && tasks.length === 0 && (
        <div className="text-center py-8" role="status" aria-live="polite">
          <div className="text-3xl mb-2" aria-hidden="true">📋</div>
          <h4 className="text-gray-600 text-sm font-medium">No tasks found</h4>
          <button 
            className="mt-2 text-xs text-blue-700 hover:text-blue-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-2 py-1"
            aria-label="Create a new task"
          >
            + Create a Task
          </button>
        </div>
      )}
      
      {/* Pagination for larger task lists */}
      {!loading && tasks.length > 5 && (
        <nav 
          className="flex justify-between items-center mt-4 text-xs text-gray-600"
          aria-label="Tasks pagination"
        >
          <span aria-live="polite">
            Showing 1-{Math.min(5, tasks.length)} of {tasks.length} tasks
          </span>
          <div className="flex space-x-1" role="group" aria-label="Pagination controls">
            <button 
              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              aria-label="Go to previous page"
            >
              Previous
            </button>
            <button 
              className="px-2 py-1 border border-blue-300 rounded bg-blue-50 text-blue-700 font-medium"
              aria-label="Page 1, current page"
              aria-current="page"
            >
              1
            </button>
            <button 
              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              aria-label="Go to page 2"
            >
              2
            </button>
            <button 
              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              aria-label="Go to next page"
            >
              Next
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default TaskTable;