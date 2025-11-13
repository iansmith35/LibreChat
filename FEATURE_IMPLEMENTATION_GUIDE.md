# Speech-to-Speech, Connectors, and Directives - Implementation Guide

This document provides setup and usage instructions for the new features added to LibreChat:
- **Directives**: System prompts, personality, and agent context management
- **Connectors**: OAuth-based integrations (Google, Rube.app, etc.)
- **Speech-to-Speech**: Google Cloud STT/TTS integration (scaffolded)

## Table of Contents
1. [Directives](#directives)
2. [Connectors](#connectors)
3. [Speech-to-Speech (Google Cloud)](#speech-to-speech)
4. [Environment Variables](#environment-variables)
5. [Security Considerations](#security-considerations)
6. [Testing](#testing)

---

## Directives

Directives allow you to configure agent behavior, personality, and system context per conversation.

### Features
- Create and manage custom directives
- Set system prompts, personality traits, and behavioral directives
- Configure memory policies for agent context
- Use preset templates (Professional Assistant, Creative Writer, Technical Expert, Educational Tutor)
- Store directives per user with file-backed storage

### API Endpoints

#### Get all directives
```http
GET /api/directives
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "directives": [
    {
      "id": "uuid",
      "name": "Professional Assistant",
      "systemPrompt": "You are a professional assistant...",
      "personality": "Professional, courteous",
      "directives": "- Be clear and concise\n- Provide sources",
      "memoryPolicy": "Remember user preferences",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get directive presets
```http
GET /api/directives/presets
Authorization: Bearer <jwt_token>
```

#### Create a directive
```http
POST /api/directives
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "My Custom Assistant",
  "systemPrompt": "You are a helpful assistant specialized in...",
  "personality": "Friendly and professional",
  "directives": "- Always provide examples\n- Explain step by step",
  "memoryPolicy": "Remember technical preferences"
}
```

#### Update a directive
```http
PATCH /api/directives/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "systemPrompt": "Updated system prompt..."
}
```

#### Delete a directive
```http
DELETE /api/directives/:id
Authorization: Bearer <jwt_token>
```

### Environment Variables

```bash
# Optional: Custom path for directive storage (defaults to api/data/directives)
DIRECTIVE_STORE_PATH=/path/to/directives
```

### Permissions

Directives use the existing `PROMPTS` permission type:
- `USE + READ`: View directives
- `USE + CREATE`: Create new directives
- `USE + UPDATE`: Modify existing directives
- `USE + DELETE`: Delete directives

---

## Connectors

Connectors provide OAuth-based integrations with external services.

### Supported Connectors (Scaffolded)
1. **Google OAuth**: OAuth2 flow for Google services
2. **Google Cloud**: Service account for STT/TTS
3. **Rube.app**: OAuth2 flow for Rube.app services

### API Endpoints

#### List connected connectors
```http
GET /api/connectors/list
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "connectors": {
    "google": {
      "connected": false,
      "type": "oauth"
    },
    "googleCloud": {
      "connected": false,
      "type": "service_account"
    },
    "rube": {
      "connected": false,
      "type": "oauth"
    }
  }
}
```

### Google OAuth Setup (Scaffold - TODO)

1. Create a Google Cloud Project at https://console.cloud.google.com
2. Enable required APIs (e.g., Google+ API for profile info)
3. Create OAuth 2.0 credentials:
   - Go to APIs & Services > Credentials
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `http://localhost:3080/api/connectors/google/callback`
4. Set environment variables:
   ```bash
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3080/api/connectors/google/callback
   ```

### Rube.app OAuth Setup (Scaffold - TODO)

```bash
RUBE_CLIENT_ID=your_rube_client_id
RUBE_CLIENT_SECRET=your_rube_client_secret
```

**Note**: OAuth flows are scaffolded but not fully implemented. See TODO comments in:
- `api/server/routes/connectors/google.js`
- `api/server/routes/connectors/rube.js`

### Implementation TODO

The connector system is scaffolded with the following tasks remaining:
- [ ] Implement OAuth state management (CSRF protection)
- [ ] Implement token exchange and storage (in-memory session-scoped)
- [ ] Add popup window handling for OAuth flows
- [ ] Implement token refresh logic
- [ ] Add service account file upload handler
- [ ] Create UI components (ConnectorsPanel, ConnectorsPage)

---

## Speech-to-Speech (Google Cloud)

Google Cloud Speech-to-Text (STT) and Text-to-Speech (TTS) integration is scaffolded for future implementation.

### Prerequisites (When Implementing)

1. **Create a Google Cloud Project**
   - Go to https://console.cloud.google.com
   - Create a new project or select existing

2. **Enable APIs**
   - Enable Cloud Speech-to-Text API
   - Enable Cloud Text-to-Speech API

3. **Create Service Account**
   - Go to IAM & Admin > Service Accounts
   - Create a new service account
   - Grant roles: "Cloud Speech Client", "Cloud Text-to-Speech Client"
   - Create and download JSON key

### Installation (When Ready to Implement)

```bash
npm install @google-cloud/speech @google-cloud/text-to-speech
```

### Configuration

#### Option 1: Service Account File Path
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
GOOGLE_CLOUD_PROJECT=your-project-id
```

#### Option 2: Service Account JSON as Environment Variable
```bash
GOOGLE_CLOUD_KEY='{"type":"service_account","project_id":"your-project",...}'
GOOGLE_CLOUD_PROJECT=your-project-id
```

### Implementation Status

The Google Cloud Speech integration is **scaffolded only**. See these files for implementation details:
- `api/server/services/Speech/googleCloudSTT.js` - STT scaffold with TODO comments
- `api/server/services/Speech/googleCloudTTS.js` - TTS scaffold with TODO comments

### Implementation TODO

- [ ] Install Google Cloud client libraries
- [ ] Implement `transcribeAudio()` in googleCloudSTT.js
- [ ] Implement `synthesizeSpeech()` in googleCloudTTS.js
- [ ] Add Google Cloud to STTService providers
- [ ] Add Google Cloud to TTSService providers
- [ ] Create tests with mocked Google Cloud clients
- [ ] Wire into existing /api/speech/stt and /api/speech/tts endpoints

### Example Usage (After Implementation)

#### Speech-to-Text
```javascript
const { transcribeAudio } = require('./services/Speech/googleCloudSTT');

// audioBuffer is the audio file as Buffer
const transcript = await transcribeAudio(audioBuffer, 'en-US');
console.log('Transcript:', transcript);
```

#### Text-to-Speech
```javascript
const { synthesizeSpeech } = require('./services/Speech/googleCloudTTS');

const audioBuffer = await synthesizeSpeech(
  'Hello, how can I help you today?',
  'en-US-Standard-A',
  'en-US'
);
// audioBuffer contains the MP3 audio data
```

---

## Environment Variables

### Complete List

```bash
#=====================================================#
# Directives & Memory Configuration                   #
#=====================================================#

# Path for storing directive files (optional, defaults to api/data/directives)
DIRECTIVE_STORE_PATH=/path/to/directives

# Path for storing memory files (optional, defaults to api/data/memory)
MEMORY_STORE_PATH=/path/to/memory

#=====================================================#
# Connectors Configuration                            #
#=====================================================#

# Google OAuth for Connectors (scaffolded)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3080/api/connectors/google/callback

# Google Cloud credentials for STT/TTS (scaffolded)
# Option 1: Path to service account JSON file
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
# Option 2: Service account JSON as string
GOOGLE_CLOUD_KEY={"type":"service_account",...}
GOOGLE_CLOUD_PROJECT=your_project_id

# Rube.app connector (scaffolded)
RUBE_CLIENT_ID=your_rube_client_id
RUBE_CLIENT_SECRET=your_rube_client_secret

# Session secret for OAuth token storage
SESSION_SECRET=your_random_session_secret
```

---

## Security Considerations

### ✅ Best Practices
1. **Never commit secrets to repository**
   - Use environment variables for all credentials
   - Add sensitive files to `.gitignore`
   - Service account JSON files are in `.gitignore` via `api/data/`

2. **Service Account Security**
   - Limit service account permissions to only what's needed
   - Rotate keys regularly
   - Use different service accounts for dev/staging/prod

3. **OAuth Security**
   - Always use HTTPS in production
   - Implement state parameter for CSRF protection
   - Store tokens securely (in-memory, session-scoped by default)
   - Implement token refresh logic

4. **Rate Limiting**
   - Existing rate limiters in `api/server/middleware/limiters/` apply to STT/TTS
   - Add additional rate limiting as needed for new endpoints

### 🚫 What NOT to Do
- Don't commit service account JSON files
- Don't hardcode credentials in code
- Don't expose credentials in client-side code
- Don't log sensitive information

---

## Testing

### Directive Endpoints

Test directive endpoints with curl or Postman:

```bash
# Get JWT token first (login)
TOKEN="your_jwt_token"

# Get all directives
curl -H "Authorization: Bearer $TOKEN" http://localhost:3080/api/directives

# Get presets
curl -H "Authorization: Bearer $TOKEN" http://localhost:3080/api/directives/presets

# Create a directive
curl -X POST http://localhost:3080/api/directives \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Assistant",
    "systemPrompt": "You are a test assistant",
    "personality": "Helpful",
    "directives": "- Be concise",
    "memoryPolicy": "Remember context"
  }'
```

### Connector Endpoints

```bash
# List connectors
curl -H "Authorization: Bearer $TOKEN" http://localhost:3080/api/connectors/list
```

### Google Cloud Speech (After Implementation)

1. **Create Mock Tests**
   ```javascript
   // Mock Google Cloud clients
   jest.mock('@google-cloud/speech');
   jest.mock('@google-cloud/text-to-speech');
   
   // Test transcription
   test('transcribe audio with Google Cloud', async () => {
     // Test implementation
   });
   ```

2. **Manual Testing**
   - Record audio using browser MediaRecorder
   - POST to `/api/speech/stt`
   - Verify transcript returned
   - Send text to `/api/speech/tts`
   - Verify audio playback works

---

## UI Components (TODO)

The following UI components need to be implemented:

### DirectiveWindow Component
- Modal or sidebar for editing directives
- Form fields: name, system prompt, personality, directives, memory policy
- Preset selection dropdown
- Save/cancel buttons
- Integration with conversation context

### ConnectorsPanel Component
- Display list of available connectors
- Show connected/disconnected status
- OAuth login buttons (popup flow)
- Service account upload for Google Cloud
- Connection status indicators

### SpeechButton Component (Enhancement)
- Record button with MediaRecorder API
- Upload audio to `/api/speech/stt`
- Display transcript in message input
- Auto-play TTS response from `/api/speech/tts`
- Toggle for speech input/output

### Hooks
- `useDirectives`: Manage directive state and API calls
- `useConnectors`: Manage connector state and OAuth flows
- `useMemory`: Sync conversation memory (already exists)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        LibreChat UI                          │
├─────────────────────────────────────────────────────────────┤
│  DirectiveWindow  │  ConnectorsPanel  │  SpeechButton      │
└─────────────┬───────────────┬─────────────────┬────────────┘
              │               │                  │
              ▼               ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                       Express Server                         │
├─────────────────────────────────────────────────────────────┤
│  /api/directives  │  /api/connectors  │  /api/speech/*      │
│     (v1)          │    (scaffold)      │   (existing)        │
└─────────────┬───────────────┬─────────────────┬────────────┘
              │               │                  │
              ▼               ▼                  ▼
┌──────────────────┐  ┌──────────────┐  ┌─────────────────┐
│  Directive       │  │  OAuth Token │  │  Google Cloud   │
│  Storage         │  │  Manager     │  │  STT/TTS        │
│  (File-backed)   │  │  (In-memory) │  │  (Scaffold)     │
└──────────────────┘  └──────────────┘  └─────────────────┘
```

---

## Next Steps

1. **Phase A Completion**: Implement DirectiveWindow UI and wire into agent messages
2. **Phase B Completion**: Implement OAuth flows and token management
3. **Phase C Completion**: Install Google Cloud libraries and complete STT/TTS integration
4. **Testing**: Add comprehensive tests for all components
5. **Documentation**: Expand README with usage examples and troubleshooting

---

## Support

For questions or issues:
1. Check the TODO comments in the code for implementation details
2. Review environment variable configuration
3. Check LibreChat documentation: https://docs.librechat.ai
4. Create an issue on GitHub

---

## Contributing

When implementing the scaffolded features:
1. Follow existing patterns in the codebase
2. Add comprehensive error handling
3. Include tests with mocked external services
4. Update this documentation
5. Follow security best practices
6. Never commit secrets or credentials
