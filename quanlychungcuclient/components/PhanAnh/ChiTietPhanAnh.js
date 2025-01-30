import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { ActivityIndicator, Card, Title, Paragraph } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import APIs, { endpoints } from '../../configs/APIs';
import { config } from '../../configs/config';


const ChiTietPhanAnh = ({ route }) => {
  const { pa_id } = route.params; // Lấy pa_id từ params của navigation
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('LOGIN_TOKEN');
      try {
        const response = await APIs.get(`${endpoints.phananhs}/${pa_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setData(response.data);
        
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pa_id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centered}>
        <Text>No data found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{data.tieu_de}</Title>
          <Paragraph>{data.noi_dung}</Paragraph>
          <Paragraph>Status: {data.status}</Paragraph>
        </Card.Content>
      </Card>

      {data.hinh_anh_phan_anhs && data.hinh_anh_phan_anhs.length > 0 && (
        <View style={styles.imagesContainer}>
          {data.hinh_anh_phan_anhs.map((item, index) => (
            <Image
              key={index}
              source={{ uri: `${config.CLOUDINARY_BASE_URL}${item.image}` }}
              style={styles.image}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 10,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  image: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 5,
  },
});

export default ChiTietPhanAnh;
