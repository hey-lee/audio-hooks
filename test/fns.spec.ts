import { describe, it, expect } from 'vitest'
import { randomPlayingIndex } from '../src/react/fns'

describe('randomPlayingIndex', () => {
  it('should return a number between index and length', () => {
    const index = 0
    const length = 5
    const result = randomPlayingIndex(index, length)
    
    expect(result).toBeGreaterThanOrEqual(index)
    expect(result).toBeLessThanOrEqual(length)
  })

  it('should not return the input index', () => {
    const index = 2
    const length = 5
    const result = randomPlayingIndex(index, length)
    
    expect(result).not.toBe(index)
  })

  it('should handle single valid option correctly', () => {
    const index = 0
    const length = 1
    const result = randomPlayingIndex(index, length)
    
    expect(result).toBe(1)
  })

  it('should work with larger ranges', () => {
    const index = 5
    const length = 100
    const result = randomPlayingIndex(index, length)
    
    expect(result).toBeGreaterThanOrEqual(index)
    expect(result).toBeLessThanOrEqual(length)
    expect(result).not.toBe(index)
  })
})