const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()
const path = require('path');
const express = require('express');


server.use(express.static(path.join(__dirname, 'public')));
server.use('/assets', express.static(path.join(__dirname, 'assets')));



server.use(middlewares);
server.use(jsonServer.bodyParser);

// Custom route to mock logic
server.post('/api/connect', (req, res) => {
    const { code } = req.body;
    const sessions = router.db.get('sessions').value();
    const session = sessions.find(s => s.code === code);

    if (session) {
        res.json({ sessionId: session.sessionId });
    } else {
        res.status(404).json({ message: 'Code not found' });
    }
});

server.use(router);
server.listen(3000, () => {
    console.log('JSON Server with custom logic running on http://localhost:3000');
});
