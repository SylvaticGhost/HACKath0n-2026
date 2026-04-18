export class SemaphoreSlim {
  private promise = Promise.resolve()
  private waiters = 0

  async wait(): Promise<() => void> {
    this.waiters++
    let resolveFn!: () => void
    const nextPromise = new Promise<void>((resolve) => {
      resolveFn = resolve
    })
    const currentPromise = this.promise

    this.promise = currentPromise.then(() => nextPromise)

    await currentPromise

    return () => {
      resolveFn()
      this.waiters--

      if (this.waiters === 0) {
        this.promise = Promise.resolve()
      }
    }
  }
}
