
A React hooks library for managing audio playback with advanced controls and features.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://raw.githubusercontent.com/hey-lee/audio-hooks/refs/heads/main/LICENSE)

## Installation

```bash
npm install audio-hooks
```

## Features

- Multiple audio playback modes (`RepeatOne`, `RepeatAll`, `Shuffle`)
- Volume control
- Playback rate control (0.5x to 3.0x)
- Track seeking
- Previous/Next track navigation
- Built on Web Audio API
- TypeScript support

## Usage

```tsx
// hooks/usePlayList.ts
import { useAudioList, AudioProvider } from 'audio-hooks/react'

export interface PlayList {
  id: string
  name: string
  owner?: string
  cover?: string
  description?: string
  tracks: Track[]
  createdAt?: string
  updatedAt?: string
  duration?: number
  isPublic?: boolean
  tags?: string[]
}

type Track = {
  name: string
  artist: string
  album: string
  cover?: string
  url: string
}


export const usePlayList = ({ tracks = [] }: PlayList) => {
  const {
    state,
    controls,
  } = useAudioList(tracks.map(({ url }) => url))

  return {
    state,
    controls,
    playingTrack: tracks[state.playingIndex],
  }
}

// components/AudioPlayer.tsx
import { usePlayList } from 'hooks/usePlayList'

const playList = {
  name: 'My Playlist',
  tracks: [],
  // ...
}

const AudioPlayer = () => {
  const {
    state,
    controls,
    playingTrack,
  } = usePlayList(playList)

  return (
    <AudioProvider>
      <div>
        Playing: {state.playing ? 'Yes' : 'No'}
        Current Track: {state.playingIndex + 1} of {playList.tracks.length}
        Time: {state.currentTime} / {state.duration}
      </div>
      
      <div>
        <button onClick={controls.play}>Play</button>
        <button onClick={controls.pause}>Pause</button>
        <button onClick={controls.prev}>Previous</button>
        <button onClick={controls.next}>Next</button>
      </div>
    </AudioProvider>
  )
}
```

## API

### `useAudioList(urls: string[])`

Returns an object containing the current state and controls for audio playback.

### `state`

- `volume`: `number` - Current volume level between `0` and `1`.
- `playing`: `boolean` - Whether audio is currently playing.
- `duration`: `number` - Total duration of current track in seconds.
- `currentTime`: `number` - Current playback position in seconds.
- `playbackRate`: `number` - Current playback speed between `0.5` and `3.0`.
- `playingIndex`: `number` - Index of currently playing track in playlist.
- `playMode`: `PlayMode: 'RepeatOne' | 'RepeatAll' | 'Shuffle'` - Represents the playback mode for audio tracks.

### `controls`

- `play()`: Start playing the current audio track.
- `togglePlay()`: Toggle play between play and pause.
- `pause()`: Pause the current audio track.
- `prev()`: Go to previous track based on current play mode.
- `next()`: Skip to next track based on current play mode.
- `setVolume(volume: number)`: Set audio volume between `0` and `1`.
- `seek(time: number)`: Seeks to the specified time in seconds.
- `playTrack(index: number)`: Play specific track by index.
- `setPlaybackRate(rate: number)`: Set playback rate between `0.5` and `3.0`.
- `nextPlayMode(mode?: PlayMode)`: Change the play mode to the next mode in the list.
  ```ts
  type PlayMode = 'RepeatAll' | 'RepeatOne' | 'Shuffle'
  ```

### `setAudioList(urls: string[])`

Update the list of audio URLs.

## License

MIT © [Lee](https://github.com/hey-lee)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
