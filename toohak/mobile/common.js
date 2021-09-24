import Automerge, { Connection } from 'automerge'
import io from 'socket.io-client'
export const docSet = new Automerge.DocSet()

// // docSet.registerHandler((docId, doc) => {
// //   console.log(`[${docId}] ${JSON.stringify(doc)}`);
// // })
// export const socket = io("http://129.242.19.137:3000")


// // export let socket = ''
// // export const conn = (address) => {
// //     socket = io("http://" + address + ":3000")
// // }

export let socket = null;
export let docarray = [];
export let count = 0;

export default function getConnected( callback ) {
    socket = io("http://129.242.19.137:3000")

    socket.on('data', ({data, name}) => {
        let doc = docSet.getDoc(name)
        doc = Automerge.change(doc, doc => {
          doc.chards = ['hei']
        })
        docSet.setDoc(name, doc)
    })
      
    socket.on('add doc web', async ({title, change}) => {
        const initDoc = Automerge.change(Automerge.init(), doc => {doc.title = title, doc.cards = []})
        const changes = JSON.parse(change)

        const doc = Automerge.applyChanges(initDoc, changes)
        docSet.setDoc(title, doc)
        docarray = Array.from(docSet.docs)
    })

    socket.on('delete doc web', async ({title}) => {
        const doc = docSet.getDoc(title)
        if ( doc ) {
        
            docSet.removeDoc(title)
            docarray = Array.from(docSet.docs)
        }
    })
    
    socket.on('add question web', async ({title, change}) => {
        console.log(title);
        const doc = docSet.getDoc(title)
        if ( doc ) {
            const changes = JSON.parse(change)

            const doc1 = Automerge.applyChanges(doc, changes)
            docSet.setDoc(title, doc1)
            docarray = Array.from(docSet.docs)
        }

    })


    socket.on('close', () => {
        console.log(`[${HOST}:${PORT}] connection closed`)
    })
    
    socket.on('error', (err) => {
        console.log(`[${socket.remoteAddress}:${socket.remotePort}] error: ${err}`)
    })
}


