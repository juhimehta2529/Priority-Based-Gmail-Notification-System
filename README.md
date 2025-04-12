# Priority-Based Gmail Notification System 📧🔔

![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-ES6-yellow)
![Gmail API](https://img.shields.io/badge/API-Gmail%20API-red)
![Automation](https://img.shields.io/badge/Type-Automation-blue)

## 🚨 Critical Setup Note
**You MUST replace all instances of `JJ@gmail.com` with your actual email address** in the code before using this script. Otherwise, notifications will be sent to the wrong recipient.

## ✨ Features
✔ Automatic email prioritization (High/Medium/Low)  
✔ Color-coded Gmail labels (🔴/🟡/🟢)  
✔ Timed reminder emails (10min/2hr/24hr)  
✔ Automatic label cleanup (7-day expiry)

## ⚙️ Installation
1. **Copy the script** from [Code.gs](#) (or repository)
2. **Replace ALL occurrences** of:
   ```javascript
   to: "JJ@gmail.com"  // ← Change this

3.  **Set up triggers:**
   - labelAndNotifyUnreadEmails() → Every 10min
   - sendHighPriorityEmails() → Every 10min
   - sendMediumPriorityEmails() → Every 120min
   - sendLowPriorityEmails() → Daily
   - removeOldPriorityLabels() → Daily

