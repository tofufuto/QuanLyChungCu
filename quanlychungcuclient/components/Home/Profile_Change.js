import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Avatar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';  
import AsyncStorage from "@react-native-async-storage/async-storage";
import APIs, { endpoints } from '../../configs/APIs';
import style from '../../styles/style';

const Profile_Change = ({ navigation, route }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUri, setAvatarUri] = useState(null);
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Cần cấp quyền truy cập vào thư viện ảnh!');
      }
    };
    requestPermission();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const updateProfile = async () => {
    if (password !== confirmPassword) {
      alert('Mật khẩu và xác nhận mật khẩu không khớp');
      return;
    }

    setLoading(true);
    
    try {
      const token = await AsyncStorage.getItem('LOGIN_TOKEN');
      const id = route.params.id; 

      const formData = new FormData();
      formData.append('password', password);
      if (avatarUri) {
        const uriParts = avatarUri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('avatar', {
          uri: avatarUri,
          name: `avatar.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      const response = await APIs.put(
        `${endpoints.user}/${id}/`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        Alert.alert('Cập nhật thành công', 'Bạn đã cập nhật thông tin thành công');
        
        // Remove the login token and navigate to login screen
        await AsyncStorage.removeItem('LOGIN_TOKEN');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); // Reset stack and navigate to Login
      } else {
        Alert.alert('Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <TouchableOpacity onPress={pickImage}>
        <Avatar.Image
          size={100}
          source={avatarUri ? { uri: avatarUri } : require("../../assets/default-avatar.jpg")}
        />
      </TouchableOpacity>

      {/* Mật khẩu */}
      <TextInput
        label="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {/* Xác nhận mật khẩu */}
      <TextInput
        label="Xác nhận mật khẩu"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
      />

      {/* Nút xác nhận */}
      <Button
        mode="contained"
        loading={loading}
        onPress={updateProfile}
        style={style.button}
      >
        Lưu thay đổi
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
    backgroundColor :'#a1e1ff',
    width: '100%',
    marginBottom: 15,
  },
});

export default Profile_Change;
