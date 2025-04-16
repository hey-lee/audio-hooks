import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAudioList } from '../src/react'

describe('useAudioList', () => {
  const mockUrls = ['audio1.mp3', 'audio2.mp3', 'audio3.mp3']
  let result: any

  beforeEach(() => {
    // Mock Audio and AudioContext
    // @ts-ignore
    global.Audio = vi.fn().mockImplementation(() => ({
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      currentTime: 0,
      duration: 100,
      ended: false,
      playbackRate: 1,
    }))

    // @ts-ignore
    global.AudioContext = vi.fn().mockImplementation(() => ({
      createMediaElementSource: vi.fn().mockReturnValue({
        connect: vi.fn(),
        disconnect: vi.fn(),
      }),
      createGain: vi.fn().mockReturnValue({
        connect: vi.fn(),
        gain: {
          setValueAtTime: vi.fn(),
        },
      }),
      destination: {},
      state: 'running',
      resume: vi.fn().mockResolvedValue(undefined),
    }))

    const hook = renderHook(() => useAudioList(mockUrls))
    result = hook.result
  })

  describe('State Properties', () => {
    it('should initialize with correct default state', () => {
      expect(result.current.state).toEqual({
        list: mockUrls,
        playing: false,
        playingIndex: -1,
        currentTime: 0,
        duration: 0,
        volume: 0.5,
        playbackRate: 1,
        playMode: 'RepeatAll'
      })
    })
  })

  describe('Controls Methods', () => {
    it('should handle play control', async () => {
      await act(async () => {
        await result.current.controls.play()
      })
      expect(result.current.state.playing).toBe(true)
      expect(result.current.state.playingIndex).toBe(0)
    })

    it('should handle pause control', async () => {
      await act(async () => {
        await result.current.controls.play()
        await result.current.controls.pause()
      })
      expect(result.current.state.playing).toBe(false)
    })

    it('should handle next control', async () => {
      await act(async () => {
        await result.current.controls.play()
        await result.current.controls.next()
      })
      expect(result.current.state.playingIndex).toBe(1)
    })

    it('should handle prev control', async () => {
      await act(async () => {
        await result.current.controls.play()
        await result.current.controls.next()
        await result.current.controls.prev()
      })
      expect(result.current.state.playingIndex).toBe(0)
    })

    it('should handle setVolume control', async () => {
      await act(async () => {
        await result.current.controls.setVolume(0.8)
      })
      expect(result.current.state.volume).toBe(0.8)
    })

    it('should handle setPlaybackRate control', async () => {
      await act(async () => {
        await result.current.controls.setPlaybackRate(1.5)
      })
      expect(result.current.state.playbackRate).toBe(1.5)
    })

    // TODO: Fix this test
    // it('should handle nextPlayMode control cycling', async () => {
    //   // Initial mode is 'RepeatAll'
    //   expect(result.current.state.playMode).toBe('RepeatAll')
      
    //   await act(async () => {
    //     result.current.controls.nextPlayMode()
    //   })
    //   expect(result.current.state.playMode).toBe('RepeatOne')
      
    //   await act(async () => {
    //     result.current.controls.nextPlayMode()
    //   })
    //   expect(result.current.state.playMode).toBe('Shuffle')
    // })

    // it('should handle specific playMode setting', async () => {
    //   expect(result.current.state.playMode).toBe('RepeatAll') // Initial state
      
    //   await act(async () => {
    //     result.current.controls.nextPlayMode('Shuffle')
    //   })
    //   expect(result.current.state.playMode).toBe('Shuffle')
      
    //   await act(async () => {
    //     result.current.controls.nextPlayMode('RepeatOne')
    //   })
    //   expect(result.current.state.playMode).toBe('RepeatOne')
    // })

    it('should handle playTrack control', async () => {
      await act(async () => {
        await result.current.controls.playTrack(1)
      })
      expect(result.current.state.playingIndex).toBe(1)
      expect(result.current.state.playing).toBe(true)
    })

    it('should handle setList control', async () => {
      const newUrls = ['new1.mp3', 'new2.mp3']
      await act(async () => {
        await result.current.controls.setList(newUrls)
      })
      expect(result.current.state.list).toEqual(newUrls)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty url list', () => {
      const { result } = renderHook(() => useAudioList([]))
      expect(result.current.state.playingIndex).toBe(-1)
    })

    it('should handle invalid playTrack index', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      await act(async () => {
        await result.current.controls.playTrack(999)
      })
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should clamp playbackRate within valid range', async () => {
      await act(async () => {
        await result.current.controls.setPlaybackRate(5) // Above max
      })
      expect(result.current.state.playbackRate).toBe(3.0)

      await act(async () => {
        await result.current.controls.setPlaybackRate(0.2) // Below min
      })
      expect(result.current.state.playbackRate).toBe(0.5)
    })
  })
})