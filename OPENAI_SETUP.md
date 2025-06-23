# OpenAI API Fallback Setup Guide

This guide explains how to set up the OpenAI API fallback option to avoid CORS (Cross-Origin Resource Sharing) restrictions when making direct API calls from the browser.

## The CORS Problem

Modern browsers block direct API calls to external services like OpenAI's API from web applications for security reasons. This means you can't directly call `https://api.openai.com/v1/chat/completions` from the browser.

## Solution Options

### Option 1: Local Proxy Server (Recommended for Development)

**What it does:** Runs a local server that forwards requests to OpenAI API, bypassing CORS restrictions.

**Setup:**

1. **Dependencies are already installed** (express, cors, node-fetch)

2. **Run the proxy server:**
   ```bash
   npm run proxy
   ```
   
   Or directly:
   ```bash
   node proxy-server.js
   ```

3. **In the app, use API URL:**
   ```
   http://localhost:3001
   ```

4. **Enter your OpenAI API key as normal**

**Pros:**
- ✅ Most reliable
- ✅ No external dependencies
- ✅ Works offline
- ✅ Full control over the proxy

**Cons:**
- ❌ Requires running an additional server
- ❌ Only works locally

---

### Option 2: CORS Proxy Service

**What it does:** Uses a public CORS proxy service to forward requests.

**Setup:**

1. **Request access to CORS Anywhere:**
   - Visit: https://cors-anywhere.herokuapp.com/corsdemo
   - Click "Request temporary access to the demo server"

2. **In the app, use API URL:**
   ```
   https://cors-anywhere.herokuapp.com/https://api.openai.com/v1
   ```

3. **Enter your OpenAI API key as normal**

**Pros:**
- ✅ No local setup required
- ✅ Works immediately after requesting access

**Cons:**
- ❌ Depends on external service
- ❌ May have usage limits
- ❌ Requires requesting access
- ❌ Not suitable for production

---

### Option 3: Browser Extension (Development Only)

**What it does:** Disables CORS in your browser for development.

**Setup:**

1. **Install a CORS extension:**
   - Chrome: "CORS Unblock" or "Disable CORS"
   - Firefox: "CORS Everywhere"

2. **Enable the extension**

3. **In the app, use API URL:**
   ```
   https://api.openai.com/v1
   ```

4. **Enter your OpenAI API key as normal**

**Pros:**
- ✅ Simple setup
- ✅ Direct API calls

**Cons:**
- ❌ Only works in your specific browser
- ❌ Security risk if left enabled
- ❌ Not suitable for production
- ❌ Only for development/testing

---

### Option 4: Production Backend (Recommended for Production)

**What it does:** Create your own backend API that handles OpenAI requests.

**Setup:**

1. **Create a backend service** (Node.js, Python, etc.)
2. **Deploy to a server** (Vercel, Netlify Functions, AWS Lambda, etc.)
3. **Update the app to use your backend URL**

**Example backend endpoint:**
```javascript
// Your backend at https://your-api.com/api/diagram
app.post('/api/diagram', async (req, res) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body),
  });
  
  const data = await response.json();
  res.json(data);
});
```

**Pros:**
- ✅ Production-ready
- ✅ Secure (API key on server)
- ✅ Can add additional features
- ✅ No CORS issues

**Cons:**
- ❌ Requires backend development
- ❌ More complex setup
- ❌ Hosting costs

---

## Quick Start Guide

### For Immediate Testing:

1. **Use Option 2 (CORS Proxy):**
   - Go to https://cors-anywhere.herokuapp.com/corsdemo
   - Request temporary access
   - Use API URL: `https://cors-anywhere.herokuapp.com/https://api.openai.com/v1`

### For Local Development:

1. **Use Option 1 (Local Proxy):**
   ```bash
   # In the project directory
   npm install express cors node-fetch
   node proxy-server.js
   
   # In another terminal
   npm run dev
   ```
   - Use API URL: `http://localhost:3001`

### For Production:

1. **Use Option 4 (Backend API):**
   - Deploy your own backend service
   - Store API keys securely on the server
   - Update the app to use your backend URL

---

## Troubleshooting

### "Connection refused" error:
- Check if the proxy server is running (Option 1)
- Verify the API URL is correct
- Try a different option

### "Access denied" error:
- Request access for CORS Anywhere (Option 2)
- Check your OpenAI API key is valid
- Verify you have sufficient OpenAI credits

### "Invalid API key" error:
- Double-check your OpenAI API key
- Ensure it starts with `sk-`
- Verify the key has necessary permissions

### Network timeout:
- Check your internet connection
- Try a different proxy option
- Verify OpenAI service status

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **API Key Storage:** Your OpenAI API key is stored in browser localStorage. This is acceptable for development but not ideal for production.

2. **CORS Extensions:** Only use CORS-disabling extensions for development. Never leave them enabled for regular browsing.

3. **Public Proxies:** Be cautious with public CORS proxies. They can potentially log your API keys and requests.

4. **Production Usage:** For production apps, always use your own backend to proxy API calls and store API keys securely on the server.

---

## Need Help?

If you're still having issues:

1. Check the browser developer console for error messages
2. Verify your OpenAI API key is valid and has credits
3. Try a different setup option
4. Check if your network/firewall is blocking the requests

The app will show helpful error messages and automatically try fallback options when possible.