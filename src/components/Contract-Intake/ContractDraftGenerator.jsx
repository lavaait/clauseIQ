import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, Eye, Download, Bold, Italic, Underline, 
  AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Check, 
  FileDown, Loader, Calendar, Building2, Layout, Sparkles, 
  ChevronDown, Bot, Wand2, PenTool, AlertCircle, CheckCircle2,
  ScrollText, FileCode, MessageCircle, X
} from 'lucide-react';
import MainLayout from '../Mainlayout/MainLayout';
import '../occ-colors.css';

// Get API base URL from environment variable
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


// Hardcoded form options (removed API dependency)
const CONTRACT_TYPES = ["Non-Disclosure Agreement"];
const TEMPLATES = { 
  "Non-Disclosure Agreement": ["NDA Template - Standard"] 
};
const AGENCIES = ["Department of Commerce"];

const ContractDraftGenerator = () => {
  // Initialize formData with hardcoded default values
  const [formData, setFormData] = useState({
    contractType: CONTRACT_TYPES[0],
    template: TEMPLATES[CONTRACT_TYPES[0]][0],
    agency: AGENCIES[0],
    effectiveDate: new Date().toISOString().split('T')[0],
    purpose: ''
  });

  const [generatedDraft, setGeneratedDraft] = useState('');
  const [currentDraftId, setCurrentDraftId] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [showMobileEditor, setShowMobileEditor] = useState(false);
  const [showToast, setShowToast] = useState({ show: false, message: '', type: '' });
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    unorderedList: false,
    orderedList: false
  });
  
  const editorRef = useRef(null);

  // Update active formats based on current selection
  useEffect(() => {
    const updateFormats = () => {
      if (document.queryCommandSupported && editorRef.current) {
        try {
          setActiveFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            alignLeft: document.queryCommandState('justifyLeft'),
            alignCenter: document.queryCommandState('justifyCenter'),
            alignRight: document.queryCommandState('justifyRight'),
            unorderedList: document.queryCommandState('insertUnorderedList'),
            orderedList: document.queryCommandState('insertOrderedList')
          });
        } catch (error) {
          console.warn('Error updating format states:', error);
        }
      }
    };

    const handleSelectionChange = () => {
      updateFormats();
    };

    // Add event listeners
    document.addEventListener('selectionchange', handleSelectionChange);
    
    if (editorRef.current) {
      editorRef.current.addEventListener('keyup', updateFormats);
      editorRef.current.addEventListener('mouseup', updateFormats);
      editorRef.current.addEventListener('focus', updateFormats);
    }

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      if (editorRef.current) {
        editorRef.current.removeEventListener('keyup', updateFormats);
        editorRef.current.removeEventListener('mouseup', updateFormats);
        editorRef.current.removeEventListener('focus', updateFormats);
      }
    };
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Update available templates when contract type changes
    if (field === 'contractType') {
      const availableTemplates = TEMPLATES[value] || [];
      if (availableTemplates.length > 0) {
        setFormData(prev => ({ ...prev, template: availableTemplates[0] }));
      }
    }
  };

  const generateDraft = async () => {
    // Validate required fields
    if (!formData.contractType || !formData.template || !formData.agency || !formData.effectiveDate || !formData.purpose.trim()) {
      showNotification('Please fill in all required fields including the purpose.', 'error');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Use template name directly as per API example
      const templateName = formData.template;
      
      // Prepare form data as application/x-www-form-urlencoded
      const formDataToSend = new URLSearchParams();
      formDataToSend.append('contract_type', formData.contractType);
      formDataToSend.append('template', templateName);
      formDataToSend.append('agency', formData.agency);
      formDataToSend.append('effective_date', formData.effectiveDate);
      formDataToSend.append('purpose', formData.purpose);

      console.log('Submitting form data:', {
        contract_type: formData.contractType,
        template: templateName,
        agency: formData.agency,
        effective_date: formData.effectiveDate,
        purpose: formData.purpose
      });

      const response = await fetch(`${API_BASE_URL}/api/ai_draft/generator/contracts/ai-draft/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'accept': 'application/json',
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('API Response:', responseData);
      
      // Extract data from the API response
      const draftContent = responseData.draft || 'No draft content received';
      const draftId = responseData.draft_id;
      const downloadUrlPath = responseData.download_url;
      const llmClause = responseData.llm_clause;
      const category = responseData.category;
      
      if (!draftId) {
        throw new Error('No draft ID received from API');
      }
      
      // Store the actual draft ID and download URL from API
      setCurrentDraftId(draftId);
      setDownloadUrl(downloadUrlPath);
      setGeneratedDraft(draftContent);
      
      // Convert line breaks to HTML for display
      const htmlContent = draftContent
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^(.*)$/gm, '<p>$1</p>')
        .replace(/<p><\/p>/g, '')
        .replace(/<p><br><\/p>/g, '<br>');
      
      // Update editor content
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlContent;
      }
      
      showNotification('Draft generated successfully!', 'success');
      
      // On mobile/tablet, show editor after generation
      if (window.innerWidth < 1280) {
        setShowMobileEditor(true);
      }
      
    } catch (error) {
      console.error('Error generating draft:', error);
      showNotification(error.message || 'Failed to generate draft. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const updateDraftFromEditor = () => {
    if (editorRef.current) {
      // Convert HTML back to plain text for storage
      const text = editorRef.current.innerText || editorRef.current.textContent || '';
      setGeneratedDraft(text);
    }
  };

  const showNotification = (message, type) => {
    setShowToast({ show: true, message, type });
    setTimeout(() => setShowToast({ show: false, message: '', type: '' }), 3000);
  };

  const applyFormatting = (command, value = null) => {
    if (!editorRef.current) return;
    
    // Focus the editor first
    editorRef.current.focus();
    
    try {
      // Special handling for list commands
      if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
        // Check if we're already in a list
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const parentElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
            ? range.commonAncestorContainer.parentElement 
            : range.commonAncestorContainer;
          
          // Check if we're already in a list
          const existingList = parentElement.closest('ul, ol');
          
          if (existingList) {
            // If we're in a list, remove the list formatting
            document.execCommand(command, false, null);
          } else {
            // If we're not in a list, create one
            document.execCommand(command, false, null);
          }
        } else {
          // No selection, just execute the command
          document.execCommand(command, false, null);
        }
      } else {
        // Execute other formatting commands normally
        document.execCommand(command, false, value);
      }
      
      // Update the draft content
      updateDraftFromEditor();
      
      // Update format states after a short delay
      setTimeout(() => {
        if (document.queryCommandSupported && editorRef.current) {
          try {
            setActiveFormats({
              bold: document.queryCommandState('bold'),
              italic: document.queryCommandState('italic'),
              underline: document.queryCommandState('underline'),
              alignLeft: document.queryCommandState('justifyLeft'),
              alignCenter: document.queryCommandState('justifyCenter'),
              alignRight: document.queryCommandState('justifyRight'),
              unorderedList: document.queryCommandState('insertUnorderedList'),
              orderedList: document.queryCommandState('insertOrderedList')
            });
          } catch (error) {
            console.warn('Error updating format states after command:', error);
          }
        }
      }, 100);
      
      showNotification(`Formatting applied`, 'success');
    } catch (error) {
      console.warn('Command not supported:', command, error);
      showNotification('Formatting not supported in this browser', 'error');
    }
  };

  const downloadDraft = async (format) => {
    const filename = `${formData.contractType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
    
    try {
      switch (format) {
        case 'txt':
          downloadTextFile(generatedDraft, `${filename}.txt`);
          break;
        case 'docx':
          downloadDocxFile(generatedDraft, `${filename}.docx`);
          break;
        case 'pdf':
          await downloadPdfFromAPI(`${filename}.pdf`);
          break;
      }
      
      setIsDownloadModalOpen(false);
      showNotification(`Document downloaded as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      console.error('Download error:', error);
      showNotification('Download failed: ' + error.message, 'error');
    }
  };

  const downloadPdfFromAPI = async (filename) => {
    setIsDownloading(true);
    
    try {
      if (!currentDraftId) {
        throw new Error('No draft ID available. Please generate a draft first.');
      }

      showNotification('Downloading PDF...', 'info');
      
      // Use the new PDF endpoint
      const response = await fetch(`${API_BASE_URL}/api/ai_draft/generator/contracts/pdf/${currentDraftId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Draft not found. Please try generating the draft again.');
        }
        throw new Error(`Failed to download PDF: ${response.status} ${response.statusText}`);
      }

      // Check if response is actually a PDF
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/pdf')) {
        // Handle PDF response
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        throw new Error('Invalid response format. Expected PDF file.');
      }
      
    } catch (error) {
      console.error('PDF download error:', error);
      throw error;
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadTextFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadDocxFile = (content, filename) => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${formData.contractType}</title></head>
      <body style='font-family: Arial, sans-serif; line-height: 1.6;'>
        ${editorRef.current ? editorRef.current.innerHTML : content.split('\n').map(line => `<p>${line || '&nbsp;'}</p>`).join('')}
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get available templates for current contract type using hardcoded values
  const availableTemplates = TEMPLATES[formData.contractType] || [];

  return (
    <div className="min-h-screen bg-occ-secondary-white">
      {/* Container with better responsive padding */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10">
        
        {/* Enhanced Header - With AI Badge */}
        <div className="bg-occ-blue-gradient rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-lg mb-3 sm:mb-4 md:mb-6 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
          
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between relative z-10">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                  <Bot className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 flex-shrink-0" />
                  <span className="truncate">AI-Assisted Draft Generator</span>
                </h1>
                <span className="px-2 py-1 bg-occ-yellow text-occ-blue-dark text-xs font-bold rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI-Powered
                </span>
              </div>
              <p className="text-white mt-1 sm:mt-2 opacity-90 text-xs sm:text-sm md:text-base flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Create professional contracts with intelligent assistance
              </p>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              {currentDraftId && (
                <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg flex items-center gap-2 text-xs sm:text-sm font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Draft Generated</span>
                  <span className="sm:hidden">Generated</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Toggle Buttons */}
        <div className="xl:hidden mb-4 md:mb-6 flex gap-2">
          <button
            onClick={() => setShowMobileEditor(false)}
            className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-lg md:rounded-xl font-medium transition-all text-sm sm:text-base ${
              !showMobileEditor 
                ? 'bg-occ-blue text-occ-secondary-white shadow-lg' 
                : 'bg-occ-secondary-gray text-occ-blue-dark hover:bg-gray-200'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              Form
            </span>
          </button>
          <button
            onClick={() => setShowMobileEditor(true)}
            className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-lg md:rounded-xl font-medium transition-all text-sm sm:text-base ${
              showMobileEditor 
                ? 'bg-occ-blue text-occ-secondary-white shadow-lg' 
                : 'bg-occ-secondary-gray text-occ-blue-dark hover:bg-gray-200'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <PenTool className="h-4 w-4 sm:h-5 sm:w-5" />
              Editor
            </span>
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 lg:gap-8 xl:gap-10 2xl:gap-12">
          
          {/* Left Panel - Form Section */}
          <div className={`space-y-4 md:space-y-6 xl:space-y-8 ${showMobileEditor ? 'hidden xl:block' : 'block'}`}>
            {/* Form Card */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-occ-blue-dark p-4 sm:p-5 md:p-6 lg:p-8 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white flex items-center gap-3 relative z-10">
                  <div className="w-3 h-3 bg-occ-yellow rounded-full animate-pulse"></div>
                  New Contract Draft
                  {currentDraftId && (
                    <span className="text-xs bg-occ-yellow text-occ-blue-dark px-2 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Generated
                    </span>
                  )}
                </h2>
              </div>
              
              <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-4 md:space-y-6">
                {/* Contract Type */}
                <div className="group">
                  <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                    <ScrollText className="w-4 h-4 text-occ-blue" />
                    Contract Type *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.contractType}
                      onChange={(e) => handleInputChange('contractType', e.target.value)}
                      disabled={isGenerating}
                      className="w-full p-3 sm:p-4 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed appearance-none pr-10"
                    >
                      {CONTRACT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Template */}
                <div className="group">
                  <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                    <Layout className="w-4 h-4 text-occ-blue" />
                    Template *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.template}
                      onChange={(e) => handleInputChange('template', e.target.value)}
                      disabled={isGenerating}
                      className="w-full p-3 sm:p-4 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed appearance-none pr-10"
                    >
                      {availableTemplates.map(template => (
                        <option key={template} value={template}>{template}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Agency */}
                <div className="group">
                  <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-occ-blue" />
                    Agency *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.agency}
                      onChange={(e) => handleInputChange('agency', e.target.value)}
                      disabled={isGenerating}
                      className="w-full p-3 sm:p-4 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed appearance-none pr-10"
                    >
                      {AGENCIES.map(agency => (
                        <option key={agency} value={agency}>{agency}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Effective Date */}
                <div className="group">
                  <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-occ-blue" />
                    Effective Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.effectiveDate}
                      onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                      disabled={isGenerating}
                      className="w-full p-3 sm:p-4 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Purpose - New Required Field */}
                <div className="group">
                  <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-occ-blue" />
                    Purpose *
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.purpose}
                      onChange={(e) => handleInputChange('purpose', e.target.value)}
                      disabled={isGenerating}
                      placeholder="Describe the purpose of this contract (e.g., To protect confidential business information exchanged during collaboration)"
                      rows={3}
                      className="w-full p-3 sm:p-4 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed resize-vertical"
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateDraft}
                  disabled={isGenerating || !formData.contractType || !formData.template || !formData.agency || !formData.effectiveDate || !formData.purpose.trim()}
                  className="w-full bg-occ-blue hover:bg-occ-blue-dark text-white font-semibold py-4 sm:py-5 px-6 sm:px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                      AI is generating your draft...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 group-hover:animate-pulse" />
                      Generate AI Draft
                    </>
                  )}
                </button>
                
                {/* Required fields note */}
                <p className="text-xs sm:text-sm text-gray-500 text-center">
                  * All fields are required to generate a draft
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel - Draft Editor */}
          <div className={`space-y-4 md:space-y-6 xl:space-y-8 ${!showMobileEditor ? 'hidden xl:block' : 'block'}`}>
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 overflow-hidden h-fit relative">
              
              {/* Editor Header */}
              <div className="bg-occ-blue p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white flex items-center gap-3">
                  <div className="w-3 h-3 bg-occ-yellow rounded-full animate-pulse"></div>
                  AI Generated Draft
                  <Bot className="w-5 h-5 opacity-70" />
                </h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsPreviewModalOpen(true)}
                    disabled={!generatedDraft || isGenerating}
                    className="p-2 sm:p-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation group"
                    title="Preview"
                  >
                    <Eye className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
                  </button>
                  <button 
                    onClick={() => setIsDownloadModalOpen(true)}
                    disabled={!generatedDraft || isGenerating || isDownloading}
                    className="p-2 sm:p-3 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation group"
                    title="Download"
                  >
                    {isDownloading ? (
                      <Loader className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                    ) : (
                      <Download className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
                    )}
                  </button>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="border-b border-gray-200 bg-gray-50 p-3 sm:p-4">
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  {/* Text Formatting */}
                  <div className="flex gap-1">
                    <button 
                      onClick={() => applyFormatting('bold')}
                      disabled={isGenerating || isDownloading}
                      className={`p-2 sm:p-3 rounded-lg transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed ${
                        activeFormats.bold 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-white text-gray-700 border border-gray-300'
                      }`}
                      title="Bold (Ctrl+B)"
                    >
                      <Bold className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button 
                      onClick={() => applyFormatting('italic')}
                      disabled={isGenerating || isDownloading}
                      className={`p-2 sm:p-3 rounded-lg transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed ${
                        activeFormats.italic 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-white text-gray-700 border border-gray-300'
                      }`}
                      title="Italic (Ctrl+I)"
                    >
                      <Italic className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button 
                      onClick={() => applyFormatting('underline')}
                      disabled={isGenerating || isDownloading}
                      className={`p-2 sm:p-3 rounded-lg transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed ${
                        activeFormats.underline 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-white text-gray-700 border border-gray-300'
                      }`}
                      title="Underline (Ctrl+U)"
                    >
                      <Underline className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                  
                  {/* Divider */}
                  <div className="w-px bg-gray-300 mx-2 h-6 sm:h-8"></div>
                  
                  {/* Alignment */}
                  <div className="flex gap-1">
                    <button 
                      onClick={() => applyFormatting('justifyLeft')}
                      disabled={isGenerating || isDownloading}
                      className={`p-2 sm:p-3 rounded-lg transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed ${
                        activeFormats.alignLeft 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-white text-gray-700 border border-gray-300'
                      }`}
                      title="Align Left"
                    >
                      <AlignLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button 
                      onClick={() => applyFormatting('justifyCenter')}
                      disabled={isGenerating || isDownloading}
                      className={`p-2 sm:p-3 rounded-lg transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed ${
                        activeFormats.alignCenter 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-white text-gray-700 border border-gray-300'
                      }`}
                      title="Align Center"
                    >
                      <AlignCenter className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button 
                      onClick={() => applyFormatting('justifyRight')}
                      disabled={isGenerating || isDownloading}
                      className={`p-2 sm:p-3 rounded-lg transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed ${
                        activeFormats.alignRight 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-white text-gray-700 border border-gray-300'
                      }`}
                      title="Align Right"
                    >
                      <AlignRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                  
                  {/* Divider */}
                  <div className="w-px bg-gray-300 mx-2 h-6 sm:h-8"></div>
                  
                  {/* Lists - Fixed Implementation */}
                  <div className="flex gap-1">
                    <button 
                      onClick={() => applyFormatting('insertUnorderedList')}
                      disabled={isGenerating || isDownloading}
                      className={`p-2 sm:p-3 rounded-lg transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed ${
                        activeFormats.unorderedList 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-white text-gray-700 border border-gray-300'
                      }`}
                      title="Bullet List"
                    >
                      <List className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button 
                      onClick={() => applyFormatting('insertOrderedList')}
                      disabled={isGenerating || isDownloading}
                      className={`p-2 sm:p-3 rounded-lg transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed ${
                        activeFormats.orderedList 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-white text-gray-700 border border-gray-300'
                      }`}
                      title="Numbered List"
                    >
                      <ListOrdered className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Rich Text Editor */}
              <div
                ref={editorRef}
                contentEditable={!isGenerating && !isDownloading}
                onInput={updateDraftFromEditor}
                className={`w-full p-4 sm:p-6 md:p-8 border-none resize-none focus:outline-none text-gray-900 leading-relaxed bg-white text-sm sm:text-base overflow-y-auto ${
                  isGenerating || isDownloading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{
                  minHeight: '300px',
                  maxHeight: '600px',
                  height: 'calc(100vh - 500px)',
                  fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'
                }}
                suppressContentEditableWarning={true}
                data-placeholder={
                  isGenerating ? "AI is generating your contract draft..." : 
                  isDownloading ? "Processing document..." :
                  "Your AI-generated contract draft will appear here. Fill in all required fields and click 'Generate AI Draft' to begin."
                }
              />

              {/* Loading overlay for editor */}
              {(isGenerating || isDownloading) && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-3">
                    <Bot className="h-12 w-12 text-blue-600 animate-bounce" />
                    <span className="text-gray-900 font-medium">
                      {isGenerating ? 'AI is crafting your draft...' : 'Processing document...'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-2 sm:p-4 md:p-6 z-50 touch-manipulation">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-occ-blue p-4 sm:p-6 md:p-8 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white flex items-center gap-2 sm:gap-3">
                <Eye className="h-5 w-5 sm:h-6 sm:w-6" />
                Contract Preview
              </h2>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-white hover:bg-blue-700 rounded-lg p-2 sm:p-3 transition-all duration-200 touch-manipulation"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            <div className="p-4 sm:p-6 md:p-8 max-h-[70vh] overflow-y-auto">
              <div className="prose prose-sm sm:prose-base max-w-none text-gray-900">
                <div dangerouslySetInnerHTML={{ __html: editorRef.current ? editorRef.current.innerHTML : generatedDraft.split('\n').map(line => `<p>${line || '&nbsp;'}</p>`).join('') }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-2 sm:p-4 md:p-6 z-50 touch-manipulation">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md">
            <div className="bg-occ-blue p-4 sm:p-6 md:p-8 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white flex items-center gap-2 sm:gap-3">
                <Download className="h-5 w-5 sm:h-6 sm:w-6" />
                Download Options
              </h2>
              <button
                onClick={() => setIsDownloadModalOpen(false)}
                className="text-white hover:bg-blue-700 rounded-lg p-2 sm:p-3 transition-all duration-200 touch-manipulation"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            <div className="p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4">
              <button
                onClick={() => downloadDraft('txt')}
                disabled={isDownloading}
                className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-gray-50 transition-all duration-200 touch-manipulation disabled:opacity-50 group"
              >
                <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Text Document</p>
                  <p className="text-xs sm:text-sm text-gray-500">.txt format</p>
                </div>
              </button>
              <button
                onClick={() => downloadDraft('docx')}
                disabled={isDownloading}
                className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-gray-50 transition-all duration-200 touch-manipulation disabled:opacity-50 group"
              >
                <FileCode className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Word Document</p>
                  <p className="text-xs sm:text-sm text-gray-500">.docx format</p>
                </div>
              </button>
              <button
                onClick={() => downloadDraft('pdf')}
                disabled={isDownloading || !currentDraftId}
                className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-gray-50 transition-all duration-200 touch-manipulation disabled:opacity-50 group"
              >
                <FileDown className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 group-hover:scale-110 transition-transform" />
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">PDF Document</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {currentDraftId ? '.pdf format' : 'Generate draft first'}
                  </p>
                </div>
                {isDownloading && (
                  <Loader className="h-4 w-4 animate-spin text-blue-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Toast Notification */}
      {showToast.show && (
        <div className={`fixed bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8 p-3 sm:p-4 md:p-6 rounded-lg shadow-lg text-white flex items-center gap-2 sm:gap-3 transform transition-all duration-300 z-50 text-sm sm:text-base max-w-xs sm:max-w-sm md:max-w-md ${
          showToast.type === 'success' ? 'bg-green-600' : 
          showToast.type === 'error' ? 'bg-red-600' : 
          'bg-blue-600'
        }`}>
          {showToast.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          ) : showToast.type === 'error' ? (
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          ) : (
            <Loader className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 animate-spin" />
          )}
          <span className="break-words">{showToast.message}</span>
        </div>
      )}
    </div>
  );
};

export default ContractDraftGenerator;