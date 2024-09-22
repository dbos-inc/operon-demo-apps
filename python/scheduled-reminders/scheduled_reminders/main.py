# This app uses DBOS to schedule reminder emails to send far in the future.

# First, let's do imports and initialize DBOS.

import os

from dbos import DBOS, SetWorkflowID
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, EmailStr
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

app = FastAPI()
DBOS(fastapi=app)

# Next, let's write the workflow that sends emails.
# It sends emails one minute, one day, one week, and
# one month in the future.

# Thanks to DBOS durable workflows, scheduling a function
# to execute far in the future is easy: just sleep then
# call the function.

# When you first call DBOS.sleep, the wakeup time is recorded
# in the database. That way, even if your program is interrupted
# or restarted multiple times during a month-long sleep,
# it will still wake up on schedule and execute the function.


@DBOS.workflow()
def reminder_workflow(to_email: str):
    DBOS.sleep(60)  # Wait for one minute
    send_email(to_email, time="one minute")

    DBOS.sleep(24 * 60 * 60)  # Wait for one day
    send_email(to_email, time="one day")

    DBOS.sleep(7 * 24 * 60 * 60)  # Wait for one week
    send_email(to_email, time="one week")

    DBOS.sleep(30 * 24 * 60 * 60)  # Wait for one month (30 days)
    send_email(to_email, time="one month")


# Now, let's write the actual email-sending code using SendGrid.
# First, we'll load a couple environment variables needed by SendGrid.

api_key = os.environ.get("SENDGRID_API_KEY", None)
if api_key is None:
    raise Exception("Error: SENDGRID_API_KEY is not set")

from_email = os.environ.get("SENDGRID_FROM_EMAIL", None)
if from_email is None:
    raise Exception("Error: SENDGRID_FROM_EMAIL is not set")


# Then, we implement the send_email function using SendGrid's API.
# We annotate this function with @DBOS.step() so the reminder workflow
# calls it durably and avoids re-executing it if restarted.


@DBOS.step()
def send_email(to_email: str, time: str):
    message = Mail(
        from_email=from_email,
        to_emails=to_email,
        subject="DBOS Reminder",
        html_content=f"This is a reminder from DBOS! It has been {time} since your last reminder.",
    )
    email_client = SendGridAPIClient(api_key)
    email_client.send(message)
    DBOS.logger.info(f"Email sent to {to_email} at time {time}")


# Next, let's use FastAPI to write an HTTP endpoint that sends emails.
# The endpoint takes in an email and starts in the background
# a reminder workflow for that email.

# As a basic anti-spam measure, we'll use the target email as an idempotency key.
# That way, you can only send one set of reminders to any given email.


class EmailSchema(BaseModel):
    email: EmailStr


@app.post("/email")
def email_endpoint(email: EmailSchema):
    with SetWorkflowID(email.email):
        DBOS.start_workflow(reminder_workflow, email.email)


# Finally, let's serve the app's frontend from an HTML file using FastAPI.
# In production, we recommend using DBOS primarily for the backend,
# with your frontend deployed elsewhere.


@app.get("/")
def frontend():
    with open(os.path.join("html", "app.html")) as file:
        html = file.read()
    return HTMLResponse(html)


# To deploy this app to the cloud and send your own reminder emails,
# configure the SendGrid environment variables then run `dbos-cloud app deploy`.
