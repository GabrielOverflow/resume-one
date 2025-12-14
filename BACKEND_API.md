# Backend API Documentation

This document describes the API endpoints and logic that the frontend requires from the backend.

## Basic Configuration

### Environment Variables
The frontend uses the `VITE_API_BASE_URL` environment variable to configure the backend API address.
- Development: `http://localhost:3001/api`
- Production: Configure according to actual deployment

### Authentication Methods
The frontend supports two authentication methods:
1. **Token Authentication**: Gets token from `localStorage.getItem('authToken')`, sends via `Authorization: Bearer <token>` header
2. **Cookie Authentication**: Uses `credentials: 'include'` to automatically send cookies

The backend needs to support one or both authentication methods.

---

## API Endpoints

### 1. Get User Membership Status

**Endpoint:** `GET /api/user/membership`

**Function:** Get the current user's membership status to determine if they can access AI-enhanced features.

**Request Headers:**
```
Authorization: Bearer <token>  (optional, if using token authentication)
Content-Type: application/json
```

**Response:**

Success Response (200):
```json
{
  "isMember": true,
  "membershipType": "premium",  // "free" | "premium" | "enterprise"
  "expiresAt": "2024-12-31T23:59:59Z"  // optional, membership expiration time
}
```

Unauthorized (401):
- Frontend will treat it as a free user, returns `{ isMember: false, membershipType: 'free' }`

**Business Logic:**
- If user is not logged in, return free user status
- If user is logged in but hasn't purchased membership, return `isMember: false`
- If user is logged in and is a member, return `isMember: true` and membership type

---

### 2. AI-Enhanced JD Match Analysis

**Endpoint:** `POST /api/jd/analyze-ai`

**Function:** Use AI (Gemini API) to intelligently analyze JD and identify hard skills and soft skills.

**Permission:** Members only

**Request Headers:**
```
Authorization: Bearer <token>  (optional, if using token authentication)
Content-Type: application/json
```

**Request Body:**
```json
{
  "jdText": "Complete job description text...",
  "resumeData": {
    "profile": {
      "fullName": "John Smith",
      "phone": "+1 (555) 123-4567",
      "email": "john.smith@example.com",
      "location": "San Francisco, CA",
      "website": "https://johnsmith.dev"
    },
    "sections": [
      {
        "id": "summary",
        "type": "SUMMARY",
        "title": "PROFESSIONAL SUMMARY",
        "items": [...]
      },
      // ... other sections
    ]
  }
}
```

**Response:**

Success Response (200):
```json
{
  "matchedKeywords": ["react", "python", "aws"],
  "missingKeywords": ["kubernetes", "docker"],
  "missingHardSkills": ["kubernetes", "docker", "terraform"],
  "missingSoftSkills": ["leadership", "communication"],
  "matchScore": 75,
  "keywordFrequency": {
    "react": 3,
    "python": 2,
    "aws": 1
  }
}
```

Error Responses:

- **401 Unauthorized**: User not logged in
  ```json
  {
    "message": "Unauthorized: Please login"
  }
  ```

- **403 Forbidden**: User is logged in but not a member
  ```json
  {
    "message": "Forbidden: AI Enhanced feature requires membership"
  }
  ```

- **402 Payment Required**: Payment required for upgrade (optional, more user-friendly message)
  ```json
  {
    "message": "Payment Required: Please upgrade to premium membership"
  }
  ```

**Business Logic:**

1. **Permission Check:**
   - Verify if user is logged in
   - Verify if user is a member (call membership status check)
   - If not a member, return 403 or 402

2. **AI Analysis Process:**
   ```
   1. Receive JD text and resume data
   2. Call Gemini API to analyze JD and extract skills:
      - Hard skills (tech stack, tools, frameworks, etc.)
      - Soft skills (communication, leadership, etc.)
   3. Convert resume data to text
   4. Match skills in JD with skills in resume
   5. Calculate match score
   6. Return analysis results
   ```

