import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, SegmentedButtons } from 'react-native-paper';
import AsyncStorage from "@react-native-async-storage/async-storage";
import APIs, { endpoints } from '../../configs/APIs';

const PhieuDongTien = ({ navigation }) => {
  const [phieuDongTien, setPhieuDongTien] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  useEffect(() => {
    fetchPhieuDongTien();
  }, []);

  useEffect(() => {
    filterByStatus(selectedStatus);
  }, [selectedStatus, phieuDongTien]);

  const fetchPhieuDongTien = async (page = 1) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('LOGIN_TOKEN');
      const response = await APIs.get(`${endpoints.phieudongtiens}?page=${page}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 200) {
        const newData = [...phieuDongTien, ...response.data.results];
        setPhieuDongTien(newData);
        setNextPage(response.data.next ? page + 1 : null);
      } else {
        console.error('Lỗi khi tải dữ liệu');
      }
    } catch (error) {
      console.error('Lỗi kết nối API:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách phiếu đóng tiền.');
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  const loadMoreData = () => {
    if (nextPage && !isFetchingMore) {
      setIsFetchingMore(true);
      fetchPhieuDongTien(nextPage);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'WAITING':
        return { label: '⏳ Đang chờ', color: '#ffa500' };
      case 'APPROVED':
        return { label: '✅ Đã duyệt', color: '#28a745' };
      case 'REJECTED':
        return { label: '❌ Bị từ chối', color: '#dc3545' };
      default:
        return { label: '⚠️ Không xác định', color: '#6c757d' };
    }
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('vi-VN'); // Định dạng theo chuẩn Việt Nam (có dấu phẩy)
  };

  const handlePress = (item) => {
      navigation.navigate("ChiTietPhieuDongTien",{id : item.id});
  };

  const filterByStatus = (status) => {
    if (status === 'ALL') {
      setFilteredData(phieuDongTien);
    } else {
      setFilteredData(phieuDongTien.filter(item => item.status === status));
    }
  };

  const renderItem = ({ item }) => {
    const statusInfo = getStatusLabel(item.status);
    return (
      <TouchableOpacity onPress={() => handlePress(item)} activeOpacity={0.7}>
        <Card style={[styles.card, { borderLeftColor: statusInfo.color, borderLeftWidth: 5 }]}>
          <Card.Content>
            <Title>💰 Tổng tiền: {formatCurrency(item.tong_tien)} VNĐ</Title>
            <Paragraph>📅 Ngày tạo: {item.created_date}</Paragraph>
            <Paragraph style={{ color: statusInfo.color }}>📌 Trạng thái: {statusInfo.label}</Paragraph>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={selectedStatus}
        onValueChange={setSelectedStatus}
        buttons={[
          { value: 'ALL', label: 'Tất cả' },
          { value: 'WAITING', label: '⏳' },
          { value: 'APPROVED', label: '✅' },
          { value: 'REJECTED', label: '❌' },
        ]}
        style={styles.filterButtons}
      />

      {loading && phieuDongTien.length === 0 ? (
        <ActivityIndicator size="large" color="#6200ea" />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingMore ? <ActivityIndicator size="small" color="#6200ea" /> : null}
        />
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
  filterButtons: {
    marginBottom: 16,
    alignSelf: 'center',
  },
  card: {
    marginBottom: 10,
    backgroundColor: '#ffffff',
    elevation: 4,
    padding: 10,
    borderRadius: 8,
  },
});

export default PhieuDongTien;
