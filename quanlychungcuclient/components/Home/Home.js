import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { Card, Title, Paragraph ,Avatar} from "react-native-paper";



const Home = () => {
    const navigation = useNavigation();  
  const handlePress = (item) => {
    if (item == "Profile")
        navigation.navigate("Profile");
    if (item == "ChuyenTienInfo")
        navigation.navigate("ChuyenTienInfo");
    if (item == "ParkingCardForR")
        navigation.navigate("ParkingCardForR");
    if(item == "PhieuDongTien")
        navigation.navigate("PhieuDongTien");
    if(item == "TuDoDienTu")
        navigation.navigate("TuDoDienTu");
  };

  return (
    <ScrollView style={styles.container}>
    <View style={styles.content}>
      <Card style={styles.card} onPress={() => handlePress("Profile")}>
        <Card.Content>
          <View style={styles.profileContainer}>
            <Avatar.Image 
              size={50} 
              source={require("../../assets/default-avatar.jpg")} 
            />
            <View style={styles.textContainer}>
              <Title>Profile</Title>
              <Paragraph>Xem thông tin cá nhân</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
    <View style={styles.content}>
      <Card style={styles.card} onPress={() => handlePress("TuDoDienTu")}>
        <Card.Content>
          <View style={styles.profileContainer}>
            <Avatar.Image 
              size={50} 
              source={require("../../assets/locker.jpg")} 
            />
            <View style={styles.textContainer}>
              <Title>Tủ đồ điện tử</Title>
              <Paragraph>Ban quản trị sẽ nhận đồ được đăng ký                 ở đây</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
    <View style={styles.content}>
      <Card style={styles.card} onPress={() => handlePress("PhieuDongTien")}>
        <Card.Content>
          <View style={styles.profileContainer}>
            <Avatar.Image 
              size={50} 
              source={require("../../assets/card.jpg")} 
            />
            <View style={styles.textContainer}>
              <Title>Phiếu đống tiền</Title>
              <Paragraph>Xem các phiếu đống tiền và upload màn          hình ủy nhiệm</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
    <View style={styles.content}>
      <Card style={styles.card} onPress={() => handlePress("ParkingCardForR")}>
        <Card.Content>
          <View style={styles.profileContainer}>
            <Avatar.Image 
              size={50} 
              source={require("../../assets/car.jpg")} 
            />
            <View style={styles.textContainer}>
              <Title>Thẻ giữ xe cho người thân</Title>
              <Paragraph>Xem các thẻ giữ xe hoặc đăng ký thẻ cho người thân</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
    <View style={styles.content}>
      <Card style={styles.card} onPress={() => handlePress("ChuyenTienInfo")}>
        <Card.Content>
          <View style={styles.profileContainer}>
            <Avatar.Image 
              size={50} 
              source={require("../../assets/question_mark.png")} 
            />
            <View style={styles.textContainer}>
              <Title>Thông tin chuyển tiền</Title>
              <Paragraph>Xem thông tin tài khoảng để chuyển các khoảng phí của chung cư</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f5f5f5",
    },
    content: {
      padding: 10,
    },
    card: {
      marginBottom: 10,
      backgroundColor: "#fff",
    },
    profileContainer: {
      flexDirection: "row", // Sắp xếp các thành phần theo chiều ngang
      alignItems: "center", // Canh giữa các thành phần dọc theo trục
    },
    textContainer: {
      marginLeft: 10, // Khoảng cách giữa Avatar và các Text
    },
  });

export default Home;