import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { INITIAL_DATA } from './constants';
import { ResumeData, Section, SectionItem, SectionType } from './types';
import ResumePreview from './components/ResumePreview';
import EditorPanel from './components/EditorPanel';
import { arrayMove } from '@dnd-kit/sortable';
import { generateDocx } from './services/docxGenerator';
import FileSaver from 'file-saver';
import { Download, Printer } from 'lucide-react';
import { analyzeJDMatch } from './services/jdMatcher';
import { analyzeJDMatchWithAI, getUserMembership, UserMembership } from './services/api';

const App: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_DATA);
  const [jdText, setJdText] = useState<string>('');
  const [useAI, setUseAI] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [membership, setMembership] = useState<UserMembership>({ isMember: false, membershipType: 'free' });
  const [isCheckingMembership, setIsCheckingMembership] = useState<boolean>(true);
  const componentRef = useRef<HTMLDivElement>(null);
  
  // Check membership status (on app startup)
  useEffect(() => {
    getUserMembership()
      .then(mem => {
        setMembership(mem);
        setIsCheckingMembership(false);
      })
      .catch(error => {
        console.error('Failed to check membership:', error);
        setIsCheckingMembership(false);
      });
  }, []);
  
  // Base match result (free feature)
  const baseMatchResult = useMemo(() => {
    if (!jdText.trim()) {
      return {
        matchedKeywords: [],
        missingKeywords: [],
        missingHardSkills: [],
        missingSoftSkills: [],
        matchScore: 0,
        keywordFrequency: new Map()
      };
    }
    return analyzeJDMatch(jdText, resumeData);
  }, [jdText, resumeData]);
  
  // AI-enhanced analysis (member feature, calls backend)
  const [aiEnhancedResult, setAiEnhancedResult] = useState<typeof baseMatchResult | null>(null);
  
  useEffect(() => {
    if (useAI && jdText.trim() && membership.isMember) {
      setIsAnalyzing(true);
      analyzeJDMatchWithAI(jdText, resumeData)
        .then(result => {
          // Convert backend response format to frontend format
          setAiEnhancedResult({
            matchedKeywords: result.matchedKeywords,
            missingKeywords: result.missingKeywords,
            missingHardSkills: result.missingHardSkills,
            missingSoftSkills: result.missingSoftSkills,
            matchScore: result.matchScore,
            keywordFrequency: new Map(Object.entries(result.keywordFrequency || {}))
          });
          setIsAnalyzing(false);
        })
        .catch(error => {
          console.error('AI analysis error:', error);
          // If AI analysis fails, fall back to base result
          setAiEnhancedResult(null);
          setIsAnalyzing(false);
          
          // Show error message
          if (error.message.includes('Forbidden') || error.message.includes('Payment Required')) {
            alert('AI Enhanced feature requires premium membership. Please upgrade to continue.');
            setUseAI(false);
          } else {
            alert('AI analysis failed. Using basic matching instead.');
          }
        });
    } else {
      setAiEnhancedResult(null);
    }
  }, [useAI, jdText, resumeData, membership.isMember]);
  
  // Use AI-enhanced result or base result
  const finalMatchResult = aiEnhancedResult || baseMatchResult;

  // --- State Modifiers ---

  const updateProfile = (field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: value }
    }));
  };

  const updateSectionTitle = (sectionId: string, newTitle: string) => {
    setResumeData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? { ...s, title: newTitle } : s)
    }));
  };

  const reorderSections = (activeId: string, overId: string) => {
    setResumeData(prev => {
      const oldIndex = prev.sections.findIndex(s => s.id === activeId);
      const newIndex = prev.sections.findIndex(s => s.id === overId);
      return {
        ...prev,
        sections: arrayMove(prev.sections, oldIndex, newIndex)
      };
    });
  };

  const addSection = (type: SectionType) => {
    const newId = Math.random().toString(36).substr(2, 9);
    let title = "New Section";
    if (type === SectionType.EXPERIENCE) title = "PROFESSIONAL EXPERIENCE";
    if (type === SectionType.EDUCATION) title = "EDUCATION";
    if (type === SectionType.SKILLS) title = "SKILLS";
    if (type === SectionType.PROJECTS) title = "PROJECTS";

    const newSection: Section = {
      id: newId,
      type,
      title,
      items: []
    };
    
    // Add a default item so it's not empty
    if (type === SectionType.SUMMARY) {
        newSection.items.push({ id: 'item-' + Date.now(), description: '' });
    } else {
        newSection.items.push({ id: 'item-' + Date.now(), title: '', subtitle: '', date: '', location: '', description: '' });
    }

    setResumeData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const removeSection = (sectionId: string) => {
    if (window.confirm("Are you sure you want to delete this entire section?")) {
      setResumeData(prev => ({
        ...prev,
        sections: prev.sections.filter(s => s.id !== sectionId)
      }));
    }
  };

  const updateItem = (sectionId: string, itemId: string, field: keyof SectionItem, value: string) => {
    setResumeData(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          items: section.items.map(item => {
            if (item.id !== itemId) return item;
            return { ...item, [field]: value };
          })
        };
      })
    }));
  };

  const addItemToSection = (sectionId: string) => {
    setResumeData(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id !== sectionId) return section;
        const newItem: SectionItem = {
            id: Date.now().toString(),
            title: '', subtitle: '', date: '', location: '', description: ''
        };
        return { ...section, items: [...section.items, newItem] };
      })
    }));
  };

  const removeItemFromSection = (sectionId: string, itemId: string) => {
    setResumeData(prev => ({
        ...prev,
        sections: prev.sections.map(section => {
            if (section.id !== sectionId) return section;
            return { ...section, items: section.items.filter(i => i.id !== itemId) };
        })
    }));
  };

  // --- Export Handlers ---

  const handlePrint = () => {
    window.print();
  };

  const handleWordExport = async () => {
    try {
        const blob = await generateDocx(resumeData);
        // Robustly handle file-saver default export which might be a function or an object
        const saveAs = (FileSaver as any).saveAs || FileSaver;
        saveAs(blob, `${resumeData.profile.fullName.replace(/\s+/g, '_')}_Resume.docx`);
    } catch (e) {
        console.error("Export failed", e);
        alert("Failed to generate Word document.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
        {/* Top Bar */}
        <div className="no-print h-16 bg-gray-900 text-white flex items-center justify-between px-6 shrink-0 shadow-md z-10">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold font-serif">R</div>
                <h1 className="text-lg font-semibold">Resume Builder</h1>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={handlePrint} 
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                >
                    <Printer size={16} /> Print / PDF
                </button>
                <button 
                    onClick={handleWordExport}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-semibold transition-colors"
                >
                    <Download size={16} /> Export Word
                </button>
            </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Left: Editor Panel */}
            <div className="no-print w-96 shrink-0 h-full z-0">
                <EditorPanel 
                    data={resumeData}
                    jdText={jdText}
                    onJdTextChange={setJdText}
                    matchResult={finalMatchResult}
                    useAI={useAI}
                    onUseAIChange={setUseAI}
                    isAnalyzing={isAnalyzing}
                    membership={membership}
                    isCheckingMembership={isCheckingMembership}
                    updateProfile={updateProfile}
                    updateSectionTitle={updateSectionTitle}
                    addSection={addSection}
                    removeSection={removeSection}
                    reorderSections={reorderSections}
                    updateItem={updateItem}
                    addItemToSection={addItemToSection}
                    removeItemFromSection={removeItemFromSection}
                />
            </div>

            {/* Right: Preview Area */}
            <div className="flex-1 bg-gray-200 overflow-auto p-8 md:p-12 flex justify-center">
                <div className="scale-100 origin-top">
                    <ResumePreview ref={componentRef} data={resumeData} matchResult={finalMatchResult} />
                </div>
            </div>
        </div>
    </div>
  );
};

export default App;