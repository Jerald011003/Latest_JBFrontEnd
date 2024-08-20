import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, Modal, FlatList } from "react-native";
import { COLORS, SIZES, FONTS, images, icons } from "../../../constants";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderCreate = ({ route }) => {
    const { meal, canteenName } = route.params;
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [csrfToken, setCsrfToken] = useState('');
    const [quantity, setQuantity] = useState(1); // Default quantity
    const [isModalVisible, setModalVisible] = useState(false);

    // Fetch CSRF Token
    useEffect(() => {
        const fetchCsrfToken = async () => {
            try {
                const response = await fetch('http://192.168.100.107:8000/csrf/');
                const data = await response.json();
                setCsrfToken(data.csrfToken);
            } catch (error) {
                console.error('Error fetching CSRF token', error);
            }
        };

        fetchCsrfToken();
    }, []);

    const handleOrder = async () => {
        setLoading(true);
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken || !csrfToken) {
                console.error('Access token or CSRF token not available');
                Alert.alert("Error", "Access token or CSRF token is missing.");
                return;
            }
    
            const response = await fetch('http://192.168.100.107:8000/create-order/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    food: meal.id,
                    quantity: quantity
                })
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response data:', errorData);
                throw new Error(errorData.message || 'Error creating order');
            }
    
            Alert.alert("Success", "Order created successfully");
            navigation.navigate("OrderList");
        } catch (error) {
            console.error("Error creating order:", error);
            Alert.alert("Error", "You have an existing unpaid order. Please pay for it before placing a new order.");
        } finally {
            setLoading(false);
        }
    };
    

    const CustomPicker = ({ selectedValue, onValueChange, items }) => {
        return (
            <View style={styles.pickerContainer}>
                <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.pickerText}>{selectedValue || 'Select quantity'}</Text>
                    <Image source={icons.down} style={styles.downicon} />
                </TouchableOpacity>
                <Modal
                    transparent
                    visible={isModalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        onPress={() => setModalVisible(false)}
                    >
                        <View style={styles.modalContent}>
                            <FlatList
                                data={items}
                                keyExtractor={(item) => item.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.modalItem}
                                        onPress={() => {
                                            onValueChange(item);
                                            setModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.modalItemText}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => navigation.goBack()}
                >
                    <Image
                        source={icons.back}
                        style={styles.icon}
                    />   
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Place Order</Text>
                </View>
            </View>

            <View style={styles.topOrderContainer}>
                <Image source={images.promoBanner} style={styles.topOrderImage} />
            </View>
            <View style={styles.orderContainer}>
                <View style={styles.mealContainer}>
                    <Image source={images.promoBanner} style={styles.mealImage} />
                    <View style={styles.mealDetails}>
                        <Text style={styles.mealName}>{meal.name}</Text>
                        <View style={styles.quantityContainer}>
                            <Text style={styles.quantityLabel}>Quantity:</Text>

                            <CustomPicker
                                selectedValue={quantity}
                                onValueChange={(itemValue) => setQuantity(itemValue)}
                                items={[1, 2, 3, 4, 5]}
                            />
                            
                        </View>
                        <Text style={styles.mealPrice}>₱{meal.price}</Text>
                    </View>
                </View>

                <View style={styles.orderSummaryContainer}>
                    <Text style={styles.orderSummaryTitle}>Order Summary</Text>
                    <View style={styles.summaryDetails}>
                        <Text style={styles.summaryText}>Quantity:</Text>
                        <Text style={styles.summaryText}>{quantity}</Text>
                    </View>
                    <View style={styles.summaryDetails}>
                        <Text style={styles.summaryText}>Price per Meal:</Text>
                        <Text style={styles.summaryText}>₱{meal.price}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.totalContainer}>
                <View style={styles.totalTextRow}>
                    <Text style={styles.totalLabel}>Total Price</Text>
                    <Text style={styles.totalPrice}>₱{meal.price * quantity}</Text>
                </View>
                <TouchableOpacity style={styles.orderButton} onPress={handleOrder}>
                    <Text style={styles.orderButtonText}>Place order</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    icon: {
        height: 20,
        width: 20,
        tintColor: COLORS.black,
    },
    downicon: {
        height: 10,
        width: 10,
        tintColor: COLORS.black,
    },
    topOrderContainer: {
        flexDirection: 'row',
        paddingHorizontal: SIZES.padding*1.5,
    },
    topOrderImage: {
        marginVertical: SIZES.shortbase*3,
        paddingHorizontal: SIZES.padding*5,
        padding: SIZES.padding * 5,
        width: "100%",
        height: "100%",
        resizeMode: 'cover',
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        marginTop: SIZES.padding * 5,
        marginVertical: SIZES.padding * 2,
        paddingHorizontal: SIZES.padding * 2,
        alignItems: 'center',
    },
    iconButton: {
        width: 45,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: COLORS.black,
        ...FONTS.h3,
    },
    orderContainer: {
        paddingHorizontal: SIZES.padding * 2,
        marginTop: SIZES.padding * 3,
    },
    mealContainer: {
        flexDirection: 'row',
        marginBottom: SIZES.padding * 2,
    },
    mealImage: {
        width: 150,
        height: 150,
        resizeMode: 'cover',
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    mealDetails: {
        flex: 1,
        marginLeft: SIZES.padding,
        justifyContent: 'center',
    },
    mealName: {
        ...FONTS.h4,
        color: COLORS.black,
        marginBottom: SIZES.padding * 0.5,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.padding * 0.5,
    },
    quantityLabel: {
        ...FONTS.body3,
        color: COLORS.gray,
        marginRight: SIZES.padding,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        overflow: 'hidden',
        width: '50%',  // Decreased width to make it smaller
        
    },
    
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SIZES.padding,
        paddingHorizontal: SIZES.padding * 2,
        backgroundColor: COLORS.white,
        
    },
    pickerText: {
        flex: 1,
        ...FONTS.body3,
        color: COLORS.black,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    modalItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    modalItemText: {
        color: 'black',
    },
    mealPrice: {
        ...FONTS.h4,
        color: COLORS.black,
    },
    orderSummaryContainer: {
        padding: SIZES.padding,
        backgroundColor: COLORS.lightGray,
        borderRadius: SIZES.radius,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    orderSummaryTitle: {
        ...FONTS.h2,
        color: COLORS.black,
        marginBottom: SIZES.padding,
    },
    summaryDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SIZES.padding * 0.5,
    },
    summaryText: {
        ...FONTS.body3,
        color: COLORS.gray,
    },
    totalContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: SIZES.padding * 2,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
        alignItems: 'center',
    },
    totalTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: SIZES.padding,
    },
    totalLabel: {
        ...FONTS.h2,
        color: COLORS.black,
    },
    totalPrice: {
        ...FONTS.h2,
        color: COLORS.black,
    },
    orderButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: SIZES.padding * 1.5,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 0, // Ensure no horizontal margin
    },
    orderButtonText: {
        color: COLORS.white,
        ...FONTS.h3,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default OrderCreate;
