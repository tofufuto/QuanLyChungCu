import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Image, TouchableOpacity, Linking } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import APIs, { endpoints } from '../../configs/APIs';

const ChiTietPhieuDongTien = ({ route, navigation }) => {
  const { id } = route.params; // Lấy id từ navigation
  const [phieu, setPhieu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchPhieu();
  }, []);

  const fetchPhieu = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('LOGIN_TOKEN');
      const response = await APIs.get(`${endpoints.phieudongtiens}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 200) {
        setPhieu(response.data);
      } else {
        Alert.alert('Lỗi', 'Không thể tải chi tiết phiếu đóng tiền.');
      }
    } catch (error) {
      console.error('Lỗi API:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến API.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      Alert.alert('Lỗi', 'Vui lòng chọn ảnh trước khi tải lên.');
      return;
    }

    setUploading(true);
    try {
      const token = await AsyncStorage.getItem('LOGIN_TOKEN');
      const formData = new FormData();
      formData.append('screenshot_xac_nhan', {
        uri: selectedImage,
        name: `upload_${id}.jpg`,
        type: 'image/jpeg',
      });

      const response = await APIs.put(`${endpoints.phieudongtiens}/${id}/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        Alert.alert('Thành công', 'Ảnh xác nhận đã được tải lên.');
        setPhieu({ ...phieu, screenshot_xac_nhan: response.data.screenshot_xac_nhan });
      } else {
        Alert.alert('Lỗi', 'Không thể tải lên ảnh.');
      }
    } catch (error) {
      console.error('Lỗi upload:', error);
      Alert.alert('Lỗi', 'Không thể tải lên ảnh.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'WAITING': return { label: '⏳ Đang chờ', color: '#ffa500' };
      case 'APPROVED': return { label: '✅ Đã duyệt', color: '#28a745' };
      case 'REJECTED': return { label: '❌ Bị từ chối', color: '#dc3545' };
      default: return { label: '⚠️ Không xác định', color: '#6c757d' };
    }
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('vi-VN'); 
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#6200ea" style={styles.loading} />;
  }

  if (!phieu) {
    return <Text style={styles.errorText}>Không tìm thấy phiếu đóng tiền.</Text>;
  }

  const statusInfo = getStatusLabel(phieu.status);

  return (
    <View style={styles.container}>
      <Card style={[styles.card, { borderLeftColor: statusInfo.color, borderLeftWidth: 5 }]}>
        <Card.Content>
          <Title>💰 Tổng tiền: {formatCurrency(phieu.tong_tien)} VNĐ</Title>
          <Paragraph>📅 Ngày tạo: {phieu.created_date}</Paragraph>
          <Paragraph style={{ color: statusInfo.color }}>📌 Trạng thái: {statusInfo.label}</Paragraph>
        </Card.Content>
      </Card>

      <Text style={styles.header}>📋 Chi tiết dịch vụ</Text>
      {phieu.chitiet_phieudongtiens.map((item) => (
        <Card key={item.id} style={styles.serviceCard}>
          <Card.Content>
            <Title>{item.ten_dich_vu}</Title>
            <Paragraph>{item.noi_dung}</Paragraph>
            <Paragraph style={styles.price}>💰 {formatCurrency(parseFloat(item.phi_dong))} VNĐ</Paragraph>
          </Card.Content>
        </Card>
      ))}

      {phieu.screenshot_xac_nhan ? (
        <Image source={{ uri: phieu.screenshot_xac_nhan }} style={styles.image} />
      ) : null}

      {(phieu.status === 'WAITING' || phieu.status === 'REJECTED') && (
        <>
          <Button mode="contained" onPress={pickImage} style={styles.button}>
            Chọn ảnh xác nhận
          </Button>

          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          )}

          <Button 
            mode="contained" 
            onPress={uploadImage} 
            loading={uploading} 
            disabled={uploading} 
            style={styles.button}>
            {uploading ? "Đang tải lên..." : "Tải lên ảnh"}
          </Button>

          {phieu.vnpay_url && (
            <Button mode="contained" onPress={() => Linking.openURL(phieu.vnpay_url)} style={styles.button}>
              Thanh toán qua VNPay
            </Button>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'red',
  },
  card: {
    marginBottom: 10,
    backgroundColor: '#ffffff',
    elevation: 4,
    padding: 10,
    borderRadius: 8,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  serviceCard: {
    marginBottom: 10,
    padding: 10,
  },
  price: {
    fontWeight: 'bold',
    color: '#6200ea',
  },
  image: {
    width: '100%',
    height: 200,
    marginVertical: 10,
  },
  previewImage: {
    width: '100%',
    height: 150,
    marginVertical: 10,
    borderRadius: 8,
  },
  button: {
    marginVertical: 5,
  },
});

export default ChiTietPhieuDongTien;
