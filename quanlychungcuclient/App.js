import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Login from './components/Login/Login';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Profile from './components/Home/Profile';
import Home from './components/Home/Home';
import Profile_Change from './components/Home/Profile_Change';
import ChuyenTienInfo from './components/Home/ChuyenTienInfo';
import ParkingCardForR from './components/TheGiuXeChoNgThan/ParkingCardForR';
import TaoTheGiuXe from './components/TheGiuXeChoNgThan/TaoTheGiuXe';

const Stack = createStackNavigator();


export default function App() {
  return (
    <NavigationContainer>
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Profile_Change" component={Profile_Change} />
      <Stack.Screen name="ChuyenTienInfo" component={ChuyenTienInfo} />
      <Stack.Screen name="ParkingCardForR" component={ParkingCardForR} />
      <Stack.Screen name="TaoTheGiuXe" component={TaoTheGiuXe} />
    </Stack.Navigator>
  </NavigationContainer>

  );
}


