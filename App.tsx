import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  SafeAreaView,
} from 'react-native';
import {API, graphqlOperation} from 'aws-amplify';
import {GraphQLResult} from '@aws-amplify/api';
import {createTodo} from './src/graphql/mutations';
import {listTodos} from './src/graphql/queries';
import {
  withAuthenticator,
  useAuthenticator,
} from '@aws-amplify/ui-react-native';

const initialState = {name: '', description: ''};

const App = () => {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState<any[]>([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  function setInput(key: string, value: string) {
    setFormState({...formState, [key]: value});
  }

  async function fetchTodos() {
    try {
      const todoData = (await API.graphql(
        graphqlOperation(listTodos)
      )) as GraphQLResult<any>;
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log('error fetching todos');
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) {
        return;
      }
      const todo = {...formState};
      setTodos([...todos, todo]);
      setFormState(initialState);
      await API.graphql(graphqlOperation(createTodo, {input: todo}));
    } catch (err) {
      console.log('error creating todo:', err);
    }
  }

  const {user, signOut} = useAuthenticator(context => [context.user]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Pressable onPress={signOut} style={styles.buttonContainer}>
          <Text style={styles.buttonText}>
            Hello, {user?.username}! Click here to sign out!
          </Text>
        </Pressable>
        <TextInput
          onChangeText={value => setInput('name', value)}
          style={styles.input}
          value={formState.name}
          placeholder="Name"
        />
        <TextInput
          onChangeText={value => setInput('description', value)}
          style={styles.input}
          value={formState.description}
          placeholder="Description"
        />
        <Pressable onPress={addTodo} style={styles.buttonContainer}>
          <Text style={styles.buttonText}>Create todo</Text>
        </Pressable>
        {todos.map((todo, index) => (
          <View key={todo.id ? todo.id : index} style={styles.todo}>
            <Text style={styles.todoName}>{todo.name}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default withAuthenticator(App);

const styles = StyleSheet.create({
  container: {width: 400, flex: 1, padding: 20, alignSelf: 'center'},
  todo: {marginBottom: 15},
  input: {
    backgroundColor: '#ddd',
    marginBottom: 10,
    padding: 8,
    fontSize: 18,
  },
  todoName: {fontSize: 20, fontWeight: 'bold'},
  buttonContainer: {
    alignSelf: 'center',
    backgroundColor: 'black',
    paddingHorizontal: 8,
  },
  buttonText: {color: 'white', padding: 16, fontSize: 18},
});
