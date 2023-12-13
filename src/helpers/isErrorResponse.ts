import { ErrorType } from '../types/errorType'

export function isErrorResponse(data: unknown): data is ErrorType {
  if (data === null || data === undefined) {
    return false
  }
  return (
    typeof data === 'object' &&
    'status' in data &&
    'statusText' in data &&
    'message' in data
  )
}

export default isErrorResponse
