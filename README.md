# Audio Hooks

A React hooks library for managing audio playback with advanced controls and features.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://raw.githubusercontent.com/hey-lee/audio-hooks/refs/heads/main/LICENSE)

## Installation

```bash
npm install audio-hooks
```

## Features

- **Multiple playback modes**: Shuffle, Single Once/Loop, Sequential Once/Loop
- **Advanced controls**: Volume, playback rate, seeking, fast forward/rewind
- **Track navigation**: Previous/Next with smart mode handling
- **Web Audio API**: High-quality audio processing with gain control
- **TypeScript support**: Full type definitions included
- **Flexible playlist management**: Dynamic audio list updates

## Quick Start

```tsx
import { useAudioList, AudioProvider } from 'audio-hooks/react'

function AudioPlayer() {
  const { state, controls } = useAudioList([
    'audio1.mp3',
    'audio2.mp3',
    'audio3.mp3'
  ])

  return (
    <AudioProvider>
      <div>
        <h3>Now Playing: Track {state.playingIndex + 1}</h3>
        <p>{Math.floor(state.currentTime)}s / {Math.floor(state.duration)}s</p>
        
        <div>
          <button onClick={controls.prev}>⏮️</button>
          <button onClick={controls.togglePlay}>
            {state.playing ? '⏸️' : '▶️'}
          </button>
          <button onClick={controls.next}>⏭️</button>
        </div>
        
        <div>
          <button onClick={() => controls.rewind()}>⏪ 5s</button>
          <button onClick={() => controls.fastForward()}>⏩ 5s</button>
        </div>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={state.volume}
          onChange={(e) => controls.setVolume(Number(e.target.value))}
        />
      </div>
    </AudioProvider>
  )
}
```

## Advanced Usage

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
  } = useAudioList(tracks.map(({ url }) => url), {
    onEnded: () => {
      console.log('Track ended')
    }
  })

  return {
    state,
    controls,
    playingTrack: tracks[state.playingIndex],
    totalTracks: tracks.length,
  }
}

// components/AudioPlayer.tsx
import { usePlayList } from 'hooks/usePlayList'

const playList = {
  name: 'My Playlist',
  tracks: [
    { name: 'Song 1', artist: 'Artist 1', album: 'Album 1', url: 'song1.mp3' },
    { name: 'Song 2', artist: 'Artist 2', album: 'Album 2', url: 'song2.mp3' },
  ],
}

const AudioPlayer = () => {
  const {
    state,
    controls,
    playingTrack,
    totalTracks,
  } = usePlayList(playList)

  return (
    <AudioProvider>
      <div className="audio-player">
        <div className="track-info">
          <h3>{playingTrack?.name || 'No track selected'}</h3>
          <p>{playingTrack?.artist} - {playingTrack?.album}</p>
          <span>Track {state.playingIndex + 1} of {totalTracks}</span>
        </div>
        
        <div className="playback-controls">
          <button onClick={controls.prev}>⏮️</button>
          <button onClick={controls.togglePlay}>
            {state.playing ? '⏸️' : '▶️'}
          </button>
          <button onClick={controls.next}>⏭️</button>
          <button onClick={() => controls.nextPlayMode()}>
            Mode: {state.playMode}
          </button>
        </div>
        
        <div className="seek-controls">
          <button onClick={() => controls.rewind(10000)}>⏪ 10s</button>
          <input
            type="range"
            min="0"
            max={state.duration}
            value={state.currentTime}
            onChange={(e) => controls.seek(Number(e.target.value))}
          />
          <button onClick={() => controls.fastForward(10000)}>⏩ 10s</button>
        </div>
        
        <div className="audio-settings">
          <label>
            Volume: {Math.round(state.volume * 100)}%
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.volume}
              onChange={(e) => controls.setVolume(Number(e.target.value))}
            />
          </label>
          
          <label>
            Speed: {state.playbackRate}x
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={state.playbackRate}
              onChange={(e) => controls.setPlaybackRate(Number(e.target.value))}
            />
          </label>
        </div>
      </div>
    </AudioProvider>
  )
}
```

## API Reference

### `useAudioList(urls, options)`

**Parameters:**
- `urls: string[]` - Array of audio URLs
- `options?: AudioOptions` - Optional configuration object
  - `onEnded?: () => void` - Callback fired when a track ends

**Returns:** `UseAudioListReturn`
- `state: AudioState` - Current playback state
- `controls: AudioControls` - Playback control methods

### AudioState

| Property | Type | Description |
|----------|------|-------------|
| `audios` | `string[]` | Array of audio URLs |
| `playing` | `boolean` | Whether audio is currently playing |
| `playingIndex` | `number` | Index of currently playing track (-1 if none) |
| `currentTime` | `number` | Current playback position in seconds |
| `duration` | `number` | Total duration of current track in seconds |
| `volume` | `number` | Current volume level (0-1) |
| `playbackRate` | `number` | Current playback speed (0.5-3.0) |
| `playMode` | `PlayMode` | Current playback mode |

### AudioControls

| Method | Parameters | Description |
|--------|------------|-------------|
| `play()` | - | Start playing the current audio track |
| `pause()` | - | Pause the current audio track |
| `togglePlay()` | - | Toggle between play and pause |
| `next()` | - | Skip to next track based on current play mode |
| `prev()` | - | Go to previous track based on current play mode |
| `seek(time)` | `time: number` | Seek to specific time in seconds |
| `fastForward(ms?)` | `ms?: number` | Fast forward by milliseconds (default: 5000) |
| `rewind(ms?)` | `ms?: number` | Rewind by milliseconds (default: 5000) |
| `setVolume(volume)` | `volume: number` | Set volume (0-1) |
| `nextPlayMode(mode?)` | `mode?: PlayMode` | Cycle through or set specific play mode |
| `playTrack(index)` | `index: number` | Play specific track by index |
| `setPlaybackRate(rate)` | `rate: number` | Set playback speed (0.5-3.0) |
| `setAudioList(urls)` | `urls: string[]` | Update the audio URL list |
| `switchAudio(index)` | `index: number` | Switch to track without playing |

### PlayMode Types

```typescript
type PlayMode = 
  | 'Shuffle'          // Random track order
  | 'SingleOnce'       // Play current track once, then stop
  | 'SingleLoop'       // Repeat current track infinitely  
  | 'SequentialOnce'   // Play all tracks once, then stop
  | 'SequentialLoop'   // Repeat entire playlist infinitely
```

### Mode Behavior

- **Shuffle**: Plays tracks in random order, continues infinitely
- **SingleOnce**: Plays the current track once and stops
- **SingleLoop**: Repeats the current track indefinitely
- **SequentialOnce**: Plays all tracks in order once, then stops
- **SequentialLoop**: Plays all tracks in order, then repeats from the beginning

## Best Practices

### Memory Management
The hook automatically manages audio resources and cleans up when components unmount. Audio elements are pooled for efficient reuse.

### Error Handling
```tsx
const { state, controls } = useAudioList(urls, {
  onEnded: () => console.log('Track finished'),
})

// Handle play errors
const handlePlay = async () => {
  try {
    await controls.play()
  } catch (error) {
    console.error('Playback failed:', error)
  }
}
```

### Performance Tips
- Use stable URL arrays to prevent unnecessary re-initializations
- Implement virtualization for large playlists
- Consider lazy loading for audio metadata

## License

MIT © [Lee](https://github.com/hey-lee)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development

```bash
git clone https://github.com/hey-lee/audio-hooks
cd audio-hooks
npm install
npm run dev
```