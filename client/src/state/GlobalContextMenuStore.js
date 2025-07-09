import { create } from 'zustand'

export const useGlobalContextMenuStore = create((set) => ({
	visible: false,
	x: 0,
	y: 0,
	type: null,
	data: {},
	show: (config) => set({ ...config, visible: true }),
	close: () => set({ visible: false }),
}))

