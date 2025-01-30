import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import AsyncStorage from "@react-native-async-storage/async-storage";
import APIs, { endpoints } from '../../configs/APIs';

const KhaoSatScreen = ({ navigation }) => {
  const [khaoSats, setKhaoSats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    fetchKhaoSats();
  }, []);

  const fetchKhaoSats = async (page = 1) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('LOGIN_TOKEN');
      const response = await APIs.get(`${endpoints.khaosats}?page=${page}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 200) {
        setKhaoSats(prev => page === 1 ? response.data.results : [...prev, ...response.data.results]);
        setNextPage(response.data.next);
      }
    } catch (error) {
      console.error('Lỗi khi tải khảo sát:', error);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  const loadMoreData = () => {
    if (nextPage && !isFetchingMore) {
      setIsFetchingMore(true);
      fetchKhaoSats(nextPage);
    }
  };

  const getStatusColor = (status) => {
    return status ? '#d3d3d3' : '#ADD8E6'; // Đã trả lời: xám, Chưa trả lời: xanh nhạt
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => item.da_tra_loi ? Alert.alert('Thông báo','Đã trả lời') : navigation.navigate('ChiTietKhaoSat',{ks_id: item.id})}>
      <Card style={[styles.card, { backgroundColor: getStatusColor(item.da_tra_loi) }]}>
        <Card.Content>
          <Title>{item.ten_khao_sat}</Title>
          <Paragraph>📅 Hạn trả lời: {item.ngay_han}</Paragraph>
          <Paragraph>📝 Trạng thái: {item.da_tra_loi ? '✅ Đã trả lời' : '🔵 Chưa trả lời'}</Paragraph>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading && khaoSats.length === 0 ? (
        <ActivityIndicator size="large" color="#6200ea" />
      ) : (
        <FlatList
          data={khaoSats}
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
  card: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },
});

export default KhaoSatScreen;
