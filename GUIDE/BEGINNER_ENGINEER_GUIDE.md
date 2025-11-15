# Beginner Engineer Guide - Getting Started with AI4EE Custom

## Welcome! 👋

This guide is designed for entry-level engineers joining the AI4EE Custom project. It will help you understand:
- Where to start working
- What different components do
- Where components are located
- How the code flows
- How to make your first changes

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Overview](#project-overview)
3. [Project Structure - Where Everything Lives](#project-structure---where-everything-lives)
4. [Understanding the Component Hierarchy](#understanding-the-component-hierarchy)
5. [Key Files and What They Do](#key-files-and-what-they-do)
6. [How the Application Works](#how-the-application-works)
7. [Where to Start Making Changes](#where-to-start-making-changes)
8. [Common Tasks](#common-tasks)
9. [Important Concepts](#important-concepts)
10. [Development Workflow](#development-workflow)

---

## Quick Start

### 1. First Time Setup

```bash
# Navigate to the project folder
cd AI4EE_Custom

# Install dependencies
npm install

# Create environment file
# Create a file called .env in the root directory
# Add your HeyGen API key:
HEYGEN_API_KEY=your_api_key_here
NEXT_PUBLIC_BASE_API_URL=https://api.heygen.com

# Start the development server
npm run dev
```

### 2. Open in Browser

Navigate to: **http://localhost:3003**

You should see:
- A navigation bar with AI4EE branding
- An avatar configuration form
- A "Chat" button

### 3. Your First Change

Try this: Change the text on the Chat button

**File to edit**: `components/InteractiveAvatar.tsx`  
**Line**: 136  
**Change**: `Chat` to `Start Conversation`

Save the file and watch it update automatically in your browser!

---

## Project Overview

### What Is This Project?

This is a **Next.js web application** that displays an AI-powered avatar that can:
- Stream live video (the avatar appears on screen)
- Respond to text messages
- Conduct interviews using predefined questions
- Display conversation transcripts

### Technology Stack (What We're Using)

- **Next.js 15**: Web framework (like React, but with extra features)
- **TypeScript**: JavaScript with type safety
- **React 19**: Library for building user interfaces
- **Tailwind CSS**: For styling (makes things look good)
- **HeyGen SDK**: Third-party library for avatar streaming

**Don't worry if these sound unfamiliar!** You'll learn as you work with them.

---

## Project Structure - Where Everything Lives

```
AI4EE_Custom/
│
├── 📁 app/                          # Next.js App Router (pages and API routes)
│   ├── 📁 api/                      # Backend API endpoints
│   │   └── 📁 get-access-token/
│   │       └── route.ts            # Gets token from HeyGen API
│   ├── layout.tsx                  # Main page layout (header, footer structure)
│   ├── page.tsx                    # Home page (where everything starts)
│   └── 📁 lib/
│       └── constants.ts            # Reusable data (avatar list, languages)
│
├── 📁 components/                   # All React components (UI pieces)
│   ├── InteractiveAvatar.tsx       # ⭐ MAIN COMPONENT - orchestrates everything
│   ├── NavBar.tsx                  # Top navigation bar
│   ├── Button.tsx                  # Reusable button component
│   ├── Input.tsx                   # Reusable input field
│   ├── Select.tsx                  # Reusable dropdown
│   ├── Icons.tsx                   # Icon components
│   │
│   ├── 📁 AvatarConfig/            # Configuration form components
│   │   ├── index.tsx               # Avatar settings form
│   │   └── Field.tsx               # Form field wrapper
│   │
│   ├── 📁 AvatarSession/           # Components for active avatar session
│   │   ├── AvatarVideo.tsx         # Video player (shows the avatar)
│   │   ├── AvatarControls.tsx      # Control buttons during session
│   │   ├── TextInput.tsx           # Message buttons
│   │   └── MessageHistory.tsx      # Conversation transcript
│   │
│   └── 📁 logic/                    # Custom hooks (reusable logic)
│       ├── context.tsx             # ⭐ GLOBAL STATE - stores app data
│       ├── useStreamingAvatarSession.ts  # Manages avatar connection
│       ├── useTextChat.ts          # Sends text messages to avatar
│       ├── useVoiceChat.ts         # Manages microphone/voice
│       ├── useMessageHistory.ts    # Handles conversation messages
│       └── useInterrupt.ts         # Stops avatar mid-speech
│
├── 📁 public/                       # Static files (images, etc.)
│   └── ai4ee_logo.png             # AI4EE logo image
│
├── 📁 styles/                       # Global CSS styles
│   └── globals.css                 # App-wide styles
│
├── agent_messages.json             # Predefined interview questions
├── package.json                    # Project dependencies and scripts
└── .env                            # Environment variables (API keys)
```

---

## Understanding the Component Hierarchy

Think of components like Russian nesting dolls - smaller components fit inside larger ones:

```
RootLayout (app/layout.tsx)
  └── NavBar (shows logo and title)
  └── Page (app/page.tsx)
      └── InteractiveAvatar (main component)
          └── StreamingAvatarProvider (provides state to children)
              ├── AvatarConfig (when not started - shows settings form)
              └── AvatarVideo (when active - shows streaming video)
                  └── AvatarControls (buttons during session)
                      └── TextInput (message buttons)
              └── MessageHistory (conversation transcript)
```

### Visual Flow

**When NOT started:**
```
Page → InteractiveAvatar → AvatarConfig
(You see a configuration form)
```

**When ACTIVE:**
```
Page → InteractiveAvatar → AvatarVideo + AvatarControls + MessageHistory
(You see video, buttons, and conversation)
```

---

## Key Files and What They Do

### 🎯 **Start Here** - Most Important Files

#### 1. `app/page.tsx` - Entry Point
**Location**: `/app/page.tsx`  
**What it does**: This is the first file that renders when you visit the website  
**Lines**: 1-14  
**Purpose**: Wraps everything in a container and renders the main `InteractiveAvatar` component

```typescript
export default function App() {
  return (
    <div className="w-screen h-screen flex flex-col">
      <InteractiveAvatar />
    </div>
  );
}
```

**When to edit**: When you want to change the overall page layout

---

#### 2. `components/InteractiveAvatar.tsx` - Main Component ⭐
**Location**: `/components/InteractiveAvatar.tsx`  
**What it does**: This is the BRAIN of the application - it coordinates everything  
**Lines**: 1-159  
**Purpose**: 
- Manages avatar configuration state
- Handles starting/stopping sessions
- Switches between configuration and video views
- Fetches access tokens

**Key Functions**:
- `fetchAccessToken()` (lines 50-64): Gets token from API
- `startSessionV2()` (lines 66-106): Starts the avatar session
- `useEffect()` (lines 112-119): Attaches video stream to video element

**When to edit**: 
- To change how sessions start/stop
- To modify the overall flow
- To add new features that affect the main flow

**First change suggestion**: Try changing the "Chat" button text (line 136)

---

#### 3. `components/logic/context.tsx` - Global State ⭐
**Location**: `/components/logic/context.tsx`  
**What it does**: Stores data that multiple components need to share  
**Lines**: 1-258  
**Purpose**: Think of this as a "shared data storage" that all components can access

**What it stores**:
- `avatarRef`: The HeyGen SDK instance
- `stream`: The video stream from HeyGen
- `sessionState`: Whether avatar is inactive/connecting/connected
- `messages`: The conversation transcript
- `isUserTalking`: Whether user is speaking
- `isAvatarTalking`: Whether avatar is speaking

**Key Concept**: This uses React Context API - components can "subscribe" to this data

**When to edit**: 
- When you need to add new shared state
- When you need to change how state is managed

**Important**: This is advanced - ask a senior engineer before modifying!

---

#### 4. `components/logic/useStreamingAvatarSession.ts` - Avatar Connection Logic
**Location**: `/components/logic/useStreamingAvatarSession.ts`  
**What it does**: Manages the connection to HeyGen's avatar streaming service  
**Lines**: 1-159  
**Purpose**: Handles all the complex logic of connecting to and managing the avatar

**Key Functions**:
- `init()` (lines 36-46): Creates the SDK instance
- `start()` (lines 79-148): Starts the avatar session
- `stop()` (lines 56-77): Stops the avatar session
- `handleStream()` (lines 48-54): Receives video stream

**When to edit**: 
- When debugging connection issues
- When modifying how avatar starts/stops
- When adding new event listeners

**Important**: This is the most complex file - study it carefully!

---

### 📝 **UI Components** - What Users See

#### 5. `components/AvatarConfig/index.tsx` - Configuration Form
**Location**: `/components/AvatarConfig/index.tsx`  
**What it does**: Shows the form where users select avatar, language, quality, etc.  
**Lines**: 1-193  
**Purpose**: Collects user preferences before starting the session

**Fields it contains**:
- Avatar ID selector (lines 64-89)
- Language selector (lines 99-110)
- Quality selector (lines 111-119)
- "Show more" button (lines 184-189)
  - Voice settings (custom voice ID, emotion, model)
  - STT settings (speech-to-text provider)

**When to edit**: 
- To add new configuration options
- To change the form layout
- To add validation

**Easy first change**: Try changing placeholder text (e.g., line 59)

---

#### 6. `components/AvatarSession/AvatarVideo.tsx` - Video Player
**Location**: `/components/AvatarSession/AvatarVideo.tsx`  
**What it does**: Displays the streaming avatar video  
**Lines**: 1-52  
**Purpose**: Shows the actual avatar video and connection quality

**What it shows**:
- Video element (lines 31-42)
- Connection quality badge (lines 18-22)
- Close button (lines 23-30)
- Loading indicator (lines 43-47)

**When to edit**: 
- To change video styling
- To add new UI overlays
- To modify the close button

**Easy first change**: Change the "Loading..." text (line 45)

---

#### 7. `components/AvatarSession/TextInput.tsx` - Message Buttons
**Location**: `/components/AvatarSession/TextInput.tsx`  
**What it does**: Shows numbered buttons for predefined messages  
**Lines**: 1-45  
**Purpose**: Allows users to send predefined interview questions

**What it does**:
- Reads messages from `agent_messages.json` (line 7)
- Displays numbered buttons (1, 2, 3, ...) (lines 32-40)
- Sends message when button clicked (lines 16-24)

**When to edit**: 
- To change button layout
- To modify message sending behavior
- To add new message categories

**Easy first change**: Change the instruction text (line 28-30)

---

#### 8. `components/AvatarSession/MessageHistory.tsx` - Transcript
**Location**: `/components/AvatarSession/MessageHistory.tsx`  
**What it does**: Shows the conversation transcript  
**Lines**: 1-40  
**Purpose**: Displays what the user and avatar have said

**What it shows**:
- Messages in a scrollable list (lines 18-37)
- "You" vs "Avatar" labels (line 32)
- Auto-scrolls to bottom when new messages arrive (lines 9-15)

**When to edit**: 
- To change message styling
- To add timestamps
- To add message actions (delete, edit)

**Easy first change**: Change "You" to "Student" (line 32)

---

### 🔧 **Backend/API** - Server-Side Code

#### 9. `app/api/get-access-token/route.ts` - API Endpoint
**Location**: `/app/api/get-access-token/route.ts`  
**What it does**: Gets a temporary token from HeyGen API  
**Lines**: 1-31  
**Purpose**: This runs on the server (not in browser) to securely get access tokens

**How it works**:
1. Reads API key from environment variable (line 1)
2. Makes request to HeyGen API (lines 10-15)
3. Returns token to frontend (lines 21-23)

**When to edit**: 
- When HeyGen API changes
- To add error handling
- To add logging

**Important**: This runs on the server - API key is safe here!

---

### 📚 **Data/Constants** - Reusable Data

#### 10. `app/lib/constants.ts` - Constants
**Location**: `/app/lib/constants.ts`  
**What it does**: Stores lists of available avatars and languages  
**Lines**: 1-53  
**Purpose**: Centralized data that multiple components use

**What it contains**:
- `AVATARS`: List of available avatars (lines 1-22)
- `STT_LANGUAGE_LIST`: Supported languages (lines 24-53)

**When to edit**: 
- To add new avatars
- To add new languages
- To modify avatar names

**Easy first change**: Add a new language to the list!

---

#### 11. `agent_messages.json` - Interview Questions
**Location**: `/agent_messages.json`  
**What it does**: Stores predefined interview questions  
**Lines**: 1-32  
**Purpose**: Array of questions used in the interview mode

**Format**: Simple JSON array of strings

**When to edit**: 
- To change interview questions
- To add new questions
- To modify question wording

**Easy first change**: Edit any question text!

---

## How the Application Works

### Flow: From Click to Avatar Streaming

Let's trace what happens when a user clicks "Chat":

```
1. User clicks "Chat" button
   ↓
2. InteractiveAvatar.tsx → startSessionV2() called (line 66)
   ↓
3. fetchAccessToken() called (line 68)
   → Makes POST request to /api/get-access-token
   ↓
4. API route (route.ts) calls HeyGen API
   → Returns access token
   ↓
5. initAvatar(newToken) called (line 69)
   → Creates StreamingAvatar SDK instance
   → Stored in context.avatarRef
   ↓
6. startAvatar(config) called (line 102)
   → Sets sessionState to CONNECTING
   → Attaches event listeners
   → Calls SDK's createStartAvatar(config)
   ↓
7. HeyGen starts streaming video
   ↓
8. STREAM_READY event fires
   → handleStream() receives MediaStream
   → Sets stream in context
   → Sets sessionState to CONNECTED
   ↓
9. useEffect in InteractiveAvatar.tsx (line 112)
   → Attaches MediaStream to video element
   → Video starts playing
   ↓
10. User sees avatar on screen! 🎉
```

### State Flow

**Component State** (stored in each component):
```
InteractiveAvatar:
  - config: Avatar configuration
  - mediaStream: Video element ref
```

**Global State** (stored in Context):
```
Context:
  - sessionState: INACTIVE | CONNECTING | CONNECTED
  - stream: MediaStream (video)
  - messages: Array of messages
  - isUserTalking: boolean
  - isAvatarTalking: boolean
```

**State Changes**:
```
INACTIVE → (click Chat) → CONNECTING → (stream ready) → CONNECTED
```

---

## Where to Start Making Changes

### 🟢 **Easy Changes** (Good First Tasks)

1. **Change Button Text**
   - **File**: `components/InteractiveAvatar.tsx`
   - **Line**: 136
   - **Change**: `Chat` → `Start Conversation`

2. **Modify Interview Questions**
   - **File**: `agent_messages.json`
   - **Change**: Edit any question text

3. **Change Instruction Text**
   - **File**: `components/AvatarSession/TextInput.tsx`
   - **Line**: 28-30
   - **Change**: "Select a message..." text

4. **Modify Avatar List**
   - **File**: `app/lib/constants.ts`
   - **Lines**: 1-22
   - **Add**: New avatar object to array

5. **Change Colors/Styling**
   - **File**: Any component file
   - **Look for**: `className` attributes
   - **Change**: Tailwind CSS classes

### 🟡 **Medium Changes** (After Getting Comfortable)

1. **Add New Configuration Field**
   - **File**: `components/AvatarConfig/index.tsx`
   - **Add**: New `<Field>` component
   - **Update**: `StartAvatarRequest` type (if needed)

2. **Modify Message Display**
   - **File**: `components/AvatarSession/MessageHistory.tsx`
   - **Change**: How messages are styled/displayed

3. **Add New Avatar Session Feature**
   - **File**: `components/AvatarSession/AvatarControls.tsx`
   - **Add**: New button/control

4. **Change Video Layout**
   - **File**: `components/AvatarSession/AvatarVideo.tsx`
   - **Modify**: Video element styling

### 🔴 **Hard Changes** (Ask for Help!)

1. **Modify State Management**
   - **File**: `components/logic/context.tsx`
   - **Why hard**: Complex, affects entire app

2. **Change Connection Logic**
   - **File**: `components/logic/useStreamingAvatarSession.ts`
   - **Why hard**: Core functionality, easy to break

3. **Modify API Endpoints**
   - **File**: `app/api/get-access-token/route.ts`
   - **Why hard**: Server-side, affects security

---

## Common Tasks

### Task 1: Add a New Avatar to the List

**Steps**:
1. Open `app/lib/constants.ts`
2. Find `AVATARS` array (line 1)
3. Add new object:
   ```typescript
   {
     avatar_id: "Your_Avatar_ID_here",
     name: "Display Name",
   },
   ```
4. Save and check dropdown in UI

**Where it's used**: `components/AvatarConfig/index.tsx:71`

---

### Task 2: Change the Default Avatar

**Steps**:
1. Open `components/InteractiveAvatar.tsx`
2. Find `DEFAULT_CONFIG` (line 25)
3. Change `avatarName: AVATARS[0].avatar_id` (line 27)
4. Change index or use specific avatar_id

**Example**: `avatarName: AVATARS[2].avatar_id` for third avatar

---

### Task 3: Modify Interview Questions

**Steps**:
1. Open `agent_messages.json`
2. Edit any string in the array
3. Save - changes appear immediately in button labels

**Note**: Button numbers (1, 2, 3...) correspond to array index

---

### Task 4: Change Port Number

**Steps**:
1. Open `package.json`
2. Find `"dev"` script (line 6)
3. Change `-p 3003` to your desired port
4. Restart dev server

---

### Task 5: Add Console Logging for Debugging

**Steps**:
1. Find the component you want to debug
2. Add `console.log()` statements:
   ```typescript
   console.log("Debug:", variableName);
   ```
3. Check browser console (F12 → Console tab)

**Good places to add**:
- `components/InteractiveAvatar.tsx:68` (after token fetch)
- `components/logic/useStreamingAvatarSession.ts:50` (when stream ready)

---

## Important Concepts

### 1. React Components

**What they are**: Reusable pieces of UI (like LEGO blocks)

**Example**:
```typescript
// This is a component
export const Button = ({ onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
};
```

**Where they are**: All files in `components/` folder

---

### 2. Props (Properties)

**What they are**: Data passed to components

**Example**:
```typescript
// Button component receives 'onClick' and 'children' props
<Button onClick={handleClick}>Click Me</Button>
```

**Key concept**: Props flow DOWN from parent to child

---

### 3. State

**What it is**: Data that can change and causes UI to update

**Two types**:
- **Local State**: `useState()` - specific to one component
- **Global State**: Context API - shared across components

**Example**:
```typescript
const [count, setCount] = useState(0);
// count is the value, setCount updates it
```

**Where it's used**: 
- Local: Inside components (e.g., `InteractiveAvatar.tsx:46`)
- Global: `components/logic/context.tsx`

---

### 4. Hooks

**What they are**: Functions that let you "hook into" React features

**Common hooks**:
- `useState()`: For state
- `useEffect()`: For side effects (API calls, subscriptions)
- `useCallback()`: For memoized functions

**Where they are**: Custom hooks in `components/logic/` folder

---

### 5. Context API

**What it is**: Way to share data between components without passing props

**How it works**:
1. Provider wraps components (stores data)
2. Components use hook to access data
3. When data changes, components update

**Example**:
```typescript
// In context.tsx
const value = { sessionState, setSessionState };

// In any component
const { sessionState } = useStreamingAvatarContext();
```

**Where it's used**: `components/logic/context.tsx`

---

### 6. Next.js App Router

**What it is**: File-based routing system

**How it works**:
- `app/page.tsx` → `/` route (home page)
- `app/api/get-access-token/route.ts` → `/api/get-access-token` endpoint
- Files in `app/` automatically become routes

**Key files**:
- `app/layout.tsx`: Wraps all pages
- `app/page.tsx`: Home page

---

### 7. TypeScript

**What it is**: JavaScript with type checking

**Why it helps**: Catches errors before runtime

**Example**:
```typescript
// TypeScript knows 'name' must be a string
interface Person {
  name: string;
  age: number;
}

const person: Person = { name: "John", age: 30 };
```

**Where you'll see it**: All `.tsx` and `.ts` files

---

### 8. Tailwind CSS

**What it is**: Utility-first CSS framework

**How it works**: Use classes directly in JSX

**Example**:
```typescript
<div className="flex flex-row gap-4 p-6 bg-zinc-900">
  // flex = display: flex
  // flex-row = flex-direction: row
  // gap-4 = gap: 1rem
  // p-6 = padding: 1.5rem
  // bg-zinc-900 = background: zinc-900
</div>
```

**Documentation**: https://tailwindcss.com/docs

---

## Development Workflow

### Daily Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Make Changes**
   - Edit files
   - Save
   - Browser auto-refreshes (hot reload)

3. **Check Console**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for API issues

4. **Test Changes**
   - Click around the app
   - Test your specific feature
   - Verify no errors

### Debugging Tips

**1. Browser Console**
- Open with F12
- Look for red errors
- Use `console.log()` for debugging

**2. React DevTools**
- Install browser extension
- Inspect component state
- See component hierarchy

**3. Network Tab**
- Check API requests
- Verify responses
- Check for failed requests

**4. Component Props**
- Add `console.log(props)` in component
- See what data is being passed

### Git Workflow (If Working with Team)

1. **Create Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Edit files
   - Test thoroughly

3. **Commit**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

4. **Push**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - On GitHub
   - Request review
   - Merge when approved

---

## File Location Quick Reference

| What You Want to Change | File Location |
|------------------------|---------------|
| Button text | `components/InteractiveAvatar.tsx:136` |
| Interview questions | `agent_messages.json` |
| Avatar list | `app/lib/constants.ts:1-22` |
| Configuration form | `components/AvatarConfig/index.tsx` |
| Video display | `components/AvatarSession/AvatarVideo.tsx` |
| Message buttons | `components/AvatarSession/TextInput.tsx` |
| Conversation display | `components/AvatarSession/MessageHistory.tsx` |
| Navigation bar | `components/NavBar.tsx` |
| Page layout | `app/page.tsx` |
| Global styling | `styles/globals.css` |
| API endpoint | `app/api/get-access-token/route.ts` |
| Global state | `components/logic/context.tsx` |
| Avatar connection | `components/logic/useStreamingAvatarSession.ts` |

---

## Learning Path

### Week 1: Basics
- ✅ Read this guide
- ✅ Set up development environment
- ✅ Make easy changes (button text, questions)
- ✅ Understand file structure

### Week 2: Components
- ✅ Study `InteractiveAvatar.tsx`
- ✅ Understand component props
- ✅ Modify UI components
- ✅ Change styling

### Week 3: State and Logic
- ✅ Study `context.tsx` (read only)
- ✅ Understand hooks
- ✅ Modify message handling
- ✅ Add new features

### Week 4: Advanced
- ✅ Study `useStreamingAvatarSession.ts`
- ✅ Understand HeyGen SDK
- ✅ Debug connection issues
- ✅ Make complex changes

---

## Getting Help

### Resources

1. **This Project's Documentation**:
   - `DETAILED_DOCUMENTATION.md` - Comprehensive technical docs
   - `FUTURE_TASKS_INTEGRATION_GUIDE.md` - Implementation guides

2. **External Resources**:
   - Next.js Docs: https://nextjs.org/docs
   - React Docs: https://react.dev
   - Tailwind CSS: https://tailwindcss.com/docs
   - HeyGen SDK: https://docs.heygen.com

3. **Team Members**:
   - Ask questions!
   - Pair program
   - Code reviews

### Common Questions

**Q: How do I see what a variable contains?**
A: Add `console.log(variableName)` and check browser console

**Q: My changes aren't showing up?**
A: 
- Save the file
- Check for errors in console
- Hard refresh (Ctrl+Shift+R)
- Restart dev server

**Q: How do I know which component is rendering?**
A: Use React DevTools browser extension

**Q: Where should I add new code?**
A: 
- UI changes → `components/` folder
- Logic → `components/logic/` folder
- API → `app/api/` folder
- Constants → `app/lib/constants.ts`

---

## Checklist: Your First Day

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Create `.env` file with API key
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3003
- [ ] Make your first change (button text)
- [ ] Read through `InteractiveAvatar.tsx`
- [ ] Explore the file structure
- [ ] Make a change to `agent_messages.json`
- [ ] Check browser console for errors

---

## Summary

**You now know**:
- ✅ Where files are located
- ✅ What components do
- ✅ How the app flows
- ✅ Where to start making changes
- ✅ Important concepts

**Next steps**:
1. Make a small change
2. Test it
3. Make another change
4. Build confidence
5. Tackle bigger tasks

**Remember**: Everyone starts somewhere! Don't be afraid to make mistakes and ask questions. 🚀

---

**Happy coding!** 🎉

