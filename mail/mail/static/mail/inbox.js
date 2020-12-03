// For this project, you’ll design an email client with three mailboxes: an inbox,
// a sent mailbox of all sent mail,
// and an archive of emails that were once in the inbox but have since been archived.

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email('', '', ''));
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

// takes in string arguments to populate compose new email, will be empty strings if new email
function compose_email(recipients, subject, body) {

  // Show compose view and hide other views
  showComposeView();

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = `${recipients}`;
  document.querySelector('#compose-subject').value = `${subject}`;
  document.querySelector('#compose-body').value = `${body}`;
}


// Loads emails in mailbox(Inbox, Sent, Archive) by making API call to views.py mailbox
function load_mailbox(mailbox) {

    // Show the mailbox in html and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#single-email-view').style.display = 'none';
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
            const email_id = email.id;
            const sender = email.sender;
            const subject = email.subject;
            const timestamp = email.timestamp;
            const isEmailRead = email.read;

            // creating button that when clicked goes to single email view
            let viewButton = document.createElement('button');
            viewButton.className = "btn btn-sm btn-outline-primary";
            viewButton.innerHTML = "View";
            viewButton.addEventListener('click', () => load_single_email(`${email_id}`));

            // creating a div (to hold each email preview)
            let element = document.createElement('div');

            // Assigns class name (for css) to each div, different colour
            // background depending if email 'read' is true or false
            element.className = (isEmailRead ? "email_preview_read" : "email_preview_unread");

            // adding data of the email and a button to the div
            element.innerHTML += ` ${timestamp} <br>`;
            element.innerHTML += ` <b>From: </b> ${sender} <br> `;
            element.innerHTML += ` <b>Subject: </b> ${subject} <br> `;
            element.appendChild(viewButton);

            // if inbox show archive button
            // if archive show unarchive button

            // Appending to '#emails-view' in inbox.html
            document.querySelector('#emails-view').append(element);

            // add an archived / unarchived button to mailboxes, 'inbox' and 'archive'
            if (mailbox != "sent") {
                let button = document.createElement('button');
                button.className = "btn btn-sm btn-outline-primary";

                button.innerHTML = (`${mailbox}` === "inbox" ? "Archive" : "Unarchive");
                button.addEventListener('click',
                    `${mailbox}` === "inbox" ?
                    () => archiveEmail(`${email_id}`) :
                    () => unarchiveEmail(`${email_id}`));

                element.appendChild(button);
            }

        });
   });
}

function load_single_email(email_id) {

    // clear any previous html inside div, as only want to show a single email each time this loads
    document.querySelector('#single-email-view').innerHTML = "";

    // Show the mailbox in html and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#single-email-view').style.display = 'block';

    // set status of email wanting to load to 'read' (true)
    // as clicking on view single email will indiciate it has been opened and therfore read
    setEmailRead(`${email_id}`);

    // fetch content of email from views, parsing in 'email_id' parameter
    fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {

        // logs to console, for debugging purposes
        console.log(email);

        // retrieve content of email from fetched data
        const sender = email.sender;
        const recipients = email.recipients;
        const subject = email.subject;
        const timestamp = email.timestamp;
        const body = email.body;

        const emailInfo = getEmailDetails(timestamp, sender, recipients, subject);
        const replyButton = getReplyButton(timestamp, sender, recipients, subject, body);
        const emailBody = getBody(body);

        // append the div to the html div '#single-email-view' so it dispays in browser
        document.querySelector('#single-email-view').appendChild(emailInfo);
        document.querySelector('#single-email-view').appendChild(replyButton);
        document.querySelector('#single-email-view').appendChild(emailBody);

    });
}

// <-------------------- helper functions --------------------------->

function getBody(body) {

    let bodyDiv = document.createElement('div');

    // add line break for formatting
    bodyDiv.innerHTML += `<hr>`;

    // add body of email
    bodyDiv.innerHTML += `<p> ${body} </p>`;

    return bodyDiv;
}

function getEmailDetails(timestamp, sender, recipients, subject) {

    let emailInfo = document.createElement('div');

    emailInfo.innerHTML += `${timestamp} <br>`;
    emailInfo.innerHTML += `<b>From: </b> ${sender} <br>`;
    emailInfo.innerHTML += `<b>To: </b> ${recipients} <br>`;
    emailInfo.innerHTML += `<b>Subject: </b> ${subject} <br>`;

    return emailInfo;
}

function getReplyButton(timestamp, sender, recipients, subject, body) {

    // Create button
    let replyButton = document.createElement('button');

    // give button name
    replyButton.innerHTML = 'Reply';

    // give button class name for css style
    replyButton.className = 'btn btn-sm btn-outline-primary';

    // Auto includes 'Re:' unless already exists dont want to add it again
    const subjectReply = subject.includes('Re:') ? subject : `Re: ${subject}`;

    // pre fill reply body with relevant text
    const bodyReply = `On ${timestamp} ${sender} wrote: ${body}`;

    // add event click to reply button to load compose email view
    replyButton.addEventListener('click', () => compose_email(recipients, subjectReply, bodyReply));

    return replyButton;

}



function archiveEmail(email_id) {

    fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({

            archived: true
        })
    })
    .then(response => response)
    .then(data => {
        console.log('Success:', data);
        load_mailbox('inbox');
    });

}

function unarchiveEmail(email_id) {

    fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({

            archived: false
        })
    })
    .then(response => response)
    .then(data => {
        console.log('Success:', data);
        load_mailbox('archive');
    });



}

function setEmailRead(email_id) {

    fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({

            read: true
        })
    })
    .then(response => response)
    .then(data => {
        console.log('Success:', data);
    });
}

function getRecepientEmail() {

    // all emails are lower case so using toLowerCase() incase any uppercase values are entered
    return document.getElementById('compose-recipients').value.toLowerCase();

}

function getEmailSubject() {

    return document.getElementById('compose-subject').value;

}

function getEmailBody() {

    return document.getElementById('compose-body').value;

}

function showComposeView() {

    // Show the mailbox in html and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#single-email-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
}


// <response>.json() js:  returns a JSON object of the result
//                   (if the result was written in JSON format, if not it raises an error)

// json.loads()     python: If you have a JSON string, you can parse it by using the method.
// JSON.stringify() js: Convert a JavaScript object into a string
