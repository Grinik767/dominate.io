const jsonServer = require('json-server')
const server = jsonServer.create()
const path = require('path');
const express = require('express');


server.use(express.static(path.join(__dirname, 'public')));

server.listen(3000, () => {
    console.log('JSON Server with custom logic running on http://localhost:3000');
});

