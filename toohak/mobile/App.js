import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity, RefreshControl} from 'react-native';
import io from 'socket.io-client'
import Automerge from 'automerge';
import Dialog from "react-native-dialog";
import DocList from './viewDoc'
import conn ,{ docSet, socket, docarray } from './common'

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';



export class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      message: '',
      docname: '',
      docarray: docarray,
      visible: false,
      visible_connect: false,
      address: null,
      socket: null,
      isConnected: '',
      refreshing: false
    }
  }

  
  addDoc() {
    const initDoc = Automerge.change(Automerge.init(), doc => {doc.title = this.state.docname, doc.cards = []})
    docSet.setDoc(this.state.docname, initDoc)
    
    this.setState({docarray : Array.from(docSet.docs)})
    this.setState({visible: false})
    
    const changes = Automerge.getAllChanges(initDoc)

    if( socket != null ) {
      socket.emit("add doc mobile", ({title: this.state.docname, change: JSON.stringify(changes)}))
    }
  }


  conn() {
    const tmp = io("http://" + this.state.address + ":3000")
    this.setState({socket: tmp})
}
  
  showDialog() {
    this.setState({visible: true})
  }
  
  handleCancel() {
    this.setState({visible: false})
  }

  showConnect() {
    this.setState({visible_connect: true})
  }

  connectCancel() {
    this.setState({visible_connect: false})
  }
  
  renderItem = ({ item })  => {
    return (
      <TouchableOpacity style={styles.item} onPress={() => this.props.navigation.navigate('Doclist', {paramKey: item[0]})}>
        <Text style={styles.title}>{item[0]}</Text>
      </TouchableOpacity>
    )
  }
  

  connect = () => {
    conn(( respons ) => {
      this.setState({ isConnected: respons})
    })
  }
  

  handleRefresh = () => {
    this.setState({refreshing: true}, () => {
      this.setState({docarray : Array.from(docSet.docs)})

      // this.setState({docarray: docarray})
      this.setState({refreshing: false})
    })
  }

  render() {
    return (
      <View style={styles.container} >
        <View style={{flex: 1, flexDirection:'row'}}>
            <Text style={{fontSize: 30}}>Toohak!</Text>
            
            <View  style={{paddingLeft: '40%'}}>
              <Button title="Connect" onPress={ () => this.connect()} />
            </View>
        </View>
        <View style={{marginVertical: 8, borderBottomColor: '#737373', borderBottomWidth: StyleSheet.hairlineWidth}} />

        <View style={{flex:10}}>
          <FlatList
            data={this.state.docarray}
            renderItem={this.renderItem}
            keyExtractor={item => item[0]}
            extraData={this.props.navigation}
            refreshing={this.state.refreshing}
            onRefresh={this.handleRefresh}
          />
        </View>

        <View style={{marginVertical: 8, borderBottomColor: '#737373', borderBottomWidth: StyleSheet.hairlineWidth}} />
        <View >

          <Button title="Add Document" onPress={ () => this.showDialog()} />
          <Dialog.Container visible={this.state.visible}>
            <Dialog.Title>Add a new document</Dialog.Title>

            <Dialog.Input
              placeholder='Add title'
              onChangeText={(name) => this.setState({docname: name})}
              defaultValue={this.state.docname} 
            />
 
            <Dialog.Button label="Cancel" onPress={() => this.handleCancel()} />
            <Dialog.Button label="Add" onPress={() => this.addDoc()} />
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
  text:
  {
    color: 'black',
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center'
  },

  btn:
  {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    marginTop: 20
  },
 
  btnText:
  {
    color: 'white',
    fontSize: 20,
    textAlign: 'center'
  }
});


const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Toohak!">
        <Stack.Screen name="Toohak!" component={Home} options={{ headerShown: false }}/>
        <Stack.Screen name="Doclist" component={DocList} options={{ headerShown: false }} />
        {/* <Stack.Screen name="AddDoc" component={AddDoc} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
