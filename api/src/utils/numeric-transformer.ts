export const numericTransformer = {
  from: (value: string | number | null): number | null => {
    if (value === null || value === undefined) return null
    const n = typeof value === 'number' ? value : parseFloat(value)
    return isNaN(n) ? null : n
  },
  to: (value: unknown) => value,
}
