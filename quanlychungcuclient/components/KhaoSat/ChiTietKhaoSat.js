import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Card, Title, RadioButton, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import APIs, { endpoints } from '../../configs/APIs';

const ChiTietKhaoSat = ({ route, navigation }) => {
  const { ks_id } = route.params;
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSurvey();
  }, []);

  const fetchSurvey = async () => {
    try {
      const token = await AsyncStorage.getItem('LOGIN_TOKEN');
      const response = await APIs.get(`${endpoints.khaosats}/${ks_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSurvey(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy khảo sát:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu khảo sát.');
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async () => {
    const unanswered = survey.chi_tiet_khao_sat.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      Alert.alert('Lỗi', 'Vui lòng trả lời tất cả các câu hỏi.');
      return;
    }

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('LOGIN_TOKEN');
      const payload = Object.entries(answers).map(([id, answer]) => ({
        chi_tiet_khao_sat: parseInt(id),
        tra_loi: answer,
      }));

      await APIs.post(`${endpoints.traloi}/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Thành công', 'Bạn đã hoàn thành khảo sát.');
      navigation.goBack();
    } catch (error) {
      console.error('Lỗi khi gửi câu trả lời:', error);
      Alert.alert('Lỗi', 'Không thể gửi câu trả lời.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#6200ea" style={styles.loader} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>{survey.ten_khao_sat}</Title>
      {survey.chi_tiet_khao_sat.map((question) => (
        <Card key={question.id} style={styles.card}>
          <Card.Content>
            <Title>{question.noi_dung}</Title>
            <RadioButton.Group
              onValueChange={(value) => handleAnswerChange(question.id, value)}
              value={answers[question.id] || ''}>
              <RadioButton.Item label="Đồng ý" value="Đồng ý" />
              <RadioButton.Item label="Bình thường" value="Bình thường" />
              <RadioButton.Item label="Không đồng ý" value="Không đồng ý" />
            </RadioButton.Group>
          </Card.Content>
        </Card>
      ))}
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={submitting}
        disabled={submitting}
        style={styles.button}>
        Thực hiện xong
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    marginBottom: 12,
    padding: 10,
  },
  button: {
    marginTop: 20,
    alignSelf: 'center',
    width: '100%',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChiTietKhaoSat;
