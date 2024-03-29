import http from 'http'
import {parse} from 'url'
import querystring from 'querystring'
import debug from 'debug'
import path from 'path'

import Request from './request'
import Response from './response'

const d = debug('mtws:server')


type Middleware = (req: any, res: any, next?: Middleware) => void | Promise<void>
type Void = (...args: any[]) => void

interface Route {
	method: string
	url: string
	func: Middleware
}

const notfound: Middleware = (_, res) => res.sendStatus(404)

const matches = (req: any, mw: Route): boolean => {
	d('handling match')
	if (!mw) return false
	// lolhoisting
	// eslint-disable-next-line no-use-before-define
	if (mw instanceof Router) {
		d('handling router')
		const routerUrl: string = mw.url
		const requestUrl: string = req.url
		d({routerUrl, requestUrl})
		// do not stress about random slashes - when paths are added, `path.normalize` is used
		// if router url is at the beginning of the request url
		if (requestUrl.indexOf(routerUrl) === 0) {
			d('potentially handling subrouter')
			// remove router url from request url
			// short-circuit as routes may completely match
			const repl: string = requestUrl.replace(routerUrl, '') || '/'
			d('request url after replacing router url: ', {repl, routerUrl, requestUrl})
			// if the start of the new url is a /, we are at a subroute
			if (repl[0] === '/') {
				// remove the router url for later parsing
				req.url = repl
				return true
			}
		}
		return false
		// todo: this (possibly) is very broken
	}
	const urlMatches = (req.url === mw.url)
	const methodMatches = (req.method === mw.method) || mw.method === '*'
	d(methodMatches && urlMatches)
	return methodMatches && urlMatches
}


// router can be a route as router.func should handle sub-routing
export class Router implements Route {
	routes: Route[] = []
	method: string
	url: string
	constructor(url: string, method: string) {
		this.url = path.normalize(`/${url}/`) || 'none' // ensure path follows /foo/bar etc
		this.method = method || 'none'
	}

	next(req: any, res: any, routes: any[]) {
		return () => {
			const r = new Router(this.url, this.method)
			r.routes = routes
			r.handle(req, res)
		}
	}

	handle(req: any, res: any): any {
		// shallow clone current routes
		const cloned = [...this.routes]
		let cur = cloned.shift()

		while (cur && !matches(req, cur))
			cur = cloned.shift()

		d('is router:', cur instanceof Router)

		if (!cur)
			notfound(req, res)
		else
			cur.func(req, res, this.next(req, res, cloned))
	}

	subroute = (router: Router): void => {
		this.routes.push(router)
	}

	add = (method: string, url: string, func: Middleware): void => {
		if (func instanceof Router) {
			d('subrouting...')
			func.url = path.normalize(`/${url}`)
			func.method = method
			this.subroute(func)
			return
		}
		this.routes.push({method, url, func})
	}

	// if we're calling func, we're looking for a subrouter. handle this here
	func = this.handle

	get = this.add.bind(this, 'GET')
	post = this.add.bind(this, 'POST')
	put = this.add.bind(this, 'PUT')
	patch = this.add.bind(this, 'PATCH')
	delete = this.add.bind(this, 'DELETE')
	head = this.add.bind(this, 'HEAD')
}

class Server extends Router {
	private server: http.Server

	constructor() {
		super('/', '*')
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
		this.handle(parsedReq, parsedRes)

		d('===END PARSE===')
	}

	// todo: add stack to req
	static parseRequest(req: http.IncomingMessage): Promise<Request> {
		// get what we're interested from the pure request
		const {query, pathname} = parse(req.url || '')
		const pQuery = querystring.parse(query || '')

		d('beginning request parse')
		const parsedRequest = new Request({req, pathname, pQuery})

		// attempt to parse incoming data
		const ctType: string | undefined = req.headers['content-type']
		d(`content type: ${ctType}`)

		if (typeof ctType === 'undefined') return Promise.resolve(parsedRequest)

		d('parsing incoming stream...')
		// handleIncomingStream returns itself - resolve after handling
		return parsedRequest.handleIncomingStream(ctType)
	}
}

export default function createServer() {
	return new Server()
}
