// Apollo deduplicates in-flight refetches. A later event must trigger another
// read after that request finishes, otherwise its newer commit can be missed.
export function queueRefetch(refetch: () => Promise<unknown>) {
  let pending = false
  let running: Promise<void> | undefined
  return () => {
    pending = true
    if (!running) {
      running = (async () => {
        do {
          pending = false
          await refetch()
        } while (pending)
      })().finally(() => {
        running = undefined
      })
    }
    return running
  }
}
