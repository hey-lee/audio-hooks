
import { randomPlayingIndex } from './fns'
import { useState, useRef, useCallback, useMemo } from 'react'
import { useGain, useAudioContext } from 'web-audio-hooks/react'

export { AudioProvider } from 'web-audio-hooks/react'

/**
 * Represents the playback mode for audio tracks
 * @typedef {('RO' | 'RA' | 'S')} PlayMode
 * - 'RO' - Repeat One playback mode
 * - 'RA' - Repeat All playback mode
 * - 'S' - Shuffle playback mode
 */
type PlayMode = 'RepeatOne' | 'RepeatAll' | 'Shuffle'
const modes: PlayMode[] = [`RepeatOne`, `RepeatAll`, `Shuffle`]

/**
 * Controls interface for audio playback functionality
 */
type Controls = {
  /** Start playing the current audio track */
  play: () => void
  /** Pause the current audio track */
  pause: () => void
  /** Skip to next track based on current play mode */
  next: () => void
  /** Go to previous track based on current play mode */
  prev: () => void
  /** 
   * Seek to specific time in current track
   * @param time - Target time in seconds
   */
  seek: (time: number) => void
  /**
   * Set audio volume
   * @param volume - Volume level between 0 and 1
   */
  setVolume: (volume: number) => void
  /**
   * Change playback mode
   * @param mode - Optional specific play mode to set, cycles through modes if not provided
   */
  nextPlayMode: (mode?: PlayMode) => void
  /**
   * Play specific track by index
   * @param index - Index of track in playlist
   */
  playTrack: (index: number) => void
  /**
   * Set playback speed
   * @param rate - Playback rate between 0.5 and 3.0
   */
  setPlaybackRate: (rate: number) => void
  /**
   * Set the list of audio URLs
   * @param urls - Array of URLs for audio tracks
   */
  setList: (urls: string[]) => void
}
/**
 * State interface for audio playback functionality
 */
type State = {
  list: string[]
  /** Whether audio is currently playing */
  playing: boolean
  /** Index of currently playing track in playlist */
  playingIndex: number
  /** Current playback position in seconds */
  currentTime: number
  /** Total duration of current track in seconds */
  duration: number
  /** Current volume level between 0 and 1 */
  volume: number
  /** Current playback speed between 0.5 and 3.0 */
  playbackRate: number
  /** Current playback mode (sequential/shuffle/loop) */
  playMode: PlayMode
}

/**
 * Return type for useAudioList hook
 * @property state - Current state of audio playback including playing status, time, volume etc
 * @property controls - Methods to control audio playback like play, pause, seek etc
 * @property setList - Function to update the list of audio URLs
 */
export type UseAudioListReturn = {
  state: State
  controls: Controls
}

/**
 * React hook for managing a list of audio tracks with playback controls
 * @param urls - Array of URLs for audio tracks to be played
 * @returns Object containing playback state, controls, and URL setter
 * @example
 * ```tsx
 * const { state, controls, setList } = useAudioList([
 *   'audio1.mp3',
 *   'audio2.mp3'
 * ])
 * ```
 */
