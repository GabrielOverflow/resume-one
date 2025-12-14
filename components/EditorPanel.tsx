import React from 'react';
import { ResumeData, Section, SectionItem, SectionType } from '../types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus, Target, AlertCircle, Crown } from 'lucide-react';
import { MatchResult } from '../services/jdMatcher';
import { UserMembership } from '../services/api';

interface EditorPanelProps {
    data: ResumeData;
    jdText: string;
    onJdTextChange: (text: string) => void;
    matchResult: MatchResult;
    useAI?: boolean;
    onUseAIChange?: (useAI: boolean) => void;
    isAnalyzing?: boolean;
    membership?: UserMembership;
    isCheckingMembership?: boolean;
    updateProfile: (field: string, value: string) => void;
    updateSectionTitle: (sectionId: string, newTitle: string) => void;
    addSection: (type: SectionType) => void;
    removeSection: (sectionId: string) => void;
    reorderSections: (activeId: string, overId: string) => void;
    updateItem: (sectionId: string, itemId: string, field: keyof SectionItem, value: string) => void;
    addItemToSection: (sectionId: string) => void;
    removeItemFromSection: (sectionId: string, itemId: string) => void;
}

// Sortable Item Wrapper
interface SortableSectionItemProps {
    id: string;
    children: React.ReactNode;
}

const SortableSectionItem: React.FC<SortableSectionItemProps> = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} className="mb-6 border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
             <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-move text-gray-400 hover:text-gray-700" {...attributes} {...listeners}>
                    <GripVertical size={16} />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Drag to Reorder</span>
                </div>
                {children}
             </div>
        </div>
    );
};


