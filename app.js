console.log(process.env)

// Include CTO.ai SDK
const { sdk } = require('@cto.ai/sdk')

// Initialize a Bolt Instance
const { App, ExpressReceiver, LogLevel } = require('@slack/bolt');

// Create a Bolt Receiver and import express
const http = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });
const express = require('express')

// Setup a static asset path
http.app.use('/*', express.static('./static'))

// Other web requests are methods on receiver.router
http.router.get('/home', (req, res) => {
  // You're working with an express req and res now.
  //res.render('./home.pug', { title: 'Interbot', message: 'Interbot' })
  res.send('Brent')
});

// Create the Bolt App, using the receiver
const app = new App({
  logLevel: LogLevel.DEBUG,
  token: process.env.SLACK_BOT_TOKEN,
  receiver: http
});

// Listens to incoming messages that contain "hello"
app.message('hello brent', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${message.user}>!`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Click Me"
          },
          "action_id": "button_click"
        }
      }
    ],
    text: `Hey there <@${message.user}>!`
  });
});

app.action('button_click', async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(`<@${body.user.id}> clicked the button`);
});

(async () => {
  try {
    await app.start(process.env.PORT || 3000);
    console.log(`⚡️Bolt app started on port ${process.env.PORT}`);

    sdk.track([], {
      "event_name": "deployment",
      "event_action":"succeeded",
      "branch": "main",
      "repo": "kc-dot-io/interbot"
    })
  } catch (e) {
    console.log('error', e)
    sdk.track([], {
      "event_name": "deployment",
      "event_action":"failed",
      "branch": "main",
      "repo": "kc-dot-io/interbot"
    })
  }

  process
  .on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown');
    sdk.track([], {
      "event_name": "deployment",
      "event_action":"failed",
      "branch": "main",
      "repo": "kc-dot-io/interbot"
    })
    process.exit(1);
  })

})();
