import { API_URL } from "../config"

export default function devopsApiFetch(url, options = {}) {
	const fullPath = `${API_URL}${url}`

	return fetch(fullPath, {
		method: options.method || 'GET',
		headers: {
			'Content-Type': 'application/json',
			...(options.headers || {}),
		},
		...(options.body && { body: JSON.stringify(options.body) })
	}).then(res => res.json())
}

