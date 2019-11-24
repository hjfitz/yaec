const {expect} = require('chai')
const fetch = require('node-fetch')

const sv = require('../dist')


const app = sv.default()

const sr0 = new sv.Router('/', 'GET')
const sr1 = new sv.Router('/', 'GET')
const nr0 = new sv.Router('/', 'GET')
const nr1 = new sv.Router('/', 'GET')

app.get('/level-1', sr0)
sr0.get('/level-2', sr1)
sr0.get('/', (req, res) => res.send('ack'))
sr1.get('/', (req, res) => res.send('ack'))
app.get('/get', (req, res) => res.send('ack'))
app.put('/put', (req, res) => res.send('ack'))
app.post('/post', (req, res) => res.send('ack'))
app.patch('/patch', (req, res) => res.send('ack'))
app.delete('/delete', (req, res) => res.send('ack'))
app.post('/json', (req, res) => res.json(req.payload))

app.get('/sn', (req, res, next) => next())
app.get('/sn', (req, res) => res.send('ack'))

app.get('/sn2', (req, res, next) => next())
app.get('/sn2', (req, res, next) => next())
app.get('/sn2', (req, res) => res.send('ack'))

app.get('/rn', (_, __, next) => next())
app.get('/rn', (_, __, next) => next())
app.get('/rn', nr0)
nr0.get('/', (_, res) => res.send('ack'))

app.get('/rn2', (_, __, next) => next())
app.get('/rn2', (_, __, next) => next())
app.get('/rn2', nr1)
nr1.get('/', (_, __, next) => next())
nr1.get('/', (_, res) => res.send('ack'))

// app.get('/oi', (req, res) => res.send('hi'))

app.listen(3000, () => console.log('listening on :3000'))

describe('server functions', () => {
	describe('normal behaviour', () => {
		it('should respond handle GET', (done) => {
			fetch('http://localhost:3000/get').then((r) => r.text()).then((r) => {
				expect(r).to.equal('ack')
				done()
			})
		})

		it('should respond handle PUT', (done) => {
			fetch('http://localhost:3000/put', {method: 'PUT'}).then((r) => r.text()).then((r) => {
				expect(r).to.equal('ack')
				done()
			})
		})

		it('should respond handle POST', (done) => {
			fetch('http://localhost:3000/post', {method: 'POST'}).then((r) => r.text()).then((r) => {
				expect(r).to.equal('ack')
				done()
			})
		})

		it('should respond handle PATCH', (done) => {
			fetch('http://localhost:3000/patch', {method: 'PATCH'}).then((r) => r.text()).then((r) => {
				expect(r).to.equal('ack')
				done()
			})
		})

		it('should respond handle DELETE', (done) => {
			fetch('http://localhost:3000/delete', {method: 'DELETE'}).then((r) => r.text()).then((r) => {
				expect(r).to.equal('ack')
				done()
			})
		})

		it('should parse json', (done) => {
			const body = JSON.stringify({
				data: 'some-data',
			})
			fetch('http://localhost:3000/json', {
				body,
				method: 'POST',
				headers: {
					'content-type': 'application/json', //  todo: implement better content-type parser
				},
			}).then((r) => r.json()).then((r) => {
				expect(JSON.stringify(r)).to.equal(body)
				done()
			})
		})
	})

	describe('sub-routing', () => {
		it('should sub-route one layer', (done) => {
			fetch('http://localhost:3000/level-1').then((r) => r.text()).then((r) => {
				expect(r).to.equal('ack')
				done()
			})
		})

		it('should sub-route another layer', (done) => {
			fetch('http://localhost:3000/level-1/level-2').then((r) => r.text()).then((r) => {
				expect(r).to.equal('ack')
				done()
			})
		})
	})

	describe('next()', () => {
		it('should handle a simple next', (done) => {
			fetch('http://localhost:3000/sn').then((r) => r.text()).then((r) => {
				expect(r).to.equal('ack')
				done()
			})
		})

		it('should handle multiple next()s', (done) => {
			fetch('http://localhost:3000/sn2').then((r) => r.text()).then((r) => {
				expect(r).to.equal('ack')
				done()
			})
		})

		it('should handle nexts, followed by a router', (done) => {
			fetch('http://localhost:3000/rn').then((r) => r.text()).then((r) => {
				expect(r).to.equal('ack')
				done()
			})
		})

		it('should handle some nexts, a router, some nexts', (done) => {
			fetch('http://localhost:3000/rn2').then((r) => r.text()).then((r) => {
				expect(r).to.equal('ack')
				done()
			})
		})
	})
})
