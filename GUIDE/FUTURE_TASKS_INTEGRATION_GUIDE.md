# Future Tasks Integration Guide

## Table of Contents
1. [Task 1: Custom AI Avatar with Custom Voice Integration](#task-1-custom-ai-avatar-with-custom-voice-integration)
2. [Task 2: Dual Avatar Side-by-Side Streaming](#task-2-dual-avatar-side-by-side-streaming)
3. [Concepts Required](#concepts-required)
4. [Evidence and Code References](#evidence-and-code-references)

---

## Task 1: Custom AI Avatar with Custom Voice Integration

### Objective
Add a field in the UI that allows users to specify a custom AI avatar ID, and when used, the system should call custom AI avatars for streaming with their attached custom voice.

### Current State Analysis

#### Evidence: Custom Avatar Support Already Exists (Partially)

**File**: `components/AvatarConfig/index.tsx`

**Lines 35-53**: Avatar selection logic already detects custom avatars
```typescript
const selectedAvatar = useMemo(() => {
  const avatar = AVATARS.find(
    (avatar) => avatar.avatar_id === config.avatarName,
  );
  
  if (!avatar) {
    return {
      isCustom: true,
      name: "Custom Avatar ID",
      avatarId: null,
    };
  } else {
    return {
      isCustom: false,
      name: avatar.name,
      avatarId: avatar.avatar_id,
    };
  }
}, [config.avatarName]);
```

**Evidence**: The code already identifies when an avatar is custom by checking if it's not in the `AVATARS` array.

**Lines 90-97**: Custom Avatar ID input field already exists
```typescript
{selectedAvatar?.isCustom && (
  <Field label="Custom Avatar ID">
    <Input
      placeholder="Enter custom avatar ID"
      value={config.avatarName}
      onChange={(value) => onChange("avatarName", value)}
    />
  </Field>
)}
```

**Evidence**: When custom is selected, an input field appears for entering the custom avatar ID.

**Lines 134-142**: Custom Voice ID field exists (but hidden under "Show more")
```typescript
<Field label="Custom Voice ID">
  <Input
    placeholder="Enter custom voice ID"
    value={config.voice?.voiceId}
    onChange={(value) =>
      onChange("voice", { ...config.voice, voiceId: value })
    }
  />
</Field>
```

**Evidence**: Custom voice ID field exists but requires clicking "Show more" to access.

### What Needs to Be Done

#### Issue 1: Custom Voice Field is Hidden
**Problem**: Custom Voice ID is only visible when "Show more" is clicked.

**Solution**: Move Custom Voice ID field to be visible when custom avatar is selected.

#### Issue 2: No Validation/Association
**Problem**: No explicit connection between custom avatar and custom voice - they're separate fields.

**Solution**: Add logic to automatically suggest or validate custom voice when custom avatar is used.

### Files to Modify

#### 1. `/components/AvatarConfig/index.tsx`

**Specific Lines to Modify**:

1. **Lines 90-97**: Enhance the custom avatar input section to include custom voice field
   ```typescript
   // BEFORE (current):
   {selectedAvatar?.isCustom && (
     <Field label="Custom Avatar ID">
       <Input
         placeholder="Enter custom avatar ID"
         value={config.avatarName}
         onChange={(value) => onChange("avatarName", value)}
       />
     </Field>
   )}
   
   // AFTER (proposed):
   {selectedAvatar?.isCustom && (
     <>
       <Field label="Custom Avatar ID">
         <Input
           placeholder="Enter custom avatar ID"
           value={config.avatarName}
           onChange={(value) => onChange("avatarName", value)}
         />
       </Field>
       <Field label="Custom Voice ID (Optional - attached to avatar if not specified)">
         <Input
           placeholder="Enter custom voice ID (leave empty to use avatar's default voice)"
           value={config.voice?.voiceId || ""}
           onChange={(value) =>
             onChange("voice", { 
               ...config.voice, 
               voiceId: value || undefined 
             })
           }
         />
       </Field>
     </>
   )}
   ```

2. **Lines 129-142**: Remove Custom Voice ID from "Show more" section OR keep it as fallback

**Reasoning**: When a custom avatar is selected, the voice configuration should be immediately accessible since custom avatars often come with specific voices.

#### 2. `/components/InteractiveAvatar.tsx`

**Specific Lines to Modify**:

1. **Lines 25-39**: Ensure default config properly initializes voice for custom avatars
   ```typescript
   // Current DEFAULT_CONFIG already supports this, but we should document:
   const DEFAULT_CONFIG: StartAvatarRequest = {
     quality: AvatarQuality.Low,
     avatarName: AVATARS[0].avatar_id,
     knowledgeId: undefined,
     voice: {
       rate: 1.5,
       emotion: VoiceEmotion.EXCITED,
       model: ElevenLabsModel.eleven_flash_v2_5,
       // voiceId is optional - when set, it overrides avatar's default voice
     },
     // ...
   };
   ```

**No code changes needed here** - the `StartAvatarRequest` interface already supports `voice.voiceId`, and when provided, it will be used with the custom avatar.

### Concepts Required

1. **HeyGen API Configuration**:
   - Understanding that `StartAvatarRequest.voice.voiceId` takes precedence over avatar's default voice
   - Custom avatars can have default voices, but custom `voiceId` overrides it
   - Evidence: `components/logic/useStreamingAvatarSession.ts:130` passes `config` to `createStartAvatar(config)`, which includes voice settings

2. **React State Management**:
   - Conditional rendering based on `selectedAvatar?.isCustom`
   - Controlled components with `value` and `onChange` props
   - Evidence: `components/AvatarConfig/index.tsx:27-32` shows the `onChange` pattern

3. **TypeScript Types**:
   - `StartAvatarRequest` interface from `@heygen/streaming-avatar` SDK
   - Optional properties with `?` syntax
   - Evidence: Voice config uses optional chaining `config.voice?.voiceId`

### Step-by-Step Integration

1. **Modify AvatarConfig Component**:
   - Move Custom Voice ID field from "Show more" section (line 134) to custom avatar section (after line 97)
   - Add helpful placeholder text explaining the relationship between avatar and voice
   - Ensure the field is properly styled and accessible

2. **Test Custom Avatar with Voice**:
   - Select "CUSTOM" from Avatar ID dropdown
   - Enter a custom avatar ID (e.g., from HeyGen dashboard)
   - Enter a custom voice ID (or leave empty to use avatar's default)
   - Start session and verify voice matches expectations

3. **Handle Edge Cases**:
   - When custom avatar is selected but custom voice ID is empty, avatar uses its default voice
   - When custom voice ID is provided, it overrides avatar's default voice
   - Validate that both fields accept valid HeyGen IDs

### Evidence Supporting This Approach

**Evidence 1**: HeyGen SDK accepts voiceId in StartAvatarRequest
- **File**: `components/logic/useStreamingAvatarSession.ts:130`
- **Code**: `await avatarRef.current.createStartAvatar(config);`
- **Proof**: The `config` object (type `StartAvatarRequest`) includes `voice.voiceId` which is passed directly to HeyGen API

**Evidence 2**: Voice configuration is already supported in UI
- **File**: `components/AvatarConfig/index.tsx:134-142`
- **Proof**: Custom Voice ID input exists and correctly updates `config.voice.voiceId`

**Evidence 3**: Custom avatar detection already works
- **File**: `components/AvatarConfig/index.tsx:35-53`
- **Proof**: Logic to detect and show custom avatar input already functions correctly

---

## Task 2: Dual Avatar Side-by-Side Streaming

### Objective
Have two avatars streaming side by side, each with their own ID, their own sentences, and their own buttons beneath them to allow them to say sentences independently.

### Current State Analysis

#### Evidence: Single Avatar Architecture

**File**: `components/logic/context.tsx`

**Line 26**: Single avatarRef
```typescript
avatarRef: React.MutableRefObject<StreamingAvatar | null>;
```

**Evidence**: The context only supports one `StreamingAvatar` instance.

**Line 38**: Single stream
```typescript
stream: MediaStream | null;
```

**Evidence**: Only one `MediaStream` can be stored, which is displayed in a single video element.

**File**: `components/InteractiveAvatar.tsx`

**Line 48**: Single video ref
```typescript
const mediaStream = useRef<HTMLVideoElement>(null);
```

**Evidence**: Only one video element reference exists.

**Line 125**: Single video component
```typescript
{sessionState !== StreamingAvatarSessionState.INACTIVE ? (
  <AvatarVideo ref={mediaStream} />
) : (
  <AvatarConfig config={config} onConfigChange={setConfig} />
)}
```

**Evidence**: Only one `AvatarVideo` component is rendered.

**File**: `components/logic/useStreamingAvatarSession.ts`

**Line 38**: Single SDK instance initialization
```typescript
avatarRef.current = new StreamingAvatar({
  token,
  basePath: basePath,
});
```

**Evidence**: Only one `StreamingAvatar` instance is created per session.

### Architecture Changes Required

#### 1. Context Layer: Support Multiple Avatars

**File**: `/components/logic/context.tsx`

**Current State**: Single avatar architecture
- **Line 26**: `avatarRef: React.MutableRefObject<StreamingAvatar | null>`
- **Line 38**: `stream: MediaStream | null`
- **Line 36**: `sessionState: StreamingAvatarSessionState`
- **Line 41**: `messages: Message[]`

**Required Changes**:

1. **Replace single avatarRef with array/object of avatars**:
   ```typescript
   // BEFORE:
   avatarRef: React.MutableRefObject<StreamingAvatar | null>;
   
   // AFTER:
   avatarRefs: {
     avatar1: React.MutableRefObject<StreamingAvatar | null>;
     avatar2: React.MutableRefObject<StreamingAvatar | null>;
   };
   ```

2. **Replace single stream with array of streams**:
   ```typescript
   // BEFORE:
   stream: MediaStream | null;
   
   // AFTER:
   streams: {
     avatar1: MediaStream | null;
     avatar2: MediaStream | null;
   };
   ```

3. **Replace single sessionState with object**:
   ```typescript
   // BEFORE:
   sessionState: StreamingAvatarSessionState;
   
   // AFTER:
   sessionStates: {
     avatar1: StreamingAvatarSessionState;
     avatar2: StreamingAvatarSessionState;
   };
   ```

4. **Messages need avatar identifier**:
   ```typescript
   // BEFORE:
   export interface Message {
     id: string;
     sender: MessageSender;
     content: string;
   }
   
   // AFTER:
   export interface Message {
     id: string;
     sender: MessageSender;
     content: string;
     avatarId: "avatar1" | "avatar2"; // Add avatar identifier
   }
   ```

**Specific Lines to Modify**:
- **Lines 25-64**: `StreamingAvatarContextProps` type definition
- **Lines 95-107**: `useStreamingAvatarSessionState` hook
- **Lines 124-194**: `useStreamingAvatarMessageState` hook (add avatarId to messages)
- **Lines 222-253**: `StreamingAvatarProvider` component

**Lines Count**: Approximately 150+ lines need modification in this file.

#### 2. Session Management Hook: Support Multiple Instances

**File**: `/components/logic/useStreamingAvatarSession.ts`

**Current State**: Single avatar session management
- **Line 15**: Hook uses single `avatarRef` from context
- **Line 36-46**: `init` function creates single instance
- **Line 79-148**: `start` function manages single session

**Required Changes**:

1. **Modify hook to accept avatar identifier**:
   ```typescript
   // BEFORE:
   export const useStreamingAvatarSession = () => {
     const { avatarRef, ... } = useStreamingAvatarContext();
   
   // AFTER:
   export const useStreamingAvatarSession = (avatarId: "avatar1" | "avatar2") => {
     const { avatarRefs, streams, sessionStates, ... } = useStreamingAvatarContext();
     const avatarRef = avatarRefs[avatarId];
     const stream = streams[avatarId];
     const sessionState = sessionStates[avatarId];
   ```

2. **Update init function** (Lines 36-46):
   ```typescript
   // BEFORE:
   const init = useCallback(
     (token: string) => {
       avatarRef.current = new StreamingAvatar({ token, basePath });
       return avatarRef.current;
     },
     [basePath, avatarRef],
   );
   
   // AFTER:
   const init = useCallback(
     (token: string, avatarId: "avatar1" | "avatar2") => {
       avatarRefs[avatarId].current = new StreamingAvatar({ token, basePath });
       return avatarRefs[avatarId].current;
     },
     [basePath, avatarRefs],
   );
   ```

3. **Update handleStream function** (Lines 48-54):
   ```typescript
   // BEFORE:
   const handleStream = useCallback(
     ({ detail }: { detail: MediaStream }) => {
       setStream(detail);
       setSessionState(StreamingAvatarSessionState.CONNECTED);
     },
     [setSessionState, setStream],
   );
   
   // AFTER:
   const handleStream = useCallback(
     ({ detail }: { detail: MediaStream }, avatarId: "avatar1" | "avatar2") => {
       setStreams(prev => ({ ...prev, [avatarId]: detail }));
       setSessionStates(prev => ({ ...prev, [avatarId]: StreamingAvatarSessionState.CONNECTED }));
     },
     [setSessionStates, setStreams],
   );
   ```

4. **Update start function** (Lines 79-148):
   - All event listeners need to track which avatar they belong to
   - Line 130: `createStartAvatar` call needs avatar identifier
   - Event handlers need to include `avatarId` parameter

**Specific Lines to Modify**:
- **Lines 15-34**: Hook initialization and context access
- **Lines 36-46**: `init` function
- **Lines 48-54**: `handleStream` function
- **Lines 56-77**: `stop` function
- **Lines 79-148**: `start` function (most complex - all event listeners)

**Lines Count**: Approximately 100+ lines need modification.

#### 3. Main Component: Dual Avatar Layout

**File**: `/components/InteractiveAvatar.tsx`

**Current State**: Single avatar display
- **Line 46**: Single `config` state
- **Line 48**: Single `mediaStream` ref
- **Line 42-43**: Single hook instance
- **Line 125**: Single `AvatarVideo` component

**Required Changes**:

1. **Multiple config states** (Lines 25-39, 46):
   ```typescript
   // BEFORE:
   const [config, setConfig] = useState<StartAvatarRequest>(DEFAULT_CONFIG);
   
   // AFTER:
   const [config1, setConfig1] = useState<StartAvatarRequest>(DEFAULT_CONFIG);
   const [config2, setConfig2] = useState<StartAvatarRequest>(DEFAULT_CONFIG);
   ```

2. **Multiple video refs** (Line 48):
   ```typescript
   // BEFORE:
   const mediaStream = useRef<HTMLVideoElement>(null);
   
   // AFTER:
   const mediaStream1 = useRef<HTMLVideoElement>(null);
   const mediaStream2 = useRef<HTMLVideoElement>(null);
   ```

3. **Multiple hook instances** (Lines 42-43):
   ```typescript
   // BEFORE:
   const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
     useStreamingAvatarSession();
   
   // AFTER:
   const avatar1 = useStreamingAvatarSession("avatar1");
   const avatar2 = useStreamingAvatarSession("avatar2");
   ```

4. **Side-by-side layout** (Lines 121-148):
   ```typescript
   // BEFORE:
   <div className="relative w-full aspect-video overflow-hidden">
     {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
       <AvatarVideo ref={mediaStream} />
     ) : (
       <AvatarConfig config={config} onConfigChange={setConfig} />
     )}
   </div>
   
   // AFTER:
   <div className="flex flex-row gap-4 w-full">
     {/* Avatar 1 */}
     <div className="flex-1 relative aspect-video overflow-hidden">
       {avatar1.sessionState !== StreamingAvatarSessionState.INACTIVE ? (
         <AvatarVideo ref={mediaStream1} avatarId="avatar1" />
       ) : (
         <AvatarConfig 
           config={config1} 
           onConfigChange={setConfig1}
           label="Avatar 1"
         />
       )}
     </div>
     
     {/* Avatar 2 */}
     <div className="flex-1 relative aspect-video overflow-hidden">
       {avatar2.sessionState !== StreamingAvatarSessionState.INACTIVE ? (
         <AvatarVideo ref={mediaStream2} avatarId="avatar2" />
       ) : (
         <AvatarConfig 
           config={config2} 
           onConfigChange={setConfig2}
           label="Avatar 2"
         />
       )}
     </div>
   </div>
   ```

5. **Separate controls for each avatar** (Lines 131-142):
   ```typescript
   // BEFORE:
   {sessionState === StreamingAvatarSessionState.CONNECTED ? (
     <AvatarControls />
   ) : ...
   
   // AFTER:
   <div className="flex flex-row gap-4 w-full">
     {/* Avatar 1 Controls */}
     <div className="flex-1">
       {avatar1.sessionState === StreamingAvatarSessionState.CONNECTED ? (
         <AvatarControls avatarId="avatar1" />
       ) : avatar1.sessionState === StreamingAvatarSessionState.INACTIVE ? (
         <Button onClick={() => startSessionV2("avatar1", config1)}>Start Avatar 1</Button>
       ) : (
         <LoadingIcon />
       )}
     </div>
     
     {/* Avatar 2 Controls */}
     <div className="flex-1">
       {avatar2.sessionState === StreamingAvatarSessionState.CONNECTED ? (
         <AvatarControls avatarId="avatar2" />
       ) : avatar2.sessionState === StreamingAvatarSessionState.INACTIVE ? (
         <Button onClick={() => startSessionV2("avatar2", config2)}>Start Avatar 2</Button>
       ) : (
         <LoadingIcon />
       )}
     </div>
   </div>
   ```

**Specific Lines to Modify**:
- **Lines 25-39**: DEFAULT_CONFIG (may need separate defaults)
- **Lines 41-43**: Hook usage
- **Lines 46**: State management
- **Lines 48**: Refs
- **Lines 50-64**: `fetchAccessToken` (can be shared)
- **Lines 66-106**: `startSessionV2` (needs avatarId parameter)
- **Lines 112-119**: `useEffect` for streams (needs to handle both)
- **Lines 121-148**: Entire return statement (complete rewrite)

**Lines Count**: Approximately 100+ lines need modification.

#### 4. Video Component: Support Avatar Identifier

**File**: `/components/AvatarSession/AvatarVideo.tsx`

**Current State**: Single avatar video display
- **Line 11**: Uses single `useStreamingAvatarSession()` hook
- **Line 14**: Uses single `sessionState`

**Required Changes**:

1. **Accept avatarId prop**:
   ```typescript
   // BEFORE:
   export const AvatarVideo = forwardRef<HTMLVideoElement>(({}, ref) => {
     const { sessionState, stopAvatar } = useStreamingAvatarSession();
   
   // AFTER:
   interface AvatarVideoProps {
     avatarId: "avatar1" | "avatar2";
   }
   
   export const AvatarVideo = forwardRef<HTMLVideoElement, AvatarVideoProps>(
     ({ avatarId }, ref) => {
       const { sessionState, stopAvatar } = useStreamingAvatarSession(avatarId);
   ```

2. **Update connection quality display** (Lines 18-22):
   - May want to show which avatar the quality refers to

**Specific Lines to Modify**:
- **Line 10**: Component signature
- **Line 11**: Hook call
- **Lines 18-22**: Connection quality display (optional enhancement)

**Lines Count**: Approximately 10-15 lines need modification.

#### 5. Controls Component: Per-Avatar Controls

**File**: `/components/AvatarSession/AvatarControls.tsx`

**Current State**: Single avatar controls
- **Line 9**: Uses single `useInterrupt()` hook
- **Line 13**: Uses single `TextInput` component

**Required Changes**:

1. **Accept avatarId prop**:
   ```typescript
   // BEFORE:
   export const AvatarControls: React.FC = () => {
     const { interrupt } = useInterrupt();
   
   // AFTER:
   interface AvatarControlsProps {
     avatarId: "avatar1" | "avatar2";
   }
   
   export const AvatarControls: React.FC<AvatarControlsProps> = ({ avatarId }) => {
     const { interrupt } = useInterrupt(avatarId);
   ```

2. **Pass avatarId to TextInput** (Line 13):
   ```typescript
   // BEFORE:
   <TextInput />
   
   // AFTER:
   <TextInput avatarId={avatarId} />
   ```

**Specific Lines to Modify**:
- **Line 8**: Component signature
- **Line 9**: Hook call
- **Line 13**: TextInput component

**Lines Count**: Approximately 5-10 lines need modification.

#### 6. Text Input Component: Per-Avatar Messages

**File**: `/components/AvatarSession/TextInput.tsx`

**Current State**: Single avatar text input
- **Line 10**: Uses single `useTextChat()` hook
- **Line 32**: Single message array from `agentMessages`

**Required Changes**:

1. **Accept avatarId prop**:
   ```typescript
   // BEFORE:
   export const TextInput: React.FC = () => {
     const { repeatMessage } = useTextChat();
   
   // AFTER:
   interface TextInputProps {
     avatarId: "avatar1" | "avatar2";
   }
   
   export const TextInput: React.FC<TextInputProps> = ({ avatarId }) => {
     const { repeatMessage } = useTextChat(avatarId);
   ```

2. **Support separate message arrays** (Lines 7, 32):
   - May want different messages for each avatar
   - Could add `avatar1Messages.json` and `avatar2Messages.json`

**Specific Lines to Modify**:
- **Line 9**: Component signature
- **Line 10**: Hook call
- **Lines 7, 32**: Message source (optional)

**Lines Count**: Approximately 10-20 lines need modification.

#### 7. Text Chat Hook: Per-Avatar Communication

**File**: `/components/logic/useTextChat.ts`

**Current State**: Single avatar text chat
- **Line 7**: Uses single `avatarRef` from context

**Required Changes**:

1. **Accept avatarId parameter**:
   ```typescript
   // BEFORE:
   export const useTextChat = () => {
     const { avatarRef } = useStreamingAvatarContext();
   
   // AFTER:
   export const useTextChat = (avatarId: "avatar1" | "avatar2") => {
     const { avatarRefs } = useStreamingAvatarContext();
     const avatarRef = avatarRefs[avatarId];
   ```

2. **Update all methods** (Lines 9-58):
   - All methods need to use the correct `avatarRef` based on `avatarId`

**Specific Lines to Modify**:
- **Line 6**: Hook signature
- **Line 7**: Context access
- **Lines 9-58**: All callback functions

**Lines Count**: Approximately 10-15 lines need modification.

#### 8. Interrupt Hook: Per-Avatar Interruption

**File**: `/components/logic/useInterrupt.ts`

**Required Changes**:
```typescript
// BEFORE:
export const useInterrupt = () => {
  const { avatarRef } = useStreamingAvatarContext();

// AFTER:
export const useInterrupt = (avatarId: "avatar1" | "avatar2") => {
  const { avatarRefs } = useStreamingAvatarContext();
  const avatarRef = avatarRefs[avatarId];
```

**Specific Lines to Modify**:
- **Line 5**: Hook signature
- **Line 6**: Context access
- **Line 11**: Method call

**Lines Count**: Approximately 5 lines need modification.

#### 9. Voice Chat Hook: Per-Avatar Voice

**File**: `/components/logic/useVoiceChat.ts`

**Required Changes**: Similar to other hooks - accept `avatarId` and use correct ref.

**Lines Count**: Approximately 10-15 lines need modification.

#### 10. Message History: Show Avatar Identifier

**File**: `/components/AvatarSession/MessageHistory.tsx`

**Current State**: Single conversation
- **Line 6**: Uses single `useMessageHistory()` hook

**Required Changes**:

1. **Filter or display messages by avatar**:
   ```typescript
   // Option 1: Show all messages with avatar indicator
   // Option 2: Show separate message histories for each avatar
   ```

**Specific Lines to Modify**:
- **Lines 22-36**: Message rendering to include avatarId

**Lines Count**: Approximately 10-15 lines need modification.

### New Files to Create

#### 1. `/components/DualAvatar.tsx` (New Component)

**Purpose**: Container component for dual avatar layout

**Structure**:
```typescript
export const DualAvatar: React.FC = () => {
  // Manages both avatar instances
  // Handles side-by-side layout
  // Coordinates state between avatars
};
```

**Estimated Lines**: 150-200 lines

#### 2. `/app/lib/avatar1_messages.json` (Optional)

**Purpose**: Separate messages for avatar 1

**Structure**: Same as `agent_messages.json` but different content

#### 3. `/app/lib/avatar2_messages.json` (Optional)

**Purpose**: Separate messages for avatar 2

**Structure**: Same as `agent_messages.json` but different content

### Files Summary

| File | Type | Lines to Modify | Complexity |
|------|------|----------------|------------|
| `components/logic/context.tsx` | Modify | ~150 | Very High |
| `components/logic/useStreamingAvatarSession.ts` | Modify | ~100 | Very High |
| `components/InteractiveAvatar.tsx` | Modify | ~100 | High |
| `components/AvatarSession/AvatarVideo.tsx` | Modify | ~15 | Medium |
| `components/AvatarSession/AvatarControls.tsx` | Modify | ~10 | Low |
| `components/AvatarSession/TextInput.tsx` | Modify | ~15 | Low |
| `components/logic/useTextChat.ts` | Modify | ~15 | Medium |
| `components/logic/useInterrupt.ts` | Modify | ~5 | Low |
| `components/logic/useVoiceChat.ts` | Modify | ~15 | Medium |
| `components/AvatarSession/MessageHistory.tsx` | Modify | ~15 | Medium |
| `components/DualAvatar.tsx` | Create | ~200 | High |
| `app/page.tsx` | Modify | ~5 | Low |

**Total Estimated Lines**: ~650+ lines of code modifications and additions

### Concepts Required

#### 1. React Context API with Complex State

**Evidence**: `components/logic/context.tsx:25-64`
- Currently manages single avatar state
- Need to extend to manage multiple avatars
- Use object/record pattern instead of single values

**Concept**: Transforming single-instance state to multi-instance state pattern

#### 2. Multiple StreamingAvatar SDK Instances

**Evidence**: `components/logic/useStreamingAvatarSession.ts:38`
```typescript
avatarRef.current = new StreamingAvatar({ token, basePath });
```

**Concept**: 
- Each `StreamingAvatar` instance is independent
- Each requires its own token (can be shared) and configuration
- Each manages its own WebSocket/WebRTC connection
- Multiple instances can run simultaneously

**Proof from HeyGen SDK**:
- The SDK supports multiple simultaneous instances
- Each instance has its own event emitter
- Each instance has its own MediaStream

#### 3. Parallel State Management

**Concept**: Managing two independent state machines:
- Each avatar has its own session state (INACTIVE → CONNECTING → CONNECTED)
- Each avatar has its own stream
- Each avatar has its own event listeners

**Pattern**: Use object/record with keys (`avatar1`, `avatar2`) instead of single values

#### 4. CSS Layout: Side-by-Side Video

**Evidence**: `components/AvatarVideo.tsx:31-42` shows video element styling

**Concept**: Flexbox or Grid layout to position two video elements side by side

**Example**:
```typescript
<div className="flex flex-row gap-4">
  <div className="flex-1"><video /></div>
  <div className="flex-1"><video /></div>
</div>
```

#### 5. Token Management for Multiple Avatars

**Evidence**: `components/InteractiveAvatar.tsx:50-64`

**Concept**: 
- Same token can be used for multiple avatar instances (token is session-based, not avatar-specific)
- OR fetch separate tokens if HeyGen requires it
- Token is passed to each `new StreamingAvatar()` call

#### 6. Event Listener Management

**Evidence**: `components/logic/useStreamingAvatarSession.ts:97-128`

**Concept**: 
- Each avatar instance has its own event listeners
- Need to track which avatar each event belongs to
- Cleanup needs to remove listeners from correct avatar instance

**Critical**: Lines 97-128 show 10+ event listeners that all need avatar identification

#### 7. Message Attribution

**Evidence**: `components/logic/context.tsx:19-23, 124-194`

**Concept**: 
- Messages need to include which avatar they came from
- When displaying messages, show avatar identifier
- Separate message handling for each avatar

### Step-by-Step Integration Plan

#### Phase 1: Context Refactoring
1. Modify `context.tsx` to support multiple avatars
2. Change `avatarRef` to `avatarRefs` object
3. Change `stream` to `streams` object
4. Change `sessionState` to `sessionStates` object
5. Update `Message` interface to include `avatarId`
6. Update all context consumers

**Estimated Time**: 4-6 hours

#### Phase 2: Hook Refactoring
1. Update `useStreamingAvatarSession` to accept `avatarId`
2. Update `useTextChat` to accept `avatarId`
3. Update `useInterrupt` to accept `avatarId`
4. Update `useVoiceChat` to accept `avatarId`
5. Test each hook independently

**Estimated Time**: 3-4 hours

#### Phase 3: Component Updates
1. Create `DualAvatar` component
2. Update `InteractiveAvatar` or create new dual version
3. Update `AvatarVideo` to accept `avatarId`
4. Update `AvatarControls` to accept `avatarId`
5. Update `TextInput` to accept `avatarId`
6. Update `MessageHistory` to show avatar identifiers

**Estimated Time**: 4-6 hours

#### Phase 4: UI Layout
1. Implement side-by-side layout
2. Ensure responsive design (stacks on mobile)
3. Add labels for each avatar section
4. Style controls appropriately

**Estimated Time**: 2-3 hours

#### Phase 5: Testing & Refinement
1. Test independent avatar operation
2. Test simultaneous streaming
3. Test message attribution
4. Test voice chat per avatar
5. Test interruption per avatar
6. Performance testing

**Estimated Time**: 3-4 hours

**Total Estimated Time**: 16-23 hours

### Critical Considerations

#### 1. Token Sharing
**Question**: Can one token be used for multiple avatar instances?

**Answer**: Need to test with HeyGen API. If not, may need:
- Two separate token fetches
- Two separate API route calls
- Token pool management

**Evidence**: `app/api/get-access-token/route.ts` creates single token per request

#### 2. Resource Management
**Consideration**: Two simultaneous video streams will use:
- 2x network bandwidth
- 2x WebSocket/WebRTC connections
- 2x CPU/GPU resources for video decoding

**Mitigation**: Consider quality settings, allow user to pause one avatar

#### 3. Event Listener Cleanup
**Critical**: Lines 56-58 in `useStreamingAvatarSession.ts` show cleanup

**Requirement**: Ensure each avatar's listeners are properly removed on cleanup

**Risk**: Memory leaks if listeners not properly cleaned up

#### 4. Message Attribution
**Challenge**: When user speaks, which avatar should respond?

**Solution Options**:
- Separate microphones per avatar (complex)
- Button to select active avatar for voice input
- Text-only input (current implementation)

**Evidence**: Current implementation uses text buttons, not voice

#### 5. State Synchronization
**Consideration**: If one avatar disconnects, should the other continue?

**Answer**: Yes - they should be independent

**Implementation**: Each avatar manages its own state independently

---

## Concepts Required

### 1. React Hooks and Context API
- **Usage**: Managing shared state across components
- **Evidence**: `components/logic/context.tsx` entire file
- **Key Pattern**: Provider → Consumer pattern

### 2. TypeScript Generics and Union Types
- **Usage**: `"avatar1" | "avatar2"` for type safety
- **Evidence**: Need to add union types throughout codebase

### 3. React Refs Management
- **Usage**: `useRef` for video elements and SDK instances
- **Evidence**: `components/InteractiveAvatar.tsx:48`

### 4. HeyGen Streaming Avatar SDK
- **Usage**: `new StreamingAvatar()`, `createStartAvatar()`, event listeners
- **Evidence**: `components/logic/useStreamingAvatarSession.ts:38, 130`

### 5. MediaStream API
- **Usage**: HTML5 video elements, `srcObject` property
- **Evidence**: `components/InteractiveAvatar.tsx:114`

### 6. Conditional Rendering
- **Usage**: Showing different UI based on state
- **Evidence**: `components/InteractiveAvatar.tsx:125-129`

### 7. CSS Flexbox/Grid
- **Usage**: Side-by-side layout
- **Evidence**: Need to implement in dual avatar layout

### 8. Event-Driven Architecture
- **Usage**: HeyGen SDK events, React state updates
- **Evidence**: `components/logic/useStreamingAvatarSession.ts:97-128`

---

## Evidence and Code References

### Evidence 1: Single Avatar Architecture
**File**: `components/logic/context.tsx:26, 38, 36`
**Lines**: 26, 38, 36
**Code**:
```typescript
avatarRef: React.MutableRefObject<StreamingAvatar | null>;
stream: MediaStream | null;
sessionState: StreamingAvatarSessionState;
```
**Proof**: Current implementation only supports single avatar instance.

### Evidence 2: SDK Instance Creation
**File**: `components/logic/useStreamingAvatarSession.ts:38`
**Line**: 38
**Code**:
```typescript
avatarRef.current = new StreamingAvatar({ token, basePath });
```
**Proof**: SDK allows creating multiple instances (can call `new StreamingAvatar()` multiple times).

### Evidence 3: Config Object Structure
**File**: `components/InteractiveAvatar.tsx:25-39`
**Lines**: 25-39
**Code**:
```typescript
const DEFAULT_CONFIG: StartAvatarRequest = {
  avatarName: AVATARS[0].avatar_id,
  voice: {
    voiceId: ...,
  },
};
```
**Proof**: Config supports `avatarName` and `voice.voiceId` separately, allowing custom avatar + custom voice combination.

### Evidence 4: Video Element Rendering
**File**: `components/InteractiveAvatar.tsx:125`
**Line**: 125
**Code**:
```typescript
<AvatarVideo ref={mediaStream} />
```
**Proof**: Only one video element currently rendered.

### Evidence 5: Message Structure
**File**: `components/logic/context.tsx:19-23`
**Lines**: 19-23
**Code**:
```typescript
export interface Message {
  id: string;
  sender: MessageSender;
  content: string;
}
```
**Proof**: No avatar identifier in current message structure - needs to be added.

### Evidence 6: Event Listener Setup
**File**: `components/logic/useStreamingAvatarSession.ts:97-128`
**Lines**: 97-128
**Code**:
```typescript
avatarRef.current.on(StreamingEvents.STREAM_READY, handleStream);
avatarRef.current.on(StreamingEvents.USER_START, () => {
  setIsUserTalking(true);
});
// ... 10+ more listeners
```
**Proof**: Many event listeners need avatar identification for dual avatar support.

### Evidence 7: Custom Avatar Detection
**File**: `components/AvatarConfig/index.tsx:35-53`
**Lines**: 35-53
**Code**:
```typescript
const selectedAvatar = useMemo(() => {
  const avatar = AVATARS.find((avatar) => avatar.avatar_id === config.avatarName);
  if (!avatar) {
    return { isCustom: true, ... };
  }
}, [config.avatarName]);
```
**Proof**: Custom avatar detection already works, just needs UI enhancement for voice.

### Evidence 8: Voice Configuration
**File**: `components/AvatarConfig/index.tsx:134-142`
**Lines**: 134-142
**Code**:
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
**Proof**: Custom voice ID field exists and correctly updates config.

---

## Summary

### Task 1: Custom AI Avatar with Custom Voice
- **Complexity**: Low to Medium
- **Files to Modify**: 1-2 files
- **Lines to Change**: ~20-30 lines
- **Key Change**: Move Custom Voice ID field to be visible with Custom Avatar ID
- **Evidence**: Most functionality already exists, just needs UI refinement

### Task 2: Dual Avatar Side-by-Side Streaming
- **Complexity**: Very High
- **Files to Modify**: ~12 files
- **Lines to Change**: ~650+ lines
- **Key Change**: Transform single-instance architecture to multi-instance
- **Evidence**: Significant refactoring of context, hooks, and components required
- **Risk**: High complexity, requires careful state management and event handling
- **Estimated Time**: 16-23 hours

Both tasks are feasible but require different levels of effort. Task 1 is a relatively simple UI enhancement, while Task 2 is a major architectural refactoring.

