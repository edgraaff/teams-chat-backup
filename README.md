# Microsoft Teams chat backup

Work in progress.

## What does it do?

It exports the full history of a Microsoft Teams chat.

## How do I run it?

(for the first time)

```sh
npm run install
```

To run the process:

```sh
npm run start
```

## What do I need?

**Chat ID**

1. Go to [https://teams.microsoft.com]()
2. Go to the chat you'd like to export.
3. Copy chat ID from URL

**Auth token**

1. Go to [https://developer.microsoft.com/en-us/graph/graph-explorer]() and login
2. On the left side (where you clicked for login), hit "modify your permissions". Enable Chat.Read and re-login.
3. Copy token from URL (#access_token=ey...). Or make any random call in the sandbox and copy the Authorization request header from the console.

**Target directory**

is the location where you'd like to export the history to.

## And then?

Once the export is completed, you'll find them in a subdirectory in the `out` directory. The messages of every page are saved in JSON files. A "human readable" version is stored as `index.html` in the target directory.

# Work to do

* Replace image URLs in template
