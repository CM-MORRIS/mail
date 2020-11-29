// For this project, you’ll design an email client with three mailboxes: an inbox,
// a sent mailbox of all sent mail,
// and an archive of emails that were once in the inbox but have since been archived.

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#send').addEventListener('click', send_email);

  // By default, load the inbox
  load_mailbox('sent');
});

function send_email() {

    // Fetch is a Javascript function that accepts two arguments.
    // 1:  URL as String,
    // 2:  Optional argument that contains info about the request.
    // If you are only looking to retrieve data from an API,
    // you do not need to use the second argument, as Javascript will automatically
    // expect a “GET” request.
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
          recipients: getRecepientEmail(),
          subject: getEmailSubject(),
          body: getEmailBody()
        })
      })
      .then(response => response.json())
      .then(result => {
        console.log(result);
      });

    // Once the email has been sent, load the user’s sent mailbox.
    load_mailbox('sent');
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


// Loads emails in mailbox(Inbox, Sent, Archive) by making API call to views.py mailbox
function load_mailbox(mailbox) {

    // Show the mailbox in html and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    // returns all emails from a mailbox via API call to views
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())  // turn response into json - 'response' is anonymous function name for the response promise, can be anything
    .then(emails => {                   // do something with data - 'email' is anonymous function name for the data, can be anything

        // logs to console, for debugging purposes
        console.log(emails);

        // looping through each email in JSON obj (for single 'email' in list of 'emails')
        emails.forEach(function(email) {

            // getting content of each email and assigning to variables
            const sender = email.sender;
            const subject = email.subject;
            const timestamp = email.timestamp;
            const isEmailRead = email.read;

            // creating a div (to hold each email preview)
            let element = document.createElement('div');

            // Assigns class name (for css) to each div, different colour background depending if email read
            element.className = (isEmailRead ? "email_preview_read" : "email_preview_unread");

            // adding data of the email to the div
            element.innerHTML += ` ${timestamp} <br>`;
            element.innerHTML += ` <b>From: </b> ${sender} <br> `;
            element.innerHTML += ` <b>Subject: </b> ${subject} `;

            // Appending to '#emails-view' in inbox.html
            document.querySelector('#emails-view').append(element);

        });
   });
}

// <-------------------- helper functions --------------------------->

function getRecepientEmail() {

  // all emails are lower case so using toLowerCase() incase any uppercase values are entered
  return document.getElementById('compose-recipients').value.toLowerCase();

}

function getEmailSubject() {

  return document.getElementById('compose-subject').value.toLowerCase();

}

function getEmailBody() {

  return document.getElementById('compose-body').value.toLowerCase();

}
