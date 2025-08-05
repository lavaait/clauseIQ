import React, { useState, useEffect, useRef } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, List, MoreHorizontal,
  Type, Undo, Redo, Search, ZoomIn, FileText, Brain,
  Check, X, Menu, ChevronLeft, ChevronRight, Save,
  Download, Eye, Sparkles, Edit3, MessageSquare, Upload,
  Loader, AlertCircle, FileUp, AlignCenter, AlignRight, AlignJustify
} from 'lucide-react';
import '../occ-colors.css';

// Get API base URL from environment variable
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


const RedliningCoach = () => {
  const [contractText, setContractText] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [redlines, setRedlines] = useState([]);
  const [modifiedContract, setModifiedContract] = useState('');
  const [acceptedSuggestions, setAcceptedSuggestions] = useState(new Set());
  const [rejectedSuggestions, setRejectedSuggestions] = useState(new Set());
  const [showMobileToolbar, setShowMobileToolbar] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeView, setActiveView] = useState('document');
  const [isMobile, setIsMobile] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [isEditorMode, setIsEditorMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [textAlign, setTextAlign] = useState('left');
  const [fontSize, setFontSize] = useState('14');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textHistory, setTextHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const fileInputRef = useRef(null);
  const textEditorRef = useRef(null);
  const searchInputRef = useRef(null);

  // Sample contract text for demo
  const sampleContract = `CONFIDENTIALITY AGREEMENT

This Confidentiality Agreement (the "Agreement") is entered into as of March 25, 2024 (the "Effective Date") by and between 4ome Corporation, a Delaware corporation, with its principal offices located at 123 Elm St. Springfield, ("Company"), and Favor Inc., Delaware corporation, with its principal offices located at 500 Oak Ave. Columbus, and Favor Inc. a Delaware corporation, with its principal offices located at 500.

1. Term
The term of this agreement shall be for 5-years from the Effective Date.

2. Obligations
The Recipient agrees that, In applying reasonable efforts, it shall maintain and use the highest level of skill to safeguard Company's Proprietary Information.

1. Proprietary Information must be marked as "unreadable to third parties."

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Proprietary information must disclosed to third parties.`;

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize with sample contract
  useEffect(() => {
    setContractText(sampleContract);
    setDisplayText(sampleContract);
    addToHistory(sampleContract);
  }, []);

  // Text history management
  const addToHistory = (text) => {
    const newHistory = [...textHistory.slice(0, historyIndex + 1), text];
    setTextHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Update contract text with history
  const updateContractText = (newText) => {
    setContractText(newText);
    setDisplayText(newText);
    addToHistory(newText);
  };

  // Text formatting functions
  const formatText = (command) => {
    if (!isEditorMode || !textEditorRef.current) return;
    
    const textarea = textEditorRef.current;
    textarea.focus();
    
    // Use execCommand for rich text formatting
    switch (command) {
      case 'bold':
        setIsBold(!isBold);
        // For demonstration, we'll add markdown formatting
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = contractText.substring(start, end);
        
        if (selectedText) {
          const newText = contractText.substring(0, start) + 
                          `**${selectedText}**` + 
                          contractText.substring(end);
          updateContractText(newText);
          
          setTimeout(() => {
            textarea.setSelectionRange(start, start + selectedText.length + 4);
          }, 0);
        }
        break;
        
      case 'italic':
        setIsItalic(!isItalic);
        const startItalic = textarea.selectionStart;
        const endItalic = textarea.selectionEnd;
        const selectedTextItalic = contractText.substring(startItalic, endItalic);
        
        if (selectedTextItalic) {
          const newText = contractText.substring(0, startItalic) + 
                          `*${selectedTextItalic}*` + 
                          contractText.substring(endItalic);
          updateContractText(newText);
          
          setTimeout(() => {
            textarea.setSelectionRange(startItalic, startItalic + selectedTextItalic.length + 2);
          }, 0);
        }
        break;
        
      case 'underline':
        setIsUnderline(!isUnderline);
        const startUnderline = textarea.selectionStart;
        const endUnderline = textarea.selectionEnd;
        const selectedTextUnderline = contractText.substring(startUnderline, endUnderline);
        
        if (selectedTextUnderline) {
          const newText = contractText.substring(0, startUnderline) + 
                          `__${selectedTextUnderline}__` + 
                          contractText.substring(endUnderline);
          updateContractText(newText);
          
          setTimeout(() => {
            textarea.setSelectionRange(startUnderline, startUnderline + selectedTextUnderline.length + 4);
          }, 0);
        }
        break;
        
      case 'color':
        // Cycle through some colors
        const colors = ['#000000', '#FF0000', '#0000FF', '#008000', '#FFA500'];
        const currentIndex = colors.indexOf(textColor);
        const nextIndex = (currentIndex + 1) % colors.length;
        setTextColor(colors[nextIndex]);
        break;
    }
  };

  // Undo functionality
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContractText(textHistory[newIndex]);
      setDisplayText(textHistory[newIndex]);
    }
  };

  // Redo functionality
  const handleRedo = () => {
    if (historyIndex < textHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContractText(textHistory[newIndex]);
      setDisplayText(textHistory[newIndex]);
    }
  };

  // Insert list
  const insertList = () => {
    if (!isEditorMode || !textEditorRef.current) return;
    
    const textarea = textEditorRef.current;
    const start = textarea.selectionStart;
    const listItem = '\n• ';
    
    const newText = contractText.substring(0, start) + listItem + contractText.substring(start);
    updateContractText(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + listItem.length, start + listItem.length);
    }, 0);
  };

  // Search functionality
  const handleSearch = () => {
    if (!searchQuery) return;
    
    const regex = new RegExp(searchQuery, 'gi');
    let highlighted = contractText;
    
    if (isEditorMode) {
      // Highlight in textarea - focus on first match
      const firstMatch = contractText.search(regex);
      if (firstMatch !== -1 && textEditorRef.current) {
        textEditorRef.current.focus();
        textEditorRef.current.setSelectionRange(firstMatch, firstMatch + searchQuery.length);
      }
    } else {
      // Highlight in display mode
      highlighted = contractText.replace(regex, (match) => 
        `<mark class="bg-blue-200">${match}</mark>`
      );
      setDisplayText(highlighted);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setShowSearch(false);
    setDisplayText(contractText);
  };

  // Save functionality
  const handleSave = () => {
    // Save to localStorage
    const saveData = {
      contractText,
      redlines,
      acceptedSuggestions: Array.from(acceptedSuggestions),
      rejectedSuggestions: Array.from(rejectedSuggestions),
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('redlining_draft', JSON.stringify(saveData));
    
    // Show save confirmation (you could add a toast notification here)
    alert('Draft saved successfully!');
  };

  // Load saved draft
  const loadDraft = () => {
    const savedData = localStorage.getItem('redlining_draft');
    if (savedData) {
      const data = JSON.parse(savedData);
      setContractText(data.contractText);
      setDisplayText(data.contractText);
      setRedlines(data.redlines || []);
      setAcceptedSuggestions(new Set(data.acceptedSuggestions || []));
      setRejectedSuggestions(new Set(data.rejectedSuggestions || []));
    }
  };

  // Font size change
  const changeFontSize = () => {
    const sizes = ['12', '14', '16', '18', '20'];
    const currentIndex = sizes.indexOf(fontSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setFontSize(sizes[nextIndex]);
  };

  // Font family change
  const changeFontFamily = () => {
    const fonts = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];
    const currentIndex = fonts.indexOf(fontFamily);
    const nextIndex = (currentIndex + 1) % fonts.length;
    setFontFamily(fonts[nextIndex]);
  };

  // Analyze contract with API
  const analyzeContract = async () => {
    if (!contractText.trim()) {
      setError('Please enter contract text to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/redline_ai_router/api/redline-analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({
          contract_text: contractText
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Redline analysis results:', data);
      
      setRedlines(data.redlines || []);
      setModifiedContract(data.modified_contract_text || contractText);
      setIsEditorMode(false);
      
      // Apply highlights to display text
      applyHighlights(data.redlines || []);
      
    } catch (error) {
      console.error('Error analyzing contract:', error);
      setError(error.message || 'Failed to analyze contract. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Apply highlights to the display text
  const applyHighlights = (redlineResults) => {
    let highlightedText = contractText;
    
    // Sort redlines by position to avoid conflicts
    const sortedRedlines = [...redlineResults].sort((a, b) => {
      const aStart = a.highlight_span?.[0] || 0;
      const bStart = b.highlight_span?.[0] || 0;
      return bStart - aStart; // Sort in reverse order to maintain positions
    });

    sortedRedlines.forEach((redline, index) => {
      if (redline.highlight_span && redline.highlight_span.length >= 2) {
        const [start, end] = redline.highlight_span;
        const beforeText = highlightedText.substring(0, start);
        const highlightedPart = highlightedText.substring(start, end);
        const afterText = highlightedText.substring(end);
        
        highlightedText = `${beforeText}<mark data-redline-id="${index}" class="bg-yellow-200 cursor-pointer hover:bg-yellow-300">${highlightedPart}</mark>${afterText}`;
      }
    });

    setDisplayText(highlightedText);
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      updateContractText(text);
      setIsEditorMode(true);
    };
    reader.readAsText(file);
  };

  // Handle accept suggestion
  const handleAccept = (index) => {
    setAcceptedSuggestions(prev => new Set([...prev, index]));
    setRejectedSuggestions(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  // Handle reject suggestion
  const handleReject = (index) => {
    setRejectedSuggestions(prev => new Set([...prev, index]));
    setAcceptedSuggestions(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  // Accept all suggestions
  const acceptAll = () => {
    const allIndices = redlines.map((_, index) => index);
    setAcceptedSuggestions(new Set(allIndices));
    setRejectedSuggestions(new Set());
    
    // Apply modified contract text
    if (modifiedContract) {
      updateContractText(modifiedContract);
    }
  };

  // Reject all suggestions
  const rejectAll = () => {
    const allIndices = redlines.map((_, index) => index);
    setRejectedSuggestions(new Set(allIndices));
    setAcceptedSuggestions(new Set());
  };

  // Get active suggestions (not yet accepted or rejected)
  const getActiveSuggestions = () => {
    return redlines.filter((_, index) => 
      !acceptedSuggestions.has(index) && !rejectedSuggestions.has(index)
    );
  };

  // Export contract
  const exportContract = () => {
    let finalText = contractText;
    
    // Apply accepted suggestions
    const acceptedRedlines = redlines.filter((_, index) => acceptedSuggestions.has(index));
    acceptedRedlines.forEach(redline => {
      if (redline.suggestion) {
        finalText = finalText.replace(redline.clause_text, redline.suggestion);
      }
    });

    // Create download
    const blob = new Blob([finalText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract_redlined_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  // Get suggestion type label
  const getSuggestionType = (issue) => {
    if (!issue) return 'Suggestion';
    const lowerIssue = issue.toLowerCase();
    if (lowerIssue.includes('grammar')) return 'Grammar';
    if (lowerIssue.includes('logic')) return 'Logic Error';
    if (lowerIssue.includes('clarity')) return 'Clarity';
    if (lowerIssue.includes('legal')) return 'Legal Issue';
    return 'Improvement';
  };

  // Get computed styles for the editor/display
  const getDocumentStyles = () => {
    return {
      fontSize: `${(parseInt(fontSize) * zoomLevel) / 100}px`,
      fontFamily: fontFamily,
      textAlign: textAlign,
      color: textColor,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      textDecoration: isUnderline ? 'underline' : 'none',
      transform: `scale(${zoomLevel / 100})`,
      transformOrigin: 'top left',
      width: `${100 * (100 / zoomLevel)}%`
    };
  };

  return (
      <div className="min-h-screen bg-occ-secondary-white">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8">
          
          {/* Enhanced Header - With Right-Side Buttons for Desktop */}
          <div className="bg-occ-blue-gradient rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-lg mb-3 sm:mb-4 md:mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 sm:w-32 md:w-48 lg:w-64 h-24 sm:h-32 md:h-48 lg:h-64 bg-white opacity-5 rounded-full -mr-12 sm:-mr-16 md:-mr-24 lg:-mr-32 -mt-12 sm:-mt-16 md:-mt-24 lg:-mt-32"></div>
            
            <div className="flex flex-col gap-2 sm:gap-3 relative z-10">
              
              {/* Desktop Layout - Title Left, Buttons Right */}
              <div className="hidden lg:flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl xl:text-3xl font-bold text-white flex items-center gap-2">
                    <Brain className="w-7 h-7 flex-shrink-0" />
                    <span className="truncate">AI Redlining Coach</span>
                  </h1>
                  <p className="text-white opacity-90 mt-1 text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Intelligent contract review and suggestion engine</span>
                  </p>
                </div>
                
                {/* Desktop Action Buttons - Right Side */}
                <div className="flex items-center gap-3 ml-6">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Contract
                  </button>
                  <button
                    onClick={analyzeContract}
                    disabled={isAnalyzing || !contractText.trim()}
                    className="px-6 py-3 bg-occ-yellow hover:bg-yellow-500 text-occ-blue-dark rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5" />
                        Analyze with AI
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Mobile/Tablet Layout */}
              <div className="lg:hidden">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-base sm:text-lg md:text-xl font-bold text-white flex items-center gap-2">
                      <Brain className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
                      <span className="truncate">AI Redlining Coach</span>
                    </h1>
                    <p className="text-white opacity-90 mt-1 text-xs sm:text-sm md:text-base flex items-center gap-1 sm:gap-2">
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">Intelligent contract review and suggestion engine</span>
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setShowMobileToolbar(!showMobileToolbar)}
                    className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                
                {/* Mobile Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Contract
                  </button>
                  <button
                    onClick={analyzeContract}
                    disabled={isAnalyzing || !contractText.trim()}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-occ-yellow hover:bg-yellow-500 text-occ-blue-dark rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        Analyze with AI
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                accept=".txt,.doc,.docx"
                className="hidden"
              />
              
              {/* Mobile View Toggle - Enhanced */}
              <div className="lg:hidden">
                <div className="flex gap-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-1">
                  <button
                    onClick={() => setActiveView('document')}
                    className={`flex-1 py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium transition-all ${
                      activeView === 'document' 
                        ? 'bg-white text-occ-blue shadow-sm' 
                        : 'text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <FileText className="w-3 h-3 inline mr-1" />
                    <span className="hidden xs:inline">Document</span>
                    <span className="xs:hidden">Doc</span>
                  </button>
                  <button
                    onClick={() => setActiveView('suggestions')}
                    className={`flex-1 py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium transition-all ${
                      activeView === 'suggestions' 
                        ? 'bg-white text-occ-blue shadow-sm' 
                        : 'text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3 inline mr-1" />
                    <span className="hidden xs:inline">Suggestions</span>
                    <span className="xs:hidden">AI</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800 text-sm sm:text-base">Analysis Error</h3>
                <p className="text-red-700 text-xs sm:text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Search Bar */}
          {showSearch && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 mb-3 flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search in document..."
                className="flex-1 outline-none text-sm"
              />
              <button
                onClick={handleSearch}
                className="px-3 py-1 bg-occ-blue text-white rounded text-sm hover:bg-occ-blue-dark"
              >
                Search
              </button>
              <button
                onClick={clearSearch}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Responsive Toolbar with Working Functions */}
          <div className={`bg-white border border-gray-200 rounded-lg shadow-md mb-3 sm:mb-4 ${showMobileToolbar || activeView === 'document' ? 'block' : 'hidden lg:block'}`}>
            {/* Desktop Toolbar */}
            <div className="hidden lg:flex items-center px-3 md:px-4 py-3 space-x-1 overflow-x-auto">
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => formatText('bold')}
                  className={`p-2 hover:bg-gray-100 rounded transition-colors touch-manipulation ${isBold ? 'bg-gray-200' : ''}`}
                  title="Bold (Select text first)"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => formatText('italic')}
                  className={`p-2 hover:bg-gray-100 rounded transition-colors touch-manipulation ${isItalic ? 'bg-gray-200' : ''}`}
                  title="Italic (Select text first)"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => formatText('underline')}
                  className={`p-2 hover:bg-gray-100 rounded transition-colors touch-manipulation ${isUnderline ? 'bg-gray-200' : ''}`}
                  title="Underline (Select text first)"
                >
                  <Underline className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => formatText('color')}
                  className="p-2 hover:bg-gray-100 rounded transition-colors touch-manipulation"
                  title="Text Color"
                  style={{ color: textColor }}
                >
                  <span className="font-bold text-sm">A</span>
                </button>
              </div>
              
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => setTextAlign('left')}
                  className={`p-2 hover:bg-gray-100 rounded transition-colors touch-manipulation ${textAlign === 'left' ? 'bg-gray-100' : ''}`}
                  title="Align Left"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setTextAlign('center')}
                  className={`p-2 hover:bg-gray-100 rounded transition-colors touch-manipulation ${textAlign === 'center' ? 'bg-gray-100' : ''}`}
                  title="Align Center"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setTextAlign('right')}
                  className={`p-2 hover:bg-gray-100 rounded transition-colors touch-manipulation ${textAlign === 'right' ? 'bg-gray-100' : ''}`}
                  title="Align Right"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={insertList}
                  className="p-2 hover:bg-gray-100 rounded transition-colors touch-manipulation"
                  title="Insert List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button 
                  className="p-2 hover:bg-gray-100 rounded transition-colors touch-manipulation"
                  title="More Options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              
              <div className="flex items-center space-x-1">
                <button 
                  onClick={changeFontSize}
                  className="p-2 hover:bg-gray-100 rounded transition-colors touch-manipulation"
                  title={`Font Size: ${fontSize}px`}
                >
                  <Type className="w-4 h-4" />
                </button>
                <button 
                  onClick={changeFontFamily}
                  className="p-2 hover:bg-gray-100 rounded transition-colors touch-manipulation"
                  title={`Font: ${fontFamily}`}
                >
                  <span className="text-sm">Aφb</span>
                </button>
              </div>
              
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              
              <div className="flex items-center space-x-1">
                <button 
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="p-2 hover:bg-gray-100 rounded transition-colors touch-manipulation disabled:opacity-50"
                  title="Undo"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleRedo}
                  disabled={historyIndex >= textHistory.length - 1}
                  className="p-2 hover:bg-gray-100 rounded transition-colors touch-manipulation disabled:opacity-50"
                  title="Redo"
                >
                  <Redo className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1"></div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 whitespace-nowrap">{zoomLevel}%</span>
                <button 
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 50}
                  className="p-2 hover:bg-gray-100 rounded transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom Out"
                >
                  <ZoomIn className="w-4 h-4 rotate-180" />
                </button>
                <button 
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 200}
                  className="p-2 hover:bg-gray-100 rounded transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button 
                  onClick={rejectAll}
                  disabled={redlines.length === 0}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  Reject All
                </button>
                <button 
                  onClick={acceptAll}
                  disabled={redlines.length === 0}
                  className="px-3 py-2 bg-occ-blue hover:bg-occ-blue-dark text-white rounded text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  Accept All
                </button>
              </div>
            </div>

            {/* Mobile/Tablet Toolbar */}
            <div className="lg:hidden p-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                <button 
                  onClick={() => formatText('bold')}
                  className={`p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex flex-col items-center touch-manipulation min-h-[60px] ${isBold ? 'bg-gray-200' : ''}`}
                >
                  <Bold className="w-4 h-4 mb-1" />
                  <span className="text-xs">Bold</span>
                </button>
                <button 
                  onClick={() => formatText('italic')}
                  className={`p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex flex-col items-center touch-manipulation min-h-[60px] ${isItalic ? 'bg-gray-200' : ''}`}
                >
                  <Italic className="w-4 h-4 mb-1" />
                  <span className="text-xs">Italic</span>
                </button>
                <button 
                  onClick={() => formatText('underline')}
                  className={`p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex flex-col items-center touch-manipulation min-h-[60px] ${isUnderline ? 'bg-gray-200' : ''}`}
                >
                  <Underline className="w-4 h-4 mb-1" />
                  <span className="text-xs">Under</span>
                </button>
                <button 
                  onClick={insertList}
                  className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex flex-col items-center touch-manipulation min-h-[60px]"
                >
                  <List className="w-4 h-4 mb-1" />
                  <span className="text-xs">List</span>
                </button>
              </div>
              
              {/* Mobile Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={rejectAll}
                  disabled={redlines.length === 0}
                  className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors touch-manipulation disabled:opacity-50"
                >
                  Reject All
                </button>
                <button 
                  onClick={acceptAll}
                  disabled={redlines.length === 0}
                  className="flex-1 py-3 px-4 bg-occ-blue hover:bg-occ-blue-dark text-white rounded-lg text-sm font-medium transition-colors touch-manipulation disabled:opacity-50"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area - Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            
            {/* Document Content */}
            <div className={`lg:col-span-3 ${activeView === 'document' || !isMobile ? 'block' : 'hidden'}`}>
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                {/* Document Container with Responsive Scaling */}
                <div className="relative">
                  {isEditorMode ? (
                    // Text Editor Mode
                    <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left', width: `${100 * (100 / zoomLevel)}%` }}>
                      <textarea
                        ref={textEditorRef}
                        value={contractText}
                        onChange={(e) => {
                          setContractText(e.target.value);
                          setDisplayText(e.target.value);
                        }}
                        onBlur={() => addToHistory(contractText)}
                        className="w-full min-h-[400px] lg:min-h-[600px] p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-occ-blue focus:border-transparent resize-none"
                        placeholder="Paste your contract text here or upload a file..."
                        style={{
                          fontSize: `${fontSize}px`,
                          fontFamily: fontFamily,
                          textAlign: textAlign,
                          color: textColor,
                          fontWeight: isBold ? 'bold' : 'normal',
                          fontStyle: isItalic ? 'italic' : 'normal',
                          textDecoration: isUnderline ? 'underline' : 'none'
                        }}
                      />
                    </div>
                  ) : (
                    // Display Mode with Highlights
                    <div 
                      className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12 overflow-auto prose max-w-none"
                      style={getDocumentStyles()}
                      dangerouslySetInnerHTML={{ __html: displayText }}
                    />
                  )}
                </div>

                {/* Mobile Bottom Actions - Fully Responsive */}
                <div className="lg:hidden border-t bg-gray-50 p-2 sm:p-3 md:p-4">
                  {/* Very Small Screens - Stack Everything */}
                  <div className="xs:hidden flex flex-col gap-3">
                    {/* Zoom Controls Row */}
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= 50}
                        className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow touch-manipulation disabled:opacity-50"
                      >
                        <ZoomIn className="w-4 h-4 text-gray-600 rotate-180" />
                      </button>
                      <span className="text-sm text-gray-600 px-3 py-1 bg-white rounded-lg min-w-[60px] text-center">{zoomLevel}%</span>
                      <button 
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= 200}
                        className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow touch-manipulation disabled:opacity-50"
                      >
                        <ZoomIn className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    
                    {/* Action Buttons Row */}
                    <div className="flex gap-2">
                      <button 
                        onClick={handleSave}
                        className="flex-1 py-3 px-3 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors touch-manipulation"
                      >
                        <Save className="w-4 h-4 inline mr-1" />
                        Save
                      </button>
                      <button 
                        onClick={exportContract}
                        className="flex-1 py-3 px-3 bg-occ-blue text-white rounded-lg text-sm font-medium hover:bg-occ-blue-dark transition-colors touch-manipulation"
                      >
                        <Download className="w-4 h-4 inline mr-1" />
                        Export
                      </button>
                    </div>
                  </div>

                  {/* Small Screens and Up - Horizontal Layout */}
                  <div className="hidden xs:flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowSearch(!showSearch)}
                        className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow touch-manipulation"
                      >
                        <Search className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= 50}
                        className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow touch-manipulation disabled:opacity-50"
                      >
                        <ZoomIn className="w-4 h-4 text-gray-600 rotate-180" />
                      </button>
                      <span className="text-sm text-gray-600 px-2 py-1 bg-white rounded min-w-[50px] text-center">{zoomLevel}%</span>
                      <button 
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= 200}
                        className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow touch-manipulation disabled:opacity-50"
                      >
                        <ZoomIn className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={handleSave}
                        className="px-2 sm:px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors touch-manipulation"
                      >
                        <Save className="w-4 h-4 inline mr-1" />
                        <span className="hidden sm:inline">Save</span>
                      </button>
                      <button 
                        onClick={exportContract}
                        className="px-2 sm:px-3 py-2 bg-occ-blue text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-occ-blue-dark transition-colors touch-manipulation"
                      >
                        <Download className="w-4 h-4 inline mr-1" />
                        <span className="hidden sm:inline">Export</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Suggestions Panel - Responsive */}
            <div className={`lg:col-span-1 ${activeView === 'suggestions' || !isMobile ? 'block' : 'hidden'}`}>
              <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-occ-blue" />
                  AI Suggestions
                  {redlines.length > 0 && (
                    <span className="ml-auto text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                      {getActiveSuggestions().length} active
                    </span>
                  )}
                </h3>
                
                <div className="space-y-3 sm:space-y-4 max-h-[600px] overflow-y-auto">
                  {/* API Suggestions */}
                  {isAnalyzing ? (
                    <div className="text-center py-8">
                      <Loader className="w-8 h-8 mx-auto mb-3 text-occ-blue animate-spin" />
                      <p className="text-sm text-gray-600">Analyzing contract...</p>
                    </div>
                  ) : redlines.length > 0 ? (
                    redlines.map((redline, index) => {
                      if (acceptedSuggestions.has(index) || rejectedSuggestions.has(index)) {
                        return null;
                      }
                      
                      return (
                        <div key={index} className="border border-orange-200 bg-orange-50 rounded-lg p-3 sm:p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-4 h-4 text-orange-600" />
                            <span className="text-xs sm:text-sm font-semibold text-orange-800">
                              {getSuggestionType(redline.issue)}
                            </span>
                            {redline.confidence && (
                              <span className="ml-auto text-xs text-gray-600">
                                {Math.round(redline.confidence * 100)}% confidence
                              </span>
                            )}
                          </div>
                          
                          {redline.issue && (
                            <div className="text-xs sm:text-sm text-gray-700 mb-2">
                              <strong>Issue:</strong> {redline.issue}
                            </div>
                          )}
                          
                          <div className="text-xs sm:text-sm text-gray-700 mb-3 p-2 bg-white rounded border">
                            <div className="mb-2">
                              <strong>Original:</strong>
                              <div className="mt-1 text-red-600">{redline.clause_text}</div>
                            </div>
                            <div>
                              <strong>Suggestion:</strong>
                              <div className="mt-1 text-green-600">{redline.suggestion}</div>
                            </div>
                          </div>
                          
                          {redline.rationale && (
                            <div className="text-xs text-gray-600 mb-3 italic">
                              {redline.rationale}
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleAccept(index)}
                              className="flex-1 px-3 py-2 bg-green-600 text-white text-xs sm:text-sm rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-1 touch-manipulation min-h-[40px]"
                            >
                              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                              Accept
                            </button>
                            <button 
                              onClick={() => handleReject(index)}
                              className="flex-1 px-3 py-2 bg-gray-400 text-white text-xs sm:text-sm rounded hover:bg-gray-500 transition-colors flex items-center justify-center gap-1 touch-manipulation min-h-[40px]"
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 sm:py-8 text-gray-500">
                      <Brain className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No suggestions yet</p>
                      <p className="text-xs mt-1">Upload a contract and click "Analyze with AI"</p>
                    </div>
                  )}

                  {/* Show accepted/rejected status */}
                  {(acceptedSuggestions.size > 0 || rejectedSuggestions.size > 0) && (
                    <div className="border-t pt-3 mt-3">
                      {acceptedSuggestions.size > 0 && (
                        <div className="text-xs text-green-600 mb-1">
                          ✓ {acceptedSuggestions.size} suggestion{acceptedSuggestions.size > 1 ? 's' : ''} accepted
                        </div>
                      )}
                      {rejectedSuggestions.size > 0 && (
                        <div className="text-xs text-gray-500">
                          ✗ {rejectedSuggestions.size} suggestion{rejectedSuggestions.size > 1 ? 's' : ''} rejected
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Summary Stats */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Review Summary</h4>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Issues:</span>
                      <span className="font-medium text-gray-900">{redlines.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Accepted:</span>
                      <span className="font-medium text-green-600">{acceptedSuggestions.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rejected:</span>
                      <span className="font-medium text-red-600">{rejectedSuggestions.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending:</span>
                      <span className="font-medium text-orange-600">{getActiveSuggestions().length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Bottom Toolbar */}
          <div className="hidden lg:block">
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 bg-occ-blue-dark bg-opacity-90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg z-10">
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="text-white hover:text-occ-yellow transition-colors touch-manipulation"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <button 
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
                className="text-white hover:text-occ-yellow transition-colors disabled:opacity-50 touch-manipulation"
                title="Zoom Out"
              >
                <ZoomIn className="w-5 h-5 rotate-180" />
              </button>
              <span className="text-white text-sm px-2 py-1">{zoomLevel}%</span>
              <button 
                onClick={handleZoomIn}
                disabled={zoomLevel >= 200}
                className="text-white hover:text-occ-yellow transition-colors disabled:opacity-50 touch-manipulation"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <div className="w-px h-5 bg-white bg-opacity-30 my-1"></div>
              <button 
                onClick={handleSave}
                className="text-white hover:text-occ-yellow transition-colors touch-manipulation"
                title="Save Draft"
              >
                <Save className="w-5 h-5" />
              </button>
              <button 
                onClick={exportContract}
                className="text-white hover:text-occ-yellow transition-colors touch-manipulation"
                title="Export Document"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default RedliningCoach;