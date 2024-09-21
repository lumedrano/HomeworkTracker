//This doGet function just creates a webpage for you, without this it will not build the webpage
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

//When you press submit on webpage, this function triggers
function addFormData(formData) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Sheet1'); // Goes to the sheet this code is attached to 

    sheet.appendRow([formData.assignmentName, formData.dueDate, formData.classDropdown, formData.status]); //this appends all information to a new row in spreadsheet

    // Sort the sheet based on the due date column
    var dataRange = sheet.getDataRange();
    dataRange.sort([{ column: 2, ascending: true }]); // Assuming due date is in the second column

    return "Assignment Added";// if this try works and all information is added, then it returns a success message to display that it was added to the sheet
  } catch (error) {
    return "An error occurred: " + error.toString();//if it tries and does not work then it catches the error and returns it to the user as a failure message
  }
}

//this function will be running daily using a trigger. If the due date for any assignment is within 3 days from current date and is either in progress or not started then it uses the next function.
function addDailyReminders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Sheet1'); // Replace 'Sheet1' with your sheet name
  var dataRange = sheet.getDataRange().getValues();

  var today = new Date();
  today.setHours(0, 0, 0, 0);

  for (var i = 0; i < dataRange.length; i++) { // Start from 1 to skip header row
    var assignmentName = dataRange[i][0]; // Assuming assignment name is in the first column
    var dueDateString = dataRange[i][1]; // Assuming due date is in the second column
    var assignmentClass = dataRange[i][2]; // Assuming class is in the third column

    var dueDate = new Date(dueDateString);

    var timeDiff = dueDate.getTime() - today.getTime();
    var daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    var status = dataRange[i][3];

//if the status of any assignment in the sheet is not started or in progress and the due date is within 3-4 days then it will use the next function to send you a reminder email
    if ((status === 'In Progress' || status === 'Not Started' || status === 'Finishing' || status === 'Checking') && daysDiff <= 4 && daysDiff >= 0) {
      sendReminderEmail(assignmentName, assignmentClass, dueDateString);
    }
  }
}

//This is used in the last function, but what it does is takes the name of assignment, class its for, and due date so you can get personalized emails from a bot to reminder you to finish it.
function sendReminderEmail(assignmentName, assignmentClass, dueDate) {
  var recipientEmail = "luigi.medrano@utexas.edu"; // Replace with your email address
  var subject = "Assignment Reminder: " + assignmentName + " for " + assignmentClass;
  var message = "Hey Luigi!,\n\nThis is a reminder that your assignment \"" + assignmentName + "\" for the class \"" + assignmentClass + "\" is due on " + formatDate(dueDate) + ".\n\nPlease ensure that you are making progress on it.\n\nBest regards,\nYour Assignment Logger";

  MailApp.sendEmail(recipientEmail, subject, message);
}


//this is a little helper function that allows the due date to be displayed like "08/09/2023" instead of hr:min:sec/month/day/year when sending you a reminder.
function formatDate(date) {
  var options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}




function onEdit() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1'); // Change to your sheet name
  var range = sheet.getActiveRange();
  var column = range.getColumn();
  var row = range.getRow();
  
  // Check if the edited cell is in the 4th column (Column D) and contains "Finished"
  if (column === 4 && range.getValue() === "Finished") {
    var dataRange = sheet.getDataRange();
    var dataValues = dataRange.getValues();
    
    // Find the row with the "Finished" status and get the data
    var finishedRowData = dataValues[row - 1]; // Adjust for 0-based index
    
    // Open the target spreadsheet and sheet where you want to move completed assignments
    var targetSpreadsheet = SpreadsheetApp.openById('1Pd4n0mUczwIXzeCfADgXMdCKW3niThmb5VEwrhT8oes'); // Replace with your target spreadsheet ID
    var targetSheet = targetSpreadsheet.getSheetByName('Sheet1'); // Replace with your target sheet name
    
    // Convert the due date (column B) to the desired format
    var dueDate = new Date(finishedRowData[1]);
    var formattedDueDate = formatDate(dueDate);
    
    // Append the completed assignment data to the target sheet
    finishedRowData[1] = formattedDueDate; // Update the due date column
    targetSheet.appendRow(finishedRowData);
    
    // Delete the original row (columns A-D) and shift the remaining data up
    sheet.deleteRow(row);
    
    // Sort the target sheet based on the due date column
    var targetDataRange = targetSheet.getDataRange();
    targetDataRange.sort([{ column: 2, ascending: true }]); // Assuming due date is in the second column
  }
}

