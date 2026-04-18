export class StringBuilder {
  private str: string

  constructor(initialStr: string = '') {
    this.str = initialStr
  }

  append(s: string): StringBuilder {
    this.str += s
    return this
  }

  appendLine(s: string): StringBuilder {
    this.str += s + '\n'
    return this
  }

  appendDefinition(term: string, definition: string): StringBuilder {
    this.str += `**${term}**: ${definition}\n \n`
    return this
  }

  toString(): string {
    return this.str
  }
}
