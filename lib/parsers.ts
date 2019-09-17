import debug from 'debug'
import querystring from 'querystring'

const d = debug('mtws:util')

export interface AmbigObject {
	[key: string]: any
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

export function parseCookies(dough: string): AmbigObject {
	return dough.split('; ').map((pair: string) => {
		const [key, ...vals]: string[] = pair.split('=')
		const val = vals.join('=')
		return {[key]: val}
	})
		.reduce((acc, cur) => ({...acc, ...cur}), {})
}

type ParserFunc = (tp: string, bd: string) => any

function getBodyParser(type: string): ParserFunc {
	if (type.includes('application/json')) return (tp: string, bd: string) => JSON.parse(bd)
	if (type.includes('boundary')) return (tp: string, bd: string) => parseBoundary(tp, bd)
	if (type.includes('x-www-form-urlencoded')) return (tp: string, bd: string) => querystring.parse(bd)
	return (bd: string) => bd
}

export function parseData(body: string, type: string): any {
	d('Parsing: ', {body})
	d('type: ', {type})
	const parser: ParserFunc = getBodyParser(type)
	return parser(type, body)
}
