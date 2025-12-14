/**
 * API Service - For communicating with backend
 * 
 * Note: These functions require backend API support
 * The backend needs to provide corresponding endpoints to handle these requests
 */

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// User membership status interface
export interface UserMembership {
    isMember: boolean;
    membershipType?: 'free' | 'premium' | 'enterprise';
    expiresAt?: string;
}

// AI-enhanced analysis result
export interface AIEnhancedMatchResult {
    matchedKeywords: string[];
    missingKeywords: string[];
    missingHardSkills: string[];
    missingSoftSkills: string[];
    matchScore: number;
    keywordFrequency: Record<string, number>;
}

/**
 * Get current user's membership status
 * TODO: Backend needs to implement GET /api/user/membership
 */
export async function getUserMembership(): Promise<UserMembership> {
    try {
        const token = localStorage.getItem('authToken'); // Assume using token authentication
        const response = await fetch(`${API_BASE_URL}/user/membership`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            credentials: 'include' // Support cookie authentication
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Not logged in, return free user
                return { isMember: false, membershipType: 'free' };
            }
            throw new Error(`Failed to fetch membership: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching membership:', error);
        // Default to free user
        return { isMember: false, membershipType: 'free' };
    }
}

/**
 * AI-enhanced JD match analysis (members only)
 * TODO: Backend needs to implement POST /api/jd/analyze-ai
 * 
 * Request body:
 * {
 *   "jdText": string,
 *   "resumeData": ResumeData
 * }
 * 
 * Response:
 * AIEnhancedMatchResult
 */
export async function analyzeJDMatchWithAI(
    jdText: string,
    resumeData: any
): Promise<AIEnhancedMatchResult> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/jd/analyze-ai`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include',
        body: JSON.stringify({
            jdText,
            resumeData
        })
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Unauthorized: Please login');
        }
        if (response.status === 403) {
            throw new Error('Forbidden: AI Enhanced feature requires membership');
        }
        if (response.status === 402) {
            throw new Error('Payment Required: Please upgrade to premium membership');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return await response.json();
}

/**
 * Check if user has permission to use AI-enhanced features
 */
export async function checkAIAccess(): Promise<boolean> {
    const membership = await getUserMembership();
    return membership.isMember;
}

