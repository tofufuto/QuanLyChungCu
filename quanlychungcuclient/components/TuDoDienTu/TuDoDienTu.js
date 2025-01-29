import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import APIs, { endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TuDoDienTu = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Cập nhật header chỉ khi `searchKeyword` thay đổi
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitleAlign: "left", // Căn trái giúp có nhiều không gian hơn
      headerTitle: () => (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm..."
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            placeholderTextColor="#666"
          />
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleAddItem} style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, searchKeyword]);

  const handleAddItem = () => {
    console.log("Thêm mới item"); // Thay thế bằng logic thêm item thực tế
  };

  useEffect(() => {
    loadTudodientus(); // Tải dữ liệu ban đầu
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    await loadTudodientus(1, searchKeyword);
  };

  const loadTudodientus = async (page = 1, keyword = '') => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('LOGIN_TOKEN');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const url = `${endpoints.tudodientus}?page=${page}${keyword ? `&keyword=${keyword}` : ''}`;
      const response = await APIs.get(url, config);
      const result = response.data;
      setData(page === 1 ? result.results : [...data, ...result.results]);
      setNextPage(result.next);
    } catch (error) {
      console.error("Lỗi khi tải tủ đồ", error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMoreData = () => {
    if (!nextPage || isLoadingMore) return;
    setIsLoadingMore(true);
    loadTudodientus(nextPage, searchKeyword);
  };

  const getStatusColor = (status) => {
    return status === 'empty' ? '#d3d3d3' : '#90ee90';
  };

  const renderItem = ({ item }) => (
    <Card style={[styles.card, { backgroundColor: getStatusColor(item.trang_thai) }]}>
      <Card.Content>
        <View style={styles.row}>
          <MaterialCommunityIcons name="archive" size={20} color="black" />
          <Text style={styles.cardTitle}>Tên đồ: {item.ten_do}</Text>
        </View>
        <View style={styles.row}>
          <MaterialCommunityIcons name="text" size={20} color="black" />
          <Text style={styles.text}>Mô tả: {item.mo_ta}</Text>
        </View>
        <View style={styles.row}>
          <MaterialCommunityIcons name="calendar" size={20} color="black" />
          <Text style={styles.text}>Ngày giao: {item.ngay_nhan_hang || '---'}</Text>
        </View>
        <View style={styles.row}>
          <MaterialCommunityIcons name="check-circle" size={20} color="black" />
          <Text style={styles.text}>Trạng thái: {item.trang_thai}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderFooter = () => {
    return isLoadingMore ? <ActivityIndicator size="large" color="#0000ff" /> : null;
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    searchContainer: {
      flexGrow: 1, // Tự mở rộng theo header
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
      paddingHorizontal: 10,
      justifyContent: 'center',
      width: '100%', // Dùng 100% thay vì 90%
      minWidth: 250, // Đảm bảo không bị quá nhỏ
    },
    searchInput: {
      height: 40,
      fontSize: 16,
      color: 'black',
    },
    addButton: {
        marginRight: 15, // Tạo khoảng cách từ lề phải
      },
  });

export default TuDoDienTu;
