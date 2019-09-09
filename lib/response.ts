import http from 'http'
import debug from 'debug'

import Request from './request'

const d = debug('resp')

export default class Response {
	private hRes: http.ServerResponse
	private hReq: Request

	constructor(res: http.ServerResponse, req: Request) {
		this.hRes = res
		this.hReq = req
		// default to plaintext response
		this.hRes.setHeader('content-type', 'text/plain')
		this.hRes.setHeader('Set-Cookie', ['set-by=ts-server'])
	}

	/**
	 * Send some data, and once it's flushed - end the connection
	 * @param payload a string of data to send
	 * @param encoding encoding to use
	 */
	send(
		payload: string,
		type: string = 'text/plain',
		encoding: string = 'utf8',
		code: number = 200,
	): void {
		d(`sending ${type}; data: ${payload}`)
		this.hRes.writeHead(code, {'Content-Type': type})
		this.hRes.write(payload, encoding, () => {
			this.hRes.end('\n')
			this.hReq._req.connection.destroy()
		})
	}

	json = (payload: object): void => this.send(JSON.stringify(payload), 'application/json')

	/**
	 * Set a message and code, and end the connection
	 * @param code HTTP code to send
	 * @param message Message to optionally send
	 */
	sendStatus(code: number, message?: string): void {
		if (message)
			this.hRes.statusMessage = message
		d(`Setting code to ${code}`)
		this.hRes.statusCode = code
		this.hRes.end()
	}
}
