import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import AsyncStorage from "@react-native-async-storage/async-storage";
import APIs, { endpoints } from '../../configs/APIs';
import { RefreshControl } from 'react-native-gesture-handler';

const ParkingCardForR = ({ navigation }) => {  // Đảm bảo rằng navigation được truyền vào
  const [parkingCards, setParkingCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchParkingCards();
  }, []);

  const fetchParkingCards = async (page = 1) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('LOGIN_TOKEN');
      const response = await APIs.get(`${endpoints.thegiuxes}?page=${page}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 200) {
        setParkingCards((prevData) => [...prevData, ...response.data.results]);
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

  const deleteParkingCard = async (id) => {
    try {
      const token = await AsyncStorage.getItem('LOGIN_TOKEN');
      const response = await APIs.delete(`${endpoints.thegiuxes}/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 204) {
        Alert.alert('Xóa thành công', 'Thẻ giữ xe đã bị xóa.');
        setParkingCards((prevData) => prevData.filter((item) => item.id !== id)); // Cập nhật danh sách sau khi xóa
      } else {
        Alert.alert('Lỗi', 'Không thể xóa thẻ giữ xe.');
      }
    } catch (error) {
      console.error('Lỗi khi xóa thẻ giữ xe:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi xóa.');
    }
  };

  const handleCardPress = (item) => {
    Alert.alert(
      'Tùy chọn',
      `Số xe: ${item.so_xe}\nChủ xe: ${item.ten_nguoi_than}`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', onPress: () => deleteParkingCard(item.id), style: 'destructive' },
      ]
    );
  };

  const loadMoreData = () => {
    if (nextPage && !isFetchingMore) {
      setIsFetchingMore(true);
      fetchParkingCards(nextPage);
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card} onPress={() => handleCardPress(item)}>
      <Card.Content>
        <Title>🚗 {item.so_xe}</Title>
        <Paragraph>👤 Chủ xe: {item.ten_nguoi_than}</Paragraph>
        <Paragraph>📅 Ngày tạo: {item.created_date}</Paragraph>
      </Card.Content>
    </Card>
  );

  // Tạo nút trên header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Title onPress={() => navigation.navigate("TaoTheGiuXe")} style={styles.headerButton}>
          Tạo
        </Title>
      ),
    });
  }, [navigation]);

  const onRefresh = () =>{
    setLoading(true);
    setParkingCards([]);
    fetchParkingCards();
  };

  return (
    <View style={styles.container}>
      {loading && parkingCards.length === 0 ? (
        <ActivityIndicator size="large" color="#6200ea" />
      ) : (
        <FlatList
          data={parkingCards}
          keyExtractor={(item) => `${item.id}-${item.so_xe}`} // Combine id and so_xe to guarantee uniqueness
          renderItem={renderItem}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5} // Load thêm dữ liệu khi kéo xuống 50% cuối danh sách
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
  headerButton: {
    padding: 10,
    color: '#6200ea',  // Màu sắc của nút
  },
});

export default ParkingCardForR;
