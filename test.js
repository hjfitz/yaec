const sv = require('./dist')


const app = sv.default()

app.get('/', (req, res) => {
	res.send('oi')
})

app.listen(3000, () => console.log('listening on :3000'))
