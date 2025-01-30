import React, { useState } from 'react';
import { View, TextInput, Button, Text, Image, ScrollView, Alert } from 'react-native';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import APIs, { endpoints } from '../../configs/APIs';

const TaoPhanAnh = ({navigation}) => {
  const [tieuDe, setTieuDe] = useState('');
  const [noiDung, setNoiDung] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Hàm mở thư viện ảnh
  const pickImage = async () => {
    let result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
      base64: false,
    });

    if (!result.canceled) {
      if (images.length < 6) {
        setImages((prevImages) => [...prevImages, result.assets[0]]);
      } else {
        Alert.alert('Lỗi', 'Bạn chỉ có thể chọn tối đa 6 hình ảnh.');
      }
    }
  };

  // Hàm gửi dữ liệu lên API
  const sendData = async () => {
    if (!tieuDe || !noiDung) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tiêu đề và nội dung.');
      return;
    }

    setLoading(true);
    const token = await AsyncStorage.getItem('LOGIN_TOKEN');

    // Chuẩn bị dữ liệu ảnh
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append('hinh_anh_phan_anhs', {
        uri: image.uri,
        type: 'image/jpeg',
        name: `image_${index}.jpg`,
      });
    });

    formData.append('tieu_de', tieuDe);
    formData.append('noi_dung', noiDung);

    try {
      const response = await APIs.post(`${endpoints.phananhs}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      Alert.alert('Thành công', 'Phản ánh của bạn đã được gửi.');
      navigation.goBack();
      // Reset form sau khi gửi thành công
      setTieuDe('');
      setNoiDung('');
      setImages([]);
    } catch (error) {
        navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <TextInput
        style={{ height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 20, paddingLeft: 10 }}
        placeholder="Tiêu đề"
        value={tieuDe}
        onChangeText={setTieuDe}
      />
      <TextInput
        style={{ height: 80, borderColor: '#ccc', borderWidth: 1, marginBottom: 20, paddingLeft: 10, textAlignVertical: 'top' }}
        placeholder="Nội dung"
        value={noiDung}
        onChangeText={setNoiDung}
        multiline
      />

      <Button title="Chọn hình ảnh" onPress={pickImage} />
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 20 }}>
        {images.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image.uri }}
            style={{ width: 100, height: 100, marginRight: 10, marginBottom: 10 }}
          />
        ))}
      </View>

      <Button
        title={loading ? 'Đang gửi...' : 'Gửi phản ánh'}
        onPress={sendData}
        disabled={loading}
      />
    </ScrollView>
  );
};

export default TaoPhanAnh;
