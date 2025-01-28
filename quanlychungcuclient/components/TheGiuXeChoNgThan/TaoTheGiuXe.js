import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import APIs, { endpoints } from '../../configs/APIs';

const TaoTheGiuXe = ({ navigation }) => {
  const [soXe, setSoXe] = useState('');
  const [tenNguoiThan, setTenNguoiThan] = useState('');
  const [loading, setLoading] = useState(false);

  const createParkingCard = async () => {
    if (!soXe || !tenNguoiThan) {
      Alert.alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    
    try {
      const token = await AsyncStorage.getItem('LOGIN_TOKEN');
      
      const formData = new FormData();
      formData.append('so_xe', soXe);
      formData.append('ten_nguoi_than', tenNguoiThan);

      const response = await APIs.post(`${endpoints.thegiuxes}/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        Alert.alert('Tạo thẻ giữ xe thành công');
        navigation.goBack(); // Go back to the previous screen (ParkingCardForR)
      } else {
        Alert.alert('Có lỗi xảy ra', 'Không thể tạo thẻ giữ xe');
      }
    } catch (error) {
      console.error('Error creating parking card:', error);
      Alert.alert('Có lỗi xảy ra', 'Vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Vehicle Number Input */}
      <TextInput
        label="Số xe"
        value={soXe}
        onChangeText={setSoXe}
        style={styles.input}
      />

      {/* Owner's Name Input */}
      <TextInput
        label="Tên người thân"
        value={tenNguoiThan}
        onChangeText={setTenNguoiThan}
        style={styles.input}
      />

      {/* Submit Button */}
      <Button
        mode="contained"
        loading={loading}
        onPress={createParkingCard}
        style={styles.button}
      >
        Tạo
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    backgroundColor : '#a1e1ff',
    width: '100%',
    marginBottom: 15,
  },
  button: {
    backgroundColor : '#008cbf',
    width: '100%',
  },
});

export default TaoTheGiuXe;
