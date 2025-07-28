import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Trash2, User, Bell, Shield, Users, Settings, UserPlus, ShieldCheck, X, Save, Menu } from 'lucide-react';
import MainLayout from '../Mainlayout/MainLayout';

const UserManagement = () => {
  const [selectedUser, setSelectedUser] = useState({
    id: 1,
    name: 'John Doe',
    initials: 'JD',
    role: 'Contract Manager',
    email: 'john.doe@company.com',
    department: 'Procurement',
    lastActive: '2 hours ago',
    permissions: ['create_contract', 'edit_contract', 'approve_under_50k'],
    notifications: {
      email: true,
      sms: false,
      inApp: false
    },
    aiExplainability: true
  });

  const [users, setUsers] = useState([
    { id: 2, name: 'Alice Smith', role: 'Legal', department: 'Legal', email: 'alice.smith@company.com', status: 'active', lastActive: '5 minutes ago', permissions: ['review_contract', 'approve_legal'] },
    { id: 3, name: 'Bob Johnson', role: 'Procurement Officer', department: 'Procurement', email: 'bob.johnson@company.com', status: 'active', lastActive: '1 hour ago', permissions: ['create_contract', 'edit_contract'] },
    { id: 4, name: 'Carol White', role: 'Admin', department: 'Operations', email: 'carol.white@company.com', status: 'inactive', lastActive: '3 days ago', permissions: ['view_all', 'manage_users'] }
  ]);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showMobileTeamMenu, setShowMobileTeamMenu] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Contract Manager',
    department: 'Procurement'
  });

  const roles = ['Contract Manager', 'Legal', 'Procurement Officer', 'Admin'];
  const departments = ['Procurement', 'Legal', 'Finance', 'Operations'];
  
  const permissions = {
    'Contract Manager': ['create_contract', 'edit_contract', 'view_contract', 'submit_for_approval'],
    'Legal': ['review_contract', 'approve_legal', 'add_legal_notes', 'reject_contract'],
    'Procurement Officer': ['approve_under_50k', 'approve_over_50k', 'final_approval', 'assign_vendor'],
    'Admin': ['view_all', 'manage_users', 'manage_workflows', 'executive_approval']
  };

  // References for handling clicks outside modals
  const mobileMenuRef = useRef(null);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileTeamMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuRef]);

  // Handle body scroll lock when modals are open
  useEffect(() => {
    const modalOpen = showAddUserModal || showRoleModal;
    
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showAddUserModal, showRoleModal]);

  const updateRole = (newRole) => {
    setSelectedUser({ ...selectedUser, role: newRole });
  };

  const toggleNotification = (type) => {
    setSelectedUser({
      ...selectedUser,
      notifications: {
        ...selectedUser.notifications,
        [type]: !selectedUser.notifications[type]
      }
    });
  };

  const toggleAIExplainability = () => {
    setSelectedUser({ ...selectedUser, aiExplainability: !selectedUser.aiExplainability });
  };

  const addUser = () => {
    if (newUser.name && newUser.email) {
      const user = {
        id: users.length + 2,
        ...newUser,
        status: 'active',
        lastActive: 'Just now',
        permissions: permissions[newUser.role] || []
      };
      setUsers([...users, user]);
      setNewUser({ name: '', email: '', role: 'Contract Manager', department: 'Procurement' });
      setShowAddUserModal(false);
    }
  };

  const removeUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const activeUsers = users.filter(u => u.status === 'active').length + 1;
  const totalUsers = users.length + 1;

  return (
    <MainLayout title="User Management" userRole="Administrator">
      <div className="min-h-screen pb-12">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="lg:hidden sticky top-0 z-10 bg-occ-secondary-white shadow-md p-3 mb-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 occ-blue" />
              <h2 className="text-base font-semibold occ-blue-dark">User Management</h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowMobileTeamMenu(!showMobileTeamMenu)}
                className="p-2 bg-occ-secondary-gray rounded-lg"
              >
                <Menu className="w-5 h-5 occ-blue-dark" />
              </button>
              <button 
                onClick={() => setShowAddUserModal(true)}
                className="p-2 bg-occ-blue rounded-lg"
              >
                <UserPlus className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {/* Mobile Team Menu Dropdown */}
            {showMobileTeamMenu && (
              <div 
                ref={mobileMenuRef}
                className="absolute right-0 top-14 bg-white shadow-xl rounded-lg p-3 w-60 border-2 border-occ-secondary-gray z-20"
              >
                <h3 className="text-sm font-semibold occ-blue-dark mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowAddUserModal(true);
                      setShowMobileTeamMenu(false);
                    }}
                    className="flex items-center gap-2 w-full p-2 hover:bg-occ-secondary-gray rounded-lg"
                  >
                    <UserPlus className="w-4 h-4 occ-blue" />
                    <span className="text-sm">Add User</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowRoleModal(true);
                      setShowMobileTeamMenu(false);
                    }}
                    className="flex items-center gap-2 w-full p-2 hover:bg-occ-secondary-gray rounded-lg"
                  >
                    <Shield className="w-4 h-4 occ-blue" />
                    <span className="text-sm">Manage Roles</span>
                  </button>
                  <div className="border-t border-occ-secondary-gray my-2 pt-2">
                    <div className="flex items-center justify-between text-xs text-occ-gray px-2">
                      <span>Users</span>
                      <span className="font-semibold">{totalUsers}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-occ-gray px-2 mt-1">
                      <span>Active</span>
                      <span className="font-semibold">{activeUsers}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modern Header Section */}
          <div className="bg-occ-blue-gradient rounded-xl p-4 sm:p-6 lg:p-8 mb-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-occ-secondary-white rounded-lg">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 occ-blue" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold occ-secondary-white">User Management</h1>
                  <p className="occ-secondary-white opacity-90 text-xs sm:text-sm">Manage user profiles, roles, and access permissions</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button 
                  onClick={() => setShowAddUserModal(true)}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-occ-yellow occ-blue-dark rounded-lg hover:opacity-90 transition-all shadow-md flex items-center gap-2 text-xs sm:text-sm font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add</span> User
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left Column - User Profile */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* User Profile Card */}
              <div className="bg-occ-secondary-white rounded-xl shadow-lg border-2 border-occ-secondary-gray p-4 sm:p-6">
                <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 occ-blue" />
                    <h2 className="text-lg font-semibold occ-blue-dark">User Profile</h2>
                  </div>
                  {/* Mobile View - Select Other User */}
                  <div className="sm:hidden">
                    <select
                      onChange={(e) => {
                        const userId = parseInt(e.target.value);
                        if (userId === 1) {
                          // Current selected user
                        } else {
                          const user = users.find(u => u.id === userId);
                          if (user) {
                            setSelectedUser({
                              ...user,
                              initials: user.name.split(' ').map(n => n[0]).join(''),
                              notifications: {
                                email: false,
                                sms: false,
                                inApp: false
                              },
                              aiExplainability: false
                            });
                          }
                        }
                      }}
                      className="p-2 text-xs border-2 border-occ-secondary-gray rounded-lg"
                    >
                      <option value={1}>Current User</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 p-4 bg-occ-secondary-gray rounded-lg">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-occ-blue text-white rounded-full flex items-center justify-center shadow-md">
                    <span className="text-xl sm:text-2xl font-bold">{selectedUser.initials}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-semibold text-occ-blue-dark">{selectedUser.name}</h3>
                    <p className="text-sm text-occ-gray mb-2">{selectedUser.email}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-block px-3 py-1 bg-occ-secondary-orange text-white text-xs font-medium rounded-full">
                        {selectedUser.role}
                      </span>
                      <span className="inline-block px-3 py-1 bg-occ-blue text-white text-xs font-medium rounded-full">
                        {selectedUser.department}
                      </span>
                      <span className="text-xs text-occ-gray">Last active: {selectedUser.lastActive}</span>
                    </div>
                  </div>
                </div>

                {/* Role Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium occ-blue-dark mb-2 sm:mb-3">
                      Assigned Role
                    </label>
                    <div className="relative">
                      <select
                        value={selectedUser.role}
                        onChange={(e) => updateRole(e.target.value)}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-occ-secondary-gray rounded-lg bg-occ-secondary-white occ-blue-dark focus:ring-2 focus:ring-occ-blue focus:border-occ-blue appearance-none transition-all shadow-sm"
                      >
                        {roles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 occ-gray pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium occ-blue-dark mb-2 sm:mb-3">
                      Department
                    </label>
                    <div className="relative">
                      <select
                        value={selectedUser.department}
                        onChange={(e) => setSelectedUser({...selectedUser, department: e.target.value})}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-occ-secondary-gray rounded-lg bg-occ-secondary-white occ-blue-dark focus:ring-2 focus:ring-occ-blue focus:border-occ-blue appearance-none transition-all shadow-sm"
                      >
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 occ-gray pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="mb-6">
                  <label className="block text-sm font-medium occ-blue-dark mb-3 flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Role Permissions
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {permissions[selectedUser.role]?.map((permission) => (
                      <div key={permission} className="flex items-center p-2 sm:p-3 bg-occ-secondary-gray rounded-lg">
                        <ShieldCheck className="w-4 h-4 occ-blue mr-2 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-occ-blue-dark capitalize">
                          {permission.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="mb-6">
                  <label className="block text-sm font-medium occ-blue-dark mb-3 flex items-center">
                    <Bell className="w-4 h-4 mr-2" />
                    Notification Preferences
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {Object.entries(selectedUser.notifications).map(([type, enabled]) => (
                      <label key={type} className="flex items-center p-3 sm:p-4 bg-occ-secondary-gray rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-occ-blue">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => toggleNotification(type)}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-occ-blue border-2 border-gray-300 rounded focus:ring-occ-blue focus:ring-2"
                        />
                        <span className="ml-2 sm:ml-3 text-xs sm:text-sm font-medium text-occ-blue-dark capitalize">
                          {type === 'inApp' ? 'In-App' : type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* AI Explainability */}
                <div className="p-3 sm:p-4 bg-occ-secondary-gray rounded-lg border-2 border-occ-secondary-gray">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Settings className="w-4 h-4 sm:w-5 sm:h-5 occ-blue" />
                      <div>
                        <span className="text-xs sm:text-sm font-semibold text-occ-blue-dark">AI Explainability</span>
                        <p className="text-xs text-occ-gray mt-1 hidden sm:block">Enable detailed AI decision explanations</p>
                      </div>
                    </div>
                    <button
                      onClick={toggleAIExplainability}
                      className={`relative inline-flex h-6 w-12 sm:h-7 sm:w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-occ-blue focus:ring-offset-2 ${
                        selectedUser.aiExplainability ? 'bg-occ-blue' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                          selectedUser.aiExplainability ? 'translate-x-6 sm:translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Access Control & Stats */}
            <div className="lg:col-span-1 space-y-4 md:space-y-6">
              {/* Quick Stats */}
              <div className="bg-occ-secondary-white rounded-xl shadow-lg border-2 border-occ-secondary-gray p-4 sm:p-6">
                <h3 className="text-lg font-semibold occ-blue-dark mb-3 sm:mb-4 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  System Overview
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-occ-secondary-gray rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm occ-gray">Total Users</span>
                      <span className="text-xl sm:text-2xl font-bold occ-blue-dark">{totalUsers}</span>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 bg-occ-secondary-gray rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm occ-gray">Active Users</span>
                      <span className="text-xl sm:text-2xl font-bold occ-blue">{activeUsers}</span>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 bg-occ-secondary-gray rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm occ-gray">Departments</span>
                      <span className="text-xl sm:text-2xl font-bold occ-secondary-orange">4</span>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 bg-occ-secondary-gray rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm occ-gray">Roles</span>
                      <span className="text-xl sm:text-2xl font-bold occ-yellow">{roles.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Access Control Panel */}
              <div className="bg-occ-secondary-white rounded-xl shadow-lg border-2 border-occ-secondary-gray p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold occ-blue-dark flex items-center">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Team Members
                  </h3>
                  <button
                    onClick={() => setShowRoleModal(true)}
                    className="text-xs font-medium occ-blue hover:occ-blue-dark"
                  >
                    Bulk Assign
                  </button>
                </div>
                
                {/* User List */}
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 max-h-60 overflow-y-auto pr-1">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 sm:p-3 bg-occ-secondary-gray rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-occ-blue rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-semibold text-occ-blue-dark truncate">{user.name}</div>
                          <div className="text-xs text-occ-gray truncate">{user.role}</div>
                        </div>
                        {user.status === 'active' ? (
                          <span className="w-2 h-2 bg-green-500 rounded-full ml-2 mr-2 flex-shrink-0"></span>
                        ) : (
                          <span className="w-2 h-2 bg-gray-400 rounded-full ml-2 mr-2 flex-shrink-0"></span>
                        )}
                      </div>
                      <button 
                        onClick={() => removeUser(user.id)}
                        className="text-occ-gray hover:text-red-600 transition-colors p-1 sm:p-2 flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="space-y-2 sm:space-y-3">
                  <button 
                    onClick={() => setShowAddUserModal(true)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-occ-blue text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-occ-blue-dark focus:outline-none focus:ring-2 focus:ring-occ-blue focus:ring-offset-2 transition-all shadow-md"
                  >
                    Add New User
                  </button>
                  <button 
                    onClick={() => setShowRoleModal(true)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-occ-blue occ-blue text-xs sm:text-sm font-semibold rounded-lg hover:bg-occ-blue hover:text-white focus:outline-none focus:ring-2 focus:ring-occ-blue focus:ring-offset-2 transition-all"
                  >
                    Manage Permissions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 my-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-occ-blue-dark flex items-center">
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Add New User
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-occ-gray hover:text-occ-blue-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-occ-blue-dark mb-1 sm:mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-occ-secondary-gray rounded-lg focus:ring-2 focus:ring-occ-blue focus:border-occ-blue text-sm"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-occ-blue-dark mb-1 sm:mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-occ-secondary-gray rounded-lg focus:ring-2 focus:ring-occ-blue focus:border-occ-blue text-sm"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-occ-blue-dark mb-1 sm:mb-2">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-occ-secondary-gray rounded-lg focus:ring-2 focus:ring-occ-blue focus:border-occ-blue text-sm"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-occ-blue-dark mb-1 sm:mb-2">
                  Department
                </label>
                <select
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-occ-secondary-gray rounded-lg focus:ring-2 focus:ring-occ-blue focus:border-occ-blue text-sm"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="bg-occ-secondary-gray rounded-lg p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-medium text-occ-blue-dark mb-2">Role Permissions</h4>
                <div className="space-y-1 sm:space-y-2 max-h-24 sm:max-h-32 overflow-y-auto pr-1">
                  {permissions[newUser.role]?.map((permission) => (
                    <div key={permission} className="flex items-center text-xs">
                      <ShieldCheck className="w-3 h-3 occ-blue mr-2 flex-shrink-0" />
                      <span className="text-occ-gray capitalize">{permission.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5 sm:mt-6">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-2 border-2 border-occ-gray text-occ-gray rounded-lg hover:bg-gray-50 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={addUser}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-occ-blue text-white rounded-lg hover:bg-occ-blue-dark transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl sm:max-w-3xl w-full p-4 sm:p-6 my-8 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6 sticky top-0 bg-white z-10 pb-2">
              <h3 className="text-lg sm:text-xl font-semibold text-occ-blue-dark flex items-center">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Manage Roles & Permissions
              </h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-occ-gray hover:text-occ-blue-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Role Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {roles.map((role) => (
                <div key={role} className="border-2 border-occ-secondary-gray rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h4 className="font-semibold text-occ-blue-dark text-sm sm:text-base">{role}</h4>
                    <span className="px-2 py-1 bg-occ-blue text-white text-xs rounded-full">
                      {users.filter(u => u.role === role).length + (selectedUser.role === role ? 1 : 0)} users
                    </span>
                  </div>
                  <div className="space-y-1 sm:space-y-2 max-h-32 overflow-y-auto pr-1">
                    {permissions[role]?.map((permission) => (
                      <div key={permission} className="flex items-center text-xs">
                        <ShieldCheck className="w-3 h-3 occ-blue mr-2 flex-shrink-0" />
                        <span className="text-occ-gray capitalize">{permission.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bulk Role Assignment */}
            <div className="border-t-2 border-occ-secondary-gray pt-4 sm:pt-6">
              <h4 className="font-semibold text-occ-blue-dark mb-3 sm:mb-4 text-sm sm:text-base">Bulk Role Assignment</h4>
              <div className="space-y-2 sm:space-y-3 max-h-60 overflow-y-auto pr-1">
                {[selectedUser, ...users].map((user) => (
                  <div key={user.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-occ-secondary-gray rounded-lg">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-occ-blue text-white rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                        <span className="text-xs sm:text-sm font-medium">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-semibold text-occ-blue-dark truncate">{user.name}</div>
                        <div className="text-xs text-occ-gray truncate">{user.email}</div>
                      </div>
                    </div>
                    <select
                      value={user.role}
                      onChange={(e) => {
                        if (user.id === selectedUser.id) {
                          setSelectedUser({ ...selectedUser, role: e.target.value });
                        } else {
                          setUsers(users.map(u => 
                            u.id === user.id ? { ...u, role: e.target.value } : u
                          ));
                        }
                      }}
                      className="w-full sm:w-auto px-2 py-1 sm:px-3 sm:py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-occ-blue focus:border-occ-blue text-xs sm:text-sm"
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-5 sm:mt-6 sticky bottom-0 bg-white pt-2">
              <button
                onClick={() => setShowRoleModal(false)}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-2 border-2 border-occ-gray text-occ-gray rounded-lg hover:bg-gray-50 transition-all text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Save role changes
                  setShowRoleModal(false);
                }}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-occ-blue text-white rounded-lg hover:bg-occ-blue-dark transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default UserManagement;