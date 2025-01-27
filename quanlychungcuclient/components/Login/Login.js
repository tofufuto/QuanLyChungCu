import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Card, Title } from "react-native-paper";
import APIs, { endpoints } from "../../configs/APIs";
import { config } from "../../configs/config";
import AsyncStorage from "@react-native-async-storage/async-storage";


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      // Tạo FormData
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      formData.append("client_id", config.clientId);
      formData.append("client_secret", config.clientSecret);
      formData.append("grant_type", "password");
  
      // Gửi request POST với FormData
      const response = await APIs.post(endpoints.token, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Dùng form-data content type
        },
      });
  
      // Kiểm tra nếu response có data và có access_token
      if (response.data && response.data.access_token) {
        console.log("Response Data:", response.data);
        
        // Lưu token vào AsyncStorage
        await AsyncStorage.setItem("LOGIN_TOKEN", response.data.access_token);

        setUsername('');
        setPassword('');
  
        // Chuyển hướng hoặc xử lý sau khi login thành công
        Alert.alert("Login Success", "You are now logged in!");
      } else {
        // Xử lý trường hợp không có access_token trong response
        Alert.alert("Login Failed", "No access token received.");
      }
  
    } catch (error) {
      // Xử lý lỗi khi đăng nhập
      console.error("Login Error:", error.response?.data || error.message);
      
      // Thông báo lỗi chi tiết từ server
      const errorMessage = error.response?.data?.error_description || "An error occurred";
      Alert.alert("Login Failed", errorMessage);
    }
  };
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Login</Title>
          <TextInput
            label="Username"
            mode="outlined"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
          <TextInput
            label="Password"
            mode="outlined"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          <Button mode="contained" onPress={handleLogin} style={styles.button}>
            Login
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  card: {
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
});

export default Login;
