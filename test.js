const sv = require('./dist')


const app = sv.default()

const sr = new sv.Router('/', 'GET')

sr.get('/', (req, res) => res.send('router get'))

app.get('/', sr)
app.get('/', (req, res) => {
	res.send('oi')
})


app.get('/oi', (req, res) => res.send('hi'))

app.listen(3000, () => console.log('listening on :3000'))
