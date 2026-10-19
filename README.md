# HTML Polyglot - Tag-Safe HTML Content Translator

A full-stack web application built with React, Vite, Tailwind CSS, Express, and Google's `@google/genai` SDK that translates HTML content into Russian, Arabic, Spanish, German, and 40+ languages while strictly preserving 100% of HTML tags, hierarchies, CSS classes, element IDs, and script tags.

---

## Running Locally

You can run this project locally on your machine in just a few steps.

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended, Node 20+ preferred)
- **npm**, **yarn**, or **pnpm**
- A free **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

### Step 1: Clone or Download the Project
```bash
git clone <your-repo-url>
cd <repo-folder>
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` in your editor and add your Gemini API key:
```env
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
PORT=3000
```

### Step 4: Start the Development Server
```bash
npm run dev
```

Open your browser at **[http://localhost:3000](http://localhost:3000)**.
The development server automatically starts both the Express backend API and the Vite React frontend on port 3000 via Vite's middleware mode.

---

## Production Build & Run

To build for production and serve the optimized build:

```bash
# 1. Build client bundle
npm run build

# 2. Run the production server
NODE_ENV=production npm start
```

---

---

## Using Local or Custom Endpoints (vLLM, Ollama, LM Studio)

You do **not** need a Gemini API key if you have a locally running model:

1. **Start your local server** (e.g. vLLM with Qwen):
   ```bash
   vllm serve Qwen/Qwen2.5-32B-Instruct --host 0.0.0.0 --port 8000 --allowed-origins "*"
   ```
2. In the app:
   - Click the **Model Pill** in the top bar (next to Settings).
   - Select **"Custom / Local Endpoint (vLLM)"**.
   - Click **"Paste VS Code JSON"** and paste your custom endpoint configuration, or click **"Load Qwen (localhost:8000)"**.
   - Click **"Test Connection"** to verify connectivity.
   - Choose **"Direct from Browser"** if accessing `http://localhost:8000` from this preview, or **"Via Server Proxy"** when running the app locally with `npm run dev`.

---

## How It Works

- **DOM-Safe Extraction**: The app parses HTML into a DOM tree in the browser, extracts only human text nodes, schema JSON-LD, and translatable attributes (`alt`, `placeholder`, `title`), leaving all HTML structure untouched.
- **Zero Tag Modification**: Because the DOM tree structure is preserved and only the text content nodes are updated, no tags, classes, or IDs can ever be altered or lost.
- **RTL Support**: Automatically adds `dir="rtl"` for Arabic, Hebrew, Persian, and Urdu when enabled.
- **Integrity Audit**: Compares original and translated HTML to verify 100% tag, class, and ID parity.
