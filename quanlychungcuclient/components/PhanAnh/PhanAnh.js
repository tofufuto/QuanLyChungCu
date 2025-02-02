import React, { useState, useEffect } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator, IconButton, Appbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import APIs, { endpoints } from '../../configs/APIs';
import { MaterialCommunityIcons } from 'react-native-vector-icons'; // Thêm thư viện Icon

const KhaoSat = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('LOGIN_TOKEN');
      try {
        const response = await APIs.get(endpoints.phananhs, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setData(response.data.results);
        setNextPage(response.data.next);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const loadMoreData = async () => {
    if (nextPage) {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('LOGIN_TOKEN');
        const response = await APIs.get(nextPage, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setData((prevData) => [...prevData, ...response.data.results]);
        setNextPage(response.data.next);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const token = await AsyncStorage.getItem('LOGIN_TOKEN');
      const response = await APIs.get(endpoints.phananhs, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setData(response.data.results);
      setNextPage(response.data.next);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }) => (
    <Card style={{ marginBottom: 10 }}>
      <Card.Content>
        <Title>
          <IconButton
            icon="comment"
            size={20}
            onPress={() => alert('Icon for Title pressed!')}
            style={{ marginRight: 10 }}
          />
          {item.tieu_de}
        </Title>
        <Paragraph>
          <IconButton
            icon="file-document"
            size={20}
            onPress={() => alert('Icon for Paragraph pressed!')}
            style={{ marginRight: 10 }}
          />
          {item.noi_dung}
        </Paragraph>
        <Paragraph>#{item.status}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => navigation.navigate('ChiTietPhanAnh', { pa_id: item.id })}>Xem chi tiết</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Thêm phản ánh" />
        <Appbar.Action
          icon="plus"
          onPress={() => navigation.navigate('TaoPhanAnh')}
        />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator animating={true} size="large" style={{ flex: 1, justifyContent: 'center' }} />
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
};

export default KhaoSat;
