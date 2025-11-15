# AI4EE Custom - Detailed Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [HeyGen API Integration Flow](#heygen-api-integration-flow)
4. [Detailed File Documentation](#detailed-file-documentation)
5. [Code Line-by-Line Analysis](#code-line-by-line-analysis)
6. [API Endpoints](#api-endpoints)
7. [State Management](#state-management)
8. [Component Hierarchy](#component-hierarchy)
9. [Usage Guide](#usage-guide)

---

## Project Overview

**AI4EE Custom** is a Next.js 15 application that provides an interactive AI avatar streaming experience using the HeyGen Streaming Avatar SDK. The application is specifically customized for the National AI Institute for Exceptional Education for early literacy interview purposes.

### Technology Stack
- **Framework**: Next.js 15.3.0 (App Router)
- **Language**: TypeScript 5.0.4
- **UI Library**: React 19.0.1
- **Styling**: Tailwind CSS 3.4.17
- **Avatar SDK**: @heygen/streaming-avatar ^2.0.13
- **UI Components**: Radix UI (@radix-ui/react-select, @radix-ui/react-switch, @radix-ui/react-toggle-group)
- **Utilities**: ahooks ^3.8.4

---

## Architecture Overview

The application follows a modular architecture with clear separation of concerns:

```
AI4EE_Custom/
├── app/                    # Next.js App Router files
│   ├── api/               # API routes
│   ├── lib/               # Utility constants
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page component
│   └── error.tsx          # Error boundary
├── components/            # React components
│   ├── AvatarConfig/      # Avatar configuration UI
│   ├── AvatarSession/     # Session-related components
│   ├── logic/             # Custom hooks and state management
│   └── ...                # Reusable UI components
├── public/                # Static assets
├── styles/                # Global CSS
└── agent_messages.json    # Predefined interview messages
```

---

## HeyGen API Integration Flow

### Complete Flow Diagram

```
1. User clicks "Chat" button
   ↓
2. Frontend calls /api/get-access-token (POST)
   ↓
3. API route fetches token from HeyGen API
   POST https://api.heygen.com/v1/streaming.create_token
   Headers: { "x-api-key": HEYGEN_API_KEY }
   ↓
4. Token returned to frontend
   ↓
5. StreamingAvatar SDK initialized with token
   new StreamingAvatar({ token, basePath })
   ↓
6. Event listeners attached
   (STREAM_READY, USER_START, AVATAR_TALKING_MESSAGE, etc.)
   ↓
7. Avatar session started
   avatar.createStartAvatar(config)
   ↓
8. MediaStream received via STREAM_READY event
   ↓
9. Video element displays streaming avatar
   ↓
10. Voice/text chat interactions
    ↓
11. Real-time event handling
    (messages, connection quality, talk states)
```

---

## Detailed File Documentation

### 1. API Route: `/app/api/get-access-token/route.ts`

**Purpose**: Server-side API endpoint that securely retrieves a HeyGen streaming access token.

**File Analysis**:

```typescript
// Line 1: Import environment variable
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
```
- **Line 1**: Reads the HeyGen API key from environment variables. This key must be set in `.env` file as `HEYGEN_API_KEY=your_key_here`
- **Why server-side**: API keys should never be exposed to the client. This route runs on the server, keeping the key secure.

```typescript
// Lines 3-31: POST handler function
export async function POST() {
  try {
    if (!HEYGEN_API_KEY) {
      throw new Error("API key is missing from .env");
    }
    const baseApiUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
```
- **Lines 4-7**: Validates that the API key exists. Throws error if missing (prevents runtime failures).
- **Line 8**: Gets the base API URL from environment. Defaults to `https://api.heygen.com` if not set.

```typescript
// Lines 10-15: HeyGen API request
const res = await fetch(`${baseApiUrl}/v1/streaming.create_token`, {
  method: "POST",
  headers: {
    "x-api-key": HEYGEN_API_KEY,
  },
});
```
- **Line 10**: Constructs the HeyGen API endpoint URL. The `/v1/streaming.create_token` endpoint creates a temporary access token for streaming sessions.
- **Line 11**: Uses POST method (required by HeyGen API).
- **Lines 13-14**: Sends the API key in the `x-api-key` header (HeyGen's authentication method).

```typescript
// Line 17: Debug logging
console.log("Response:", res);
```
- **Line 17**: Logs the raw response object for debugging (check server console).

```typescript
// Lines 19-23: Extract and return token
const data = await res.json();
return new Response(data.data.token, {
  status: 200,
});
```
- **Line 19**: Parses JSON response from HeyGen API. Response structure: `{ data: { token: "..." } }`
- **Lines 21-23**: Returns the token as plain text with HTTP 200 status. The token is used by the client to initialize the SDK.

```typescript
// Lines 24-30: Error handling
} catch (error) {
  console.error("Error retrieving access token:", error);
  return new Response("Failed to retrieve access token", {
    status: 500,
  });
}
```
- **Lines 24-30**: Catches any errors (network failures, API errors, parsing errors) and returns HTTP 500 with error message.

**Key Points**:
- This is a **server-only** route (runs on Node.js server, not in browser)
- The API key is **never exposed** to the client
- Returns a **temporary token** that the client uses for the session
- Token expires after some time (HeyGen manages token lifetime)

---

### 2. Constants: `/app/lib/constants.ts`

**Purpose**: Defines reusable constants for avatars and languages.

**File Analysis**:

```typescript
// Lines 1-22: Avatar definitions
export const AVATARS = [
  {
    avatar_id: "Ann_Therapist_public",
    name: "Ann Therapist",
  },
  // ... more avatars
];
```
- **Lines 1-22**: Array of available HeyGen avatars. Each object contains:
  - `avatar_id`: The HeyGen avatar identifier (must match HeyGen's avatar names exactly)
  - `name`: Display name for the UI

**Available Avatars**:
- `Ann_Therapist_public` - Ann Therapist
- `Shawn_Therapist_public` - Shawn Therapist
- `Bryan_FitnessCoach_public` - Bryan Fitness Coach
- `Dexter_Doctor_Standing2_public` - Dexter Doctor Standing
- `Elenora_IT_Sitting_public` - Elenora Tech Expert

```typescript
// Lines 24-53: Language list for STT (Speech-to-Text)
export const STT_LANGUAGE_LIST = [
  { label: "Bulgarian", value: "bg", key: "bg" },
  // ... 27 more languages
];
```
- **Lines 24-53**: Supported languages for speech recognition. Used in the language selector dropdown.
- Format: `{ label: "Display Name", value: "ISO code", key: "unique key" }`
- The `value` is sent to HeyGen API to configure the avatar's language.

---

### 3. Context & State Management: `/components/logic/context.tsx`

**Purpose**: Provides global state management using React Context API for the streaming avatar session.

**File Analysis**:

#### Context Type Definition (Lines 25-64)

```typescript
type StreamingAvatarContextProps = {
  avatarRef: React.MutableRefObject<StreamingAvatar | null>;
  basePath?: string;
  // ... many state properties
};
```
- **Line 26**: `avatarRef` - Holds the instance of the `StreamingAvatar` SDK object. Uses `useRef` to persist across renders without causing re-renders.
- **Line 27**: `basePath` - Optional base URL for HeyGen API (defaults to `https://api.heygen.com`).

**State Groups**:

1. **Voice Chat State** (Lines 29-34):
   - `isMuted`: Boolean indicating if microphone is muted
   - `isVoiceChatLoading`: Loading state for voice chat initialization
   - `isVoiceChatActive`: Whether voice chat is currently active

2. **Session State** (Lines 36-38):
   - `sessionState`: Enum (`INACTIVE`, `CONNECTING`, `CONNECTED`)
   - `stream`: The `MediaStream` object containing the video stream from HeyGen

3. **Message State** (Lines 41-53):
   - `messages`: Array of conversation messages
   - `handleUserTalkingMessage`: Callback for when user speech is transcribed
   - `handleStreamingTalkingMessage`: Callback for when avatar speech is transcribed
   - `handleEndMessage`: Callback when a message ends

4. **Listening/Talking State** (Lines 55-60):
   - `isListening`: Whether the system is actively listening for user input
   - `isUserTalking`: Whether user is currently speaking
   - `isAvatarTalking`: Whether avatar is currently speaking

5. **Connection Quality** (Lines 62-63):
   - `connectionQuality`: Enum representing network connection quality

#### State Management Hooks

```typescript
// Lines 95-107: Session state hook
const useStreamingAvatarSessionState = () => {
  const [sessionState, setSessionState] = useState(
    StreamingAvatarSessionState.INACTIVE,
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  // ...
};
```
- **Lines 96-97**: Manages the session lifecycle state (INACTIVE → CONNECTING → CONNECTED)
- **Lines 99-100**: Stores the video MediaStream that will be displayed in the video element

```typescript
// Lines 124-194: Message state management
const useStreamingAvatarMessageState = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const currentSenderRef = useRef<MessageSender | null>(null);
```
- **Lines 125-126**: Manages the conversation history as an array of messages
- **Line 127**: Tracks the current speaker to merge consecutive messages from the same sender

**Message Handling Logic**:

```typescript
// Lines 128-152: User message handler
const handleUserTalkingMessage = ({ detail }: { detail: UserTalkingMessageEvent }) => {
  if (currentSenderRef.current === MessageSender.CLIENT) {
    // Append to last message (same speaker)
    setMessages((prev) => [
      ...prev.slice(0, -1),
      {
        ...prev[prev.length - 1],
        content: [prev[prev.length - 1].content, detail.message].join(""),
      },
    ]);
  } else {
    // Create new message (different speaker)
    currentSenderRef.current = MessageSender.CLIENT;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: MessageSender.CLIENT,
        content: detail.message,
      },
    ]);
  }
};
```
- **Lines 133-141**: If the current sender is already CLIENT, appends the new text to the last message (streaming text continuation)
- **Lines 142-151**: If different sender, creates a new message entry with unique ID

**Provider Component** (Lines 222-253):

```typescript
export const StreamingAvatarProvider = ({
  children,
  basePath,
}: {
  children: React.ReactNode;
  basePath?: string;
}) => {
  const avatarRef = React.useRef<StreamingAvatar>(null);
  // ... initialize all state hooks
  
  return (
    <StreamingAvatarContext.Provider value={{...allState}}>
      {children}
    </StreamingAvatarContext.Provider>
  );
};
```
- **Line 229**: Creates a ref to hold the `StreamingAvatar` instance (persists across renders)
- **Lines 230-235**: Initializes all state management hooks
- **Lines 237-251**: Provides all state and functions to child components via Context

---

### 4. Core Hook: `/components/logic/useStreamingAvatarSession.ts`

**Purpose**: Main hook that manages the HeyGen StreamingAvatar SDK lifecycle and operations.

**File Analysis**:

#### Imports (Lines 1-13)

```typescript
import StreamingAvatar, {
  ConnectionQuality,
  StartAvatarRequest,
  StreamingEvents,
} from "@heygen/streaming-avatar";
```
- **Line 1**: Imports the main `StreamingAvatar` class from the HeyGen SDK
- **Line 2**: `ConnectionQuality` - Enum for connection quality states
- **Line 3**: `StartAvatarRequest` - TypeScript interface for avatar configuration
- **Line 4**: `StreamingEvents` - Enum of all available SDK events

#### Initialization Function (Lines 36-46)

```typescript
const init = useCallback(
  (token: string) => {
    avatarRef.current = new StreamingAvatar({
      token,
      basePath: basePath,
    });
    return avatarRef.current;
  },
  [basePath, avatarRef],
);
```
- **Line 38**: Creates a new `StreamingAvatar` instance with:
  - `token`: The access token from `/api/get-access-token`
  - `basePath`: Base URL for HeyGen API (optional, defaults to `https://api.heygen.com`)
- **Line 39**: Stores the instance in `avatarRef.current` so it persists across renders
- **Why `useCallback`**: Memoizes the function to prevent unnecessary re-creations

#### Stream Handler (Lines 48-54)

```typescript
const handleStream = useCallback(
  ({ detail }: { detail: MediaStream }) => {
    setStream(detail);
    setSessionState(StreamingAvatarSessionState.CONNECTED);
  },
  [setSessionState, setStream],
);
```
- **Line 49**: Receives `MediaStream` object when the avatar stream is ready
- **Line 50**: Stores the stream in state (will be assigned to video element's `srcObject`)
- **Line 51**: Updates session state to CONNECTED (enables UI controls)

#### Stop Function (Lines 56-77)

```typescript
const stop = useCallback(async () => {
  avatarRef.current?.off(StreamingEvents.STREAM_READY, handleStream);
  avatarRef.current?.off(StreamingEvents.STREAM_DISCONNECTED, stop);
  clearMessages();
  stopVoiceChat();
  setIsListening(false);
  setIsUserTalking(false);
  setIsAvatarTalking(false);
  setStream(null);
  await avatarRef.current?.stopAvatar();
  setSessionState(StreamingAvatarSessionState.INACTIVE);
}, [/* dependencies */]);
```
- **Lines 57-58**: Removes all event listeners to prevent memory leaks
- **Line 59**: Clears conversation messages
- **Line 60**: Stops voice chat if active
- **Lines 61-63**: Resets all talking/listening state flags
- **Line 64**: Clears the video stream
- **Line 65**: Calls SDK's `stopAvatar()` method to terminate the HeyGen session
- **Line 66**: Resets session state to INACTIVE

#### Start Function (Lines 79-148) - **MOST IMPORTANT**

```typescript
const start = useCallback(
  async (config: StartAvatarRequest, token?: string) => {
    if (sessionState !== StreamingAvatarSessionState.INACTIVE) {
      throw new Error("There is already an active session");
    }
```
- **Lines 80-83**: Validates that no session is currently active

```typescript
    if (!avatarRef.current) {
      if (!token) {
        throw new Error("Token is required");
      }
      init(token);
    }
```
- **Lines 85-90**: If avatar not initialized, requires a token and initializes it

```typescript
    setSessionState(StreamingAvatarSessionState.CONNECTING);
```
- **Line 96**: Sets state to CONNECTING (shows loading UI)

**Event Listeners Setup** (Lines 97-128):

```typescript
avatarRef.current.on(StreamingEvents.STREAM_READY, handleStream);
```
- **Line 97**: Listens for when the video stream is ready. When fired, `handleStream` receives the `MediaStream` object.

```typescript
avatarRef.current.on(StreamingEvents.STREAM_DISCONNECTED, stop);
```
- **Line 98**: Handles disconnections (network issues, errors). Automatically calls `stop()` to clean up.

```typescript
avatarRef.current.on(
  StreamingEvents.CONNECTION_QUALITY_CHANGED,
  ({ detail }: { detail: ConnectionQuality }) =>
    setConnectionQuality(detail),
);
```
- **Lines 99-103**: Monitors connection quality. `detail` can be: `EXCELLENT`, `GOOD`, `FAIR`, `POOR`, `UNKNOWN`.

```typescript
avatarRef.current.on(StreamingEvents.USER_START, () => {
  setIsUserTalking(true);
});
avatarRef.current.on(StreamingEvents.USER_STOP, () => {
  setIsUserTalking(false);
});
```
- **Lines 104-109**: Detects when user starts/stops speaking (for UI indicators).

```typescript
avatarRef.current.on(StreamingEvents.AVATAR_START_TALKING, () => {
  setIsAvatarTalking(true);
});
avatarRef.current.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
  setIsAvatarTalking(false);
});
```
- **Lines 110-115**: Detects when avatar starts/stops speaking (for UI indicators).

```typescript
avatarRef.current.on(
  StreamingEvents.USER_TALKING_MESSAGE,
  handleUserTalkingMessage,
);
avatarRef.current.on(
  StreamingEvents.AVATAR_TALKING_MESSAGE,
  handleStreamingTalkingMessage,
);
```
- **Lines 116-123**: Receives transcribed text in real-time as user/avatar speaks. These events fire multiple times during speech (streaming transcription).

```typescript
avatarRef.current.on(StreamingEvents.USER_END_MESSAGE, handleEndMessage);
avatarRef.current.on(
  StreamingEvents.AVATAR_END_MESSAGE,
  handleEndMessage,
);
```
- **Lines 124-128**: Fired when a complete message ends (user finishes speaking or avatar finishes response).

```typescript
await avatarRef.current.createStartAvatar(config);
```
- **Line 130**: **CRITICAL LINE** - Actually starts the avatar session by calling the SDK method with configuration. This:
  1. Sends request to HeyGen API with config
  2. Establishes WebSocket/WebRTC connection
  3. Begins streaming video
  4. Initializes speech recognition
  5. Returns a Promise that resolves when connection is established

**Configuration Object** (`StartAvatarRequest`):
```typescript
{
  quality: AvatarQuality.Low | Medium | High,  // Video quality
  avatarName: "Ann_Therapist_public",           // Avatar ID
  knowledgeId?: string,                         // Optional knowledge base
  voice: {
    rate: 1.5,                                  // Speech rate
    emotion: VoiceEmotion.EXCITED,              // Voice emotion
    model: ElevenLabsModel.eleven_flash_v2_5,   // TTS model
  },
  language: "en",                               // Language code
  voiceChatTransport: VoiceChatTransport.WEBSOCKET | WebRTC,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,             // Speech-to-text provider
  },
}
```

---

### 5. Voice Chat Hook: `/components/logic/useVoiceChat.ts`

**Purpose**: Manages voice chat functionality (microphone input).

**File Analysis**:

```typescript
const startVoiceChat = useCallback(
  async (isInputAudioMuted?: boolean) => {
    if (!avatarRef.current) return;
    setIsVoiceChatLoading(true);
    await avatarRef.current?.startVoiceChat({
      isInputAudioMuted,
    });
    setIsVoiceChatLoading(false);
    setIsVoiceChatActive(true);
    setIsMuted(!!isInputAudioMuted);
  },
  [avatarRef, setIsMuted, setIsVoiceChatActive, setIsVoiceChatLoading],
);
```
- **Line 17**: Function to start voice chat (enables microphone)
- **Line 18**: `isInputAudioMuted` - Optional parameter to start muted
- **Line 20**: Sets loading state (may require browser permissions)
- **Line 21**: Calls SDK's `startVoiceChat()` - requests microphone permission and starts capturing audio
- **Line 24**: Marks voice chat as active
- **Line 25**: Sets mute state based on parameter

```typescript
const muteInputAudio = useCallback(() => {
  if (!avatarRef.current) return;
  avatarRef.current?.muteInputAudio();
  setIsMuted(true);
}, [avatarRef, setIsMuted]);
```
- **Lines 37-42**: Mutes the microphone without stopping voice chat (user can unmute)

```typescript
const unmuteInputAudio = useCallback(() => {
  if (!avatarRef.current) return;
  avatarRef.current?.unmuteInputAudio();
  setIsMuted(false);
}, [avatarRef, setIsMuted]);
```
- **Lines 43-48**: Unmutes the microphone

---

### 6. Text Chat Hook: `/components/logic/useTextChat.ts`

**Purpose**: Handles text-to-speech functionality (sending text messages to avatar).

**File Analysis**:

```typescript
const sendMessage = useCallback(
  (message: string) => {
    if (!avatarRef.current) return;
    avatarRef.current.speak({
      text: message,
      taskType: TaskType.TALK,
      taskMode: TaskMode.ASYNC,
    });
  },
  [avatarRef],
);
```
- **Lines 9-19**: Sends a text message to the avatar
- **Line 12**: Calls SDK's `speak()` method
- **Line 14**: `taskType: TaskType.TALK` - Avatar will speak the text
- **Line 15**: `taskMode: TaskMode.ASYNC` - Returns immediately (non-blocking)

```typescript
const sendMessageSync = useCallback(
  async (message: string) => {
    if (!avatarRef.current) return;
    return await avatarRef.current?.speak({
      text: message,
      taskType: TaskType.TALK,
      taskMode: TaskMode.SYNC,
    });
  },
  [avatarRef],
);
```
- **Lines 21-32**: Synchronous version - waits for avatar to finish speaking before resolving

```typescript
const repeatMessage = useCallback(
  (message: string) => {
    if (!avatarRef.current) return;
    return avatarRef.current?.speak({
      text: message,
      taskType: TaskType.REPEAT,  // Different from TALK
      taskMode: TaskMode.ASYNC,
    });
  },
  [avatarRef],
);
```
- **Lines 34-45**: Uses `TaskType.REPEAT` - Avatar repeats the exact text (used in interview mode for consistency)

**TaskType Differences**:
- `TALK`: Avatar speaks with natural intonation, may paraphrase
- `REPEAT`: Avatar repeats exactly as written (important for standardized interviews)

---

### 7. Main Component: `/components/InteractiveAvatar.tsx`

**Purpose**: Main component that orchestrates the avatar session UI and interactions.

**File Analysis**:

#### Imports and Default Config (Lines 1-39)

```typescript
const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.Low,
  avatarName: AVATARS[0].avatar_id,
  knowledgeId: undefined,
  voice: {
    rate: 1.5,
    emotion: VoiceEmotion.EXCITED,
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "en",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};
```
- **Lines 25-39**: Default configuration for avatar session
- **Line 27**: Uses first avatar from constants (`Ann_Therapist_public`)
- **Line 35**: Uses WebSocket transport (alternative: WebRTC)

#### Token Fetching (Lines 50-64)

```typescript
async function fetchAccessToken() {
  try {
    const response = await fetch("/api/get-access-token", {
      method: "POST",
    });
    const token = await response.text();
    console.log("Access Token:", token);
    return token;
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw error;
  }
}
```
- **Lines 52-54**: Calls the Next.js API route to get HeyGen access token
- **Line 55**: Extracts token from response (plain text)
- **Line 57**: Logs token for debugging (remove in production)

#### Session Start (Lines 66-106)

```typescript
const startSessionV2 = useMemoizedFn(async () => {
  try {
    const newToken = await fetchAccessToken();
    const avatar = initAvatar(newToken);
```
- **Line 68**: Fetches new token (tokens expire, get fresh one each session)
- **Line 69**: Initializes SDK with token

```typescript
    avatar.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
      console.log("Avatar started talking", e);
    });
    // ... more event listeners
```
- **Lines 71-100**: Attaches additional event listeners for debugging/logging (optional, already handled in `useStreamingAvatarSession`)

```typescript
    await startAvatar(config);
```
- **Line 102**: Starts the avatar session with current configuration

#### Video Stream Handling (Lines 112-119)

```typescript
useEffect(() => {
  if (stream && mediaStream.current) {
    mediaStream.current.srcObject = stream;
    mediaStream.current.onloadedmetadata = () => {
      mediaStream.current!.play();
    };
  }
}, [mediaStream, stream]);
```
- **Lines 112-119**: When `stream` state changes (after `STREAM_READY` event):
  - **Line 114**: Assigns `MediaStream` to video element's `srcObject`
  - **Lines 115-117**: Automatically plays video when metadata loads

#### UI Rendering (Lines 121-148)

```typescript
{sessionState !== StreamingAvatarSessionState.INACTIVE ? (
  <AvatarVideo ref={mediaStream} />
) : (
  <AvatarConfig config={config} onConfigChange={setConfig} />
)}
```
- **Lines 125-129**: Conditional rendering:
  - If session active: Shows video component
  - If inactive: Shows configuration form

```typescript
{sessionState === StreamingAvatarSessionState.CONNECTED ? (
  <AvatarControls />
) : sessionState === StreamingAvatarSessionState.INACTIVE ? (
  <div className="flex flex-row gap-4">
    <Button onClick={() => startSessionV2()}>Chat</Button>
  </div>
) : (
  <LoadingIcon />
)}
```
- **Lines 132-142**: Controls rendering:
  - CONNECTED: Shows session controls
  - INACTIVE: Shows "Chat" button
  - CONNECTING: Shows loading indicator

#### Provider Wrapper (Lines 152-158)

```typescript
export default function InteractiveAvatarWrapper() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <InteractiveAvatar />
    </StreamingAvatarProvider>
  );
}
```
- **Line 154**: Wraps component with Context Provider
- **Line 154**: Sets `basePath` from environment variable (optional)

---

### 8. Avatar Configuration Component: `/components/AvatarConfig/index.tsx`

**Purpose**: UI for configuring avatar settings before starting a session.

**File Analysis**:

#### Configuration Fields

```typescript
<Field label="Custom Knowledge Base ID">
  <Input
    placeholder="Enter custom knowledge base ID"
    value={config.knowledgeId}
    onChange={(value) => onChange("knowledgeId", value)}
  />
</Field>
```
- **Lines 57-63**: Optional field for HeyGen Knowledge Base ID (for RAG/custom AI responses)

```typescript
<Field label="Avatar ID">
  <Select
    options={[...AVATARS, "CUSTOM"]}
    onSelect={(option) => {
      if (typeof option === "string") {
        onChange("avatarName", "");
      } else {
        onChange("avatarName", option.avatar_id);
      }
    }}
  />
</Field>
```
- **Lines 64-89**: Avatar selector dropdown
- **Line 71**: Includes predefined avatars + "CUSTOM" option
- **Lines 81-87**: Handles selection: if custom, clears avatarName; otherwise sets to selected avatar_id

```typescript
<Field label="Language">
  <Select
    options={STT_LANGUAGE_LIST}
    onSelect={(option) => onChange("language", option.value)}
  />
</Field>
```
- **Lines 99-110**: Language selector (affects speech recognition and avatar language)

```typescript
<Field label="Avatar Quality">
  <Select
    options={Object.values(AvatarQuality)}
    onSelect={(option) => onChange("quality", option)}
  />
</Field>
```
- **Lines 111-119**: Quality selector: `Low`, `Medium`, `High` (affects video quality and bandwidth)

```typescript
<Field label="Voice Chat Transport">
  <Select
    options={Object.values(VoiceChatTransport)}
    onSelect={(option) => onChange("voiceChatTransport", option)}
  />
</Field>
```
- **Lines 120-128**: Transport protocol:
  - `websocket`: Uses WebSocket (more compatible)
  - `webrtc`: Uses WebRTC (lower latency, better quality)

#### Advanced Settings (Lines 129-183)

Shown when "Show more..." is clicked:

```typescript
<Field label="Custom Voice ID">
  <Input
    value={config.voice?.voiceId}
    onChange={(value) =>
      onChange("voice", { ...config.voice, voiceId: value })
    }
  />
</Field>
```
- **Lines 134-142**: Custom HeyGen voice ID (optional, uses default if not set)

```typescript
<Field label="Emotion">
  <Select
    options={Object.values(VoiceEmotion)}
    onSelect={(option) =>
      onChange("voice", { ...config.voice, emotion: option })
    }
  />
</Field>
```
- **Lines 143-153**: Voice emotion: `EXCITED`, `HAPPY`, `SAD`, `NEUTRAL`, etc.

```typescript
<Field label="ElevenLabs Model">
  <Select
    options={Object.values(ElevenLabsModel)}
    onSelect={(option) =>
      onChange("voice", { ...config.voice, model: option })
    }
  />
</Field>
```
- **Lines 154-164**: TTS model selection (ElevenLabs provides the voice)

```typescript
<Field label="Provider">
  <Select
    options={Object.values(STTProvider)}
    onSelect={(option) =>
      onChange("sttSettings", {
        ...config.sttSettings,
        provider: option,
      })
    }
  />
</Field>
```
- **Lines 168-181**: Speech-to-text provider: `DEEPGRAM`, `WHISPER`, etc.

---

### 9. Avatar Video Component: `/components/AvatarSession/AvatarVideo.tsx`

**Purpose**: Displays the streaming avatar video.

**File Analysis**:

```typescript
export const AvatarVideo = forwardRef<HTMLVideoElement>(({}, ref) => {
  const { sessionState, stopAvatar } = useStreamingAvatarSession();
  const { connectionQuality } = useConnectionQuality();
```
- **Line 10**: Uses `forwardRef` to pass video element ref to parent
- **Line 11**: Gets session state and stop function from hook
- **Line 12**: Gets connection quality for display

```typescript
{connectionQuality !== ConnectionQuality.UNKNOWN && (
  <div className="absolute top-3 left-3 bg-black text-white rounded-lg px-3 py-2">
    Connection Quality: {connectionQuality}
  </div>
)}
```
- **Lines 18-22**: Displays connection quality badge (top-left overlay)

```typescript
{isLoaded && (
  <Button
    className="absolute top-3 right-3 !p-2 bg-zinc-700 bg-opacity-50 z-10"
    onClick={stopAvatar}
  >
    <CloseIcon />
  </Button>
)}
```
- **Lines 23-30**: Close button (top-right) to stop session

```typescript
<video
  ref={ref}
  autoPlay
  playsInline
  style={{
    width: "100%",
    height: "100%",
    objectFit: "contain",
  }}
>
  <track kind="captions" />
</video>
```
- **Lines 31-42**: HTML5 video element:
  - **Line 32**: Ref assigned from parent
  - **Line 33**: `autoPlay` - starts playing automatically
  - **Line 34**: `playsInline` - plays inline on mobile (no fullscreen)
  - **Lines 35-39**: Full width/height, contain fit (preserves aspect ratio)
  - **Line 41**: Caption track placeholder (for accessibility)

```typescript
{!isLoaded && (
  <div className="w-full h-full flex items-center justify-center absolute top-0 left-0">
    Loading...
  </div>
)}
```
- **Lines 43-47**: Loading overlay shown while stream is not ready

---

### 10. Text Input Component: `/components/AvatarSession/TextInput.tsx`

**Purpose**: Provides predefined message buttons for interview mode.

**File Analysis**:

```typescript
import agentMessages from "../../agent_messages.json";
```
- **Line 7**: Imports predefined interview questions from JSON file

```typescript
const handleSendMessage = useCallback(
  (message: string) => {
    if (message.trim() === "") {
      return;
    }
    repeatMessage(message);
  },
  [repeatMessage],
);
```
- **Lines 16-24**: Sends message using `REPEAT` mode (exact text, important for standardized interviews)

```typescript
<div className="grid grid-cols-5 gap-2 w-full max-w-[600px] mx-auto">
  {agentMessages.map((message, index) => (
    <Button
      key={index}
      onClick={() => handleSendMessage(message)}
    >
      {index + 1}
    </Button>
  ))}
</div>
```
- **Lines 31-40**: Renders numbered buttons (1-32) for each predefined message
- **Line 32**: Maps over `agent_messages.json` array
- **Line 38**: Shows number label (1, 2, 3, ...)

**Note**: The actual message text is stored in `agent_messages.json` (32 interview questions for early literacy assessment).

---

### 11. Message History Component: `/components/AvatarSession/MessageHistory.tsx`

**Purpose**: Displays the conversation transcript.

**File Analysis**:

```typescript
const { messages } = useMessageHistory();
const containerRef = useRef<HTMLDivElement>(null);
```
- **Line 6**: Gets messages array from context
- **Line 7**: Ref for scrollable container

```typescript
useEffect(() => {
  const container = containerRef.current;
  if (!container || messages.length === 0) return;
  container.scrollTop = container.scrollHeight;
}, [messages]);
```
- **Lines 9-15**: Auto-scrolls to bottom when new messages arrive

```typescript
{messages.map((message) => (
  <div
    key={message.id}
    className={`flex flex-col gap-1 max-w-[350px] ${
      message.sender === MessageSender.CLIENT
        ? "self-end items-end"
        : "self-start items-start"
    }`}
  >
    <p className="text-xs text-zinc-400">
      {message.sender === MessageSender.AVATAR ? "Avatar" : "You"}
    </p>
    <p className="text-sm">{message.content}</p>
  </div>
))}
```
- **Lines 22-36**: Renders messages:
  - **Line 25-27**: Conditional styling: CLIENT messages on right (blue), AVATAR on left
  - **Line 31**: Shows sender label
  - **Line 34**: Displays message content

---

### 12. Avatar Controls Component: `/components/AvatarSession/AvatarControls.tsx`

**Purpose**: Control buttons during active session.

**File Analysis**:

```typescript
export const AvatarControls: React.FC = () => {
  const { interrupt } = useInterrupt();
  
  return (
    <div className="flex flex-col gap-3 relative w-full items-center">
      <TextInput />
      <div className="absolute top-[-70px] right-3">
        <Button onClick={interrupt}>Interrupt</Button>
      </Button>
    </div>
  );
};
```
- **Line 9**: Gets interrupt function from hook
- **Line 13**: Renders `TextInput` component (message buttons)
- **Line 14-17**: Interrupt button (stops avatar mid-speech)

**Interrupt Function** (`useInterrupt.ts`):
```typescript
const interrupt = useCallback(() => {
  if (!avatarRef.current) return;
  avatarRef.current.interrupt();
}, [avatarRef]);
```
- Calls SDK's `interrupt()` method to stop avatar speech immediately

---

### 13. Page Component: `/app/page.tsx`

**Purpose**: Main page entry point.

**File Analysis**:

```typescript
"use client";
import InteractiveAvatar from "@/components/InteractiveAvatar";

export default function App() {
  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="w-[900px] flex flex-col items-start justify-start gap-5 mx-auto pt-4 pb-20">
        <div className="w-full">
          <InteractiveAvatar />
        </div>
      </div>
    </div>
  );
}
```
- **Line 1**: `"use client"` - Marks as client component (uses hooks)
- **Line 9**: Main layout container (full screen, centered)
- **Line 10**: Content wrapper (900px max width, centered)
- **Line 12**: Renders the main `InteractiveAvatar` component

---

### 14. Layout Component: `/app/layout.tsx`

**Purpose**: Root layout for the entire application.

**File Analysis**:

```typescript
export const metadata: Metadata = {
  title: {
    default: "AI4EE - Early Literacy Interview Avatar Demo",
    template: `%s - AI4EE Early Literacy Demo`,
  },
  icons: {
    icon: "/ai4ee_logo.png",
  },
};
```
- **Lines 17-25**: Sets page metadata (title, favicon)

```typescript
return (
  <html
    suppressHydrationWarning
    className={`${fontSans.variable} ${fontMono.variable} font-sans`}
    lang="en"
  >
    <body className="min-h-screen bg-black text-white">
      <main className="relative flex flex-col gap-6 h-screen w-screen">
        <NavBar />
        {children}
      </main>
    </body>
  </html>
);
```
- **Lines 32-45**: Root HTML structure:
  - **Line 35**: Font variables for Tailwind
  - **Line 39**: Dark theme (black background, white text)
  - **Line 41**: Includes navigation bar
  - **Line 42**: Renders page content

---

## Code Line-by-Line Analysis

### Critical HeyGen API Integration Points

#### 1. Token Retrieval Flow

**File**: `app/api/get-access-token/route.ts`
- **Line 1**: `const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;`
  - Reads API key from environment (must be in `.env` file)
- **Line 10**: `const res = await fetch(`${baseApiUrl}/v1/streaming.create_token`, ...)`
  - Makes POST request to HeyGen API endpoint
- **Line 13**: `"x-api-key": HEYGEN_API_KEY`
  - Authenticates with HeyGen using API key header
- **Line 19**: `const data = await res.json();`
  - Parses JSON response: `{ data: { token: "..." } }`
- **Line 21**: `return new Response(data.data.token, ...)`
  - Returns token as plain text to client

#### 2. SDK Initialization

**File**: `components/logic/useStreamingAvatarSession.ts`
- **Line 38**: `avatarRef.current = new StreamingAvatar({ token, basePath })`
  - Creates SDK instance with access token
  - Stores in ref to persist across renders

#### 3. Avatar Session Start

**File**: `components/logic/useStreamingAvatarSession.ts`
- **Line 130**: `await avatarRef.current.createStartAvatar(config)`
  - **MOST CRITICAL LINE** - Initiates connection to HeyGen
  - Sends configuration to API
  - Establishes WebSocket/WebRTC connection
  - Begins streaming video

#### 4. Stream Reception

**File**: `components/logic/useStreamingAvatarSession.ts`
- **Line 48-54**: `handleStream` callback
  - Receives `MediaStream` when ready
  - Stores in React state
  - Updates UI state to CONNECTED

**File**: `components/InteractiveAvatar.tsx`
- **Lines 112-119**: `useEffect` hook
  - Watches `stream` state
  - Assigns to video element: `mediaStream.current.srcObject = stream`
  - Auto-plays video

#### 5. Event Handling

**File**: `components/logic/useStreamingAvatarSession.ts`
- **Lines 97-128**: Event listener setup
  - `STREAM_READY`: Receives video stream
  - `USER_TALKING_MESSAGE`: Real-time transcription of user speech
  - `AVATAR_TALKING_MESSAGE`: Real-time transcription of avatar speech
  - `CONNECTION_QUALITY_CHANGED`: Network quality updates
  - `USER_START/STOP`: User speaking detection
  - `AVATAR_START_TALKING/STOP_TALKING`: Avatar speaking detection

---

## API Endpoints

### Internal API Routes

#### POST `/api/get-access-token`

**Purpose**: Securely retrieves HeyGen streaming token.

**Request**:
- Method: `POST`
- Headers: None required
- Body: None

**Response**:
- Status: `200 OK`
- Content-Type: `text/plain`
- Body: Access token string

**Example**:
```typescript
const response = await fetch("/api/get-access-token", {
  method: "POST",
});
const token = await response.text();
// token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Error Responses**:
- `500`: Failed to retrieve token
  - Body: "Failed to retrieve access token"
  - Causes: Missing API key, network error, HeyGen API error

---

### External HeyGen API Endpoints

#### POST `https://api.heygen.com/v1/streaming.create_token`

**Purpose**: Creates a temporary access token for streaming session.

**Request**:
- Method: `POST`
- Headers:
  - `x-api-key`: Your HeyGen API key
- Body: None

**Response**:
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Used In**: `app/api/get-access-token/route.ts:10`

---

## State Management

### State Flow Diagram

```
StreamingAvatarProvider (Context)
    ↓
Provides state to all components:
    - avatarRef: StreamingAvatar instance
    - sessionState: INACTIVE | CONNECTING | CONNECTED
    - stream: MediaStream | null
    - messages: Message[]
    - isUserTalking: boolean
    - isAvatarTalking: boolean
    - connectionQuality: ConnectionQuality
    - isMuted: boolean
    - isVoiceChatActive: boolean
    ↓
Components subscribe via hooks:
    - useStreamingAvatarSession()
    - useVoiceChat()
    - useTextChat()
    - useMessageHistory()
    - useConnectionQuality()
    - useInterrupt()
```

### State Transitions

**Session Lifecycle**:
```
INACTIVE
  ↓ (user clicks "Chat")
CONNECTING (token fetch, SDK init)
  ↓ (STREAM_READY event)
CONNECTED (streaming active)
  ↓ (user clicks "Stop" or error)
INACTIVE (cleanup)
```

**Message Flow**:
```
1. User speaks or sends text
   ↓
2. SDK transcribes/processes
   ↓
3. USER_TALKING_MESSAGE events fire (streaming)
   ↓
4. handleUserTalkingMessage() updates messages state
   ↓
5. Avatar processes and responds
   ↓
6. AVATAR_TALKING_MESSAGE events fire (streaming)
   ↓
7. handleStreamingTalkingMessage() updates messages state
   ↓
8. USER_END_MESSAGE / AVATAR_END_MESSAGE fires
   ↓
9. handleEndMessage() finalizes message
```

---

## Component Hierarchy

```
RootLayout (app/layout.tsx)
  └── NavBar (components/NavBar.tsx)
  └── Page (app/page.tsx)
      └── InteractiveAvatarWrapper
          └── StreamingAvatarProvider (Context)
              └── InteractiveAvatar
                  ├── AvatarConfig (when INACTIVE)
                  │   └── Field components
                  │       ├── Input
                  │       └── Select
                  │
                  ├── AvatarVideo (when ACTIVE)
                  │   └── HTML5 <video> element
                  │
                  ├── Button "Chat" (when INACTIVE)
                  ├── LoadingIcon (when CONNECTING)
                  │
                  └── AvatarControls (when CONNECTED)
                      ├── TextInput
                      │   └── Button[] (numbered messages)
                      └── Button "Interrupt"
                  │
                  └── MessageHistory (when CONNECTED)
                      └── Message[] (conversation transcript)
```

---

## Usage Guide

### Setup Steps

1. **Install Dependencies**:
   ```bash
   cd AI4EE_Custom
   npm install
   ```

2. **Environment Variables**:
   Create `.env` file:
   ```
   HEYGEN_API_KEY=your_heygen_api_key_here
   NEXT_PUBLIC_BASE_API_URL=https://api.heygen.com
   ```
   - Get API key from: https://app.heygen.com/settings?nav=API

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   - App runs on: http://localhost:3003

### Using the Application

1. **Configure Avatar**:
   - Select Avatar ID (or enter custom)
   - Choose Language
   - Set Quality (Low/Medium/High)
   - Optionally: Custom Knowledge Base ID, Voice settings

2. **Start Session**:
   - Click "Chat" button
   - Wait for connection (CONNECTING state)
   - Video stream appears (CONNECTED state)

3. **Interact**:
   - **Text Chat**: Click numbered buttons to send predefined messages
   - **Interrupt**: Click "Interrupt" to stop avatar mid-speech
   - **View Transcript**: See conversation in MessageHistory component

4. **Stop Session**:
   - Click X button (top-right of video)
   - Or navigate away (automatic cleanup)

### Customization Points

#### Change Default Avatar

**File**: `components/InteractiveAvatar.tsx:27`
```typescript
const DEFAULT_CONFIG: StartAvatarRequest = {
  avatarName: AVATARS[0].avatar_id,  // Change index or use specific ID
  // ...
};
```

#### Modify Interview Messages

**File**: `agent_messages.json`
- Edit the JSON array to change predefined questions
- Number of buttons auto-adjusts

#### Change Port

**File**: `package.json:6`
```json
"dev": "next dev -p 3003"  // Change port number
```

#### Customize UI Colors

**File**: `styles/globals.css` or Tailwind classes in components

---

## HeyGen API Configuration Reference

### StartAvatarRequest Interface

```typescript
interface StartAvatarRequest {
  quality?: AvatarQuality;              // "low" | "medium" | "high"
  avatarName?: string;                  // Avatar ID (e.g., "Ann_Therapist_public")
  knowledgeId?: string;                 // Optional knowledge base ID
  voice?: {
    voiceId?: string;                   // Custom voice ID
    rate?: number;                      // Speech rate (0.5 - 2.0)
    emotion?: VoiceEmotion;             // Emotion enum
    model?: ElevenLabsModel;            // TTS model
  };
  language?: string;                    // ISO language code ("en", "es", etc.)
  voiceChatTransport?: VoiceChatTransport; // "websocket" | "webrtc"
  sttSettings?: {
    provider?: STTProvider;             // "deepgram" | "whisper" | etc.
  };
}
```

### Streaming Events Reference

| Event | Description | Payload |
|-------|-------------|---------|
| `STREAM_READY` | Video stream is ready | `{ detail: MediaStream }` |
| `STREAM_DISCONNECTED` | Connection lost | `{}` |
| `USER_START` | User started speaking | `{}` |
| `USER_STOP` | User stopped speaking | `{}` |
| `AVATAR_START_TALKING` | Avatar started speaking | `{}` |
| `AVATAR_STOP_TALKING` | Avatar stopped speaking | `{}` |
| `USER_TALKING_MESSAGE` | Real-time transcription chunk | `{ detail: { message: string } }` |
| `AVATAR_TALKING_MESSAGE` | Real-time avatar speech chunk | `{ detail: { message: string } }` |
| `USER_END_MESSAGE` | User finished message | `{}` |
| `AVATAR_END_MESSAGE` | Avatar finished message | `{}` |
| `CONNECTION_QUALITY_CHANGED` | Network quality changed | `{ detail: ConnectionQuality }` |

### SDK Methods Reference

#### `StreamingAvatar` Class

```typescript
// Initialize
new StreamingAvatar({ token: string, basePath?: string })

// Start session
createStartAvatar(config: StartAvatarRequest): Promise<void>

// Stop session
stopAvatar(): Promise<void>

// Voice chat
startVoiceChat(options?: { isInputAudioMuted?: boolean }): Promise<void>
closeVoiceChat(): void
muteInputAudio(): void
unmuteInputAudio(): void

// Text-to-speech
speak(options: {
  text: string;
  taskType: TaskType.TALK | TaskType.REPEAT;
  taskMode: TaskMode.ASYNC | TaskMode.SYNC;
}): Promise<void>

// Interrupt
interrupt(): void

// Events
on(event: StreamingEvents, callback: (data: any) => void): void
off(event: StreamingEvents, callback: Function): void
```

---

## Troubleshooting

### Common Issues

1. **Token Fetch Fails**:
   - Check `HEYGEN_API_KEY` in `.env` file
   - Verify API key is valid at HeyGen dashboard
   - Check server console for errors

2. **Video Not Displaying**:
   - Check browser console for errors
   - Verify `STREAM_READY` event fires
   - Check network tab for WebSocket/WebRTC connections

3. **No Audio**:
   - Check browser microphone permissions
   - Verify `startVoiceChat()` is called
   - Check `isMuted` state

4. **Connection Quality Poor**:
   - Check network connection
   - Try lower quality setting
   - Check HeyGen status page

5. **Messages Not Appearing**:
   - Verify event listeners are attached
   - Check `handleUserTalkingMessage` / `handleStreamingTalkingMessage` are called
   - Check React DevTools for state updates

---

## Best Practices

1. **Always cleanup**: Remove event listeners in `stop()` function
2. **Error handling**: Wrap SDK calls in try-catch blocks
3. **Token security**: Never expose API key to client
4. **State management**: Use Context API for shared state
5. **Performance**: Use `useCallback` and `useMemo` for expensive operations
6. **User experience**: Show loading states during connection
7. **Accessibility**: Provide captions and keyboard navigation

---

## Conclusion

This documentation provides a comprehensive guide to the AI4EE Custom project, with detailed explanations of how HeyGen API integration works at every level. The application follows React best practices and provides a clean, maintainable architecture for streaming avatar interactions.

For additional help:
- HeyGen Documentation: https://docs.heygen.com
- HeyGen SDK GitHub: https://github.com/HeyGen-Official/StreamingAvatarSDK
- Next.js Documentation: https://nextjs.org/docs

