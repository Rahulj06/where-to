import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'where-to-anon-id'

export const useAnonymousId = () => {
  const getOrCreate = (): string => {
    if (typeof window === 'undefined') return ''
    let id = localStorage.getItem(STORAGE_KEY)
    if (!id) {
      id = uuidv4()
      localStorage.setItem(STORAGE_KEY, id)
    }
    return id
  }

  return { getOrCreate }
}
