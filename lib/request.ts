/**
 * BIG TODO: REFACTOR
 */

import http from 'http'
import debug from 'debug'
import {ParsedUrlQuery} from 'querystring'
import {parseCookies, parseData, AmbigObject} from './parsers'

const d = debug('mtws:request')

interface IRequest {
	req: http.IncomingMessage
	pQuery: ParsedUrlQuery
	pathname?: string
}

function inherit(obj: http.IncomingMessage) {
	// @ts-ignore (as this can be `any`)
	Object.keys(obj).forEach((key: string) => (this as Request)[key] = (<any>obj)[key])
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
		this.handleIncomingStream = this.handleIncomingStream.bind(this)
		inherit.bind(this)(request.req)

		if (request.req.headers.cookie)
			this.cookies = parseCookies(request.req.headers.cookie)

		d(`Request made to ${request.pathname}`)
	}

	handleIncomingStream(type: string): Promise<Request> {
		return new Promise((res) => {
			let body: string = ''
			this.req.on('data', (data) => {
				// kill early if we're getting too much info
				if (body.length > 1e6) this.req.connection.destroy()
				body += data
			})
			this.req.on('end', () => {
				this.payload = parseData(body, type)
				d('parsed payload: ', this.payload)
				res(this)
			})
		})
	}
}

export default Request
