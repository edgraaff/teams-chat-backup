const fs = require('fs');
const path = require('path');
const util = require('util');
const axios = require('axios');

const fsAPI = {
  writeFile: util.promisify(fs.writeFile),
  open: util.promisify(fs.open),
  write: util.promisify(fs.write),
  close: util.promisify(fs.close),
  readdir: util.promisify(fs.readdir),
  readFile: util.promisify(fs.readFile)
};

const FILENAME_MATCH = /messages-([0-9]{1,})\.json/;

class Backup {
  constructor ({ chatId, authToken, target }) {
    this.target = target;
    this.chatId = chatId;
    this.instance = axios.create({
      headers: {
        Accept: 'application/json, text/plain, */*',
        Authorization: `Bearer ${authToken}`,
        'Sec-Fetch-Mode': 'cors',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36'
      }
    });
  }

  async run () {
    await this.createTarget();
    await this.getMessages();
    await this.createHtml();
  }

  createTarget (location) {
    return new Promise((resolve, reject) => {
      function probe (location, callback) {
        fs.access(location, err => {
          if (err) {
            // then try its parent
            probe(path.dirname(location), err => {
              if (err) return callback(err);

              // now create it
              fs.mkdir(location, callback);
            });
          } else {
            callback();
          }
        });
      }

      probe(path.resolve(this.target), resolve);
    });
  }

  async getMessages () {
    // URL to first page (most recent messages)
    let url = `https://graph.microsoft.com/beta/me/chats/${this.chatId}/messages`;
    let page = 0;

    while (true) {
      const pageNum = `0000${page++}`.slice(-5);

      console.log(`retrieve page ${pageNum}`);
      const res = await this.instance.get(url);

      if (res.data.value && res.data.value.length) {
        await fsAPI.writeFile(
          path.resolve(this.target, `messages-${pageNum}.json`),
          JSON.stringify(res.data.value, null, '  '),
          'utf8');
      }

      // if there's a next page (earlier messages) ...
      if (res.data['@odata.count'] && res.data['@odata.nextLink']) {
        // .. get these in the next round
        url = res.data['@odata.nextLink'];
      } else {
        // otherwise we're done
        break;
      }
    }
  }

  async createHtml () {
    // need my id to identify 'my' messages
    const profile = await this.instance.get('https://graph.microsoft.com/v1.0/me/');
    const myId = profile.data.id;

    // collect pages to include
    const filenames = await fsAPI.readdir(this.target);
    const pages = filenames.filter(filename => FILENAME_MATCH.test(filename));

    const fd = await fsAPI.open(path.resolve(this.target, 'index.html'), 'w');

    // write head
    await fsAPI.write(fd, `<html>
  <head>
    <link rel="stylesheet" href="../../messages.css">
  </head>
  <body>
`);

    // loop over pages in reverse order
    for (let pageIdx = pages.length - 1; pageIdx >= 0; pageIdx--) {
      const page = pages[pageIdx];

      const data = await fsAPI.readFile(path.resolve(this.target, page), 'utf8');
      const messages = JSON.parse(data);

      // loop over in reverse order:
      for (let messageIdx = messages.length - 1; messageIdx >= 0; messageIdx--) {
        const message = messages[messageIdx];

        await fsAPI.write(fd, `<div class="message ${message.from.user.id === myId ? 'message-right' : 'message-left'}">
  <div class="message-timestamp">${message.lastModifiedDateTime || message.createdDateTime}</div>
  <div class="message-sender">${message.from.user.displayName}</div>
`);

        if (message.body.contentType === 'html') {
          await fsAPI.write(fd, `<div class="message-body">${message.body.content}</div>
</div>`);
        } else {
          await fsAPI.write(fd, `<div class="message-body">${escapeHtml(message.body.content)}</div>
</div>`);
        }
      }
    }

    // write foot
    await fsAPI.write(fd, `</body>
</html>
`);

    await fsAPI.close(fd);
  }
}

function escapeHtml (unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = Backup;
