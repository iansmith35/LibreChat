<p align="center">
  <a href="https://librechat.ai">
    <img src="client/public/assets/logo.svg" height="256">
  </a>
  <h1 align="center">
    <a href="https://librechat.ai">LibreChat</a>
  </h1>
</p>

<p align="center">
  <a href="https://discord.librechat.ai"> 
    <img
      src="https://img.shields.io/discord/1086345563026489514?label=&logo=discord&style=for-the-badge&logoWidth=20&logoColor=white&labelColor=000000&color=blueviolet">
  </a>
  <a href="https://www.youtube.com/@LibreChat"> 
    <img
      src="https://img.shields.io/badge/YOUTUBE-red.svg?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&logoWidth=20">
  </a>
  <a href="https://docs.librechat.ai"> 
    <img
      src="https://img.shields.io/badge/DOCS-blue.svg?style=for-the-badge&logo=read-the-docs&logoColor=white&labelColor=000000&logoWidth=20">
  </a>
  <a aria-label="Sponsors" href="https://github.com/sponsors/danny-avila">
    <img
      src="https://img.shields.io/badge/SPONSORS-brightgreen.svg?style=for-the-badge&logo=github-sponsors&logoColor=white&labelColor=000000&logoWidth=20">
  </a>
</p>

<p align="center">
<a href="https://railway.app/template/b5k2mn?referralCode=HI9hWz">
  <img src="https://railway.app/button.svg" alt="Deploy on Railway" height="30">
</a>
<a href="https://zeabur.com/templates/0X2ZY8">
  <img src="https://zeabur.com/button.svg" alt="Deploy on Zeabur" height="30"/>
</a>
<a href="https://template.cloud.sealos.io/deploy?templateName=librechat">
  <img src="https://raw.githubusercontent.com/labring-actions/templates/main/Deploy-on-Sealos.svg" alt="Deploy on Sealos" height="30">
</a>
</p>

<p align="center">
  <a href="https://www.librechat.ai/docs/translation">
    <img 
      src="https://img.shields.io/badge/dynamic/json.svg?style=for-the-badge&color=2096F3&label=locize&query=%24.translatedPercentage&url=https://api.locize.app/badgedata/4cb2598b-ed4d-469c-9b04-2ed531a8cb45&suffix=%+translated" 
      alt="Translation Progress">
  </a>
</p>


# ✨ Features

- 🖥️ **UI & Experience** inspired by ChatGPT with enhanced design and features

