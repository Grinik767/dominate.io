const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()
const path = require('path');
const express = require('express');


server.use(express.static(path.join(__dirname, 'public')));


server.use(middlewares);
server.use(jsonServer.bodyParser);

server.post('/api/lobby/connect', (req, res) => {
    const { code } = req.body;
    const lobbies = router.db.get('lobbies').value();
    const session = lobbies.find(s => s.code === code);

    if (session) {
        res.json({ sessionId: session.sessionId });
    } else {
        res.status(404).json({ message: 'Лобби не найдено' });
    }
});


server.get('/api/lobby', (req, res) => {
    const { code } = req.query;
    const lobbyInfo = router.db.get('lobbyInfo').value()
    res.json(lobbyInfo);
});

server.post('/api/lobby/create', (req, res) => {
    res.json('4F1X');
});

server.use(router);
server.listen(3000, () => {
    console.log('JSON Server with custom logic running on http://localhost:3000');
});


// const express = require('express');
// const path = require('path');
// const app = express();
// const PORT = 3000;
//
// // Раздаём статические файлы из папки public
// app.use(express.static(path.join(__dirname, 'public')));
//
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });
//
// app.get('/about', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'about.html'));
// });
//
// app.get('/contact', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'contact.html'));
// });
//
// app.listen(PORT, () => {
//     console.log(`Сервер запущен на http://localhost:${PORT}`);
// });
