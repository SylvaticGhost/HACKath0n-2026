class GuardClause {
  false(variable: boolean, variableName: string): boolean {
    if (!variable) {
      throw new Error(`${variableName} must be true.`)
    }
    return variable
  }

  zero(variable: number, variableName: string): number {
    if (variable === 0) {
      throw new Error(`${variableName} must be non-zero.`)
    }
    return variable
  }

  negative(variable: number, variableName: string): number {
    if (!variable || variable < 0) {
      throw new Error(`${variableName} must be non-negative. value is ${variable}`)
    }
    return variable
  }

  negativeOrZero(variable: number, variableName: string): number {
    if (!variable || variable <= 0) {
      throw new Error(`${variableName} must be non-negative or non-zero. value is ${variable}`)
    }
    return variable
  }

  nullOrEmpty(variable: string | null | undefined, variableName: string): string {
    if (variable === null || variable === undefined || variable.length == 0) {
      throw new Error(`${variableName} must be not null or empty.`)
    }
    return variable
  }

  nanOrUndefined(variable: number | undefined, variableName: string): number {
    if (variable === undefined || isNaN(variable)) {
      throw new Error(`${variableName} must be not NaN or undefined.`)
    }
    return variable
  }

  nullOrUndefined<T>(variable: T | null | undefined, variableName: string): T {
    if (variable === null || variable === undefined) {
      throw new Error(`${variableName} must be not null or undefined.`)
    }
    return variable
  }

  notEqual<T>(var1: T, var2: T, var1Name: string, var2Name: string): T {
    if (var1 !== var2)
      throw new Error(`variable ${var1Name} (value: ${var1}) doesn't equal ${var2Name} (value: ${var2})`)
    return var1
  }
}

export class Guard {
  static against = new GuardClause()
}
