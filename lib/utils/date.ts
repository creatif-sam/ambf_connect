export function formatShortDate(dateString: string) {
  const d = new Date(dateString)

  const day = d.getUTCDate()
  const month = d.getUTCMonth() + 1
  const year = d.getUTCFullYear()

  return `${day}/${month}/${year}`
}
