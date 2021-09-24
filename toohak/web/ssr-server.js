const express = require('express')
const next = require('next')
const sio = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare()
.then(() => {
  const server = express()
  const http = require('http').Server(server);
  const io = sio(http)

  server.get('*', (req, res) => {
    return handle(req, res)
  })

  io.on('connection', (socket) => {
    console.log('a user is connected');

    
    socket.on('add doc',  ({title, change}) => {
        io.emit('add doc web',  ({title: title, change: change}));
    })

    socket.on("add question",  ({title, change}) => {
        console.log('in add question: ' + title);
        io.emit('add question web',  ({title: title, change: change}));
    })

    socket.on('add card mobile',  ({title, change}) => {

        console.log('in add card mobile: ' + title);
        io.emit('add doc new card',  ({title: title, change: change}));

    })

    socket.on('delete doc', async ({title}) => {
        io.emit('delete doc web',  ({title: title}));
    })

    socket.on('add doc mobile', async ({title, change}) => {
        io.emit('add doc new doc',  ({title: title, change: change}));
    })
    
    socket.on('add answer mobile', async ({title, change}) => {
        io.emit('add doc new answer',  ({title: title, change: change}));
    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});


  http.listen(3000, () => {
      console.log('listening on *:3000');
      console.log('> Ready on http://localhost:3000')

  });

})
.catch((ex) => {
  console.error(ex.stack)
  process.exit(1)
})