export class Result<T> {
  statusCode: number
  errorMessage?: string
  value?: T

  private constructor(statusCode: number, value?: T, errorMessage?: string) {
    this.statusCode = statusCode
    this.value = value
    this.errorMessage = errorMessage
  }

  get strictValue(): T {
    if (this.isFailure() || this.value === undefined || this.value === null) {
      throw new Error(`Attempted to access value of a failed Result: ${this.errorMessage}`)
    }
    return this.value
  }

  isSuccess(): boolean {
    return this.statusCode >= 200 && this.statusCode < 300
  }

  isFailure(): boolean {
    return !this.isSuccess()
  }

  mapFailure<U>(): Result<U> {
    if (this.isFailure()) {
      return new Result<U>(this.statusCode, undefined, this.errorMessage)
    }
    throw new Error('Cannot map failure on a successful Result')
  }

  hasValue(): boolean {
    return this.value !== undefined && this.value !== null
  }

  againstFailure(): Result<T> {
    if (this.isFailure()) {
      throw new Error(this.errorMessage)
    }
    return this
  }

  static success<T>(value: T, statusCode: number = 200): Result<T> {
    return new Result<T>(statusCode, value)
  }

  static created<T>(value: T): Result<T> {
    return new Result<T>(201, value)
  }

  static accepted<T>(value: T): Result<T> {
    return new Result<T>(202, value)
  }

  static badRequest<T>(errorMessage: string): Result<T> {
    return new Result<T>(400, undefined, errorMessage)
  }

  static notFound<T>(errorMessage: string): Result<T> {
    return new Result<T>(404, undefined, errorMessage)
  }

  static unauthorized<T>(errorMessage: string): Result<T> {
    return new Result<T>(401, undefined, errorMessage)
  }

  static forbidden<T>(errorMessage: string): Result<T> {
    return new Result<T>(403, undefined, errorMessage)
  }

  static conflict<T>(errorMessage: string): Result<T> {
    return new Result<T>(409, undefined, errorMessage)
  }

  static internalError<T>(errorMessage: string): Result<T> {
    return new Result<T>(500, undefined, errorMessage)
  }

  static parseObject<T>(obj: any): Result<T> {
    if (!obj.statusCode || typeof obj.statusCode !== 'number') {
      throw new Error('Invalid Result object: missing or invalid statusCode')
    }

    let errorMessage: string | undefined

    if (typeof obj.errorMessage === 'string' && obj.errorMessage.trim().length > 0) {
      errorMessage = obj.errorMessage
    } else if (typeof obj.message === 'string' && obj.message.trim().length > 0) {
      errorMessage = obj.message
    } else if (Array.isArray(obj.message)) {
      const messages = obj.message.filter(
        (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0,
      )
      if (messages.length > 0) {
        errorMessage = messages.join(', ')
      }
    } else if (typeof obj.error === 'string' && obj.error.trim().length > 0) {
      errorMessage = obj.error
    }

    return new Result<T>(obj.statusCode, obj.value, errorMessage)
  }
}
