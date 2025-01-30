import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import APIs, { endpoints } from '../../configs/APIs';

const DangKyTuDo = ({ navigation }) => {
  const [tenDo, setTenDo] = useState('');
  const [moTa, setMoTa] = useState('');
  const [ngayNhanHang, setNgayNhanHang] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Xử lý khi chọn ngày (Không cho chọn quá khứ)
  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate && selectedDate >= new Date()) {
      setNgayNhanHang(selectedDate);
    } else {
      Alert.alert('Lỗi', 'Không thể chọn ngày trong quá khứ!');
    }
  };

  // Xử lý đăng ký
  const handleSubmit = async () => {
    if (!tenDo || !moTa || !ngayNhanHang) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('LOGIN_TOKEN');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        ten_do: tenDo,
        mo_ta: moTa,
        ngay_nhan_hang: ngayNhanHang.toISOString().split('T')[0], // Format YYYY-MM-DD
      };

      await APIs.post(`${endpoints.tudodientus}/`, payload, config);
      Alert.alert('Thành công', 'Đăng ký tủ đồ điện tử thành công!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Lỗi khi đăng ký:', error);
      Alert.alert('Lỗi', 'Đăng ký thất bại. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tên đồ</Text>
      <TextInput style={styles.input} value={tenDo} onChangeText={setTenDo} placeholder="Nhập tên đồ" />

      <Text style={styles.label}>Mô tả</Text>
      <TextInput style={styles.input} value={moTa} onChangeText={setMoTa} placeholder="Nhập mô tả" multiline />

      <Text style={styles.label}>Ngày nhận hàng</Text>
      <Button title="Chọn ngày" onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          value={ngayNhanHang}
          mode="date"
          display="default"
          minimumDate={new Date()} // Chặn ngày quá khứ
          onChange={onChangeDate}
        />
      )}
      <Text style={styles.dateText}>Ngày đã chọn: {ngayNhanHang.toISOString().split('T')[0]}</Text>

      <Button title="Đăng ký" onPress={handleSubmit} disabled={loading || !tenDo || !moTa} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginTop: 5 },
  dateText: { marginTop: 10, fontSize: 16, color: '#333' },
});

export default DangKyTuDo;
