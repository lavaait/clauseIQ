import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, AlertTriangle, Users, X, ChevronDown, ChevronUp } from 'lucide-react';
import MainLayout from '../Mainlayout/MainLayout';
import '../occ-colors.css';

import { milestoneTypes, defaultFormData, projectTimelineConfig, milestonesApi } from '../../data/milestoneData';
import { statusColors, statusBorderColors, statusDots, statusIcons, typeColors } from '../../data/milestoneStyles';
import { getTimelinePosition, formatDate, getMonthLabels, calculateTodayPosition} from '../utils/timelineUtils';

const SolicitationPlanning = () => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline'); 
  const [expandedMilestone, setExpandedMilestone] = useState(null);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        setLoading(true);
        const data = await milestonesApi.getMilestones();
        setMilestones(data);
      } catch (error) {
        console.error('Error fetching milestones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, []);

  const handleAddMilestone = async () => {
    if (formData.title && formData.startDate && formData.endDate) {
      try {
        const newMilestone = {
          ...formData,
          status: 'pending',
          assignees: formData.assignees.filter(a => a.trim() !== '')
        };
        
        const savedMilestone = await milestonesApi.addMilestone(newMilestone);
        setMilestones([...milestones, savedMilestone]);
        resetForm();
      } catch (error) {
        console.error('Error adding milestone:', error);
      }
    }
  };

  const handleEditMilestone = (milestone) => {
    setEditingMilestone(milestone.id);
    setFormData({
      title: milestone.title,
      type: milestone.type,
      startDate: milestone.startDate,
      endDate: milestone.endDate,
      description: milestone.description,
      assignees: milestone.assignees || []
    });
    setShowAddForm(true);
    setShowMobileForm(true);
  };

  const handleUpdateMilestone = async () => {
    try {
      const updatedMilestone = { 
        id: editingMilestone,
        ...formData, 
        assignees: formData.assignees.filter(a => a.trim() !== '') 
      };
      
      await milestonesApi.updateMilestone(updatedMilestone);
      
      setMilestones(milestones.map(m => 
        m.id === editingMilestone ? updatedMilestone : m
      ));
      
      resetForm();
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  const handleDeleteMilestone = async (id) => {
    try {
      await milestonesApi.deleteMilestone(id);
      setMilestones(milestones.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting milestone:', error);
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setShowAddForm(false);
    setEditingMilestone(null);
    setShowMobileForm(false);
  };

  const addAssignee = () => {
    setFormData({
      ...formData,
      assignees: [...formData.assignees, '']
    });
  };

  const updateAssignee = (index, value) => {
    const newAssignees = [...formData.assignees];
    newAssignees[index] = value;
    setFormData({ ...formData, assignees: newAssignees });
  };

  const removeAssignee = (index) => {
    setFormData({
      ...formData,
      assignees: formData.assignees.filter((_, i) => i !== index)
    });
  };

  const toggleMilestoneExpand = (id) => {
    if (expandedMilestone === id) {
      setExpandedMilestone(null);
    } else {
      setExpandedMilestone(id);
    }
  };

  const monthLabels = getMonthLabels(projectTimelineConfig.startDate, projectTimelineConfig.endDate);
  const todayPosition = calculateTodayPosition(projectTimelineConfig.startDate, projectTimelineConfig.endDate);

  return (
    <MainLayout title='Solicitation-Planner'>
      <div className="min-h-screen pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header Section */}
          <div className="bg-occ-blue-gradient rounded-xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 shadow-lg">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold occ-secondary-white mb-1 sm:mb-2">Solicitation Planning</h1>
            <p className="occ-secondary-white opacity-90 text-sm sm:text-base">Plan and track solicitation milestones with AI-generated suggestions</p>
          </div>

          {/* AI Suggestion Banner */}
          <div className="bg-white border-l-4 border-occ-blue rounded-lg p-3 sm:p-5 mb-6 sm:mb-8 shadow-md">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-occ-blue rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-semibold occ-blue-dark">AI-Generated Timeline Suggestion</span>
            </div>
            <p className="text-gray-700 text-xs sm:text-sm">
              Based on your requirements, I've suggested a 2.5-month timeline with key milestones: RFI, RFP development, evaluation, and legal review phases.
            </p>
          </div>

          {/* Mobile Add Button (Fixed position) */}
          <div className="lg:hidden fixed right-4 bottom-4 z-10">
            <button
              onClick={() => {
                setShowAddForm(true);
                setShowMobileForm(true);
              }}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-occ-blue text-white shadow-lg hover:bg-occ-blue-dark transition-colors"
            >
              <Plus size={24} />
            </button>
          </div>

          {/* Mobile Form Overlay */}
          {showMobileForm && (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold occ-blue-dark">
                    {editingMilestone ? 'Edit Milestone' : 'Add New Milestone'}
                  </h3>
                  <button 
                    onClick={resetForm}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium occ-gray mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-occ-blue focus:border-transparent transition-all"
                      placeholder="Enter milestone title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium occ-gray mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-occ-blue focus:border-transparent transition-all"
                    >
                      {milestoneTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium occ-gray mb-1">Start Date</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-occ-blue focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium occ-gray mb-1">End Date</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-occ-blue focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium occ-gray mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-occ-blue focus:border-transparent transition-all"
                      rows="3"
                      placeholder="Enter milestone description"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium occ-gray mb-1">Assignees</label>
                    {formData.assignees.map((assignee, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={assignee}
                          onChange={(e) => updateAssignee(index, e.target.value)}
                          className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-occ-blue focus:border-transparent transition-all"
                          placeholder="Enter assignee name"
                        />
                        <button
                          onClick={() => removeAssignee(index)}
                          className="p-3 text-occ-secondary-orange hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addAssignee}
                      className="occ-blue hover:text-occ-blue-dark text-sm font-medium flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Add Assignee
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={editingMilestone ? handleUpdateMilestone : handleAddMilestone}
                    className="bg-occ-blue occ-secondary-white px-5 py-3 rounded-lg hover:bg-occ-blue-dark transition-all duration-200 flex-1"
                  >
                    {editingMilestone ? 'Update Milestone' : 'Add Milestone'}
                  </button>
                  <button
                    onClick={resetForm}
                    className="bg-occ-secondary-gray text-gray-800 px-5 py-3 rounded-lg hover:bg-gray-300 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-occ-blue"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Mobile Tabs */}
                <div className="flex lg:hidden bg-white rounded-lg shadow-sm mb-4">
                  <button 
                    className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'timeline' ? 'occ-blue border-b-2 border-occ-blue' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('timeline')}
                  >
                    Timeline
                  </button>
                  <button 
                    className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'cards' ? 'occ-blue border-b-2 border-occ-blue' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('cards')}
                  >
                    Milestones
                  </button>
                </div>

                {/* Timeline Header */}
                <div className={`bg-white rounded-xl shadow-md overflow-hidden ${activeTab !== 'timeline' && 'hidden lg:block'}`}>
                  <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100">
                    <h2 className="text-lg sm:text-xl font-semibold occ-blue-dark">Timeline Overview</h2>
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="hidden lg:flex items-center gap-2 bg-occ-blue occ-secondary-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-occ-blue-dark transition-all duration-200 shadow-sm text-sm sm:text-base"
                    >
                      <Plus size={16} />
                      Add Milestone
                    </button>
                  </div>

                  {/* Modern Timeline View */}
                  <div className="p-4 sm:p-6">
                    {/* Timeline with elegant month labels - Desktop version */}
                    <div className="relative mb-12 hidden sm:block">
                      {/* Month labels */}
                      <div className="flex justify-between text-xs sm:text-sm font-medium occ-blue-dark absolute -top-7 w-full">
                        {monthLabels.map((month, index) => (
                          <div 
                            key={index} 
                            className="absolute"
                            style={{ left: month.position }}
                          >
                            {month.name}
                          </div>
                        ))}
                      </div>
                      
                      {/* Main timeline track */}
                      <div className="h-2 bg-gray-100 w-full rounded-full relative">
                        {/* Timeline progress */}
                        <div className="absolute h-2 bg-occ-blue rounded-full" style={{ width: todayPosition }}></div>
                        
                        {/* Today marker */}
                        <div 
                          className="absolute top-0 w-4 h-4 bg-white rounded-full border-2 border-occ-blue-dark shadow-md" 
                          style={{ left: todayPosition, transform: 'translate(-50%, -25%)' }}
                        >
                          <div className="absolute whitespace-nowrap text-xs font-medium occ-blue-dark bg-white px-2 py-1 rounded shadow-sm border border-gray-200" 
                               style={{ top: '-30px', left: '50%', transform: 'translateX(-50%)' }}>
                            Today
                          </div>
                        </div>
                        
                        {/* Milestone markers on timeline */}
                        {milestones.map((milestone) => {
                          const position = getTimelinePosition(
                            milestone.startDate, 
                            milestone.endDate,
                            projectTimelineConfig.startDate,
                            projectTimelineConfig.endDate
                          );
                          const startPosition = position.left;
                          
                          return (
                            <div 
                              key={`marker-${milestone.id}`} 
                              className={`absolute top-0 w-3 h-3 rounded-full ${statusDots[milestone.status]} border-2 border-white`}
                              style={{ left: startPosition, transform: 'translate(-50%, -25%)' }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Mobile timeline view - simplified */}
                    <div className="sm:hidden mb-4">
                      <div className="h-2 bg-gray-100 w-full rounded-full relative mb-8">
                        <div className="absolute h-2 bg-occ-blue rounded-full" style={{ width: todayPosition }}></div>
                        <div 
                          className="absolute top-0 w-4 h-4 bg-white rounded-full border-2 border-occ-blue-dark shadow-md" 
                          style={{ left: todayPosition, transform: 'translate(-50%, -25%)' }}
                        >
                          <div className="absolute whitespace-nowrap text-xs font-medium occ-blue-dark bg-white px-2 py-1 rounded shadow-sm border border-gray-200" 
                              style={{ top: '-30px', left: '50%', transform: 'translateX(-50%)' }}>
                            Today
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs font-medium occ-gray mb-2">
                        <span>{formatDate(projectTimelineConfig.startDate)}</span>
                        <span>{formatDate(projectTimelineConfig.endDate)}</span>
                      </div>
                    </div>
                    
                    {/* Timeline items */}
                    <div className="space-y-3">
                      {milestones.map((milestone) => {
                        const position = getTimelinePosition(
                          milestone.startDate, 
                          milestone.endDate,
                          projectTimelineConfig.startDate,
                          projectTimelineConfig.endDate
                        );
                        return (
                          <div 
                            key={milestone.id} 
                            className={`border-l-4 ${statusBorderColors[milestone.status]} pl-3 sm:pl-4 py-2 sm:py-3 bg-white rounded-r-lg shadow-sm hover:shadow transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between pr-3 sm:pr-4`}
                            onClick={() => handleEditMilestone(milestone)}
                          >
                            <div className="flex items-start sm:items-center gap-2 sm:gap-4">
                              <div className={`p-1.5 sm:p-2 rounded-full ${statusColors[milestone.status]} flex items-center justify-center shrink-0 mt-0.5 sm:mt-0`}>
                                {statusIcons[milestone.status]}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                  <h4 className="font-semibold occ-blue-dark text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">{milestone.title}</h4>
                                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[milestone.type]}`}>
                                    {milestone.type}
                                  </span>
                                  {milestone.hasWarning && (
                                    <div className="flex items-center gap-1 text-occ-secondary-orange">
                                      <AlertTriangle size={14} />
                                      <span className="text-xs hidden sm:inline">Schedule drift</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs occ-gray mt-1">
                                  <div className="flex items-center gap-1">
                                    <Calendar size={12} className="occ-blue" />
                                    <span>{formatDate(milestone.startDate)} - {formatDate(milestone.endDate)}</span>
                                  </div>
                                  {milestone.assignees && milestone.assignees.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Users size={12} className="occ-blue" />
                                      <span className="truncate max-w-[120px] sm:max-w-none">
                                        {milestone.assignees.join(', ')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-2 sm:mt-0 justify-end">
                              <div className="text-xs px-2 py-0.5 rounded bg-gray-100 hidden sm:block">
                                {position.width}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMilestone(milestone.id);
                                }}
                                className="p-1.5 text-gray-400 hover:bg-occ-secondary-orange hover:text-white rounded-full transition-all duration-200"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Milestone Cards */}
                <div className={`bg-white rounded-xl shadow-md p-4 sm:p-6 ${activeTab !== 'cards' && 'hidden lg:block'}`}>
                  <h3 className="text-lg font-semibold occ-blue-dark mb-4 border-b border-gray-100 pb-3">Milestone Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {milestones.map((milestone) => (
                      <div 
                        key={milestone.id} 
                        className="bg-white border border-gray-100 rounded-lg p-4 sm:p-5 hover:shadow-md transition-all duration-200 relative overflow-hidden group"
                      >
                        {/* Status indicator line on the left */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusDots[milestone.status]}`}></div>
                        
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pl-2">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h4 className="font-semibold occ-blue-dark text-sm sm:text-base">{milestone.title}</h4>
                              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[milestone.type]}`}>
                                {milestone.type}
                              </span>
                              {milestone.hasWarning && (
                                <div className="flex items-center gap-1 text-occ-secondary-orange">
                                  <AlertTriangle size={14} />
                                  <span className="text-xs">Alert</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Mobile view: Toggle description */}
                            <div className="sm:hidden">
                              {expandedMilestone === milestone.id ? (
                                <p className="text-xs text-gray-600 mb-3">{milestone.description}</p>
                              ) : (
                                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{milestone.description}</p>
                              )}
                              {milestone.description.length > 100 && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMilestoneExpand(milestone.id);
                                  }}
                                  className="text-xs occ-blue flex items-center mb-2"
                                >
                                  {expandedMilestone === milestone.id ? (
                                    <>Show less <ChevronUp size={14} /></>
                                  ) : (
                                    <>Show more <ChevronDown size={14} /></>
                                  )}
                                </button>
                              )}
                            </div>
                            
                            {/* Desktop view: Always show description */}
                            <p className="hidden sm:block text-sm text-gray-600 mb-3">{milestone.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-3 text-xs occ-gray">
                              <div className="flex items-center gap-1">
                                <Calendar size={14} className="occ-blue" />
                                <span>{formatDate(milestone.startDate)} - {formatDate(milestone.endDate)}</span>
                              </div>
                              {milestone.assignees && milestone.assignees.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Users size={14} className="occ-blue" />
                                  <span className="truncate max-w-[120px] sm:max-w-none">
                                    {milestone.assignees.join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 sm:gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditMilestone(milestone);
                              }}
                              className="p-1.5 sm:p-2 text-gray-400 hover:bg-occ-blue hover:text-white rounded-full transition-all duration-200"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMilestone(milestone.id);
                              }}
                              className="p-1.5 sm:p-2 text-gray-400 hover:bg-occ-secondary-orange hover:text-white rounded-full transition-all duration-200"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Right column with form */}
              <div className="hidden lg:block">
                {showAddForm ? (
                  <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                    <h3 className="text-lg font-semibold occ-blue-dark mb-4 pb-2 border-b border-gray-100">
                      {editingMilestone ? 'Edit Milestone' : 'Add New Milestone'}
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium occ-gray mb-1">Title</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-occ-blue focus:border-transparent transition-all"
                          placeholder="Enter milestone title"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium occ-gray mb-1">Type</label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-occ-blue focus:border-transparent transition-all"
                        >
                          {milestoneTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium occ-gray mb-1">Start Date</label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-occ-blue focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium occ-gray mb-1">End Date</label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-occ-blue focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium occ-gray mb-1">Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-occ-blue focus:border-transparent transition-all"
                          rows="3"
                          placeholder="Enter milestone description"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium occ-gray mb-1">Assignees</label>
                        {formData.assignees.map((assignee, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={assignee}
                              onChange={(e) => updateAssignee(index, e.target.value)}
                              className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-occ-blue focus:border-transparent transition-all"
                              placeholder="Enter assignee name"
                            />
                            <button
                              onClick={() => removeAssignee(index)}
                              className="p-3 text-occ-secondary-orange hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={addAssignee}
                          className="occ-blue hover:text-occ-blue-dark text-sm font-medium flex items-center gap-1"
                        >
                          <Plus size={14} />
                          Add Assignee
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                      <button
                        onClick={editingMilestone ? handleUpdateMilestone : handleAddMilestone}
                        className="bg-occ-blue occ-secondary-white px-5 py-3 rounded-lg hover:bg-occ-blue-dark transition-all duration-200 flex-1"
                      >
                        {editingMilestone ? 'Update Milestone' : 'Add Milestone'}
                      </button>
                      <button
                        onClick={resetForm}
                        className="bg-occ-secondary-gray text-gray-800 px-5 py-3 rounded-lg hover:bg-gray-300 transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold occ-blue-dark">Project Summary</h3>
                      <span className="bg-occ-blue-dark occ-secondary-white px-3 py-1 rounded-full text-xs font-medium">Active</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm occ-gray">Total Milestones</span>
                        <span className="font-semibold">{milestones.length}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm occ-gray">Completed</span>
                        <span className="font-semibold">{milestones.filter(m => m.status === 'completed').length}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm occ-gray">In Progress</span>
                        <span className="font-semibold">{milestones.filter(m => m.status === 'in-progress').length}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm occ-gray">Pending</span>
                        <span className="font-semibold">{milestones.filter(m => m.status === 'pending').length}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm occ-gray">Project Duration</span>
                        <span className="font-semibold">{formatDate(projectTimelineConfig.startDate)} - {formatDate(projectTimelineConfig.endDate)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="w-full bg-occ-blue occ-secondary-white px-4 py-3 rounded-lg hover:bg-occ-blue-dark transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Plus size={16} />
                        Add New Milestone
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SolicitationPlanning;