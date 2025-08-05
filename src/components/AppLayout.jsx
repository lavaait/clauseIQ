import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { routesConfig } from '../config/routes.config';
import MainLayout from './Mainlayout/MainLayout';
const AppLayout = () => {
  return (
    <Router basename="/occai">
      <Routes>
        {routesConfig.map((route, index) => (
          <Route
            key={route.path || index}
            path={route.path}
            element={
              <MainLayout title={route.title}>
                <route.component />
              </MainLayout>
            }
          />
        ))}
        
        {/* Catch all route for 404 */}
        <Route 
          path="*" 
          element={
            <MainLayout title="Page Not Found">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
                  <p className="text-gray-600">The page you're looking for doesn't exist.</p>
                  <button 
                    onClick={() => window.history.back()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </MainLayout>
          } 
        />
      </Routes>
    </Router>
  );
};

export default AppLayout;