const EditorPanel: React.FC<EditorPanelProps> = ({ 
    data, 
    jdText,
    onJdTextChange,
    matchResult,
    useAI = false,
    onUseAIChange,
    isAnalyzing = false,
    membership = { isMember: false, membershipType: 'free' },
    isCheckingMembership = false,
    updateProfile, 
    updateSectionTitle,
    addSection, 
    removeSection, 
    reorderSections,
    updateItem,
    addItemToSection,
    removeItemFromSection
}) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            reorderSections(active.id as string, over!.id as string);
        }
    };

    // Get match score color
    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-green-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 70) return 'bg-green-500';
        if (score >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="h-full overflow-y-auto p-6 bg-gray-50 border-r border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Editor</h2>

            {/* JD Matching Area */}
            <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg shadow-sm border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Target size={18} className="text-blue-600" />
                        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Target Job Description</h3>
                    </div>
                    {onUseAIChange && (
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={useAI}
                                onChange={(e) => {
                                    if (!membership.isMember && e.target.checked) {
                                        alert('AI Enhanced feature requires premium membership. Please upgrade to continue.');
                                        return;
                                    }
                                    onUseAIChange(e.target.checked);
                                }}
                                disabled={!membership.isMember || isCheckingMembership}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <div className="flex items-center gap-1">
                                <Crown size={12} className={membership.isMember ? "text-yellow-500" : "text-gray-400"} />
                                <span className={`text-xs font-semibold ${membership.isMember ? "text-blue-900" : "text-gray-500"}`}>
                                    AI Enhanced {!membership.isMember && "(Premium)"}
                                </span>
                            </div>
                        </label>
                    )}
                </div>
                <textarea
                    value={jdText}
                    onChange={(e) => onJdTextChange(e.target.value)}
                    placeholder="Paste the job description here to see real-time matching..."
                    rows={4}
                    className="w-full p-2 border border-blue-300 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    disabled={isAnalyzing}
                />
                {isAnalyzing && (
                    <div className="mt-2 text-xs text-blue-600 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                        Analyzing with AI...
                    </div>
                )}
                
                {/* Match Score Display */}
                {jdText.trim().length > 0 && (
                    <div className="mt-4 space-y-3">
                        {/* Match Score Dashboard */}
                        <div className="bg-white p-3 rounded border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-700">Match Score</span>
                                <span className={`text-2xl font-bold ${getScoreColor(matchResult.matchScore)}`}>
                                    {matchResult.matchScore}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${getScoreBgColor(matchResult.matchScore)}`}
                                    style={{ width: `${matchResult.matchScore}%` }}
                                />
                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                                {matchResult.matchedKeywords.length} / {matchResult.matchedKeywords.length + matchResult.missingKeywords.length} keywords matched
                            </div>
                        </div>

                        {/* Missing Hard Skills */}
                        {matchResult.missingHardSkills && matchResult.missingHardSkills.length > 0 && (
                            <div className="bg-white p-3 rounded border border-red-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle size={14} className="text-red-600" />
                                    <span className="text-xs font-semibold text-red-900">Missing Hard Skills</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {matchResult.missingHardSkills.slice(0, 10).map((keyword, idx) => (
                                        <span 
                                            key={idx}
                                            className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded border border-red-300"
                                        >
                                            {keyword}
                                        </span>
                                    ))}
                                    {matchResult.missingHardSkills.length > 10 && (
                                        <span className="px-2 py-1 text-red-600 text-xs">
                                            +{matchResult.missingHardSkills.length - 10} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Missing Soft Skills */}
                        {matchResult.missingSoftSkills && matchResult.missingSoftSkills.length > 0 && (
                            <div className="bg-white p-3 rounded border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle size={14} className="text-purple-600" />
                                    <span className="text-xs font-semibold text-purple-900">Missing Soft Skills</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {matchResult.missingSoftSkills.slice(0, 10).map((keyword, idx) => (
                                        <span 
                                            key={idx}
                                            className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded border border-purple-300"
                                        >
                                            {keyword}
                                        </span>
                                    ))}
                                    {matchResult.missingSoftSkills.length > 10 && (
                                        <span className="px-2 py-1 text-purple-600 text-xs">
                                            +{matchResult.missingSoftSkills.length - 10} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Other Missing Keywords (uncategorized) */}
                        {matchResult.missingKeywords.length > 0 && 
                         (matchResult.missingHardSkills?.length || 0) + (matchResult.missingSoftSkills?.length || 0) < matchResult.missingKeywords.length && (
                            <div className="bg-white p-3 rounded border border-orange-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle size={14} className="text-orange-600" />
                                    <span className="text-xs font-semibold text-orange-900">Other Missing Keywords</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {matchResult.missingKeywords
                                        .filter(k => 
                                            !matchResult.missingHardSkills?.includes(k) && 
                                            !matchResult.missingSoftSkills?.includes(k)
                                        )
                                        .slice(0, 10)
                                        .map((keyword, idx) => (
                                        <span 
                                            key={idx}
                                            className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded border border-orange-300"
                                        >
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Profile Section */}
            <div className="mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Contact Information</h3>
                <div className="space-y-3">
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={data.profile.fullName}
                        onChange={(e) => updateProfile('fullName', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <input 
                            type="text" 
                            placeholder="Phone" 
                            className="w-full p-2 border rounded text-sm"
                            value={data.profile.phone}
                            onChange={(e) => updateProfile('phone', e.target.value)}
                        />
                        <input 
                            type="text" 
                            placeholder="Email" 
                            className="w-full p-2 border rounded text-sm"
                            value={data.profile.email}
                            onChange={(e) => updateProfile('email', e.target.value)}
                        />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Location (City, Country)" 
                        className="w-full p-2 border rounded text-sm"
                        value={data.profile.location}
                        onChange={(e) => updateProfile('location', e.target.value)}
                    />
                     <input 
                        type="text" 
                        placeholder="Website / LinkedIn" 
                        className="w-full p-2 border rounded text-sm"
                        value={data.profile.website}
                        onChange={(e) => updateProfile('website', e.target.value)}
                    />
                </div>
            </div>

            {/* Draggable Sections */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={data.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                        {data.sections.map((section) => (
                            <SortableSectionItem key={section.id} id={section.id}>
                                <div className="w-full">
                                    <div className="flex items-center justify-between mb-2">
                                        <input
                                            className="font-semibold bg-transparent border-none focus:ring-0 p-0 text-sm text-gray-700 w-full mr-2"
                                            value={section.title}
                                            onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                                        />
                                        <button 
                                            onClick={() => removeSection(section.id)}
                                            className="text-red-400 hover:text-red-600"
                                            title="Delete Section"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    
                                    {/* Section Content Editor */}
                                    <div className="bg-white p-3 -mx-3 -mb-2 border-t border-gray-100">
                                        {section.items.map((item, idx) => (
                                            <div key={item.id} className="mb-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0 relative group">
                                                 <button 
                                                    onClick={() => removeItemFromSection(section.id, item.id)}
                                                    className="absolute top-0 right-0 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={14} />
                                                </button>

                                                {section.type === SectionType.SUMMARY && (
                                                    <textarea 
                                                        rows={5}
                                                        className="w-full p-2 border rounded text-xs"
                                                        placeholder="Professional Summary..."
                                                        value={item.description}
                                                        onChange={(e) => updateItem(section.id, item.id, 'description', e.target.value)}
                                                    />
                                                )}

                                                {section.type === SectionType.SKILLS && (
                                                    <div className="grid grid-cols-1 gap-2">
                                                        <input 
                                                            className="w-full p-2 border rounded text-xs font-bold" 
                                                            placeholder="Category (e.g. Frontend)"
                                                            value={item.title}
                                                            onChange={(e) => updateItem(section.id, item.id, 'title', e.target.value)}
                                                        />
                                                        <textarea
                                                            rows={2}
                                                            className="w-full p-2 border rounded text-xs" 
                                                            placeholder="List of skills..."
                                                            value={item.description}
                                                            onChange={(e) => updateItem(section.id, item.id, 'description', e.target.value)}
                                                        />
                                                    </div>
                                                )}

                                                {(section.type !== SectionType.SUMMARY && section.type !== SectionType.SKILLS) && (
                                                    <div className="space-y-2">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input 
                                                                className="p-2 border rounded text-xs font-bold" 
                                                                placeholder={section.type === SectionType.EDUCATION ? "University/School" : "Company/Organization"}
                                                                value={item.subtitle}
                                                                onChange={(e) => updateItem(section.id, item.id, 'subtitle', e.target.value)}
                                                            />
                                                             <input 
                                                                className="p-2 border rounded text-xs" 
                                                                placeholder="Date Range"
                                                                value={item.date}
                                                                onChange={(e) => updateItem(section.id, item.id, 'date', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input 
                                                                className="p-2 border rounded text-xs italic" 
                                                                placeholder={section.type === SectionType.EDUCATION ? "Degree/Certificate" : "Job Title"}
                                                                value={item.title}
                                                                onChange={(e) => updateItem(section.id, item.id, 'title', e.target.value)}
                                                            />
                                                             <input 
                                                                className="p-2 border rounded text-xs" 
                                                                placeholder="Location"
                                                                value={item.location}
                                                                onChange={(e) => updateItem(section.id, item.id, 'location', e.target.value)}
                                                            />
                                                        </div>
                                                        <textarea 
                                                            rows={4}
                                                            className="w-full p-2 border rounded text-xs"
                                                            placeholder="Description / Bullet points"
                                                            value={item.description}
                                                            onChange={(e) => updateItem(section.id, item.id, 'description', e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        
                                        {/* Add Item Button (Except Summary which is singular) */}
                                        {section.type !== SectionType.SUMMARY && (
                                            <button 
                                                onClick={() => addItemToSection(section.id)}
                                                className="w-full py-2 mt-2 border border-dashed border-gray-300 text-gray-500 text-xs rounded hover:bg-gray-50 flex items-center justify-center gap-1"
                                            >
                                                <Plus size={14} /> Add Item
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </SortableSectionItem>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Add Section Buttons */}
            <div className="mt-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Add Module</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => addSection(SectionType.EXPERIENCE)} className="p-2 text-xs bg-white border border-gray-300 hover:bg-gray-50 rounded text-left">Work Experience</button>
                    <button onClick={() => addSection(SectionType.EDUCATION)} className="p-2 text-xs bg-white border border-gray-300 hover:bg-gray-50 rounded text-left">Education</button>
                    <button onClick={() => addSection(SectionType.SKILLS)} className="p-2 text-xs bg-white border border-gray-300 hover:bg-gray-50 rounded text-left">Skills</button>
                    <button onClick={() => addSection(SectionType.PROJECTS)} className="p-2 text-xs bg-white border border-gray-300 hover:bg-gray-50 rounded text-left">Projects</button>
                    <button onClick={() => addSection(SectionType.CUSTOM)} className="p-2 text-xs bg-white border border-gray-300 hover:bg-gray-50 rounded text-left">Custom Section</button>
                </div>
            </div>
        </div>
    );
};

export default EditorPanel;
