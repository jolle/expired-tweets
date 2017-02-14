![expired-tweets](expired-tweets.png)


# expired-tweets
Want to see if you have tweeted links that have expired or takeoverable domains? Look no more!

### Usage
This tool requires nodejs and npm (and electron for GUI).

use the gui with `electron gui.js` or with a binary (see [Making an application with GUI](#making-an-application-with-gui))
OR
```
node cli.js -d=twitter_archive_directory_here
```

You can get your Twitter archive [here](https://twitter.com/settings/account) (_Your Twitter archive_).

### Making an application with GUI
Requires electron and electron-packager.

Change "darwin" (macOS) in the following command for your platform or build for all with `--all`.

```
electron-packager ./ expired-tweets --platform=darwin --overwrite --icon=icon.icns
```
(in project root directory)

### Example result
```
alert vanishreegov.com expired a while ago
info Checked www.flickr.com
alert vanishreegov.com may be takeoverable with an unknown host
```

### Why?
Inspired by [this](https://twitter.com/securinti/status/823640079067287552).

###### Logo icon(s) by icons8.com