import debug from 'debug'

const d = debug('mtws:util')

export interface AmbigObject {
	[key: string]: string
}

export function parseBoundary(type: string, body: string): AmbigObject {
	d('parsing form with boundary')
	const [, delim]: string[] = type.split('=')
	d(`delim: ${delim}`)
	const splitBody: string[] = body.split('\n').map((line) => line.replace(/\r/g, '')).filter(Boolean)
	const keySplit: string[][] = []
	const cur: string[] = []

	for (let i: number = 0; i < splitBody.length; i += 1) {
		const line: string = splitBody[i]
		d(line)
		if (line.includes(delim)) {
			if (cur.length) keySplit.push([...cur])
			cur.length = 0
		} else {
			cur.push(line)
		}
	}

	const parsed: AmbigObject = keySplit.map((pair: string[]) => {
		const [unparsedKey, ...rest]: string[] = pair
		const key: string = unparsedKey
			.replace('Content-Disposition: form-data name=', '')
			.replace(/"/g, '')
		return {[key]: rest.join()}
	}).reduce((acc, curr) => Object.assign(acc, curr), {})

	return parsed
}

export const parseCookies = (dough: string): {[key: string]: string} => dough.split('').map((pair: string) => {
	const [key, ...vals]: string[] = pair.split('=')
	return {[key]: vals.join('=')}
})
	.reduce((acc: Object, cur: { [x: string]: string }) => Object.assign(acc, cur), {})
