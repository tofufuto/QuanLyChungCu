import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Image } from "react-native";
import { Card,Avatar } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import APIs, { endpoints } from "../../configs/APIs";
import { config } from "../../configs/config";
import style from "../../styles/style";
import { ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

const Profile = () => {
  const [userData, setUserData] = useState(null);  // Lưu dữ liệu người dùng
  const [loading, setLoading] = useState(true);  // Trạng thái tải dữ liệu
  const [error, setError] = useState(null);  // Trạng thái lỗi
   const navigation = useNavigation();  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Lấy token từ AsyncStorage
        const token = await AsyncStorage.getItem(config.LOGIN_TOKEN);
        
        if (token) {
          // Gửi request với header Authorization Bearer <access_token>
          const response = await APIs.get(endpoints.user, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          // Lưu dữ liệu người dùng vào state
          setUserData(response.data);
          console.log("Response Data:", response.data);
        } else {
          setError("Token không có, vui lòng đăng nhập lại!");
        }
      } catch (error) {
        setError("Đã xảy ra lỗi khi tải dữ liệu!");
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);  // Kết thúc quá trình tải
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View >
        <Text>{error}</Text>
      </View>
    );
  }
  const change_profile = () =>{
    navigation.navigate("Profile_Change",{id : userData.results[0].id});
  };

  return (
    <ScrollView>
    <View style={style.profile_container}>
   <Card style={style.card}>
    <Avatar.Image size={100} source={{ uri: `${config.CLOUDINARY_BASE_URL}${userData.results[0].avatar}` }} />
    </Card>
    <Card style={[style.profile_card,style.profile_card_lightblue]}>
    <Text style={style.profile_text}>ID: {userData.results[0].id}</Text>
    <Text style={style.profile_text}>Username: {userData.results[0].username}</Text>
    </Card> 
    <Card style={style.profile_card}>
    <Text style={style.profile_text}>Họ tên: {userData.results[0].first_name} {userData.results[0].last_name}</Text>
    <Text style={style.profile_text}>Điện thoại: {userData.results[0].sdt}</Text>
    <Text style={style.profile_text}>CCCD: {userData.results[0].cccd}</Text>
    <Text style={style.profile_text}>Ngày sinh: {userData.results[0].birthdate}</Text>
    </Card> 
    <Card style={[style.profile_card,style.profile_card_lightgreen]}>
    <Text style={style.profile_text}>Phòng: {userData.results[0].phong ? userData.results[0].phong.so_phong : 'Chưa có phòng'}</Text> 
    </Card> 
    <Card style={[style.profile_card,style.profile_card_lightyellow]} onPress={() =>change_profile()}>
    <Text style={style.profile_text}>Đổi mật khẩu</Text> 
    </Card> 
  </View>
  </ScrollView>
  );
};

export default Profile;
