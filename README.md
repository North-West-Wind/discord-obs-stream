# Discord OBS Stream
Stream OBS output to Discord. Works on all platforms.

# Installation
## Requirements
- [FFmpeg](https://ffmpeg.org)
- [Node.js](https://nodejs.org)
- [OBS Studio](https://obsproject.com) (or any recording software that can output with FFmpeg)

## Download
You download this program using an `npm` command:
```
npm i -g discord-obs-stream
```

# Configuration
## Getting Token
You will need to obtain the token of a Discord account. I recommend doing this on an alt account. PLEASE KEEP YOUR TOKEN SECURE, as having the token basically means you're logged in as that user. If you leak it accidentally, reset your password.

[Here](https://github.com/aiko-chan-ai/discord.js-selfbot-v13#get-token-) are the codes to automatically grab it for you.

## Setting Token and User
Running the program will tell you where the config file is located. This file contains 2 configuration fields:
- `token`: The token you obtained from above
- `user`: The user ID of your main account
- `url` (optional): Don't touch if you are not sure what it does. Default: `udp://@:1234?overrun_nonfatal=1&fifo_size=50000000`
- `bitrate` (optional): Bitrate of video. Default: `2500`
- `fps` (optional): FPS of video. Default: `30`

## OBS Studio
You will need to modify OBS recording settings for this to work. I recommend creating a new profile for it.
1. Go to Settings -> Output -> Recording.
2. Change `Type` to `Custom Output (FFmpeg)`.
3. Set `FFmpeg Output Type` to `Output to URL`.
4. Input `udp://127.0.0.1:1234` to `File path or URL`.
5. Change `Container Format` to `mpegts`.
6. Click `Apply`.

# Running
Run `discord-obs-stream` in a console. If success, it will output `Logged in as ${alt account}`.

Before you start streaming on Discord, you need to click `Start Recording` in OBS Studio.

## Commands
- `on`: Start streaming
- `off`: Stop streaming
- `reload`: Reload config
- `stop`: Exit the program