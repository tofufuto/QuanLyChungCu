import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex:1,
        justifyContent:'center',  
        padding: 20,
        backgroundColor: "#f5f5f5",                                     
    }, 
    card: {
    padding: 20,
    backgroundColor:'#a1e1ff',
    },
    title: {
    textAlign: "center",
    marginBottom: 20,
    },
    input: {
    marginBottom: 15,
    },
    button: {
    backgroundColor:'#008cbf',
    marginTop: 10,
    },
    big_title: {
        textAlign: "center",
        marginBottom: 20,
        fontSize:30,
        color:"#008cbf",
        fontWeight:"500",
    },
    profile_container: {
        flex: 1,
        justifyContent: 'center',  // Căn giữa theo chiều dọc
        alignItems: 'center',      // Căn giữa theo chiều ngang
        backgroundColor: "#f5f5f5", // Màu nền nhẹ cho container
        padding: 20, // Thêm một chút khoảng cách xung quanh để nội dung không bị sát cạnh
    },
    profile_text: {
    fontSize: 20,
    margin: 10, // Khoảng cách giữa các đoạn văn bản
    color: '#333', // Màu chữ tối để dễ đọc
    },
    profile_card: {
    alignItems:'flex-start',
    width: '100%',
    padding: 15, // Khoảng cách bên trong card
    margin: 10, // Khoảng cách bên ngoài card, tạo không gian giữa các element
    backgroundColor: '#fff', // Màu nền của card
    borderRadius: 10, // Bo góc cho card
    shadowColor: '#000', // Màu bóng đổ
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8, // Độ mờ của bóng đổ
    shadowRadius: 3, // Bán kính bóng đổ
    elevation: 5, // Bóng đổ trên Android
    },
    profile_card_lightblue: {
    backgroundColor: '#a1e1ff', 
    },
    profile_card_lightgreen: {
    backgroundColor: '#6eff97', 
    },


})