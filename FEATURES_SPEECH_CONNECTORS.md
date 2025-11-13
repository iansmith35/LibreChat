# Speech, Connectors & Directive Features

This document describes the new features added for speech-to-speech, external connectors, and AI directive configuration.

## Phase A: Directive Window & Persistent Memory (Fully Implemented)

### Directive System

The directive system allows you to configure custom system prompts, personality traits, and memory policies for your AI conversations.

#### Backend Components

- **`api/server/agent/directive.ts`**: File-backed directive store with atomic writes
- **`api/server/routes/directive.js`**: REST API endpoints for directive management

#### API Endpoints

- `GET /api/agent/directive/:conversationId` - Get directive for a conversation
- `POST /api/agent/directive/:conversationId` - Save/update directive
- `GET /api/agent/directive/:conversationId/history` - Get directive history
- `DELETE /api/agent/directive/:conversationId` - Delete directive
- `GET /api/agent/presets` - Get all directive presets

#### Frontend Components

- **`client/src/components/DirectiveWindow.tsx`**: UI for configuring directives
  - System prompt configuration
  - Personality settings
  - Memory policy definition
  - Persistent storage in localStorage and server

### Memory Management

The memory system provides file-backed persistent storage for conversation memories that can be injected into AI prompts.

#### Backend Components

- **`api/server/memory/store.ts`**: File-backed JSON memory store with atomic writes
- **`api/server/routes/memory.js`**: REST API endpoints for memory management

#### API Endpoints

- `GET /api/memory/:conversationId` - Get all memory items
- `POST /api/memory/:conversationId` - Add a memory item
- `PATCH /api/memory/:conversationId/:itemId` - Update a memory item
- `DELETE /api/memory/:conversationId/:itemId` - Delete a memory item
- `DELETE /api/memory/:conversationId` - Clear all memories

#### Frontend Components

- **`client/src/hooks/useMemory.ts`**: React hook for memory management
  - Load memories
  - Add/update/delete memories
  - Toggle memory enable/disable
  - Clear all memories

#### Features

- Atomic file writes (write to temp, then rename)
- Per-conversation memory isolation
- Enable/disable individual memory items
- Automatic persistence to disk
- In-memory caching for performance

## Phase B: External Connectors (Scaffolded)

### Google OAuth Connector

Provides OAuth authentication for Google services.

#### Backend Components

- **`api/server/connectors/google_oauth.ts`**: Google OAuth implementation
- Session-scoped in-memory token storage
- OAuth flow with state verification

#### API Endpoints

- `GET /api/connectors/google/login` - Initiate OAuth flow
- `GET /api/connectors/google/callback` - OAuth callback handler
- `GET /api/connectors/google/status` - Check connection status
- `DELETE /api/connectors/google/disconnect` - Disconnect account

#### Frontend Components

- **`client/src/integrations/googleAuthPopup.ts`**: OAuth popup handler
- Handles postMessage communication
- Timeout and error handling

### rube.app Connector (Scaffolded)

Scaffold for integrating with rube.app services.

#### API Endpoints

- `POST /api/connectors/rube/link` - Link API key
- `GET /api/connectors/rube/status` - Check connection status
- `DELETE /api/connectors/rube/disconnect` - Disconnect
- `POST /api/connectors/rube/login` - OAuth login (scaffold)
- `GET /api/connectors/rube/callback` - OAuth callback (scaffold)

### Connectors Panel

- **`client/src/components/ConnectorsPanel.tsx`**: UI for managing connectors
- **`client/src/pages/Settings/ConnectorsPage.tsx`**: Settings page integration
- **`api/server/routes/connectors.js`**: Combined connector routes
  - `GET /api/connectors/list` - List all connectors

## Phase C: Speech-to-Speech (Scaffolded)

### Google Cloud STT/TTS

Text-to-Speech and Speech-to-Text using Google Cloud APIs.

#### Backend Components

- **`api/server/connectors/google_cloud.js`**: Google Cloud Speech services
- Lazy-loads Google Cloud libraries when credentials are available
- Returns 501 error with setup instructions when not configured

#### API Endpoints

- `POST /api/speech/stt` - Speech-to-Text (audio upload, max 10MB)
- `POST /api/speech/tts` - Text-to-Speech (returns base64 audio)
- `GET /api/speech/status` - Check service availability

#### Voice Configuration

Default voice mapping: **"Vale"** → `en-GB-Wavenet-F` (Female, British English)

Override via environment variable:
```bash
TTS_DEFAULT_VOICE=en-US:en-US-Wavenet-A:MALE
```

#### Frontend Components

- **`client/src/components/SpeechButton.tsx`**: Voice recording and playback
  - MediaRecorder API for audio capture
  - Automatic transcription upload
  - TTS response playback
  - Visual recording indicator

#### Features

