---
id: reddit
title: Reddit
---

## Documentation

https://www.reddit.com/dev/api/

## Configuration

https://www.reddit.com/prefs/apps/

## Options

The **Reddit Provider** comes with a set of default options:

- [Reddit Provider options](https://github.com/nextauthjs/next-auth/blob/main/packages/next-auth/src/providers/reddit.js)

You can override any of the options to suit your own use case.

## Example

```js
import RedditProvider from "next-auth/providers/reddit";
...
providers: [
  RedditProvider({
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET
  })
]
...
```

:::warning
Reddit requires authorization every time you go through their page.
:::

:::warning
Only allows one callback URL per Client ID / Client Secret.
:::

:::tip
This Provider template only has a one hour access token to it and only has the "identity" scope. If you want to get a refresh token as well you must follow this:

```js
providers: [
  RedditProvider({
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    authorization: {
      params: {
        duration: 'permanent',
      },
    },
  }),
]
```

:::
