# DraftResume

DraftResume is an AI-powered, BYOK (Bring Your Own Key) resume builder designed to help users quickly extract, tailor, and export ATS-friendly resumes and cover letters. 

![Dashboard Screenshot](./public/screenshot-dashboard.png)
![Login Screenshot](./public/screenshot-login.png)

## 🚀 Features

- **AI-Powered Parsing**: Paste a raw, unformatted resume or LinkedIn export, and let AI extract it into a structured format.
- **Job Description Tailoring**: Automatically tailor your resume's bullet points and summary to match a specific job description without hallucinating new information.
- **ATS-Friendly Exports**: Export your resume as a clean, parsable PDF or DOCX file.
- **Real-time Preview**: Edit your resume using a structured form and instantly see a live preview.
- **Cloud Sync**: Securely save your resumes to the cloud and access them from anywhere.
- **BYOK (Bring Your Own Key)**: Privacy-first architecture. Supply your own API key (OpenAI/Anthropic) to power the AI features without being locked into a subscription.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **UI & Styling**: [React 18](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/) (shadcn/ui components)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Authentication & Database**: [Supabase](https://supabase.com/)
- **Document Export**: `jspdf` (for PDF generation) and `docx` (for Word documents)
- **Drag & Drop**: `@dnd-kit/core`

## 🔐 Authentication & Cloud Storage

DraftResume uses **Supabase** for user authentication and data persistence.

- **Authentication**: Users can sign up and log in securely. The app uses `@supabase/ssr` to manage secure sessions via cookies, ensuring routes are protected via Next.js Middleware (`middleware.js`).
- **Cloud Sync**: Once authenticated, users can save their structured resume JSON directly to their Supabase account, making it accessible across devices.

## 🤖 AI API Integration

The core AI engine operates securely through a Next.js serverless route (`/api/ai`), interacting directly with the AI provider using the user's provided API key.

1. **Client Request**: The client sends a request containing the prompt, job description, or raw resume data, along with the API key stored in the Zustand store.
2. **Server-Side API (`/api/ai`)**: Acts as a secure proxy to interact with the LLM. It enforces strict JSON schemas to ensure the AI always returns a predictably structured resume object.
3. **Response Handling**: The application parses the returned JSON string to instantly update the UI.

## ⚙️ How it Works

1. **Setup**: The user clicks the Settings icon and inputs their preferred AI provider (e.g., OpenAI) and their API Key. This key is stored locally in the browser.
2. **Import**: The user pastes their current resume as raw text. The application sends this to the AI API, which parses it into a structured JSON schema.
3. **Edit & Tailor**: The user can manually edit fields using the form on the left, or paste a Job Description and click "Tailor to JD". The AI will rewrite bullet points to highlight relevant skills.
4. **Export**: The user selects their preferred template and exports the live preview to PDF or DOCX.

## 💻 Running Locally

### Prerequisites

- Node.js 18+
- Supabase Project (for Authentication & DB)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vishalvermauts/DraftResume.git
   cd DraftResume
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3001](http://localhost:3001) in your browser.
