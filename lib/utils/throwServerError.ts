export function throwServerError(error: any): never {
  if (!error) {
    throw new Error("Unknown server error")
  }

  if (error instanceof Error) {
    throw error
  }

  if (typeof error === "string") {
    throw new Error(error)
  }

  if (error.message) {
    throw new Error(error.message)
  }

  throw new Error(JSON.stringify(error))
}
