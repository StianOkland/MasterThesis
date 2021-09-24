import React, { Component, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Card, CardItem, Left,Right, Body, Icon } from 'native-base';
import Automerge, { change } from 'automerge';
import Dialog from "react-native-dialog";
import uuid from 'react-native-uuid';
import { docSet, socket, docarray } from './common'

export default class DocList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      cards: [],
      title: '',
      visible: false,
      visible_answer: false,
      answer: '',
      refreshing: false,
    }
    
  }
  
  componentDidMount() { 
    this.setState({name: this.props.route.params.paramKey})
   
  }
  
  showDialog() {
    this.setState({visible: true})
  }
 
  handleCancel() {
    this.setState({visible: false})
  }

  addAnswer(item) {
    let doc1 = docSet.getDoc(this.state.name)
    let num = 0
    if( doc1 ) {
      for(let i = 0; i < doc1.cards.length; i++) {
        if( doc1.cards[i]['id'] == item['id'] ) {
          num = i
          break
        }
      }
      let id = uuid.v4()
      let doc2 = Automerge.change(doc1, doc => {
        doc.cards[num]['Answers'].push({id: id, a: this.state.answer})
      })
      const changes = Automerge.getAllChanges(doc2)
      docSet.setDoc(this.state.name, doc2)
      // this.state.cards = Array.from(doc2.cards)
      if( socket != null ) {
        socket.emit("add answer mobile", ({title: this.state.name, change: JSON.stringify(changes)}))
      } 
    }
  }


  
  addCardToList() {
    let id = uuid.v4()
    let doc1 = docSet.getDoc(this.state.name)
    console.log(this.state.name);
    if (doc1) {
      const doc2 = Automerge.change(doc1, doc => {
        doc.cards.push({id: id, Question: this.state.title, Answers: []})
      })
      docSet.setDoc(this.state.name, doc2)
      this.setState({docarray: Array.from(docSet.docs)})
      this.setState({visible: false})

      const changes = Automerge.getAllChanges(doc2)

      if( socket != null ) {
        socket.emit("add card mobile", ({title: this.state.name, change: JSON.stringify(changes)}))
      }
    }
  }

  handleRefresh = () => {
    this.setState({refreshing: true}, () => {
      const doc = docSet.getDoc(this.state.name)
      this.setState({cards: doc.cards})
      this.setState({refreshing: false})
    })
  }

  renderItem = ({ item }) => {
    let answers = []
    for(let i = 0; i < item.Answers.length; i++) {
      answers.push(item.Answers[i].a + '\n')
    }
    return (
      <Card>
      <CardItem>
        <Left style={{flex:0.8}}>
          <Icon name="question" />
          <Body>
            <Text style={{fontWeight:'bold',fontSize:20}}>{item.Question}</Text>
            <Text style={{fontSize:14}}>{item.id}</Text>
          </Body>
        </Left>

      </CardItem>
      <CardItem content>
        <Text>{answers}</Text>
      </CardItem>

      <CardItem content>
        <View style={styles.container}>
          <TextInput
            style={{ height: 40, borderColor: 'gray', borderWidth: 1, textAlign: 'center' }}
            onChangeText={text => this.setState({answer: text})}
          />
          <Button title="Add answer" onPress={() => this.addAnswer(item)} />
          {/* <Dialog.Container visible={this.state.visible_answer}>
            <Dialog.Title>Add a new answer</Dialog.Title>      
            <Dialog.Input
              placeholder='The answer'
              onChangeText={(ans) => this.setState({answer: ans})}
              defaultValue={this.state.answer} 
            />
            <Dialog.Button label="Cancel" onPress={() => this.answerCancel()} />
            <Dialog.Button label="Add" onPress={addAns}/>
          </Dialog.Container> */}
          
        </View>
      </CardItem>

    </Card>
    )
  }




  render() {
    return (
      <View style={styles.container}>
        <View style={{flex: 1}}>
           <Text style={{fontSize: 30}}>Toohak!</Text>
           <View style={{marginVertical: 8, borderBottomColor: '#737373', borderBottomWidth: StyleSheet.hairlineWidth}} />
        </View>

        <View style={{flex:10}}>
          <FlatList
            data={this.state.cards}
            renderItem={this.renderItem}
            keyExtractor={item => item['id']}
            extraData={this.state}
            refreshing={this.state.refreshing}
            onRefresh={this.handleRefresh}
          />
        </View>


        <View >
          <Button title="Add Card" onPress={ () => this.showDialog()} />
          <Dialog.Container visible={this.state.visible}>
            <Dialog.Title>Add a new card/question</Dialog.Title>

            <Dialog.Input
              placeholder='Add title'
              onChangeText={(title) => this.setState({title: title})}
              defaultValue={this.state.title} 
            />
 
            <Dialog.Button label="Cancel" onPress={() => this.handleCancel()} />
            <Dialog.Button label="Add" onPress={() => this.addCardToList()} />
          </Dialog.Container>
          </View>
      </View>
    );
    
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: '10%',
  },
  item: {
    padding: 20,
    marginVertical: 8,
    backgroundColor: "#f9c2ff"

  },
  title: {
    textAlign: 'center',
    marginVertical: 8,
  },
});


