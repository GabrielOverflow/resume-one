export enum SectionType {
    SUMMARY = 'SUMMARY',
    EXPERIENCE = 'EXPERIENCE',
    EDUCATION = 'EDUCATION',
    SKILLS = 'SKILLS',
    PROJECTS = 'PROJECTS',
    CUSTOM = 'CUSTOM'
}

export interface Profile {
    fullName: string;
    phone: string;
    email: string;
    location: string;
    linkedin?: string;
    website?: string;
}

export interface SectionItem {
    id: string;
    title?: string; // For job title, degree, etc.
    subtitle?: string; // For company, university
    date?: string;
    location?: string;
    description?: string; // Bullet points or text
}

export interface Section {
    id: string;
    type: SectionType;
    title: string;
    items: SectionItem[];
    // For skills, we might treat 'description' as the list of skills
    // For summary, 'description' of the first item is the text
}

export interface ResumeData {
    profile: Profile;
    sections: Section[];
}