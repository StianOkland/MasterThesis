import React from 'react'
import uuid from 'react-native-uuid';
import Automerge, { init } from 'automerge'
import Head from 'next/head'
import io from 'socket.io-client'


const docSet = new Automerge.DocSet()



docSet.registerHandler((docId, doc) => {
    console.log(`[${docId}] ${JSON.stringify(doc)}`)
})





export default class Home extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      docarray: [],
      docname:'testdoc',
      question: '',
      answer: '',
      questionNumber: 0,
      socket: null,
      address: null,
      isConnected: ''
    }
    this.handleChangeName = this.handleChangeName.bind(this)
    this.handleQuestionTitle = this.handleQuestionTitle.bind(this)
    this.handleQuestionAnswer = this.handleQuestionAnswer.bind(this)
    this.handleQuestionNumber = this.handleQuestionNumber.bind(this)
    this.addDoc = this.addDoc.bind(this)
    this.deleteDoc = this.deleteDoc.bind(this)
    this.addQ = this.addQ.bind(this)
    this.addA = this.addA.bind(this)
  }


  componentDidMount() {
    this.socket = io("http://localhost:3000")

    this.socket.on('data', ({data, name}) => {
        let doc = docSet.getDoc(name)
        doc = Automerge.change(doc, doc => {
          doc.chards = ['hei']
        })
        docSet.setDoc(name, doc)
    })
      
    this.socket.on('add doc web', async ({title, change}) => {
        const initDoc = Automerge.change(Automerge.init(), doc => {doc.title = title, doc.cards = []})
        let changes = JSON.parse(change)

        const doc = Automerge.applyChanges(initDoc, changes)
        docSet.setDoc(title, doc)
        this.state.docarray = Array.from(docSet.docs)
    })

    this.socket.on('close', () => {
        console.log(`[${HOST}:${PORT}] connection closed`)
    })

    this.socket.on('error', (err) => {
        console.log(`[${socket.remoteAddress}:${socket.remotePort}] error: ${err}`)
    })

    this.socket.on('add card web', async ({name, change}) => {
        const doc = docSet.getDoc(name)
        let changes = JSON.parse(change)
        doc2 = Automerge.applyChanges(doc, changes)
        docSet.setDoc(name, doc2)
    })

    this.socket.on('add doc new doc',  async ({title, change}) => {
      const initDoc = Automerge.change(Automerge.init(), doc => {doc.title = title, doc.cards = []})
      const changes = JSON.parse(change)


      const doc = Automerge.applyChanges(initDoc, changes)
      docSet.setDoc(title, doc)
      this.setState({docarray : Array.from(docSet.docs)})
    })

    this.socket.on('add doc new card', async ({title, change}) => {
      const doc = docSet.getDoc(title)
      if (doc) {
          const changes = JSON.parse(change)
          const doc2 = Automerge.applyChanges(doc, changes)
          docSet.setDoc(title, doc2)
          this.setState({docarray : Array.from(docSet.docs)})
      }
    })

    this.socket.on('add doc new answer', async ({title, change}) => {
      const doc = docSet.getDoc(title)
      if (doc) {
          const changes = JSON.parse(change)
          const doc2 = Automerge.applyChanges(doc, changes)
          docSet.setDoc(title, doc2)
          this.setState({docarray : Array.from(docSet.docs)})
      }
    })
  }


  handleChangeName(e) {
    this.setState({docname: e.target.value})
  }
  handleQuestionTitle(e) {
    this.setState({question: e.target.value})
  }
  handleQuestionAnswer(e) {
    this.setState({answer: e.target.value})
  }
  handleQuestionNumber(e) {
    this.setState({questionNumber: e.target.value})
  }
  
  
  addDoc() {
    const initDoc = Automerge.change(Automerge.init(), doc => {doc.title = this.state.docname, doc.cards = []})
    docSet.setDoc(this.state.docname, initDoc)
    this.setState({docarray : Array.from(docSet.docs)})
    
    const changes = Automerge.getAllChanges(initDoc)
    
    this.socket.emit("add doc", ({title: this.state.docname, change: JSON.stringify(changes)}))
    
  }

  deleteDoc() {
    let doc = docSet.getDoc(this.state.docname)
    if (doc) {
        docSet.removeDoc(this.state.docname)
        this.setState({docarray : Array.from(docSet.docs)})
        this.socket.emit("delete doc", ({title: this.state.docname}))
    }
  }

  addQ() {
    let id = uuid.v4()
    let doc1 = docSet.getDoc(this.state.docname)
    if (doc1) {
      const doc2 = Automerge.change(doc1, doc => {
        doc.cards.push({id: id, Question: this.state.question, Answers: []})
      })
      docSet.setDoc(this.state.docname, doc2)
      this.setState({docarray : Array.from(docSet.docs)})
      const changes = Automerge.getAllChanges(doc2)

      this.socket.emit("add question", ({title: this.state.docname, change: JSON.stringify(changes)}))
      
    }
  }

  addA() {
    let id = uuid.v4()
    let doc1 = docSet.getDoc(this.state.docname)
    if (doc1) {
      let doc2 = Automerge.change(doc1, doc => {
        doc.cards[this.state.questionNumber]['Answers'].push({id: id, a: this.state.answer})
      })
      docSet.setDoc(this.state.docname, doc2)
      this.setState({docarray : Array.from(docSet.docs)})
      const changes = Automerge.getAllChanges(doc2)

      this.socket.emit("add question", ({title: this.state.docname, change: JSON.stringify(changes)}))
      
    }
  }

  render() {
    return (
      <div>
        <Head>
          <title>Toohak</title>
        </Head>
        <h1>Toohak!</h1>
        
        <label>
          Add a document: -Title of document 
        </label>
        <br/>

        <input type='text' onChange={this.handleChangeName}/>
        <input 
          type='button'
          onClick={this.addDoc}
          value='Add a new document'
        />
        <br/>
        <label>
          Delete document: - Title of document 
        </label>
        <br/>

        <input type='text' onChange={this.handleChangeName}/>
        <input 
          type='button'
          onClick={this.deleteDoc}
          value='Delete a document'
        />
        <br/>
        <label>
          Add a question: -Title of document, The question
        </label>

        <br/>
        <input type='text' onChange={this.handleChangeName}/>
        <input type='text' onChange={this.handleQuestionTitle}/>
        
        <input 
          type='button'
          onClick={this.addQ}
          value='Add a question'
        />
        <br/>
        <label>
          Add an answer: -Title of document, Number of the question, The answer
        </label>
        <br/>
        <input type='text' onChange={this.handleChangeName}/>
        <input type='number' onChange={this.handleQuestionNumber}/>
        <input type='text' onChange={this.handleQuestionAnswer}/>


        
        <input 
          type='button'
          onClick={this.addA}
          value='Add an answer'
        />
     
        <div style={{fontSize: 15}}>
          <pre>Documents: {JSON.stringify(this.state.docarray, null, 2)}</pre>

        </div>
      </div>

    ) 
  }
}