export const useAudioList = (urls: string[]): UseAudioListReturn  => {
  const context = useAudioContext()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioPoolRef = useRef<HTMLAudioElement[]>([])
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const gainNode = useGain(0.5)
  const playModeRef = useRef<State['playMode']>(`RepeatAll`)
  const playingIndexRef = useRef<State['playingIndex']>(-1)

  const [_urls, setList] = useState(urls)
  const [playing, setPlaying] = useState<State['playing']>(false)
  const [duration, setDuration] = useState<State['duration']>(0)
  const [volume, setVolume] = useState<State['volume']>(0.5)
  const [currentTime, setCurrentTime] = useState<State['currentTime']>(0)
  const [playbackRate, setPlaybackRate] = useState<State['playbackRate']>(1)

  const state: State = useMemo(() => ({
    list: _urls,
    volume,
    playing,
    duration,
    currentTime,
    playbackRate,
    playMode: playModeRef.current,
    playingIndex: playingIndexRef.current,
  }), [
    _urls,
    volume,
    playing,
    duration,
    currentTime,
    playbackRate,
    playModeRef,
    playingIndexRef,
  ])

  const getAudio = (url?: string) => {
    const available = audioPoolRef.current.find((a) => a.ended)
    if (available && url) {
      available.src = url
      return available;
    }
    return new Audio(url)
  }

  const initAudio = useCallback(
    (url: string) => {
      if (!context || !url || !gainNode) return
      if (sourceRef.current) {
        audioRef.current?.pause()
        sourceRef.current.disconnect()
      }
      
      audioRef.current = getAudio(url)
      const audio = audioRef.current
      audio.playbackRate = playbackRate
      audio.crossOrigin = `anonymous`

      sourceRef.current = context.createMediaElementSource(audio)
      sourceRef.current.connect(gainNode)
      gainNode.connect(context.destination)

      const updateTime = () => {
        setCurrentTime(audio.currentTime)
      }

      const updateMetadata = () => {
        setDuration(audio.duration)
      }

      const onAudioEnded = () => {
        if (playModeRef.current === `RepeatOne`) {
          audio.currentTime = 0
          audio.play()   
        } else {
          playNextTrack()
        }
        audioPoolRef.current.push(audio)
      }

      const onRateChange = () => {
        controls.setPlaybackRate(audio.playbackRate)
      }

      audio.addEventListener(`ratechange`, onRateChange)
      audio.addEventListener(`timeupdate`, updateTime)
      audio.addEventListener(`loadedmetadata`, updateMetadata)
      audio.addEventListener(`ended`, onAudioEnded)

      return () => {
        audio.pause()
        audioPoolRef.current.forEach(a => a.pause())
        audioPoolRef.current = []
        sourceRef.current?.disconnect()
        audio.removeEventListener(`ratechange`, onRateChange)
        audio.removeEventListener(`timeupdate`, updateTime)
        audio.removeEventListener(`loadedmetadata`, updateMetadata)
        audio.removeEventListener(`ended`, onAudioEnded)
      }
    },
    [context, gainNode, playbackRate]
  )

  const playTrack = useCallback(async (index: number) => {
    if (index < 0 || index >= _urls.length) {
      console.warn(`Invalid index: ${index}`)
      return
    }

    playingIndexRef.current = index

    setPlaying(false)
    initAudio(_urls[playingIndexRef.current])

    try {
      if (context?.state === `suspended`) {
        await context.resume()
      }
      await audioRef.current?.play()
      setPlaying(true)
    } catch (err) {
      console.error(`播放失败:`, err)
    }

  }, [context, _urls, initAudio])

  const getPrevIndex = () => {
    if (_urls.length === 0) return -1
    if (playModeRef.current === `Shuffle`) {
      return randomPlayingIndex(playingIndexRef.current, _urls.length)
    }
    if (playingIndexRef.current <= 0) {
      return _urls.length - 1
    }
    return playingIndexRef.current - 1
  }
  const getNextIndex = () => {
    if (_urls.length === 0) return -1
    if (_urls.length > 0 && playingIndexRef.current === -1) {
      return 0   
    }
    if (playModeRef.current === `Shuffle`) {
      return randomPlayingIndex(playingIndexRef.current, _urls.length)
    }
    if (playingIndexRef.current >= (_urls.length - 1)) {
      return 0
    }
    
    return playingIndexRef.current + 1
  }

  const playPrevTrack = () => {
    playTrack(getPrevIndex())
  }

  const playNextTrack = () => {
    playTrack(getNextIndex())
  }

  const controls: Controls = {
    play: async () => {
      if (audioRef.current) {
        await audioRef.current.play()
        setPlaying(true)
      } else {
        if (_urls.length > 0) {
          playTrack(0)
        }
      }
    },
    pause: () => {
      audioRef.current?.pause()
      setPlaying(false)
    },
    playTrack,
    setList,
    prev: playPrevTrack,
    next: playNextTrack,
    seek: (time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time
      }
    },
    setVolume: (volume: number) => {
      setVolume(volume)
      if (gainNode) {
        gainNode.gain.setValueAtTime(volume, context?.currentTime || 0)
      }
    },
    nextPlayMode: (_mode?: PlayMode) => {
      const currentIndex = modes.indexOf(playModeRef.current)
      const nextIndex = (currentIndex + 1) % modes.length
      const mode = _mode || modes[nextIndex]
      playModeRef.current = mode
    },
    setPlaybackRate: (rate: number) => {
      rate = Math.min(Math.max(rate, 0.5), 3.0)
      setPlaybackRate(rate)
      if (audioRef.current) {
        audioRef.current.playbackRate = rate
      }
    },
  }

  return {
    state,
    controls,
  }
}
