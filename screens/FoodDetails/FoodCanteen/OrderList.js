import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, Modal, TextInput, Image  } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS, images, icons } from "../../../constants";
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const OrderList = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [password, setPassword] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [user, setUser] = useState(null);
    const [reloadScreen, setReloadScreen] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken) {
                console.error('Access token not available');
                return;
            }

            const ordersResponse = await fetch('http://192.168.100.107:8000/orders/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }
            });

            if (!ordersResponse.ok) {
                throw new Error('Error fetching orders');
            }

            const ordersData = await ordersResponse.json();
            console.log(ordersData); // Add this line to check the response
            setOrders(ordersData);

            const userResponse = await fetch('http://192.168.100.107:8000/details/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }
            });

            if (!userResponse.ok) {
                throw new Error('Error fetching user details');
            }

            const userData = await userResponse.json();
            setUser(userData);
        } catch (error) {
            console.error("Error fetching orders:", error);
            Alert.alert("Error", "There was an error fetching the orders.");
        } finally {
            setLoading(false);
        }
    };

    // Use useFocusEffect to trigger fetchOrders when the screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [])
    );

    // Also, fetch orders when the component mounts or when the refresh parameter changes
    useEffect(() => {
        fetchOrders();
    }, [route.params?.refresh]);
    
    const handlePayNow = (order) => {
        setSelectedOrder(order);
        setModalVisible(true);
    };

    const handleTransfer = async () => {
        if (!password) {
          Alert.alert("Error", "Please enter your password.");
          return;
        }
    
        try {
          const accessToken = await AsyncStorage.getItem('accessToken');
          if (!accessToken) {
            console.error('Access token not available');
            return;
          }
    
          // Verify the buyer's password
          const passwordResponse = await fetch('http://192.168.100.107:8000/verify-password/', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
          });
    
          if (passwordResponse.ok) {
            const response = await fetch('http://192.168.100.107:8000/transfer/', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                recipient_phone_number: selectedOrder.vendor_phone_number,
                amount: selectedOrder.total_price,
              }),
            });
    
            if (!response.ok) {
              throw new Error('Error processing payment');
            }
    
            // Update order payment status
            await fetch(`http://192.168.100.107:8000/orders/${selectedOrder.id}/pay/`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            });
    
            Alert.alert("Success", "Payment successful.");
            setModalVisible(false);
            setOrders((prevOrders) =>
              prevOrders.map((order) =>
                order.id === selectedOrder.id ? { ...order, is_paid: true } : order
              )
            );
            
            // Trigger screen reload
            setReloadScreen((prev) => !prev);
          } else {
            Alert.alert("Error", "Incorrect password.");
          }
        } catch (error) {
          console.error("Error processing payment:", error);
          Alert.alert("Error", "You dont have enough balance in your account.");
        }
      };
    
      

    const renderItem = ({ item }) => {
        const isBuyer = user && item.user === user.email;
        const isVendor = user && item.vendor === user.email;
    
        return (
            <View style={styles.orderContainer}>
                <View style={styles.orderContent}>
                    {item.food && (
                        <Image source={images.promoBanner} style={styles.foodImage} />
                    )}
                    <View style={styles.orderDetails}>
                        {item.food && (
                            <>
                                <Text style={styles.foodName}>{item.food.name}</Text>
                                {/* <Text style={styles.foodDescription}>{item.food.description}</Text> */}
                                <Text style={styles.foodPrice}>₱{item.food.price}</Text>
                            </>
                        )}
                        <Text style={styles.orderQuantity}>Quantity: {item.quantity}</Text>
                        <Text style={styles.totalPrice}>Total: ₱{item.total_price}</Text>
                        <Text style={styles.orderedBy}>Ordered by {isBuyer ? "You" : item.user}</Text>
                        <Text style={styles.orderDate}>Ordered on: {new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                </View>
                {isBuyer && !item.is_paid && (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.payButton} onPress={() => handlePayNow(item)}>
                            <Text style={styles.payButtonText}>Pay Now</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {isVendor && !item.is_paid && (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.nfcButton}
                            onPress={() => navigation.navigate("PayNFC", { order: item })}
                        >
                            <Text style={styles.nfcButtonText}>Scan Student ID</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {item.is_paid && <Text style={styles.paidText}>Paid</Text>}
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
                    onPress={() => navigation.navigate("Home")}
                >
                    <Image
                        source={icons.back} // Adjust the image source
                        style={styles.iconImage} // Apply styling for size
                    />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Orders</Text>
                </View>
            </View>
            <FlatList
                data={orders}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.contentContainer}
                ListEmptyComponent={<Text style={styles.emptyText}>No orders found</Text>}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Confirm Payment</Text>
                        <Text style={styles.modalText}>Vendor Email: {selectedOrder?.vendor}</Text>
                        <Text style={styles.modalText}>Vendor Phone no.: {selectedOrder?.vendor_phone_number}</Text>
                        <Text style={styles.modalText}>Enter your password to confirm the payment of ₱{selectedOrder?.total_price}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalButton} onPress={handleTransfer}>
                                <Text style={styles.modalButtonText}>Confirm</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    orderContainer: {
        padding: 10,
        marginVertical: 5,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 3,
    },
    orderContent: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    foodImage: {
        width: 150,
        height: 150,
        borderRadius: 8,
    },
    orderDetails: {
        flex: 1,
        marginLeft: 10,
    },
    foodName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
    },
    foodDescription: {
        fontSize: 14,
        color: '#555',
    },
    foodPrice: {
        fontSize: 14,
        // fontWeight: 'bold',
        marginVertical: 5,
        color: 'black',
    },
    orderQuantity: {
        fontSize: 14,
        color: '#555',
    },
    totalPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 5,
        color: 'black',
    },
    orderedBy: {
        fontSize: 12,
        color: COLORS.gray,
    },
    orderDate: {
        fontSize: 12,
        color: COLORS.gray,
    },
    payButton: {
        backgroundColor: '#ff5a5f',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    payButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        
    },
    vendorViewText: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
    },
    paidText: {
        fontSize: 14,
        color: '#28a745',
        textAlign: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        marginVertical: SIZES.padding * 3,
        paddingHorizontal: SIZES.padding * 3,
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
    contentContainer: {
        paddingHorizontal: SIZES.padding * 3,
    },
    emptyText: {
        ...FONTS.h4,
        color: COLORS.gray,
        textAlign: 'center',
        marginTop: SIZES.padding * 2,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        color: 'black',
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        color: 'black',

    },
    modalTitle: {
        ...FONTS.h2,
        marginBottom: 15,
        textAlign: 'center',
        color: 'black',

    },
    modalText: {
        ...FONTS.body3,
        textAlign: 'center',
        marginBottom: 10,
        color: 'black',

    },
    input: {
        height: 40,
        borderColor: COLORS.gray,
        borderWidth: 1,
        borderRadius: 5,
        width: '100%',
        marginBottom: 15,
        paddingHorizontal: 10,
        color: 'black',

    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    modalButtonText: {
        color: COLORS.white,
        ...FONTS.h4,
    },
    buttonContainer: {
        // flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    nfcButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1,
        marginLeft: 5,
    },
    nfcButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    iconImage: {
        width: 20,
        height: 20,
        tintColor: COLORS.black,
    },
});

export default OrderList;
