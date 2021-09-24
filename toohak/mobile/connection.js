const Automerge = require('automerge')

class Connection {
  constructor (docSet, socket) {
    this.automerge = new Automerge.Connection(docSet, msg => this.sendMsg(msg))
    this.socket = socket
    this.automerge.open()
  }

  receiveData (data) {
    this.automerge.receiveMsg(data)
  }

  sendMsg (msg) {
    if (!this.socket) return
    console.log('Sending:', msg)
    const data = (JSON.stringify(msg), 'utf8')
    this.socket.write(data)
  }

  close () {
    if (!this.socket) return
    this.socket.end()
    this.socket = null
  }
}

module.exports = Connection