# WAT
plugin on to of our dashboard to show what are new errors
and show we care or not

chrome://extensions/ -> Developer mode -> Load unpacked extension -> select the folder

also inspect console
and service worker console

# Usage
As plugin, works on logs.io
but need to change back and forth the tab(the first tiem is runned)

## Show new errors
```bash
./newErrors.js prod Timeout
./newErrors.js stage Timeout
```

## Show all errors yesterday
```bash
./newErrors.js prod Timeout -1
```

## Show errors that were yesterday
node last.err.by.cat.js -e prod -c 'DbBackupFailed'
```js
Err reported times: 5
Up to times a day: 832
Today theres % chance of that error: 18.518
[
  {
  app: 'backup',
  logLevel: 'error',
  env: 'production',
  message: 'db backup failed Database backup capture failed twice!!',
  category: 'ExportDbBackupWorker',
  time: 2022-10-27T08:19:31.375Z,
  timeAgo: '28 days ago'
  },
  {
  app: 'backup',
  logzioSignature: -785292811,
  logLevel: 'error',
  env: 'production',
  message: 'at="error" category="ExportDbBackupWorker" desc="db backup failed Database backup capture failed twice!!"
  db backup failed Database backup capture failed twice!!',
  logSize: 645,
  category: 'ExportDbBackupWorker',
  time: 2022-11-23T04:18:17.275Z,
  timeAgo: '1 day ago'
  }
]
```

```sh
nodemon -x 'node last.err.by.cat.js -e stage -m "fastmeasuncon"'
#Err reported times: 131
#Err reported days: 34
#Up to times a day: 832
#Today theres % chance of that error: 77.3
```

## To load logs
```bash
cd .Trash/
node load.logs.js stage 2022-11-25
```
For some reason its minus day: that means instead 25th it loads 24th


# TODO
- [ ] Add counts to db per day instead uniqBy
- [ ] add causes and resolutions for errors and links to discussions
- [ ] on logs.io add button to hide by message(id)

neural net to categorise should I care and highlight

# DONE
- [X] `npm run backup`
- [X] low db
- [!] maybe localforage would be a better frontend option?
- [X] store every day error
- [X] counts and
- [X] error messages
- [X] add staging
- [X] show new messages,
    - [X] and last seen
- [X] dotenv
  cookie
- [X] UniqBy Category => uniqBy msg (but lowercase, filter non letters)
