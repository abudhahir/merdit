# 🚀 Quick Start Guide

Get the Mermaid Diagram Generator running with OpenAI API fallback in 3 simple steps!

## 🎯 Super Quick Setup (2 minutes)

### Step 1: Start the Proxy Server
```bash
npm run proxy
```
✅ You should see: `🚀 OpenAI Proxy Server running on http://localhost:3001`

### Step 2: Start the App
```bash
# In a new terminal
npm run dev
```
✅ You should see: `Local: http://localhost:5173/`

### Step 3: Configure OpenAI API
1. **Open** http://localhost:5173/
2. **Click** "🔑 Use OpenAI API" section
3. **Click** "🔑 Configure OpenAI API" button
4. **Enter:**
   - **API Key:** Your OpenAI API key (starts with `sk-`)
   - **API URL:** `http://localhost:3001`
5. **Click** "Save & Continue"

## 🎉 You're Ready!

- Type a description like "Create a flowchart showing user login process"
- Click "Generate Diagram"
- Watch your diagram appear!

## 🔧 Alternative Setup (if proxy doesn't work)

### Option A: CORS Proxy
1. Visit https://cors-anywhere.herokuapp.com/corsdemo
2. Click "Request temporary access to the demo server"
3. Use API URL: `https://cors-anywhere.herokuapp.com/https://api.openai.com/v1`

### Option B: Browser Extension (Dev only)
1. Install "CORS Unblock" Chrome extension
2. Enable it
3. Use API URL: `https://api.openai.com/v1`

## ⚠️ Troubleshooting

### "Connection refused" error:
- ✅ Check proxy is running: `npm run proxy`
- ✅ Use correct URL: `http://localhost:3001`

### "Invalid API key" error:
- ✅ Check your OpenAI API key is valid
- ✅ Ensure you have OpenAI credits
- ✅ Key should start with `sk-`

### Proxy won't start:
- ✅ Kill existing processes: `killall node`
- ✅ Try again: `npm run proxy`

## 📁 What's Running

- **Frontend:** http://localhost:5173/ (React app)
- **Proxy:** http://localhost:3001/ (CORS proxy for OpenAI)
- **Health Check:** http://localhost:3001/health

## 🎮 Features to Try

1. **Generate Different Diagrams:**
   - "Create a sequence diagram for user authentication"
   - "Show a database ER diagram for a blog system"
   - "Make a flowchart for order processing"

2. **Use History:**
   - Generate multiple diagrams
   - Use "← Previous" and "Next →" buttons
   - Click "🗑️ Clear" to reset history

3. **Export Options:**
   - Click "Export SVG" for scalable graphics
   - Click "Export PNG" for images
   - Click "Export HTML" for standalone files

## 🔐 Security Notes

- Your API key is stored in browser localStorage
- The proxy runs locally on your machine
- No data is sent to external services except OpenAI

## 🆘 Need Help?

1. Check the browser console for errors (F12)
2. Verify proxy server logs in terminal
3. Try different setup options above
4. Check [OPENAI_SETUP.md](./OPENAI_SETUP.md) for detailed troubleshooting

---

**Happy Diagramming! 🎨✨**