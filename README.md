# Microsoft Teams Chat Backup

This project retrieves a full chat history (messages and uploaded files) and renders it as an HTML.

## Requirements

Node.js 10 (or higher). Tested on macOS and Windows, but will most likely run on Linux too.

# Setup

Like any other JS project, clone this repo and run the following command to install dependencies:

```sh
npm install
```

# Run

To backup a chat, run:

```sh
npm run start
```

This will ask several questions:

**Chat ID** - this is the identifier of the conversation. To find it:

1. Go to [https://teams.microsoft.com](https://teams.microsoft.com)
2. Go to the chat you'd like to export.
3. Copy chat ID from URL. It looks like `19:<uuid of one user>-<uuid of other user>@unq.gbl.spaces`

**Auth token (JWT)** - this is needed for calling Microsoft Graph APIs.

1. Go to [https://developer.microsoft.com/en-us/graph/graph-explorer](https://developer.microsoft.com/en-us/graph/graph-explorer). At the left side, under Authentication, click "Sign In with Microsoft"
2. After having logged in, on the left side (where you clicked for login), click "modify permissions". Enable `Chat.Read` and re-login (like it states).
3. The URL contains the token (`#access_token=<long token goes here>`). Copy this value. Or make any random call in the sandbox and copy the Authorization request header either from the JS console (without `Bearer ` in front of it) or from the "Access token" tab of the Graph Explorer page.

**Target directory name** - is the name to use for the export (will be created in the `out` directory in this project).

# Output

An exported chat contains:

* `messages-#####.json`: these are the pages of messages. Page 0000 is the most recent one (pages and messages within are in reverse order).
* `image-#####`: these are images uploaded in the chat
* `index.html`: is the full history rendered into a simple HTML template, referring to the downloaded images. This is the file you want for viewing.

# To Do

* Make an easier way of obtaining a token.
* Add support for bot messages (for example a form).
