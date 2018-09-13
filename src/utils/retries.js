const MAX_RETRY_WAIT_MS = 2 * 60 * 1000

/**
 * Retries up to maxRetries times.
 * @param {int} maxRetries - Number of times to try.
 * @param {function} fn - Async function to retry.
 * @returns - Return value of 'fn' if it succeeded.
 */
async function withRetries(maxRetries, fn) {
  let tryCount = 0
  while (true) {
    try {
      return await fn() // Do our action.
    } catch (e) {
      // Roughly double wait time each failure
      let waitTime = Math.pow(1000, 1 + tryCount / 6)
      // Randomly jiggle wait time by 20% either way. No thundering herd.
      waitTime = Math.floor(waitTime * (1.2 - Math.random() * 0.4))
      // Max out at two minutes
      waitTime = Math.min(waitTime, MAX_RETRY_WAIT_MS)
      console.log(`will retry in ${waitTime / 1000} seconds`)
      tryCount += 1
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    if (tryCount >= maxRetries) {
      throw new Error('number of retries exceeded')
    }
  }
}

module.exports = { withRetries }
