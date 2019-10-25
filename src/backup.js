const fs = require('fs');
const path = require('path');
const util = require('util');
const axios = require('axios');

const fsAPI = {
  writeFile: util.promisify(fs.writeFile)
};

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
}

module.exports = Backup;
