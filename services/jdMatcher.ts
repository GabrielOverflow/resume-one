import { ResumeData } from '../types';

// Common technical keywords (hard skills)
const TECHNICAL_KEYWORDS = [
    // Frontend
    'React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Next.js', 'Redux',
    // Backend
    'Java', 'Python', 'Node.js', 'Spring', 'Django', 'Flask', 'Express', 'Go', 'C++', 'C#',
    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'Terraform', 'Ansible',
    // Databases
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQL', 'NoSQL',
    // Tools & Frameworks
    'Git', 'REST', 'GraphQL', 'Microservices', 'Agile', 'Scrum', 'Jira', 'Confluence',
    // AI/ML
    'Machine Learning', 'AI', 'TensorFlow', 'PyTorch', 'Deep Learning', 'NLP',
    // Other
    'API', 'RESTful', 'gRPC', 'WebSocket', 'OAuth', 'JWT'
];

// Common soft skills keywords
const SOFT_SKILLS = [
    'Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Collaboration',
    'Project Management', 'Mentoring', 'Cross-functional', 'Stakeholder', 'Presentation'
];

export interface MatchResult {
    matchedKeywords: string[];
    missingKeywords: string[];
    missingHardSkills: string[];  // Missing hard skills
    missingSoftSkills: string[];  // Missing soft skills
    matchScore: number;
    keywordFrequency: Map<string, number>;
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): Set<string> {
    const keywords = new Set<string>();
    const normalizedText = text.toLowerCase();
    
    // Extract technical keywords
    TECHNICAL_KEYWORDS.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        if (regex.test(text)) {
            keywords.add(keyword.toLowerCase());
        }
    });
    
    // Extract soft skills
    SOFT_SKILLS.forEach(skill => {
        const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        if (regex.test(text)) {
            keywords.add(skill.toLowerCase());
        }
    });
    
    // Extract other possible skills (2-4 word combinations, capitalized)
    const skillPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b/g;
    const matches = text.match(skillPattern);
    if (matches) {
        matches.forEach(match => {
            // Filter out common non-skill words
            const commonWords = ['the', 'and', 'or', 'but', 'for', 'with', 'from', 'this', 'that', 'will', 'have', 'been', 'are', 'was', 'were'];
            if (!commonWords.includes(match.toLowerCase()) && match.length > 2) {
                keywords.add(match.toLowerCase());
            }
        });
    }
    
    return keywords;
}

/**
 * Calculate keyword frequency in text
 */
function calculateKeywordFrequency(text: string, keywords: Set<string>): Map<string, number> {
    const frequency = new Map<string, number>();
    const normalizedText = text.toLowerCase();
    
    keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = normalizedText.match(regex);
        frequency.set(keyword, matches ? matches.length : 0);
    });
    
    return frequency;
}

/**
 * Convert resume data to plain text
 */
function resumeToText(resumeData: ResumeData): string {
    let text = '';
    
    // Profile
    text += `${resumeData.profile.fullName} `;
    text += `${resumeData.profile.email} `;
    text += `${resumeData.profile.location} `;
    
    // Sections
    resumeData.sections.forEach(section => {
        text += `${section.title} `;
        section.items.forEach(item => {
            if (item.title) text += `${item.title} `;
            if (item.subtitle) text += `${item.subtitle} `;
            if (item.description) text += `${item.description} `;
            if (item.location) text += `${item.location} `;
        });
    });
    
    return text;
}

/**
 * Analyze JD and resume match score
 */
export function analyzeJDMatch(jdText: string, resumeData: ResumeData): MatchResult {
    if (!jdText || jdText.trim().length === 0) {
        return {
            matchedKeywords: [],
            missingKeywords: [],
            missingHardSkills: [],
            missingSoftSkills: [],
            matchScore: 0,
            keywordFrequency: new Map()
        };
    }
    
    // Extract keywords from JD
    const jdKeywords = extractKeywords(jdText);
    const jdKeywordFrequency = calculateKeywordFrequency(jdText, jdKeywords);
    
    // Convert resume to text
    const resumeText = resumeToText(resumeData);
    
    // Find matched keywords
    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];
    const missingHardSkills: string[] = [];
    const missingSoftSkills: string[] = [];
    
    // Check if keyword is a hard skill
    const isHardSkill = (keyword: string): boolean => {
        const lowerKeyword = keyword.toLowerCase();
        return TECHNICAL_KEYWORDS.some(tech => tech.toLowerCase() === lowerKeyword);
    };
    
    // Check if keyword is a soft skill
    const isSoftSkill = (keyword: string): boolean => {
        const lowerKeyword = keyword.toLowerCase();
        return SOFT_SKILLS.some(skill => skill.toLowerCase() === lowerKeyword);
    };
    
    jdKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        if (regex.test(resumeText)) {
            matchedKeywords.push(keyword);
        } else {
            // Only add high-frequency keywords to missing list
            const frequency = jdKeywordFrequency.get(keyword) || 0;
            if (frequency > 0) {
                missingKeywords.push(keyword);
                
                // Categorize as hard skill or soft skill
                if (isHardSkill(keyword)) {
                    missingHardSkills.push(keyword);
                } else if (isSoftSkill(keyword)) {
                    missingSoftSkills.push(keyword);
                }
            }
        }
    });
    
    // Calculate match score (0-100)
    let matchScore = 0;
    if (jdKeywords.size > 0) {
        matchScore = Math.round((matchedKeywords.length / jdKeywords.size) * 100);
    }
    
    // Sort missing keywords by frequency
    const sortByFrequency = (keywords: string[]) => {
        return keywords.sort((a, b) => {
            const freqA = jdKeywordFrequency.get(a) || 0;
            const freqB = jdKeywordFrequency.get(b) || 0;
            return freqB - freqA;
        });
    };
    
    return {
        matchedKeywords,
        missingKeywords: sortByFrequency(missingKeywords).slice(0, 20), // Show top 20 only
        missingHardSkills: sortByFrequency(missingHardSkills).slice(0, 15), // Top 15 hard skills
        missingSoftSkills: sortByFrequency(missingSoftSkills).slice(0, 15), // Top 15 soft skills
        matchScore,
        keywordFrequency: jdKeywordFrequency
    };
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
    if (typeof document === 'undefined') {
        // If not in browser environment, use simple string replacement
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Highlight keywords in text
 */
export function highlightKeywords(text: string, keywords: string[]): string {
    if (!text || keywords.length === 0) return escapeHtml(text);
    
    // Escape HTML first to prevent XSS
    let highlightedText = escapeHtml(text);
    
    // Sort keywords by length in descending order, match longer keywords first (avoid short keywords covering long ones)
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
    
    sortedKeywords.forEach(keyword => {
        const escapedKeyword = escapeHtml(keyword);
        const regex = new RegExp(`\\b(${escapedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
        highlightedText = highlightedText.replace(regex, '<mark class="jd-match-highlight">$1</mark>');
    });
    
    // Handle line breaks
    highlightedText = highlightedText.replace(/\n/g, '<br>');
    
    return highlightedText;
}

// AI-enhanced features have been moved to backend
// Please use analyzeJDMatchWithAI function in services/api.ts

