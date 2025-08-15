# AI-Powered Writing Assistant with Inquiry Complexes

An advanced writing assistant that combines real-time AI criticism with deep intellectual exploration through dialectical inquiry networks.

## Features

### AI-Powered Real-Time Criticism
- **Dialectical Critic**: Challenges reasoning, identifies logical gaps, and strengthens intellectual rigor
- **Style Guide**: Improves writing flow, clarity, and persuasiveness
- **Inquiry Integration Agent**: Connects writing to deeper philosophical questions and existing knowledge

### Intelligent Suggestion Management
- Real-time text change detection with position tracking
- AI-powered evaluation of whether suggestions have been addressed
- Automatic suggestion lifecycle management (active → resolved → retracted)

### Inquiry Complex System
- Recursive networks of intellectual points, objections, refutations, and syntheses
- AI-generated philosophical exploration from writing purposes
- Visual exploration interface for complex intellectual relationships
- Integration between writing assistance and deep thinking

### Modular AI Service
- Support for OpenAI, Claude, and local inference APIs
- Local gpt-oss-20b model support via Ollama for privacy and offline use
- Structured prompt engineering for consistent AI responses
- Error handling and automatic fallback mechanisms

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd writing-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Install backend dependencies (for local inference):
```bash
cd backend
npm install
cd ..
```

4. Set up environment variables:
Create a `.env` file in the root directory:
```
REACT_APP_OPENAI_API_KEY=your_openai_api_key
REACT_APP_CLAUDE_API_KEY=your_claude_api_key

# Local inference (optional)
REACT_APP_USE_LOCAL_INFERENCE=false
REACT_APP_LOCAL_BACKEND_URL=http://localhost:3001
```

