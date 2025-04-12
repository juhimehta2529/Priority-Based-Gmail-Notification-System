// Updated keywords for priority classification
var keywords = {
  high: [
    /deadline/i, /urgent/i, /meeting/i, /asap/i, /important/i, 
    /submission/i, /mark submission/i, /exam/i, /project due/i, 
    /final warning/i, /immediate action required/i
  ],
  medium: [
    /reminder/i, /follow up/i, /schedule/i, /weekly report/i, 
    /assignment due/i, /progress update/i, /coursework/i
  ],
  low: [
    /newsletter/i, /promotion/i, /update/i, /general info/i, 
    /notification/i, /event invitation/i, /FYI/i, /meeting minutes/i
  ]
};

// Global variables to store email data 
var highPriorityEmails = [];
var mediumPriorityEmails = [];
var lowPriorityEmails = [];

// 1. Function to label and classify unread emails in the Inbox only
function labelAndNotifyUnreadEmails() {
  var userEmail = "JJ@gmail.com"; // Exclude self-sent emails
  var today = new Date();
  var pastWeek = new Date();
  pastWeek.setDate(today.getDate() - 7);
  
  var formattedDate = pastWeek.getFullYear() + "/" + (pastWeek.getMonth() + 1) + "/" + pastWeek.getDate();
  var searchQuery = "in:inbox after:" + formattedDate + " is:unread";
  var threads = GmailApp.search(searchQuery);
  
  var labels = {
    high: GmailApp.getUserLabelByName("High Priority") || GmailApp.createLabel("High Priority"),
    medium: GmailApp.getUserLabelByName("Medium Priority") || GmailApp.createLabel("Medium Priority"),
    low: GmailApp.getUserLabelByName("Low Priority") || GmailApp.createLabel("Low Priority")
  };

  threads.forEach(thread => {
    var messages = thread.getMessages();
    messages.forEach(message => {
      if (message.isUnread()) {
        var body = message.getPlainBody();
        var subject = message.getSubject();
        var from = message.getFrom();
        
        if (from.includes(userEmail)) return;
        
        var priority = checkPriority(body);
        if (!priority) return;// Skip this message if no priority keyword found
        
        if (priority === "high") {
          labels.high.addToThread(thread);
          highPriorityEmails.push({ from, subject, remarks: extractRemarks(body) });
        } else if (priority === "medium") {
          labels.medium.addToThread(thread);
          mediumPriorityEmails.push({ from, subject, remarks: extractRemarks(body) });
        } else {
          labels.low.addToThread(thread);
          lowPriorityEmails.push({ from, subject, remarks: extractRemarks(body) });
        }
      }
    });
  });

  ScriptProperties.setProperty("highPriorityEmails", JSON.stringify(highPriorityEmails));
  ScriptProperties.setProperty("mediumPriorityEmails", JSON.stringify(mediumPriorityEmails));
  ScriptProperties.setProperty("lowPriorityEmails", JSON.stringify(lowPriorityEmails));
}

// 2. Function to check the priority based on updated keywords
function checkPriority(body) {
  for (let key of keywords.high) if (key.test(body)) return "high";
  for (let key of keywords.medium) if (key.test(body)) return "medium";
  for (let key of keywords.low) if (key.test(body)) return "low";
  return null;
}

// 3. Function to extract remarks based on updated regex patterns
function extractRemarks(body) {
  let remarks = "";

  body = body.replace(/\s+/g, ' ').trim();

  let keywordPatterns = [
    /(deadline|due date|submission)[:\s]*([\w\s,-]+)/i,
    /(urgent|important|asap)[:\s]*([^.]+)/i,
    /(meeting|call|appointment)[:\s]*(\w+\s+\d{1,2},?\s+\d{4}?\s+\d{1,2}:\d{2}\s?(am|pm)?)/i,
    /(follow up|reminder|progress)[:\s]*([^.]+)/i
  ];

  for (let regex of keywordPatterns) {
    let match = body.match(regex);
    if (match) {
      remarks = match[0];
      break;
    }
  }

  if (!remarks) {
    let sentences = body.match(/[^.!?]+[.!?]/g);
    if (sentences && sentences.length > 0) {
      remarks = sentences[0].substring(0, 60).trim();
    }
  }

  return remarks || "General Important Email";
}

// 4. Send summary email
function sendSummaryEmail(emailData, subject, delayMinutes) {
  var htmlBody = "<table border='1'><tr><th>From</th><th>Subject</th><th>Remarks</th></tr>";
  emailData.forEach(email => {
    htmlBody += `<tr><td>${email.from}</td><td>${email.subject}</td><td>${email.remarks}</td></tr>`;
  });
  htmlBody += "</table>";

  MailApp.sendEmail({
    to: "JJ@gmail.com",
    subject: subject,
    htmlBody: htmlBody
  });
}

// 5. Send high priority emails
function sendHighPriorityEmails() {
  var highPriorityEmails = JSON.parse(ScriptProperties.getProperty("highPriorityEmails"));
  if (highPriorityEmails.length > 0) {
    sendSummaryEmail(highPriorityEmails, "High Priority Emails", 10);
  }
}

// 6. Send medium priority emails
function sendMediumPriorityEmails() {
  var mediumPriorityEmails = JSON.parse(ScriptProperties.getProperty("mediumPriorityEmails"));
  if (mediumPriorityEmails.length > 0) {
    sendSummaryEmail(mediumPriorityEmails, "Medium Priority Emails", 120);
  }
}

// 7. Send low priority emails
function sendLowPriorityEmails() {
  var lowPriorityEmails = JSON.parse(ScriptProperties.getProperty("lowPriorityEmails"));
  if (lowPriorityEmails.length > 0) {
    sendSummaryEmail(lowPriorityEmails, "Low Priority Emails", 1440);
  }
}

// 8. Remove old labels
function removeOldPriorityLabels() {
  var today = new Date();
  var pastWeek = new Date();
  pastWeek.setDate(today.getDate() - 7);

  var formattedDate = pastWeek.getFullYear() + "/" + (pastWeek.getMonth() + 1) + "/" + pastWeek.getDate();
  
  var priorityLabels = ["High Priority", "Medium Priority", "Low Priority"];

  priorityLabels.forEach(labelName => {
    var label = GmailApp.getUserLabelByName(labelName);
    if (label) {
      var searchQuery = "label:" + labelName + " before:" + formattedDate;
      var threads = GmailApp.search(searchQuery);
      threads.forEach(thread => {
        label.removeFromThread(thread);
      });
    }
  });
}
