import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, SegmentedButtons } from 'react-native-paper';
import AsyncStorage from "@react-native-async-storage/async-storage";
import APIs, { endpoints } from '../../configs/APIs';

const PhieuDongTien = ({ navigation }) => {
  const [phieuDongTien, setPhieuDongTien] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  useEffect(() => {
    fetchPhieuDongTien(1, selectedStatus);
  }, [selectedStatus]);

  const fetchPhieuDongTien = async (page = 1, status = 'ALL') => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('LOGIN_TOKEN');
      const keyword = status !== 'ALL' ? `&keyword=${status}` : '';
      const url = `${endpoints.phieudongtiens}?page=${page}${keyword}`;
      
      const response = await APIs.get(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.status === 200) {
        setPhieuDongTien(page === 1 ? response.data.results : [...phieuDongTien, ...response.data.results]);
        setNextPage(response.data.next);
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
      const nextPageNum = new URL(nextPage).searchParams.get("page");
      fetchPhieuDongTien(nextPageNum, selectedStatus);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("ChiTietPhieuDongTien", { id: item.id })} activeOpacity={0.7}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>💰 Tổng tiền: {item.tong_tien.toLocaleString('vi-VN')} VNĐ</Title>
          <Paragraph>📅 Ngày tạo: {item.created_date}</Paragraph>
          <Paragraph>📌 Trạng thái: {item.status}</Paragraph>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

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
          data={phieuDongTien}
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