3. **Gemini API Call Example:**
   ```python
   # Python example
   import google.generativeai as genai
   
   genai.configure(api_key="YOUR_GEMINI_API_KEY")
   model = genai.GenerativeModel('gemini-pro')
   
   prompt = f"""
   Analyze the following job description and extract skills. Categorize them into:
   1. Hard skills: technical skills, tools, technologies, programming languages, frameworks, software, platforms, certifications
   2. Soft skills: interpersonal skills, communication, leadership, teamwork, problem-solving, collaboration
   
   Job Description:
   {jd_text}
   
   Return ONLY a valid JSON object in this exact format:
   {{
     "hardSkills": ["skill1", "skill2"],
     "softSkills": ["skill1", "skill2"]
   }}
   """
   
   response = model.generate_content(prompt)
   # Parse JSON response
   ```

4. **Match Score Calculation:**
   - Number of matched keywords / Total keywords in JD * 100
   - Consider keyword frequency weight (optional)

5. **Return Format:**
   - `matchedKeywords`: List of keywords matched in resume
   - `missingKeywords`: All keywords appearing in JD but not in resume
   - `missingHardSkills`: Missing hard skills (filtered from missingKeywords)
   - `missingSoftSkills`: Missing soft skills (filtered from missingKeywords)
   - `matchScore`: Match score from 0-100
   - `keywordFrequency`: Frequency of keywords in JD

---

## Frontend Call Flow

### 1. On Application Startup
```typescript
// App.tsx - useEffect
getUserMembership()
  .then(membership => {
    setMembership(membership);
    // If user is a member, can show AI Enhanced toggle
  })
```

### 2. When User Enables AI Enhanced
```typescript
// App.tsx - useEffect
if (useAI && jdText.trim() && membership.isMember) {
  analyzeJDMatchWithAI(jdText, resumeData)
    .then(result => {
      // Use AI analysis results
    })
    .catch(error => {
      // Handle errors (403/402 will prompt user to upgrade)
    });
}
```

### 3. Error Handling
- **401**: Prompt user to login
- **403/402**: Prompt user to upgrade membership
- **Other errors**: Fall back to basic matching functionality

---

## Backend Implementation Suggestions

### Technology Stack Suggestions
- **Node.js + Express** or **Python + FastAPI** or **Go + Gin**
- **Database**: Store user information and membership status
- **Authentication**: JWT or Session
- **AI Service**: Google Gemini API

### Project Structure Suggestions
```
backend/
├── routes/
│   ├── user.js          # User-related routes
│   └── jd.js            # JD analysis routes
├── services/
│   ├── membership.js    # Membership service
│   └── aiAnalyzer.js    # AI analysis service
├── middleware/
│   └── auth.js          # Authentication middleware
└── config/
    └── gemini.js        # Gemini API configuration
```

### Security Considerations
1. **API Key Protection**: Gemini API Key must be stored on the server side, cannot be exposed to frontend
2. **Rate Limiting**: Implement rate limiting on AI analysis endpoint to prevent abuse
3. **Input Validation**: Validate JD text length and format
4. **Error Handling**: Do not expose internal error messages to frontend

### Performance Optimization
1. **Caching**: Cache analysis results for identical JD text
2. **Async Processing**: If analysis takes long, consider async processing, return task ID
3. **Batch Processing**: If batch analysis is supported, can improve efficiency

---

## Testing Suggestions

### Test Cases
1. **Unauthenticated user**: Should return free user status
2. **Free user**: Attempting to use AI feature should return 403
3. **Member user**: Should be able to use AI feature normally
4. **Expired member**: Should return 403
5. **Invalid token**: Should return 401
6. **Empty JD text**: Should return error or empty result
7. **Very long JD text**: Should handle or truncate

---

## Frontend Code Locations

- **API Calls**: `services/api.ts`
- **Membership Status Management**: `App.tsx` (useState, useEffect)
- **UI Display**: `components/EditorPanel.tsx`
- **Basic Matching (Free)**: `services/jdMatcher.ts` (analyzeJDMatch)

---

## Important Notes

1. **CORS**: Backend needs to configure CORS to allow frontend domain access
2. **Environment Variables**: Frontend uses `VITE_API_BASE_URL`, backend needs to configure corresponding port and path
3. **Data Format**: Ensure request and response JSON formats match the documentation
4. **Error Handling**: Unified error response format for easier frontend handling

---

## Contact

For questions, please refer to the `services/api.ts` file in the frontend code, which contains detailed interface call logic and error handling.
