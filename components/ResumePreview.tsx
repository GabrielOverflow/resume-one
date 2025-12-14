import React, { forwardRef } from 'react';
import { ResumeData, SectionType } from '../types';
import { MatchResult } from '../services/jdMatcher';
import { highlightKeywords } from '../services/jdMatcher';

interface ResumePreviewProps {
    data: ResumeData;
    matchResult?: MatchResult;
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ data, matchResult }, ref) => {
    // Helper function to render highlighted text
    const renderHighlightedText = (text: string | undefined): React.ReactNode => {
        if (!text) return null;
        
        if (matchResult && matchResult.matchedKeywords.length > 0) {
            const highlightedHTML = highlightKeywords(text, matchResult.matchedKeywords);
            return <span dangerouslySetInnerHTML={{ __html: highlightedHTML }} />;
        }
        
        return text;
    };
    return (
        <div 
            ref={ref}
            className="print-container bg-white shadow-xl w-[210mm] min-h-[297mm] p-[15mm] md:p-[20mm] mx-auto text-gray-900 font-serif leading-relaxed selection:bg-gray-200"
            style={{ color: '#000000' }} // Force black for consistency
        >
            {/* Header */}
            <header className="text-center mb-6">
                <h1 className="text-3xl font-bold mb-2 uppercase tracking-wide">{data.profile.fullName}</h1>
                <div className="text-sm flex flex-wrap justify-center gap-2 text-gray-800">
                    {data.profile.phone && <span>{data.profile.phone}</span>}
                    {data.profile.phone && data.profile.email && <span>|</span>}
                    {data.profile.email && <span>{data.profile.email}</span>}
                    {data.profile.email && data.profile.location && <span>|</span>}
                    {data.profile.location && <span>{data.profile.location}</span>}
                    {data.profile.website && <span>|</span>}
                    {data.profile.website && <span>{data.profile.website}</span>}
                </div>
            </header>

            {/* Sections */}
            <div className="space-y-6">
                {data.sections.map((section) => (
                    <section key={section.id} className="mb-4">
                        {/* Section Title */}
                        <h2 className="text-lg font-bold uppercase border-b-2 border-black mb-3 pb-1 tracking-wider">
                            {section.title}
                        </h2>

                        {/* Section Content */}
                        <div className="space-y-4">
                            {/* Summary Type */}
                            {section.type === SectionType.SUMMARY && (
                                <p className="text-sm text-justify leading-6">
                                    {renderHighlightedText(section.items[0]?.description)}
                                </p>
                            )}

                            {/* Skills Type */}
                            {section.type === SectionType.SKILLS && (
                                <div className="space-y-1">
                                    {section.items.map((item) => (
                                        <div key={item.id} className="text-sm">
                                            <span className="font-bold">{item.title}: </span>
                                            <span>{renderHighlightedText(item.description)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Experience / Education / Custom Types */}
                            {(section.type === SectionType.EXPERIENCE || 
                              section.type === SectionType.EDUCATION ||
                              section.type === SectionType.PROJECTS ||
                              section.type === SectionType.CUSTOM) && (
                                <div>
                                    {section.items.map((item) => (
                                        <div key={item.id} className="mb-4 last:mb-0 break-inside-avoid">
                                            {/* Header Row 1: Company/Uni & Dates */}
                                            <div className="flex justify-between items-baseline font-bold text-sm">
                                                <span>{renderHighlightedText(item.subtitle)}</span>
                                                <span className="text-right shrink-0 ml-4">{item.date}</span>
                                            </div>
                                            
                                            {/* Header Row 2: Role/Degree & Location */}
                                            <div className="flex justify-between items-baseline text-sm italic mb-1">
                                                <span>{renderHighlightedText(item.title)}</span>
                                                <span className="text-right shrink-0 ml-4">{item.location}</span>
                                            </div>

                                            {/* Content/Bullets */}
                                            {item.description && (
                                                <div className="text-sm text-justify leading-5 mt-1 whitespace-pre-line">
                                                    {renderHighlightedText(item.description)}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
});

ResumePreview.displayName = 'ResumePreview';

export default ResumePreview;