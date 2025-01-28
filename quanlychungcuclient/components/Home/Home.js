import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { Card, Title, Paragraph ,Avatar} from "react-native-paper";



const Home = () => {
    const navigation = useNavigation();  
  const handlePress = (item) => {
    if (item == "Profile")
        navigation.navigate("Profile");
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