# Troubleshooting: 404 Error for label-history.js

## Problem

You're seeing this error in the console:
```
[Fri Feb 13 2026 23:53:20] "GET /js/label-history.js" Error (404): "Not found"
```

## The File DOES Exist

The file `label-history.js` is in the repository at `js/label-history.js` and is properly committed.

## Why You're Getting 404

This 404 error typically happens due to:

### 1. Browser Caching
Your browser cached the old page that didn't have this file, and now it's looking for it but using cached information about the file structure.

### 2. Server Not Restarted
If you started the server before the file was added, the server needs to be restarted to pick up new files.

### 3. Wrong Directory
The server might be running from a different directory than where the files are.

## Solutions (Try in Order)

### Solution 1: Hard Refresh Browser ⭐ EASIEST

**Windows/Linux:**
- Press `Ctrl + Shift + R`
- Or `Ctrl + F5`

**Mac:**
- Press `Cmd + Shift + R`

**Alternative:**
- Open DevTools (F12)
- Right-click the refresh button
- Select "Empty Cache and Hard Reload"

### Solution 2: Restart the Server ⭐ MOST COMMON FIX

```bash
# 1. Stop the current server
# Press Ctrl+C in the terminal where it's running

# 2. Restart the server
# If using Python:
python -m http.server 8000

# If using Node:
node serve.js

# If using npm:
npm start
```

### Solution 3: Clear Browser Cache Completely

1. Open browser settings
2. Clear browsing data
3. Select "Cached images and files"
4. Clear data
5. Reload the page

### Solution 4: Verify File Exists

```bash
# Navigate to repository
cd /path/to/Todi-Viewer-Map

# Check file exists
ls -la js/label-history.js

# Should show:
# -rw-rw-r-- 1 user user 3758 Feb 13 12:55 label-history.js

# View first few lines
head -20 js/label-history.js

# Should show:
# /**
#  * Label History Manager
#  * ...
# export class LabelHistory {
```

### Solution 5: Check File Permissions

```bash
# Make sure file is readable
chmod 644 js/label-history.js

# Check permissions
ls -la js/label-history.js
# Should show: -rw-r--r--
```

### Solution 6: Verify Correct Directory

```bash
# Make sure server is running from correct directory
pwd
# Should show: /path/to/Todi-Viewer-Map

# List files in current directory
ls
# Should see: index_v14_REFACTORED.html, js/, etc.
```

## Quick Checklist

- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Restart the server
- [ ] Check file exists: `ls js/label-history.js`
- [ ] Check you're in right directory: `pwd`
- [ ] Clear browser cache
- [ ] Try different browser

## Still Not Working?

### Debug Steps

1. **Check server console output**
   - Look for any error messages when server starts
   - Check if it says "Serving at..." with correct path

2. **Test file directly**
   - Go to: `http://localhost:8000/js/label-history.js`
   - You should see the JavaScript code
   - If 404, server can't find the file

3. **Check git status**
   ```bash
   git status
   # Should say: "nothing to commit, working tree clean"
   ```

4. **Verify branch**
   ```bash
   git branch
   # Should show: * copilot/refactor-state-management-3d-map
   ```

5. **Pull latest changes**
   ```bash
   git pull origin copilot/refactor-state-management-3d-map
   ```

## Other 404 Errors

If you're seeing 404 for other files:

### label-interactive.js
- Same solutions as above

### label-layout-engine.js
- Same solutions as above

### labelfx-config-builder.js
- Same solutions as above

### live-label-preview.js
- Same solutions as above

## Prevention

To prevent this in the future:

1. **Always restart server** after pulling new files
2. **Use hard refresh** when testing changes
3. **Disable cache** in DevTools during development:
   - Open DevTools (F12)
   - Go to Network tab
   - Check "Disable cache"
   - Keep DevTools open while testing

## Common Patterns

```
404 Error → Hard Refresh → Fixed ✅
404 Error → Restart Server → Fixed ✅
404 Error → Pull Latest → Restart → Fixed ✅
```

## Success Indicators

You'll know it's working when:

1. **Browser console shows**:
   ```
   [Label History] Manager initialized
   ```

2. **Network tab shows**:
   ```
   label-history.js    200    GET
   ```

3. **No 404 errors** in console

## Contact

If none of these solutions work, the file might actually be missing from your local copy. Verify with:

```bash
git log --oneline --all --grep="label-history"
```

This should show commits mentioning the file.
