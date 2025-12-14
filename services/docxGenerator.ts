import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TabStopType, TabStopPosition, BorderStyle } from 'docx';
import { ResumeData, SectionType } from '../types';

// Helper to split text by newlines and create text runs with breaks
const createTextRunsFromDescription = (text: string | undefined, isBullet: boolean = false): Paragraph[] => {
    if (!text) return [];
    
    const lines = text.split('\n');
    return lines.map(line => {
        return new Paragraph({
            children: [
                new TextRun({
                    text: line.trim(),
                    font: "Times New Roman",
                    size: 22, // 11pt
                }),
            ],
            bullet: isBullet ? { level: 0 } : undefined,
            spacing: { after: 50 }, // Small space between lines
        });
    });
};

export const generateDocx = async (data: ResumeData): Promise<Blob> => {
    const children: any[] = [];

    // Header
    children.push(
        new Paragraph({
            text: data.profile.fullName,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            run: {
                font: "Times New Roman",
                bold: true,
                size: 32, // 16pt
                color: "000000",
            }
        })
    );

    const contactParts = [
        data.profile.phone,
        data.profile.email,
        data.profile.location,
        data.profile.website,
        data.profile.linkedin
    ].filter(Boolean).join(" | ");

    children.push(
        new Paragraph({
            children: [new TextRun({ text: contactParts, font: "Times New Roman", size: 22 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
        })
    );

    // Sections
    data.sections.forEach(section => {
        // Section Title
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: section.title.toUpperCase(),
                        font: "Times New Roman",
                        bold: true,
                        size: 24, // 12pt
                    })
                ],
                spacing: { before: 200, after: 100 },
                border: {
                    bottom: {
                        color: "000000",
                        space: 1,
                        style: BorderStyle.SINGLE,
                        size: 6,
                    }
                }
            })
        );

        section.items.forEach(item => {
            // Special layout for Summary and Skills
            if (section.type === SectionType.SUMMARY) {
                 children.push(...createTextRunsFromDescription(item.description));
            } else if (section.type === SectionType.SKILLS) {
                 children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: item.title ? `${item.title}: ` : '',
                                bold: true,
                                font: "Times New Roman",
                                size: 22,
                            }),
                            new TextRun({
                                text: item.description || '',
                                font: "Times New Roman",
                                size: 22,
                            })
                        ],
                        spacing: { after: 50 }
                    })
                 );
            } else {
                // Experience, Education, Projects, Custom
                // Header line: Title/Subtitle on Left, Date/Location on right
                // We use Tabs for right alignment
                
                const leftText = item.subtitle ? item.subtitle : item.title; // Company Name usually first in some formats, or Title. 
                // Matching the PDF: Title is first line, Company is second line? 
                // PDF: Deloitte Australia (Company) ... Date
                //      Software Engineer (Role) ... Location
                
                // Let's try to match the visual exactly:
                // Left: Subtitle (Company)   Right: Date
                // Left: Title (Role)         Right: Location
                
                // Line 1
                if (item.subtitle || item.date) {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: item.subtitle || '',
                                    bold: true,
                                    font: "Times New Roman",
                                    size: 22,
                                }),
                                new TextRun({
                                    text: `\t${item.date || ''}`,
                                    font: "Times New Roman",
                                    size: 22,
                                    bold: true,
                                })
                            ],
                            tabStops: [
                                {
                                    type: TabStopType.RIGHT,
                                    position: TabStopPosition.MAX,
                                }
                            ],
                            spacing: { before: 100 }
                        })
                    );
                }

                // Line 2
                if (item.title || item.location) {
                     children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: item.title || '',
                                    italic: true,
                                    font: "Times New Roman",
                                    size: 22,
                                }),
                                new TextRun({
                                    text: `\t${item.location || ''}`,
                                    font: "Times New Roman",
                                    size: 22,
                                    italic: false,
                                })
                            ],
                            tabStops: [
                                {
                                    type: TabStopType.RIGHT,
                                    position: TabStopPosition.MAX,
                                }
                            ],
                            spacing: { after: 50 }
                        })
                    );
                }

                // Description
                if (item.description) {
                    children.push(...createTextRunsFromDescription(item.description, true));
                }
            }
            
            // Add some spacing after item
             children.push(new Paragraph({ spacing: { after: 100 } }));
        });
    });

    const doc = new Document({
        sections: [{
            properties: {},
            children: children,
        }],
    });

    return await Packer.toBlob(doc);
};