import http from 'http'
import {parse} from 'url'
import querystring from 'querystring'
import debug from 'debug'

import Request from './request'
import Response from './response'

const d = debug('serv')


type Middleware = (req: any, res: any, next?: Middleware) => void | Promise<void>
type Void = (...args: any[]) => void

interface Route {
	method: string
	url: string
	func: Middleware
}

const matches = (req: any, mw: Route): boolean => {
	const urlMatches = (req.url === mw.url)
	const methodMatches = (req.method === mw.method) || mw.method === '*'
	return methodMatches && urlMatches
}

const notfound: Middleware = (req, res) => res.sendStatus(404)

// router can be a route as router.func should handle sub-routing
class Router implements Route {
	routes: Route[] = []
	method: string
	url: string
	constructor(url: string, method: string) {
		this.url = url
		this.method = method
	}

	handle(req: any, res: any): any {
		// shallow clone current routes
		const cloned = [...this.routes]
		let cur = cloned.pop()
		while (cur && matches(req, cur))
			cur = cloned.pop()
		if (cur)
		// todo: handle routers and next here
		// let idx = this.routes.indexOf(cur)
			cur.func(req, res)
		else
			notfound(req, res)
	}

	add = (method: string, url: string, func: Middleware): void => {
		this.routes.push({method, url, func})
	}

	func = this.handle
}


class Server {
	private server: http.Server
	router = new Router('/', '*')

	constructor() {
		this.listener = this.listener.bind(this)
		this.server = http.createServer(this.listener)
	}

	public listen = (port: number, cb: Void): void => {
		this.server.listen(port, cb)
	}

	private async listener(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
		d('===BEGINNING PARSE===')
		// firstly, parse the request and response - make it a little more express-like
		const parsedReq = await Server.parseRequest(req)
		const parsedRes = new Response(res, parsedReq)

		d('attempting to handle')
		console.log(this)
		this.router.handle(parsedReq, res)

		d('===END PARSE===')
	}

	// todo: add stack to req
	static parseRequest(req: http.IncomingMessage): Promise<Request> {
		// get what we're interested from the pure request
		const {url, headers, method, statusCode} = req
		const {query, pathname} = parse(url || '')
		const pQuery = querystring.parse(query || '')


		d('beginning request parse')
		const parsedRequest = new Request({statusCode, pathname, headers, method, req, query: pQuery})

		// attempt to parse incoming data
		d(`content type: ${headers['content-type']}`)
		if (!('content-type' in headers)) return Promise.resolve(parsedRequest)

		d('parsing incoming stream...')
		// handleIncomingStream returns itself - resolve after handling
		return parsedRequest.handleIncomingStream(headers['content-type'])
	}

	get = this.router.add.bind(this.router, 'GET')
	post = this.router.add.bind(this.router, 'POST')
	put = this.router.add.bind(this.router, 'PUT')
	path = this.router.add.bind(this.router, 'PATCH')
	delete = this.router.add.bind(this.router, 'DELETE')
	head = this.router.add.bind(this.router, 'HEAD')
}

export default function createServer() {
	return new Server()
}
