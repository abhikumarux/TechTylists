import React from 'react';
import { View, Text, Button } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to the Image Upload App</Text>
      <Button
        title="Go to Upload Page"
        onPress={() => navigation.navigate('Upload')}
      />
    </View>
  );
};

export default HomeScreen;
