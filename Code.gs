// This doGet function creates a webpage for you. Without this, it will not build the webpage.
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

// When you press submit on the webpage, this function triggers.
function addFormData(formData) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Sheet1'); // You can customize the sheet name here, if needed.

    sheet.appendRow([formData.assignmentName, formData.dueDate, formData.classDropdown, formData.status]); // Appends all information to a new row in the spreadsheet.

    // Sort the sheet based on the due date column.
    var dataRange = sheet.getDataRange();
    dataRange.sort([{ column: 2, ascending: true }]); // Assuming the due date is in the second column.

    return "Assignment Added"; // If this works, it returns a success message to confirm that the assignment was added to the sheet.
  } catch (error) {
    return "An error occurred: " + error.toString(); // Catches and returns any errors.
  }
}

// This function runs daily using a trigger. If the due date for any assignment is within 3 days and the assignment is in progress or not started, it triggers the next function.
function addDailyReminders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Sheet1'); // Customize the sheet name if needed.
  var dataRange = sheet.getDataRange().getValues();

  var today = new Date();
  today.setHours(0, 0, 0, 0);

  for (var i = 0; i < dataRange.length; i++) { 
    var assignmentName = dataRange[i][0]; // Assignment name in the first column.
    var dueDateString = dataRange[i][1]; // Due date in the second column.
    var assignmentClass = dataRange[i][2]; // Class name in the third column.

    var dueDate = new Date(dueDateString);

    var timeDiff = dueDate.getTime() - today.getTime();
    var daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    var status = dataRange[i][3]; // Status in the fourth column.

    // Sends reminder if the assignment is not finished and due within 3-4 days.
    if ((status === 'In Progress' || status === 'Not Started' || status === 'Finishing' || status === 'Checking') && daysDiff <= 4 && daysDiff >= 0) {
      sendReminderEmail(assignmentName, assignmentClass, dueDateString);
    }
  }
}

// This function sends a reminder email. Customize the recipient and email content as needed.
function sendReminderEmail(assignmentName, assignmentClass, dueDate) {
  var recipientEmail = "youremail@gmail.com"; // Replace this with your email.
  var subject = "Assignment Reminder: " + assignmentName + " for " + assignmentClass;
  var message = "Hello, \n\nThis is a reminder that your assignment \"" + assignmentName + "\" for the class \"" + assignmentClass + "\" is due on " + formatDate(dueDate) + ".\n\nPlease ensure that you are making progress on it.\n\nBest regards,\nYour Assignment Logger";

  MailApp.sendEmail(recipientEmail, subject, message); // Sends the email.
}

// Helper function to format the due date for email notifications.
function formatDate(date) {
  var options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options); // Formats the date like "August 9, 2023".
}

// This function runs when the spreadsheet is edited. If the assignment is marked as "Finished", it deletes the row, shifts the remaining data up, and sorts the sheet by the due date.
function onEdit() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1'); // Customize this sheet name if needed.
  var range = sheet.getActiveRange();
  var column = range.getColumn();
  var row = range.getRow();
  
  // Check if the edited cell is in the 4th column (Column D) and contains "Finished".
  if (column === 4 && range.getValue() === "Finished") {
    // Delete the row and shift the remaining data up.
    sheet.deleteRow(row);
    
    // Sort the sheet based on the due date column (assumed to be in Column B).
    var dataRange = sheet.getDataRange();
    dataRange.sort([{ column: 2, ascending: true }]); // Sort by Column B (Due Date), ascending order.
  }
}