- 🤖 **AI Model Selection**:  
  - Anthropic (Claude), AWS Bedrock, OpenAI, Azure OpenAI, Google, Vertex AI, OpenAI Responses API (incl. Azure)
  - [Custom Endpoints](https://www.librechat.ai/docs/quick_start/custom_endpoints): Use any OpenAI-compatible API with LibreChat, no proxy required
  - Compatible with [Local & Remote AI Providers](https://www.librechat.ai/docs/configuration/librechat_yaml/ai_endpoints):
    - Ollama, groq, Cohere, Mistral AI, Apple MLX, koboldcpp, together.ai,
    - OpenRouter, Helicone, Perplexity, ShuttleAI, Deepseek, Qwen, and more

- 🔧 **[Code Interpreter API](https://www.librechat.ai/docs/features/code_interpreter)**: 
  - Secure, Sandboxed Execution in Python, Node.js (JS/TS), Go, C/C++, Java, PHP, Rust, and Fortran
  - Seamless File Handling: Upload, process, and download files directly
  - No Privacy Concerns: Fully isolated and secure execution

- 🔦 **Agents & Tools Integration**:  
  - **[LibreChat Agents](https://www.librechat.ai/docs/features/agents)**:
    - No-Code Custom Assistants: Build specialized, AI-driven helpers
    - Agent Marketplace: Discover and deploy community-built agents
    - Collaborative Sharing: Share agents with specific users and groups
    - Flexible & Extensible: Use MCP Servers, tools, file search, code execution, and more
    - Compatible with Custom Endpoints, OpenAI, Azure, Anthropic, AWS Bedrock, Google, Vertex AI, Responses API, and more
    - [Model Context Protocol (MCP) Support](https://modelcontextprotocol.io/clients#librechat) for Tools

- 🔍 **Web Search**:  
  - Search the internet and retrieve relevant information to enhance your AI context
  - Combines search providers, content scrapers, and result rerankers for optimal results
  - **Customizable Jina Reranking**: Configure custom Jina API URLs for reranking services
  - **[Learn More →](https://www.librechat.ai/docs/features/web_search)**

- 🪄 **Generative UI with Code Artifacts**:  
  - [Code Artifacts](https://youtu.be/GfTj7O4gmd0?si=WJbdnemZpJzBrJo3) allow creation of React, HTML, and Mermaid diagrams directly in chat

- 🎨 **Image Generation & Editing**
  - Text-to-image and image-to-image with [GPT-Image-1](https://www.librechat.ai/docs/features/image_gen#1--openai-image-tools-recommended)
  - Text-to-image with [DALL-E (3/2)](https://www.librechat.ai/docs/features/image_gen#2--dalle-legacy), [Stable Diffusion](https://www.librechat.ai/docs/features/image_gen#3--stable-diffusion-local), [Flux](https://www.librechat.ai/docs/features/image_gen#4--flux), or any [MCP server](https://www.librechat.ai/docs/features/image_gen#5--model-context-protocol-mcp)
  - Produce stunning visuals from prompts or refine existing images with a single instruction

- 💾 **Presets & Context Management**:  
  - Create, Save, & Share Custom Presets  
  - Switch between AI Endpoints and Presets mid-chat
  - Edit, Resubmit, and Continue Messages with Conversation branching  
  - Create and share prompts with specific users and groups
  - [Fork Messages & Conversations](https://www.librechat.ai/docs/features/fork) for Advanced Context control

- 💬 **Multimodal & File Interactions**:  
  - Upload and analyze images with Claude 3, GPT-4.5, GPT-4o, o1, Llama-Vision, and Gemini 📸  
  - Chat with Files using Custom Endpoints, OpenAI, Azure, Anthropic, AWS Bedrock, & Google 🗃️

- 🌎 **Multilingual UI**:
  - English, 中文 (简体), 中文 (繁體), العربية, Deutsch, Español, Français, Italiano
  - Polski, Português (PT), Português (BR), Русский, 日本語, Svenska, 한국어, Tiếng Việt
  - Türkçe, Nederlands, עברית, Català, Čeština, Dansk, Eesti, فارسی
  - Suomi, Magyar, Հայերեն, Bahasa Indonesia, ქართული, Latviešu, ไทย, ئۇيغۇرچە

- 🧠 **Reasoning UI**:  
  - Dynamic Reasoning UI for Chain-of-Thought/Reasoning AI models like DeepSeek-R1

- 🎨 **Customizable Interface**:  
  - Customizable Dropdown & Interface that adapts to both power users and newcomers

- 🗣️ **Speech & Audio**:  
  - Chat hands-free with Speech-to-Text and Text-to-Speech  
  - Automatically send and play Audio  
  - Supports OpenAI, Azure OpenAI, and Elevenlabs

- 📥 **Import & Export Conversations**:  
  - Import Conversations from LibreChat, ChatGPT, Chatbot UI  
  - Export conversations as screenshots, markdown, text, json

- 🔍 **Search & Discovery**:  
  - Search all messages/conversations

- 👥 **Multi-User & Secure Access**:
  - Multi-User, Secure Authentication with OAuth2, LDAP, & Email Login Support
  - Built-in Moderation, and Token spend tools

- ⚙️ **Configuration & Deployment**:  
  - Configure Proxy, Reverse Proxy, Docker, & many Deployment options  
  - Use completely local or deploy on the cloud

- 📖 **Open-Source & Community**:  
  - Completely Open-Source & Built in Public  
  - Community-driven development, support, and feedback

[For a thorough review of our features, see our docs here](https://docs.librechat.ai/) 📚

## 🪶 All-In-One AI Conversations with LibreChat

LibreChat brings together the future of assistant AIs with the revolutionary technology of OpenAI's ChatGPT. Celebrating the original styling, LibreChat gives you the ability to integrate multiple AI models. It also integrates and enhances original client features such as conversation and message search, prompt templates and plugins.

With LibreChat, you no longer need to opt for ChatGPT Plus and can instead use free or pay-per-call APIs. We welcome contributions, cloning, and forking to enhance the capabilities of this advanced chatbot platform.

[![Watch the video](https://raw.githubusercontent.com/LibreChat-AI/librechat.ai/main/public/images/changelog/v0.7.6.gif)](https://www.youtube.com/watch?v=ilfwGQtJNlI)

Click on the thumbnail to open the video☝️

---

## 🎙️ Speech-to-Speech & Advanced Features

LibreChat now includes comprehensive speech-to-speech capabilities, an extensible connector system for third-party integrations, persistent memory across conversations, and a directive system for agent customization.

### Speech-to-Speech

Record audio, transcribe it to text (STT), and have agent responses read aloud (TTS) with support for multiple providers:

- **Supported Providers:** OpenAI, Azure OpenAI, Google Cloud Speech/TTS
- **Google Cloud Default Voice:** UK English female (en-GB-Wavenet-F)
- **Endpoints:**
  - `POST /api/speech/stt` - Upload audio file, receive transcript
  - `POST /api/speech/tts` - Send text, receive audio stream

### Connectors

Connect external services and APIs to extend LibreChat functionality:

- **Google OAuth:** Sign in with Google and access Google services
- **Google Cloud:** Upload service account for Speech/TTS integration
- **Rube.app:** OAuth and API-key based connector (scaffold)
- **Generic API-key connectors:** Extensible system for future integrations

**Endpoints:**
- `GET /api/connectors/list` - List all connected services
- `GET /api/connectors/google/login` - Initiate Google OAuth
- `POST /api/connectors/google-cloud/upload` - Upload service account JSON
- `POST /api/connectors/rube/api-key` - Connect with rube.app API key

### Directives

Customize agent behavior per conversation with system prompts, personality, and memory policies:

- **System Prompt:** Override default instructions
- **Personality:** Define agent tone and style
- **Directives:** Specific rules and constraints
- **Memory Policy:** Control how agent uses persistent memory

**Endpoints:**
- `GET /api/agents/directive/:conversationId` - Retrieve directive
- `POST /api/agents/directive/:conversationId` - Save directive

### Persistent Memory

Agents can remember information across conversations:

- **File-backed storage:** JSON files with atomic writes
- **Per-user, per-conversation:** Isolated memory spaces
- **Token limits:** Configurable memory capacity
- **Endpoints:**
  - `GET /api/memories` - List all memories
  - `POST /api/memories` - Create memory
  - `PATCH /api/memories/:key` - Update memory
  - `DELETE /api/memories/:key` - Delete memory

### Environment Variables

Configure these features via environment variables:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3080/api/connectors/google/callback

# Google Cloud Speech/TTS
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
# OR
GOOGLE_CLOUD_KEY={"type":"service_account",...}
GOOGLE_CLOUD_PROJECT=your-project-id

# TTS Default Voice (UK English female)
TTS_DEFAULT_VOICE=en-GB-Wavenet-F

# Rube.app (Optional)
RUBE_CLIENT_ID=your_rube_client_id
RUBE_CLIENT_SECRET=your_rube_client_secret
RUBE_OAUTH_REDIRECT_URI=http://localhost:3080/api/connectors/rube/callback

# Storage Paths
DIRECTIVE_STORE_PATH=./data/directives
MEMORY_STORE_PATH=./data/memory

# Session Secret (Required for OAuth)
SESSION_SECRET=your_session_secret
```

### Security Notes

- **No secrets in code:** All credentials managed via environment variables
- **In-memory tokens:** OAuth tokens stored in-memory (session-scoped)
- **Encrypted storage recommended:** For production, use encrypted database or Redis
- **Rate limiting:** Speech endpoints include rate limiting
- **Upload limits:** Audio files limited to 10MB

### Getting Started

1. **Configure environment variables** in your `.env` file
2. **Obtain Google Cloud credentials:**
   - Create a project in Google Cloud Console
   - Enable Speech-to-Text and Text-to-Speech APIs
   - Create a service account and download JSON key
   - Set `GOOGLE_APPLICATION_CREDENTIALS` or upload via connectors
3. **Start the server** and access the UI
4. **Connect services** via Settings > Connectors
5. **Test speech-to-speech** with the microphone button in chat

For detailed setup instructions, see the [documentation](https://librechat.ai/docs).

---

## 🌐 Resources

**GitHub Repo:**
  - **RAG API:** [github.com/danny-avila/rag_api](https://github.com/danny-avila/rag_api)
  - **Website:** [github.com/LibreChat-AI/librechat.ai](https://github.com/LibreChat-AI/librechat.ai)

**Other:**
  - **Website:** [librechat.ai](https://librechat.ai)
  - **Documentation:** [librechat.ai/docs](https://librechat.ai/docs)
  - **Blog:** [librechat.ai/blog](https://librechat.ai/blog)

---

## 📝 Changelog

Keep up with the latest updates by visiting the releases page and notes:
- [Releases](https://github.com/danny-avila/LibreChat/releases)
- [Changelog](https://www.librechat.ai/changelog) 

**⚠️ Please consult the [changelog](https://www.librechat.ai/changelog) for breaking changes before updating.**

---

## ⭐ Star History

<p align="center">
  <a href="https://star-history.com/#danny-avila/LibreChat&Date">
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=danny-avila/LibreChat&type=Date&theme=dark" onerror="this.src='https://api.star-history.com/svg?repos=danny-avila/LibreChat&type=Date'" />
  </a>
</p>
<p align="center">
  <a href="https://trendshift.io/repositories/4685" target="_blank" style="padding: 10px;">
    <img src="https://trendshift.io/api/badge/repositories/4685" alt="danny-avila%2FLibreChat | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/>
  </a>
  <a href="https://runacap.com/ross-index/q1-24/" target="_blank" rel="noopener" style="margin-left: 20px;">
    <img style="width: 260px; height: 56px" src="https://runacap.com/wp-content/uploads/2024/04/ROSS_badge_white_Q1_2024.svg" alt="ROSS Index - Fastest Growing Open-Source Startups in Q1 2024 | Runa Capital" width="260" height="56"/>
  </a>
</p>

---

## ✨ Contributions

Contributions, suggestions, bug reports and fixes are welcome!

For new features, components, or extensions, please open an issue and discuss before sending a PR.

If you'd like to help translate LibreChat into your language, we'd love your contribution! Improving our translations not only makes LibreChat more accessible to users around the world but also enhances the overall user experience. Please check out our [Translation Guide](https://www.librechat.ai/docs/translation).

---

## 💖 This project exists in its current state thanks to all the people who contribute

<a href="https://github.com/danny-avila/LibreChat/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=danny-avila/LibreChat" />
</a>

---

## 🎉 Special Thanks

We thank [Locize](https://locize.com) for their translation management tools that support multiple languages in LibreChat.

<p align="center">
  <a href="https://locize.com" target="_blank" rel="noopener noreferrer">
    <img src="https://github.com/user-attachments/assets/d6b70894-6064-475e-bb65-92a9e23e0077" alt="Locize Logo" height="50">
  </a>
</p>

---

## 🎙️ Speech-to-Speech and External Connectors

LibreChat now supports speech-to-speech capabilities and external service connectors for enhanced functionality.

### Speech-to-Speech

Enable natural voice conversations with your AI assistant using Google Cloud Speech APIs or compatible alternatives.

**Features:**
- 🎤 **Speech-to-Text**: Record audio directly in the UI and have it transcribed to text
- 🔊 **Text-to-Speech**: Get audio responses from the AI agent
- 🌐 **Google Cloud Integration**: Uses Google Cloud Speech-to-Text and Text-to-Speech APIs
- 🔄 **Fallback Support**: Works with open-source alternatives when Google Cloud is not configured

**Configuration:**

To enable speech-to-speech, you need to configure Google Cloud credentials:

**Option 1: Service Account Key File** (recommended for local development)
```bash
# Set the path to your service account JSON key file
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your-service-account-key.json
```

**Option 2: JSON Key as Environment Variable** (recommended for Docker/cloud)
```bash
# Set the entire JSON key as an environment variable
GOOGLE_CLOUD_KEY='{"type":"service_account","project_id":"your-project",...}'
```

**Getting Google Cloud Credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Cloud Speech-to-Text API and Cloud Text-to-Speech API
4. Go to IAM & Admin → Service Accounts
5. Create a service account with the following roles:
   - Cloud Speech-to-Text User
   - Cloud Text-to-Speech User
6. Create and download a JSON key for the service account
7. Add the key to your environment as shown above

### External Connectors

Connect external services to extend LibreChat's capabilities with tools and integrations.

**Supported Connectors:**
- 🔗 **Google OAuth**: Connect your Google account for cloud services
- 🔌 **Rube.app**: Integration with Rube.app services
- ⚙️ **Generic Connectors**: Add custom connectors with API keys

**Configuration:**

#### Google OAuth Connector

```bash
# Obtain from https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3080/api/connectors/google/callback
```

**Setting up Google OAuth:**
1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Set application type to "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3080/api/connectors/google/callback` (for local development)
   - Your production URL + `/api/connectors/google/callback` (for production)
5. Copy the Client ID and Client Secret to your `.env` file

#### Rube.app Connector

```bash
RUBE_CLIENT_ID=your-rube-client-id
RUBE_CLIENT_SECRET=your-rube-client-secret
RUBE_OAUTH_URL=https://rube.app/oauth/authorize
RUBE_REDIRECT_URI=http://localhost:3080/api/connectors/rube/callback
```

### Agent Directives

Configure agent behavior, personality, and memory settings per conversation.

**Features:**
- 📝 **System Prompts**: Set custom system-level instructions
- 🎭 **Personality**: Define communication style and tone
- 📋 **Directives**: Add specific behavioral instructions
- �� **Memory Policy**: Control how the agent uses persistent memory

**Usage:**

Directives are managed through the UI's side panel. You can:
1. Open the Connectors panel from settings
2. Set system prompts and personality traits
3. Add or remove specific directives
4. Configure memory retention policy (automatic, manual, or off)

### Persistent Memory

Store and retrieve conversation context across sessions for better continuity.

**Features:**
- 💾 **File-based Storage**: Memories stored securely in `data/memory/`
- 🔐 **Per-conversation**: Each conversation has its own memory store
- 📊 **Memory Management**: View, edit, and clear memory through the UI
- 🔄 **Auto-sync**: Automatically updated based on directive settings

**Storage Location:**
```
data/
├── memory/         # Conversation memories (JSON)
└── directives/     # Agent directives (JSON)
```

**Note:** The `data/` directory is gitignored by default to protect sensitive information.

### Security Notes

⚠️ **Important Security Considerations:**

- Never commit service account keys or OAuth credentials to version control
- Use environment variables for all sensitive configuration
- Tokens are stored in memory by default (use Redis or database for production)
- The `data/` directory contains sensitive conversation data and should be secured
- Regularly rotate API keys and service account credentials
- Use HTTPS in production to protect OAuth flows

### API Endpoints

The following new API endpoints are available:

**Speech APIs:**
- `POST /api/speech/stt` - Speech-to-text transcription
- `POST /api/speech/tts` - Text-to-speech synthesis
- `GET /api/speech/status` - Check service configuration status

**Connector APIs:**
- `GET /api/connectors/google/login` - Initiate Google OAuth
- `GET /api/connectors/google/callback` - OAuth callback handler
- `GET /api/connectors/google/status` - Check connection status
- `POST /api/connectors/google/disconnect` - Disconnect Google account
- Similar endpoints for `/api/connectors/rube/*`

**Memory APIs:**
- `GET /api/memory/:conversationId` - Retrieve conversation memory
- `POST /api/memory/:conversationId` - Save conversation memory
- `DELETE /api/memory/:conversationId` - Clear conversation memory

**Directive APIs:**
- `GET /api/agent/directive/:conversationId` - Get agent directive
- `POST /api/agent/directive/:conversationId` - Save agent directive
- `DELETE /api/agent/directive/:conversationId` - Delete agent directive

### Testing

To test the new features locally:

1. **Configure environment variables** in `.env` file
2. **Start the server**: `npm run backend:dev`
3. **Start the client**: `npm run frontend:dev`
4. **Test speech-to-speech**: Click the microphone icon in chat input
5. **Test connectors**: Open settings → Connectors panel
6. **Test directives**: Open the directive window from the side panel

### Troubleshooting

**Speech-to-speech not working:**
- Verify Google Cloud credentials are configured correctly
- Check that Speech APIs are enabled in your Google Cloud project
- Ensure service account has proper permissions
- Check browser console for error messages

**Connectors not connecting:**
- Verify OAuth credentials in environment variables
- Check redirect URIs match exactly (including protocol and port)
- Ensure cookies are enabled in browser
- Check that popup blockers are not preventing OAuth flow

**Memory not persisting:**
- Verify `data/memory/` directory exists and is writable
- Check server logs for file system errors
- Ensure conversation ID is valid

For more information and updates, visit [LibreChat Documentation](https://docs.librechat.ai).

