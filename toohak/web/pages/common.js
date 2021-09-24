import Automerge, { Connection } from 'automerge'
import io from 'socket.io-client'
export const docSet = new Automerge.DocSet()

export let socket = null;
export let docarray = [];

export default function getConnected( callback ) {
    socket = io("http://localhost:3000")

    socket.on('data', ({data, name}) => {
        let doc = docSet.getDoc(name)
        doc = Automerge.change(doc, doc => {
          doc.chards = ['hei']
        })
        docSet.setDoc(name, doc)
    })
      
    socket.on('add doc web', async ({title, change}) => {
        const initDoc = Automerge.change(Automerge.init(), doc => {doc.title = title, doc.cards = []})
        let changes = JSON.parse(change)

        const doc = Automerge.applyChanges(initDoc, changes)
        docSet.setDoc(title, doc)
        docarray = Array.from(docSet.docs)
    })

    socket.on('close', () => {
        console.log(`[${HOST}:${PORT}] connection closed`)
    })

    socket.on('error', (err) => {
        console.log(`[${socket.remoteAddress}:${socket.remotePort}] error: ${err}`)
    })

    socket.on('add card web', async ({name, change}) => {
        const doc = docSet.getDoc(name)
        let changes = JSON.parse(change)
        doc2 = Automerge.applyChanges(doc, changes)
        docSet.setDoc(name, doc2)
    })

    socket.on('add doc new doc',  ({name, change}) => {
        const initDoc = Automerge.change(Automerge.init(), doc => {doc.title = title, doc.cards = []})

        let changes = JSON.parse(change)
        const doc = Automerge.applyChanges(initDoc, changes)
        docSet.setDoc(doc.title, doc)
        docarray = Array.from(docSet.docs)
    })

    socket.on('add doc new card', async ({name, change}) => {
      const doc = docSet.getDoc(name)
      if (doc) {
          let changes = JSON.parse(change)
          const doc2 = Automerge.applyChanges(doc, changes)
          docSet.setDoc(doc2.title, doc2)
          docarray = Array.from(docSet.docs)
      }
    })
}
