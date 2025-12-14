# Minimalist Resume Builder

A modern, minimalist resume builder with real-time Job Description (JD) matching and AI-enhanced analysis capabilities.

## Features

### Core Features (Free)
- ✏️ **Interactive Resume Editor**: Drag-and-drop sections, real-time preview
- 📄 **Multiple Export Formats**: Export to Word (.docx) or Print/PDF
- 🎯 **JD Real-time Matching**: Paste job descriptions and see keyword matches
- 🔍 **Keyword Highlighting**: Automatically highlight matched keywords in the resume preview
- 📊 **Match Score Dashboard**: Real-time match score (0-100) that updates as you edit
- 🏷️ **Missing Keywords Display**: Shows missing hard skills and soft skills from the JD

### Premium Features (Requires Backend)
- 🤖 **AI-Enhanced Analysis**: Advanced skill extraction and categorization using AI
- 👑 **Membership-based Access**: Premium features for members only

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS
- **Drag & Drop**: @dnd-kit
- **Document Generation**: docx library
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd resume-project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure backend API:
   Create a `.env.local` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3001/api
   ```
   If not set, the app will default to `http://localhost:3001/api`.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
resume-project/
├── components/          # React components
│   ├── EditorPanel.tsx  # Left sidebar editor
│   └── ResumePreview.tsx # Right preview area
├── services/            # Business logic
│   ├── api.ts          # Backend API integration
│   ├── jdMatcher.ts    # JD matching logic
│   └── docxGenerator.ts # Word document generation
├── types.ts             # TypeScript type definitions
├── constants.ts         # Initial resume data template
└── App.tsx             # Main application component
```

## Backend Integration

This project is designed to work with a backend API for premium features. See `BACKEND_API.md` for detailed API specifications.

### Required Backend Endpoints

- `GET /api/user/membership` - Get user membership status
- `POST /api/jd/analyze-ai` - AI-enhanced JD analysis (premium)

For more details, refer to:
- `BACKEND_API.md` - Complete backend API documentation
- `FRONTEND_READY.md` - Frontend readiness and integration guide

## Usage

1. **Edit Your Resume**: Use the left sidebar to edit your profile, sections, and items
2. **Add JD for Matching**: Paste a job description in the "Target Job Description" field
3. **View Matches**: See highlighted keywords in the preview and match score in the sidebar
4. **Export**: Click "Export Word" to download a .docx file or "Print / PDF" to print

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
