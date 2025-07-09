import { createContext, useContext } from 'react'

export const StatusContext = createContext(null)

export function useStatus() {
	return useContext(StatusContext)
}