5. For local inference setup (optional):
   - Install [Ollama](https://ollama.com/download)
   - Pull the model: `ollama pull gpt-oss:20b`
   - Start Ollama: `ollama serve`

6. Start the development server:
```bash
# Start both frontend and backend (if using local inference)
npm run dev

# Or start frontend only
npm start
```

7. Open [http://localhost:3000](http://localhost:3000) to view the app.

## How to Use the Writing Assistant Effectively

### Getting Started

1. **Define Your Writing Purpose**
   - Be specific about what you want to achieve
   - Include your target audience (e.g., "policymakers," "general public," "academic peers")
   - Mention the type of reasoning you'll use (e.g., "evidence-based," "philosophical," "personal narrative")
   - Example: "I want to write a persuasive essay arguing for renewable energy adoption, targeting policymakers with evidence-based reasoning and economic arguments"

2. **Let AI Generate Initial Complexes**
   - The system automatically creates 2-3 inquiry complexes from your purpose
   - These represent deep questions that will strengthen your intellectual foundation
   - Review the notification showing which complexes were created

### Writing with AI Critics

3. **Start Writing and Monitor Feedback**
   - Begin writing your content in the main text area
   - AI critics analyze your text every 2 seconds as you write
   - Three types of feedback appear in the right panel:
     - **Intellectual feedback** (purple brain icon): Logic, reasoning, argument structure
     - **Stylistic feedback** (blue palette icon): Writing style, flow, clarity
     - **Inquiry integration** (green target icon): Connections to deeper questions

4. **Engage with Suggestions**
   - Hover over feedback cards to highlight relevant text sections
   - Use action buttons on each suggestion:
     - **Check mark**: Mark as resolved when you've addressed the issue
     - **X**: Dismiss suggestions that don't apply
     - **Arrow**: For inquiry integration suggestions, take special actions like creating new complexes

5. **Understand Suggestion Lifecycle**
   - **Active**: New suggestions requiring attention
   - **Resolved**: Issues you've successfully addressed (AI verified)
   - **Retracted**: Suggestions automatically withdrawn when AI detects you've made changes
   - **Dismissed**: Suggestions you've manually dismissed

### Using Inquiry Complexes for Deep Thinking

6. **Explore Generated Complexes**
   - Click the "Inquiry Complex" tab to see your generated intellectual networks
   - Each complex starts with a central question and develops objections, refutations, and syntheses
   - Use the "Expand" buttons to generate new intellectual content

7. **Apply Complex Insights to Writing**
   - When you receive inquiry integration suggestions, use the action button to:
     - **Create new complexes** from questions that emerge in your writing
     - **Apply insights** from existing complexes to strengthen your arguments
     - **Explore frameworks** to connect with broader philosophical traditions

### Best Practices

8. **Purpose Definition Tips**
   - Include concrete details about your goals, audience, and approach
   - Mention any specific challenges you're facing
   - Be honest about your level of expertise on the topic
   - Update your purpose if it evolves during writing

9. **Working with AI Feedback**
   - Don't feel obligated to implement every suggestion
   - Pay special attention to "high" severity intellectual feedback
   - Use style suggestions to improve readability for your target audience
   - Engage with inquiry integration suggestions to deepen your thinking

10. **Intellectual Development Strategy**
    - Start writing to get initial thoughts down
    - Use generated inquiry complexes to identify areas needing deeper thinking
    - Return to the Inquiry Complex tab when you encounter challenging questions
    - Let the recursive exploration inform your writing revisions

### Managing the Writing Process

11. **Monitoring Controls**
    - Toggle "Pause Critics" when you want to write without interruption
    - Use "Clear All Feedback" for a fresh start
    - The system remembers your complexes even when feedback is cleared

12. **Navigation Between Modes**
    - **Home**: Set or revise your writing purpose
    - **Writing**: Main writing interface with AI critics
    - **Inquiry Complex**: Deep intellectual exploration

### Troubleshooting Common Issues

13. **If Critics Aren't Responding**
    - Ensure you have sufficient content (at least 50 characters)
    - Check that monitoring is enabled (not paused)
    - Verify your API keys are properly configured

14. **If Suggestions Seem Irrelevant**
    - Review your purpose statement for clarity and specificity
    - Dismiss inappropriate suggestions to help train the system
    - Remember that intellectual suggestions may challenge your assumptions intentionally

15. **Maximizing Intellectual Development**
    - Don't rush to dismiss challenging intellectual feedback
    - Explore inquiry complexes even if they seem tangential initially
    - Use the recursive nature of complexes to discover unexpected insights
    - Apply insights from complexes back to your writing for richer argumentation

The writing assistant is designed to evolve with your thinking process, providing both immediate stylistic help and deep intellectual scaffolding for sophisticated written work.

## Technical Architecture

### Core Components

- **React Frontend**: Modern, responsive interface built with Create React App
- **AI Service Layer**: Modular service supporting OpenAI and Claude APIs
- **Text Analysis System**: Real-time change detection and suggestion position tracking
- **Inquiry Complex Engine**: Recursive AI-generated intellectual exploration networks
- **Suggestion Evaluator**: AI-powered assessment of suggestion resolution

### Key Files

- `src/agents/`: AI critic implementations (intellectual, stylistic, inquiry integration)
- `src/services/`: Core services (AI API, inquiry complexes, suggestion evaluation)
- `src/utils/`: Utilities (text change detection, position tracking)
- `src/components/`: React components for UI
- `src/hooks/`: Custom React hooks for writing analysis

### AI Integration

- Structured JSON prompts for consistent AI responses
- Error handling and response cleaning for reliable parsing
- Temperature and token control for different types of analysis
- Modular provider system for easy API switching

## Development

### Available Scripts

- `npm start`: Runs frontend development server
- `npm run backend`: Runs backend server for local inference
- `npm run dev`: Runs both frontend and backend concurrently
- `npm run build`: Creates production build
- `npm test`: Runs test suite
- `npm run eject`: Ejects from Create React App (one-way operation)

### Environment Variables

**Frontend (.env)**:
- `REACT_APP_OPENAI_API_KEY`: OpenAI API key for GPT models
- `REACT_APP_CLAUDE_API_KEY`: Anthropic API key for Claude models
- `REACT_APP_USE_LOCAL_INFERENCE`: Enable local inference (true/false)
- `REACT_APP_LOCAL_BACKEND_URL`: Backend URL for local inference

**Backend (backend/.env)**:
- `PORT`: Backend server port (default: 3001)
- `OLLAMA_BASE_URL`: Ollama API URL (default: http://localhost:11434)
- `OLLAMA_MODEL`: Model name (default: gpt-oss:20b)

### Local Inference Setup

**Requirements**:
- 16GB RAM minimum (more recommended)
- ~12GB storage for gpt-oss-20b model
- Ollama installed and running

**Troubleshooting**:
- If "Local backend unavailable": Check backend server and Ollama are running
- If "Model not found": Run `ollama pull gpt-oss:20b`
- For performance issues: Ensure sufficient RAM and close other applications

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
