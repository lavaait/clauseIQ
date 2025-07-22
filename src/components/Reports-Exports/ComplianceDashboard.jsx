import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Download, FileText, BarChart3 } from 'lucide-react';
import MainLayout from '../Mainlayout/MainLayout';
import '../occ-colors.css';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ComplianceDashboard = () => {
  // State for loading and notifications
  const [loadingStates, setLoadingStates] = useState({});
  const [notification, setNotification] = useState(null);

  // Sample data for the chart
  const chartData = [
    { month: 'Apr', FAR: 45, DFARS: 40 },
    { month: 'Jun', FAR: 68, DFARS: 65 },
    { month: 'Jul', FAR: 78, DFARS: 82 },
    { month: 'Aug', FAR: 85, DFARS: 75 },
    { month: 'Sep', FAR: 62, DFARS: 42 }
  ];

  // Sample compliance data
  const complianceData = {
    farCompliance: 88,
    dfarsCompliance: 82,
    totalContracts: 45,
    nonCompliant: 12,
    pendingReview: 8,
    fullyCompliant: 25,
    monthlyTrend: chartData
  };

  // PDF Export Function
  const exportToPDF = (reportType) => {
    return new Promise((resolve, reject) => {
      try {
        const pdf = new jsPDF();
        const currentDate = new Date().toLocaleDateString();
        const isQuarterly = reportType.includes('Quarterly');
        
        // Set font
        pdf.setFont('helvetica');
        
        // Title
        pdf.setFontSize(18);
        pdf.setTextColor(0, 90, 202); // OCC Blue
        pdf.text(`COMPLIANCE DASHBOARD - ${reportType.toUpperCase()}`, 20, 20);
        
        // Date
        pdf.setFontSize(10);
        pdf.setTextColor(152, 153, 155); // OCC Gray
        pdf.text(`Generated on: ${currentDate}`, 20, 30);
        
        // Executive Summary
        pdf.setFontSize(14);
        pdf.setTextColor(0, 29, 79); // OCC Blue Dark
        pdf.text('EXECUTIVE SUMMARY', 20, 50);
        
        // Draw line
        pdf.setDrawColor(0, 90, 202);
        pdf.line(20, 55, 190, 55);
        
        // Compliance data
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        let yPos = 70;
        
        const summaryData = [
          `FAR Compliance Rate: ${complianceData.farCompliance}%`,
          `DFARS Compliance Rate: ${complianceData.dfarsCompliance}%`,
          `Total Contracts: ${complianceData.totalContracts}`,
          `Non-Compliant Contracts: ${complianceData.nonCompliant}`,
          `Pending Review: ${complianceData.pendingReview}`,
          `Fully Compliant: ${complianceData.fullyCompliant}`
        ];
        
        summaryData.forEach((item) => {
          pdf.text(item, 20, yPos);
          yPos += 10;
        });
        
        // Monthly Trend Section
        yPos += 10;
        pdf.setFontSize(14);
        pdf.setTextColor(0, 29, 79);
        pdf.text(`${isQuarterly ? 'QUARTERLY' : 'MONTHLY'} COMPLIANCE TREND`, 20, yPos);
        
        pdf.setDrawColor(0, 90, 202);
        pdf.line(20, yPos + 5, 190, yPos + 5);
        
        yPos += 20;
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        
        chartData.forEach((item) => {
          pdf.text(`${item.month}: FAR ${item.FAR}%, DFARS ${item.DFARS}%`, 20, yPos);
          yPos += 8;
        });
        
        // Analysis Section
        yPos += 15;
        pdf.setFontSize(14);
        pdf.setTextColor(0, 29, 79);
        pdf.text('ANALYSIS & RECOMMENDATIONS', 20, yPos);
        
        pdf.setDrawColor(0, 90, 202);
        pdf.line(20, yPos + 5, 190, yPos + 5);
        
        yPos += 20;
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        
        const analysisText = [
          `• Current FAR compliance rate of ${complianceData.farCompliance}% ${complianceData.farCompliance >= 85 ? 'meets' : 'does not meet'} target standards`,
          `• DFARS compliance rate of ${complianceData.dfarsCompliance}% ${complianceData.dfarsCompliance >= 85 ? 'meets' : 'requires improvement to meet'} target standards`,
          `• ${complianceData.nonCompliant} contracts require immediate attention`,
          `• ${complianceData.pendingReview} contracts are pending compliance review`
        ];
        
        analysisText.forEach((text) => {
          const lines = pdf.splitTextToSize(text, 170);
          lines.forEach((line) => {
            pdf.text(line, 20, yPos);
            yPos += 6;
          });
          yPos += 2;
        });
        
        // Actions Required
        yPos += 10;
        pdf.setFontSize(14);
        pdf.setTextColor(0, 29, 79);
        pdf.text('COMPLIANCE ACTIONS REQUIRED', 20, yPos);
        
        pdf.setDrawColor(0, 90, 202);
        pdf.line(20, yPos + 5, 190, yPos + 5);
        
        yPos += 20;
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        
        const actions = [
          `1. Review and remediate ${complianceData.nonCompliant} non-compliant contracts`,
          `2. Complete compliance assessment for ${complianceData.pendingReview} pending contracts`,
          `3. Maintain monitoring of ${complianceData.fullyCompliant} compliant contracts`,
          '4. Implement corrective measures for compliance gaps'
        ];
        
        actions.forEach((action) => {
          const lines = pdf.splitTextToSize(action, 170);
          lines.forEach((line) => {
            pdf.text(line, 20, yPos);
            yPos += 6;
          });
          yPos += 2;
        });
        
        // Save the PDF
        const fileName = `${reportType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        
        resolve(`${reportType} PDF downloaded successfully`);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Excel Export Function
  const exportToExcel = () => {
    return new Promise((resolve, reject) => {
      try {
        // Create a new workbook
        const workbook = XLSX.utils.book_new();
        
        // Compliance Summary Sheet
        const summaryData = [
          ['Compliance Dashboard Summary', '', '', ''],
          ['Generated on:', new Date().toLocaleDateString(), '', ''],
          ['', '', '', ''],
          ['Metric', 'Value', 'Status', 'Target'],
          ['FAR Compliance', `${complianceData.farCompliance}%`, complianceData.farCompliance >= 85 ? 'Meeting Target' : 'Below Target', '85%'],
          ['DFARS Compliance', `${complianceData.dfarsCompliance}%`, complianceData.dfarsCompliance >= 85 ? 'Meeting Target' : 'Below Target', '85%'],
          ['Total Contracts', complianceData.totalContracts, '', ''],
          ['Non-Compliant', complianceData.nonCompliant, '', ''],
          ['Pending Review', complianceData.pendingReview, '', ''],
          ['Fully Compliant', complianceData.fullyCompliant, '', '']
        ];
        
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        
        // Set column widths
        summarySheet['!cols'] = [
          { width: 20 },
          { width: 15 },
          { width: 20 },
          { width: 10 }
        ];
        
        // Monthly Trend Sheet
        const trendData = [
          ['Monthly Compliance Trend', '', '', ''],
          ['', '', '', ''],
          ['Month', 'FAR Compliance (%)', 'DFARS Compliance (%)', 'Variance'],
          ...chartData.map(item => [
            item.month,
            item.FAR,
            item.DFARS,
            Math.abs(item.FAR - item.DFARS)
          ])
        ];
        
        const trendSheet = XLSX.utils.aoa_to_sheet(trendData);
        
        // Set column widths
        trendSheet['!cols'] = [
          { width: 10 },
          { width: 20 },
          { width: 20 },
          { width: 12 }
        ];
        
        // Add sheets to workbook
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Compliance Summary');
        XLSX.utils.book_append_sheet(workbook, trendSheet, 'Monthly Trend');
        
        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        // Save file
        const fileName = `Compliance_Data_${new Date().toISOString().split('T')[0]}.xlsx`;
        saveAs(blob, fileName);
        
        resolve('Excel file downloaded successfully');
      } catch (error) {
        reject(error);
      }
    });
  };

  // Show notification function
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Enhanced Export Handler with React state management
  const handleExport = async (reportType, format) => {
    const buttonKey = `${reportType}-${format}`;
    
    // Set loading state
    setLoadingStates(prev => ({ ...prev, [buttonKey]: true }));

    try {
      let result;
      if (format === 'PDF') {
        result = await exportToPDF(reportType);
      } else if (format === 'Excel') {
        result = await exportToExcel();
      }
      
      showNotification(`${reportType} ${format} exported successfully!`, 'success');
      console.log(result);
    } catch (error) {
      console.error('Export error:', error);
      showNotification(`Error exporting ${reportType}. Please try again.`, 'error');
    } finally {
      // Remove loading state
      setLoadingStates(prev => ({ ...prev, [buttonKey]: false }));
    }
  };

  // Button component with loading state
  const ExportButton = ({ reportType, format, className, children }) => {
    const buttonKey = `${reportType}-${format}`;
    const isLoading = loadingStates[buttonKey];

    return (
      <button 
        onClick={() => handleExport(reportType, format)}
        disabled={isLoading}
        className={`${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Exporting...</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  };

  return (
    <MainLayout title='Compliance Summary'>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="min-h-screen">
        <div className="bg-occ-blue-gradient rounded-xl p-6 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-occ-secondary-white rounded-lg">
                <BarChart3 className="w-8 h-8 occ-blue" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold occ-secondary-white">Compliance Dashboard</h1>
                <p className="occ-secondary-gray text-sm sm:text-base mt-1">FAR/DFARS compliance rates across contracts</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 -mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Metrics and Reports */}
            <div className="lg:col-span-1 space-y-6">
              {/* FAR Compliance Card */}
              <div className="bg-occ-secondary-white rounded-xl shadow-lg p-6 border-l-4 border-occ-blue hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold occ-gray uppercase tracking-wide">FAR Compliance</h3>
                  <div className="w-3 h-3 rounded-full bg-occ-blue"></div>
                </div>
                <div className="text-4xl font-bold occ-blue mb-2">{complianceData.farCompliance}%</div>
                <div className="text-xs occ-secondary-orange">+5% from last month</div>
              </div>

              {/* DFARS Compliance Card */}
              <div className="bg-occ-secondary-white rounded-xl shadow-lg p-6 border-l-4 border-occ-secondary-blue hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold occ-gray uppercase tracking-wide">DFARS Compliance</h3>
                  <div className="w-3 h-3 rounded-full bg-occ-secondary-blue"></div>
                </div>
                <div className="text-4xl font-bold occ-secondary-blue mb-2">{complianceData.dfarsCompliance}%</div>
                <div className="text-xs occ-secondary-orange">+2% from last month</div>
              </div>

              {/* Export Reports Section */}
              <div className="bg-occ-secondary-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-bold occ-blue-dark mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Export Reports
                </h3>
                
                {/* Monthly Report */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-occ-secondary-gray gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-occ-blue"></div>
                    <span className="occ-blue-dark font-medium">Monthly Report</span>
                  </div>
                  <ExportButton 
                    reportType="Monthly Report" 
                    format="PDF"
                    className="flex items-center justify-center space-x-2 px-4 py-2 text-sm bg-occ-secondary-orange text-white rounded-lg hover:bg-opacity-90 transition-colors shadow-md w-full sm:w-auto"
                  >
                    <Download className="w-4 h-4" />
                    <span>PDF</span>
                  </ExportButton>
                </div>

                {/* Quarterly Report */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-occ-secondary-gray gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-occ-secondary-blue"></div>
                    <span className="occ-blue-dark font-medium">Quarterly Report</span>
                  </div>
                  <ExportButton 
                    reportType="Quarterly Report" 
                    format="PDF"
                    className="flex items-center justify-center space-x-2 px-4 py-2 text-sm bg-occ-secondary-orange text-white rounded-lg hover:bg-opacity-90 transition-colors shadow-md w-full sm:w-auto"
                  >
                    <Download className="w-4 h-4" />
                    <span>PDF</span>
                  </ExportButton>
                </div>

                {/* Download Format */}
                <div className="pt-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-2 h-2 rounded-full bg-occ-yellow"></div>
                    <span className="occ-blue-dark font-medium">Download Format</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <ExportButton 
                      reportType="Data Export" 
                      format="PDF"
                      className="flex items-center justify-center space-x-2 px-4 py-2 text-sm bg-occ-secondary-orange text-white rounded-lg hover:bg-opacity-90 transition-colors shadow-md flex-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </ExportButton>
                    <ExportButton 
                      reportType="Data Export" 
                      format="Excel"
                      className="flex items-center justify-center space-x-2 px-4 py-2 text-sm bg-occ-blue text-white rounded-lg hover:bg-occ-blue-dark transition-colors shadow-md flex-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Excel</span>
                    </ExportButton>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Chart */}
            <div className="lg:col-span-3">
              <div className="bg-occ-secondary-white rounded-xl shadow-lg p-6 sm:p-8 h-full hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
                  <h3 className="text-xl font-bold occ-blue-dark mb-2 sm:mb-0">Monthly Compliance Trend</h3>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-occ-blue shadow-sm"></div>
                      <span className="text-sm occ-gray font-medium">FAR Compliance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-occ-secondary-blue shadow-sm"></div>
                      <span className="text-sm occ-gray font-medium">DFARS Compliance</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-80 sm:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#98999B' }}
                        className="occ-gray"
                      />
                      <YAxis 
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#98999B' }}
                        tickFormatter={(value) => `${value}%`}
                        className="occ-gray"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="FAR" 
                        stroke="#005ACA" 
                        strokeWidth={4}
                        dot={{ fill: '#005ACA', strokeWidth: 3, r: 5 }}
                        activeDot={{ r: 7, stroke: '#005ACA', strokeWidth: 3, fill: '#FFFFFF' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="DFARS" 
                        stroke="#0072C6" 
                        strokeWidth={4}
                        dot={{ fill: '#0072C6', strokeWidth: 3, r: 5 }}
                        activeDot={{ r: 7, stroke: '#0072C6', strokeWidth: 3, fill: '#FFFFFF' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-occ-secondary-gray">
                  <div className="text-center">
                    <div className="text-2xl font-bold occ-blue">{complianceData.totalContracts}</div>
                    <div className="text-xs occ-gray uppercase tracking-wide">Total Contracts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold occ-secondary-blue">{complianceData.nonCompliant}</div>
                    <div className="text-xs occ-gray uppercase tracking-wide">Non-Compliant</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold occ-secondary-orange">{complianceData.pendingReview}</div>
                    <div className="text-xs occ-gray uppercase tracking-wide">Pending Review</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold occ-yellow">{complianceData.fullyCompliant}</div>
                    <div className="text-xs occ-gray uppercase tracking-wide">Fully Compliant</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ComplianceDashboard;