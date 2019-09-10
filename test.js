const sv = require('./dist')


const app = sv.default()

const sr = new sv.Router('/', 'GET')

sr.get('/oioi', (req, res, next) => {
	console.log('next pass 1')
	next()
})
sr.get('/oioi', (req, res, next) => {
	console.log('next pass 2')
	next()
})

sr.get('/oioi', (req, res) => res.send('router get'))

// app.subroute(sr)
app.get('/foo', sr)
app.get('/', (req, res) => {
	res.send('oi')
})


// app.get('/oi', (req, res) => res.send('hi'))

app.listen(3000, () => console.log('listening on :3000'))
