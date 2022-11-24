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
