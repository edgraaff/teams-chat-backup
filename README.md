# Microsoft Teams chat backup

Work in progress. Run with `npm run start`. Data you'll need:

**Chat ID**

1. Go to https://teams.microsoft.com
2. Go to the chat you'd like to export.
3. Copy chat ID from URL

**Auth token**

1. Go to https://developer.microsoft.com/en-us/graph/graph-explorer and login
2. On the left side (where you clicked for login), hit "modify your permissions". Enable Chat.Read and re-login.
3. Copy token from URL (#access_token=ey...). Or make any random call in the sandbox and copy the Authorization request header from the console.

**Target directory**

is the location where you'd like to export the history to.

# Work to do

* Pour into HTML template
* Retrieve screenshots (as you need the same token to get these images)
