import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import AsyncStorage from "@react-native-async-storage/async-storage";
import APIs, { endpoints } from '../../configs/APIs';

const ChuyenTienInfo = () => {
  const [transferInfo, setTransferInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    fetchTransferInfo();
  }, []);

  const fetchTransferInfo = async (page = 1) => {
    try {
      const token = await AsyncStorage.getItem('LOGIN_TOKEN');
      const response = await APIs.get(`${endpoints.thongtinchuyentiens}?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setTransferInfo((prevData) => [...prevData, ...response.data.results]);
        setNextPage(response.data.next ? page + 1 : null);
      } else {
        console.error('Lỗi khi tải dữ liệu');
      }
    } catch (error) {
      console.error('Lỗi kết nối API:', error);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  const loadMoreData = () => {
    if (nextPage && !isFetchingMore) {
      setIsFetchingMore(true);
      fetchTransferInfo(nextPage);
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.ten}</Title>
        <Paragraph>🏦 Ngân hàng: {item.ngan_hang}</Paragraph>
        <Paragraph>💳 Số tài khoản: {item.so_tai_khoang}</Paragraph>
        <Paragraph>📅 Ngày tạo: {item.created_date}</Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {loading && transferInfo.length === 0 ? (
        <ActivityIndicator size="large" color="#6200ea" />
      ) : (
        <FlatList
          data={transferInfo}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5} // Khi kéo xuống 50% cuối danh sách thì load thêm
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
  card: {
    marginBottom: 10,
    backgroundColor: '#ffffff',
    elevation: 4,
  },
});

export default ChuyenTienInfo;
