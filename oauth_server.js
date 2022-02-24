import express from 'express';
const app = express()
const port = 8080

app.all('*', (req, res) => {
	console.log(req.method, req.query, req.headers);
	res.json(
	{
		code: req.query.code,
		state: req.query.state,
	})
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})
