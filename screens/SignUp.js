import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { app } from './FireBaseConfig'; 
import { getFirestore } from 'firebase/firestore';
import { doc, setDoc, runTransaction } from 'firebase/firestore'; 
import axios from 'axios';

const db = getFirestore(app);
const API_URL = 'http://18.227.89.214:5000'; 

const SignUp = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignUp = async () => {
    try {
      const auth = getAuth();
      console.log('Creating user with email:', email);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const counterRef = doc(db, 'counters', 'awsPhotoKey');

      const newValue = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
  
        if (!counterDoc.exists()) {
          transaction.set(counterRef, { lastValue: 0 });
        }
  
        const lastValue = counterDoc.data()?.lastValue || 0;
        const newValue = lastValue + 1;
  
        transaction.update(counterRef, { lastValue: newValue });
  
        return newValue;
      });
  

      console.log('Adding user data to Firestore...');
      await setDoc(doc(db, 'users', user.email), {
        email: user.email,
        awsPhotoKey: newValue,
      });

      try {
        const response = await axios.post(`${API_URL}/register`, { username: String(newValue) });
        console.log('User created:', response.data);
        alert('User created successfully');
      } catch (error) {
        console.error('Error creating user:', error.response?.data || error.message);
        alert('Failed to create user');
      }



      console.log('User data added to Firestore');
    } catch (error) {
      console.error('Error during sign-up:', error);
      setErrorMessage(error.message);
    }
  };
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
      />
      <Button title="Sign Up" onPress={handleSignUp} />
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
        Already have an account? Login
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
  link: {
    color: 'blue',
    marginTop: 15,
    textAlign: 'center',
  },
});

export default SignUp;