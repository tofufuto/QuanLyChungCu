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
import PhieuDongTien from './components/PhieuDongTien/PhieuDongTien';
import ChiTietPhieuDongTien from './components/PhieuDongTien/ChiTietPhieuDongTien';
import TuDoDienTu from './components/TuDoDienTu/TuDoDienTu';
import DangKyTuDo from './components/TuDoDienTu/DangKyTuDo';
import KhaoSat from './components/KhaoSat/KhaoSat';
import ChiTietKhaoSat from './components/KhaoSat/ChiTietKhaoSat';
import PhanAnh from './components/PhanAnh/PhanAnh';
import ChiTietPhanAnh from './components/PhanAnh/ChiTietPhanAnh';
import TaoPhanAnh from './components/PhanAnh/TaoPhanAnh';
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
      <Stack.Screen name="PhieuDongTien" component={PhieuDongTien} />
      <Stack.Screen name="ChiTietPhieuDongTien" component={ChiTietPhieuDongTien} />
      <Stack.Screen name="TuDoDienTu" component={TuDoDienTu} />
      <Stack.Screen name="DangKyTuDo" component={DangKyTuDo} />
      <Stack.Screen name="KhaoSat" component={KhaoSat} />
      <Stack.Screen name="ChiTietKhaoSat" component={ChiTietKhaoSat} />
      <Stack.Screen name="PhanAnh" component={PhanAnh} />
      <Stack.Screen name="ChiTietPhanAnh" component={ChiTietPhanAnh} />
      <Stack.Screen name="TaoPhanAnh" component={TaoPhanAnh} />
    </Stack.Navigator>
  </NavigationContainer>

  );
}


