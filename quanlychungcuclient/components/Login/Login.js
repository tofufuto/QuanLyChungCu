import React, { useState } from "react";
import { View, Alert, Text } from "react-native";
import { TextInput, Button, Card, Title } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";  // Import navigation hook
import APIs, { endpoints } from "../../configs/APIs";
import { config } from "../../configs/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import style from "../../styles/style";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();  // Sử dụng navigation

  const handleLogin = async () => {
    if (username.trim() && password.trim()) {
      try {
        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);
        formData.append("client_id", config.clientId);
        formData.append("client_secret", config.clientSecret);
        formData.append("grant_type", "password");

        const response = await APIs.post(endpoints.token, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data && response.data.access_token) {
          console.log("Response Data:", response.data);

          await AsyncStorage.setItem(config.LOGIN_TOKEN, response.data.access_token);

          setUsername("");
          setPassword("");

          // Alert.alert("Login Success", "You are now logged in!");
          
          // Chuyển đến màn hình Profile sau khi đăng nhập thành công
          navigation.navigate("Profile");
        } else {
          Alert.alert("Đăng nhập thất bại", "Sai mật khẩu hoặc username");
        }
      } catch (error) {
        Alert.alert("Đăng nhập thất bại", "Sai mật khẩu hoặc username");
      }
    } else {
      Alert.alert("Lỗi", "Vui lòng điền username và password");
    }
  };

  return (
    <View style={style.container}>
      <Text style={style.big_title}>CHUNG CƯ ABC</Text>
      <Card style={style.card}>
        <Card.Content>
          <Title style={style.title}>Đăng Nhập</Title>
          <TextInput
            label="Username"
            mode="outlined"
            value={username}
            onChangeText={setUsername}
            style={style.input}
          />
          <TextInput
            label="Password"
            mode="outlined"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={style.input}
          />
          <Button mode="contained" onPress={handleLogin} style={style.button}>
            Đăng Nhập
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

export default Login;
