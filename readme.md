![expired-tweets](expired-tweets.png)

[![Build Status](https://travis-ci.org/jolle/expired-tweets.svg?branch=master)](https://travis-ci.org/jolle/expired-tweets)

# expired-tweets

Want to see if you have tweeted links that have expired or takeoverable domains? Look no more!

## Installation

This tool requires NodeJS. To install the binary, you should use `npm` or `yarn`. **You might need to use `sudo` in order for the binaries to install to your PATH.**

### `npm`

```sh
npm install -g expired-tweets
```

### `yarn`

```sh
yarn global add expired-tweets
```

## Usage

First, download your Twitter archive [here](https://twitter.com/settings/account#tweet_export) (_Your Twitter archive_). Then, run the following command:

```sh
expired-tweets -d [your_exported_tweets_directory_location]
```

## Why?

Inspired by [this](https://twitter.com/securinti/status/823640079067287552).

###### Logo icon(s) by icons8.com
