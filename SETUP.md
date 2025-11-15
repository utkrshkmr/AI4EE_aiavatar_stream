# AI4EE Avatar Demo - Quick Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /home/csgrad/utkarshk/projects/avatar_stream/AI4EE_Custom
npm install
```

### 2. Configure Environment

The `.env` file has been copied from the original project. Ensure it contains your HeyGen API key:

```
HEYGEN_API_KEY=your_actual_api_key_here
```

### 3. Run the Application

```bash
npm run dev
```

The application will start on **http://localhost:3001** (port 3001 to avoid conflicts with the original app on port 3000)

## 📋 What's Changed from Original

### UI Customizations:
1. ✅ **Title Updated**: "National AI Institute for Exceptional Education - Early Literacy Interview Avatar Demo"
2. ✅ **Logo Added**: AI4EE logo displayed in top-right corner
3. ✅ **Navigation Removed**: Removed Avatars, Voices, API Docs, Guide, SDK links
4. ✅ **Simplified Config**: 
   - Removed "Custom Knowledge Base ID" field
   - Changed "Avatar ID" to "Avatar Type"
5. ✅ **Chat Only**: 
   - Removed "Start Voice Chat" button
   - Renamed "Start Text Chat" to "Chat"

## 🎨 Customized Components

- `/components/NavBar.tsx` - New navbar with AI4EE branding
- `/components/AvatarConfig/index.tsx` - Simplified configuration
- `/components/InteractiveAvatar.tsx` - Text chat only interface
- `/app/layout.tsx` - Updated metadata and favicon

## 🔧 Technical Details

- **Framework**: Next.js 15
- **Port**: 3001 (to avoid conflict with original on 3000)
- **Styling**: Tailwind CSS
- **SDK**: HeyGen Streaming Avatar SDK v2.0.13

## 📝 Notes

- All original files remain untouched in `/InteractiveAvatarNextJSDemo`
- This is a complete standalone copy in `/AI4EE_Custom`
- The logo file has been copied to `/public/ai4ee_logo.png`