- 10MB audio upload limit
- WebM Opus audio format
- Automatic punctuation in transcripts
- MP3 audio output for TTS
- Rate limiting ready

## Environment Variables

### Required for Speech Services

```bash
# Option 1: Path to service account JSON
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Option 2: JSON string (useful for Docker/cloud deployments)
GOOGLE_CLOUD_KEY='{"type":"service_account",...}'
```

### Optional Configuration

```bash
# Default TTS voice (overrides "Vale" mapping)
# Format: languageCode:voiceName:ssmlGender
TTS_DEFAULT_VOICE=en-GB:en-GB-Wavenet-F:FEMALE

# Session secret for OAuth
SESSION_SECRET=your-random-secret-here

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=your-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3080/api/connectors/google/callback

# rube.app
RUBE_CLIENT_ID=your-rube-client-id
RUBE_CLIENT_SECRET=your-rube-client-secret
RUBE_REDIRECT_URI=http://localhost:3080/api/connectors/rube/callback
```

## Setup Instructions

### 1. Install Dependencies

The required Google Cloud packages are already added to `api/package.json`:
- `@google-cloud/speech`
- `@google-cloud/text-to-speech`

### 2. Configure Google Cloud

1. Create a Google Cloud project
2. Enable Speech-to-Text and Text-to-Speech APIs
3. Create a service account with appropriate permissions
4. Download the JSON key file or copy its contents

### 3. Set Environment Variables

Add to your `.env` file:
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
# OR
GOOGLE_CLOUD_KEY='{"type":"service_account",...}'

# Optional: Override default voice
TTS_DEFAULT_VOICE=en-US:en-US-Neural2-F:FEMALE
```

### 4. Start the Server

```bash
npm run backend:dev
# or
npm run backend
```

### 5. Test Speech Services

Check if services are available:
```bash
curl http://localhost:3080/api/speech/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Testing

### Memory Store Tests

Run memory store tests:
```bash
cd api
npm test -- test/server/memory/store.test.js
```

Tests cover:
- Adding memory items
- Updating items
- Deleting items
- Persistence across store instances
- Atomic writes
- Concurrent operations

## Data Storage

### File Locations

- **Directives**: `data/directives/directives.json`
- **Directive History**: `data/directives/directive-history.json`
- **Memory Store**: `data/memory/memory-store.json`

### Data Format

All data is stored as JSON with atomic writes:
1. Write to temporary file (`.tmp`)
2. Atomic rename to final location
3. Ensures no corruption on crash/interruption

## Security Considerations

1. **No Secrets in Code**: All credentials via environment variables
2. **In-Memory Tokens**: OAuth tokens stored in memory (not persisted)
3. **Rate Limiting**: Ready for implementation on speech endpoints
4. **File Size Limits**: 10MB max for audio uploads
5. **Authentication**: All endpoints require JWT authentication

## Future Enhancements

### Phase B Completion
- Persistent OAuth token storage (Redis/DB with encryption)
- Complete rube.app integration
- Additional connector types

### Phase C Completion
- WebSocket streaming for real-time STT
- Audio quality selection
- Multiple voice options in UI
- Conversation mode (continuous speech)

### Phase A Enhancement
- Memory search and filtering
- Automatic memory extraction from conversations
- Memory categories and tags
- Export/import memory data

## Troubleshooting

### Speech Services Not Available

**Error**: `Speech-to-Text service not available`

**Solution**: 
1. Verify Google Cloud credentials are set
2. Check service account has correct permissions
3. Ensure APIs are enabled in Google Cloud Console

### OAuth Popup Blocked

**Error**: Popup window doesn't open

**Solution**:
1. Allow popups for the LibreChat domain
2. Check browser console for errors
3. Verify redirect URIs are correctly configured

### Memory Not Persisting

**Error**: Memory items disappear after restart

**Solution**:
1. Check file permissions on `data/` directory
2. Verify disk space is available
3. Check server logs for write errors

## API Usage Examples

### Add Memory via API

```bash
curl -X POST http://localhost:3080/api/memory/conv-123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "User prefers concise responses"}'
```

### Save Directive

```bash
curl -X POST http://localhost:3080/api/agent/directive/conv-123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "systemPrompt": "You are a helpful assistant.",
    "personality": "professional",
    "memoryPolicy": "Remember user preferences"
  }'
```

### Speech-to-Text

```bash
curl -X POST http://localhost:3080/api/speech/stt \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@recording.webm" \
  -F "languageCode=en-US"
```

### Text-to-Speech

```bash
curl -X POST http://localhost:3080/api/speech/tts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, I am Vale, your AI assistant.",
    "voiceName": "Vale"
  }'
```

## Contributing

When contributing to these features:

1. Follow existing code patterns
2. Add tests for new functionality
3. Update documentation
4. Ensure no secrets are committed
5. Test both success and error cases

## License

These features are part of LibreChat and follow the same license terms.
