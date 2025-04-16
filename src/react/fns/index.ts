
/**
 * Generates a random index between the given index and length (inclusive)
 * If the generated random number equals the input index, recursively generates a new one
 * 
 * @param index - The starting index (minimum value)
 * @param length - The maximum length (maximum value)
 * @returns A random number between index and length, excluding the input index
 */
export const randomPlayingIndex = (index: number, length: number): number => {
  const random = Math.floor(Math.random() * (length - index + 1)) + index
  if (random === index) {
    return randomPlayingIndex(index, length)
  }
  return random
}