# 🚀 Quick Start - AI4EE Interview Avatar

## Run the Application

\`\`\`bash
cd /home/csgrad/utkarshk/projects/avatar_stream/AI4EE_Custom
npm run dev
\`\`\`

**Open**: http://localhost:3001

## How to Use

### Step 1: Configure Avatar
- Select **Avatar Type** from dropdown
- Choose **Language** (default: English)
- Adjust **Avatar Quality** if needed
- Click **"Chat"** button

### Step 2: Conduct Interview
- **Numbered buttons (1-31)** appear
- Click buttons **in order** to ask questions
- Avatar will repeat each question aloud
- Student responds verbally
- Continue with next numbered button

### Step 3: Interview Flow
\`\`\`
Click [1] → Avatar asks: "Hi there! I'm excited to talk with you today..."
Student responds → Click [2] → Avatar asks next question
Continue through all 31 questions
\`\`\`

## Button Layout

\`\`\`
Buttons 1-5:   Introduction & basic info
Buttons 6-11:  Family & friends
Buttons 12-23: Reading preferences & favorites
Buttons 24-31: Closing & farewell
\`\`\`

## Features

✅ **31 Pre-set Questions** - Consistent interview every time
✅ **One-Click Sending** - No typing required
✅ **Text Mode Only** - Simplified interface
✅ **Interrupt Button** - Stop avatar if needed
✅ **Auto-Repeat Mode** - Avatar repeats questions clearly

## Customization

**Edit Questions**: Modify \`agent_messages.json\`
**Change Layout**: Edit \`components/AvatarSession/TextInput.tsx\`

---

**Need Help?** See:
- \`INTERVIEW_MODE_UPDATE.md\` - Detailed feature documentation
- \`CUSTOMIZATION_SUMMARY.md\` - All UI customizations
- \`README.md\` - Complete documentation
