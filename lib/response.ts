import http from 'http'
import debug from 'debug'

import Request from './request'

const d = debug('mtws:response')

export default class Response {
	private hRes: http.ServerResponse
	private hReq: Request
	code: number = 200
	encoding: string = 'utf8'
	type: string = 'text/plain'

	constructor(res: http.ServerResponse, req: Request) {
		this.hRes = res
		this.hReq = req
		// default to plaintext response
		this.hRes.setHeader('content-type', 'text/plain')
		this.hRes.setHeader('Set-Cookie', ['server=mtws'])
	}


	send(payload: string): void {
		d(`sending ${this.type}; data: ${payload}`)
		this.hRes.writeHead(this.code, {'Content-Type': this.type})
		this.hRes.write(payload, this.encoding, () => {
			this.hRes.end('\n')
			this.hReq.req.connection.destroy()
		})
	}

	json(payload: object): void {
		this.type = 'application/json'
		this.send(JSON.stringify(payload))
	}

	sendStatus(code: number, message?: string): void {
		if (message) this.hRes.statusMessage = message
		d(`Setting code to ${code}`)
		this.hRes.statusCode = code
		this.hRes.end()
	}
}
