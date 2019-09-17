/**
 * BIG TODO: REFACTOR
 */

import http from 'http'
import debug from 'debug'
import querystring, {ParsedUrlQuery} from 'querystring'
import {parseCookies, parseBoundary, AmbigObject} from './util'

const d = debug('mtws:request')

interface IRequest {
	req: http.IncomingMessage
	pQuery: ParsedUrlQuery
	pathname?: string
}

function inherit(obj: http.IncomingMessage) {
	Object.keys(obj).forEach((key: string) => this[key] = obj[key])
}

class Request extends http.IncomingMessage {
	req: http.IncomingMessage
	originalUrl?: string
	cookies: AmbigObject = {}
	payload: ParsedUrlQuery | AmbigObject | string = ''
	pathname?: string


	constructor(request: IRequest) {
		super(request.req.connection)
		this.req = request.req
		this.originalUrl = request.pathname
		inherit.bind(this)(request.req)
		// this.headers = request.req.headers
		// this.url = request.req.url
		// this.pathname = this.url
		// this.method = request.req.method

		if (request.req.headers.cookie)
			this.cookies = parseCookies(request.req.headers.cookie)

		d(`Request made to ${request.pathname}`)
	}

	handleIncomingStream(type?: string): Promise<Request> {
		return new Promise((res) => {
			let body: string = ''
			this.req.on('data', (data) => {
				// kill early if we're getting too much info
				if (body.length > 1e6) this.req.connection.destroy()
				body += data
			})
			this.req.on('end', () => {
				this.parseData(body, type)
				res(this)
			})
		})
	}

	parseData(body: string, type?: string): void {
		if (!type) return
		if (type === 'text/plain') {
			this.payload = body
		} else if (type.indexOf('application/json') > -1) {
			try {
				d('parsing application/json')
				d(body)
				const parsed = JSON.parse(body)
				d('parse successful')
				this.payload = parsed
			} catch (err) {
				d(err)
				d('Unable to parse body')
			}
		} else if (type.includes('boundary') || body.includes('Boundary')) {
			this.payload = parseBoundary(type, body)
		} else if (type === 'application/x-www-form-urlencoded') {
			d('parsing form x-www-formdata')
			d(body)
			d(querystring.parse(body))
			try {
				this.payload = JSON.parse(body)
			} catch (err) {
				d('err parsing with JSON.parse')
				const parsedForm = querystring.parse(body)
				d(typeof parsedForm)
				this.payload = parsedForm
			}
		} else {
			d('unknown header!', type)
			d('defaulting parse! keeping raw data')
			this.payload = body || ''
		}
	}
}

export default Request
