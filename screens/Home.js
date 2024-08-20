import React, { useState, useEffect, useCallback } from "react";
import {
    SafeAreaView,
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    Alert
} from "react-native";
import { COLORS, SIZES, FONTS, icons, images } from "../constants";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = () => {
    const navigation = useNavigation();
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
    const [features, setFeatures] = useState(featuresData);
    const [specialPromos, setSpecialPromos] = useState([]);
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [csrfToken, setCsrfToken] = useState('');
    const [firstName, setFirstName] = useState('');
    const [isVendor, setIsVendor] = useState(false); // New state for user type
    const [userDetails, setUserDetails] = useState({});

    const featuresData = [
        {
            id: 1,
            icon: icons.reload,
            color: COLORS.primary,
            backgroundColor: COLORS.white,
            description: "Top Up",
            screen: "TopUp"
        },
        {
            id: 2,
            icon: icons.food,
            color: COLORS.yellow,
            backgroundColor: COLORS.lightyellow,
            description: "Foods",
            screen: "Food"
        },
        {
            id: 3,
            icon: icons.diet,
            color: COLORS.primary,
            backgroundColor: COLORS.lightGreen,
            description: "Diet Tracker",
            screen: "DietTracker"
        },
        {
            id: 4,
            icon: icons.wallet,
            color: COLORS.red,
            backgroundColor: COLORS.lightRed,
            description: "Wallet",
            screen: "Wallet"
        },
        {
            id: 5,
            icon: icons.bill,
            color: COLORS.yellow,
            backgroundColor: COLORS.lightyellow,
            description: "Transactions",
            screen: "Transactions"
        },
        {
            id: 6,
            icon: icons.cart,
            color: COLORS.yellow,
            backgroundColor: COLORS.lightyellow,
            description: "Orders",
            screen: "OrderList"
        },
    ];

    
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

    const fetchUserDetails = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken || !csrfToken) {
                console.error('Token or CSRF Token not available');
                return;
            }
    
            const response = await fetch('http://192.168.100.107:8000/details/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-CSRFToken': csrfToken
                }
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
            setUserDetails(data);
        } catch (error) {
            console.error("Error fetching user details:", error);
            Alert.alert('Error', 'Unable to fetch user details.');
        }
    };

    
    const fetchBalance = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken || !csrfToken) {
                console.error('Token or CSRF Token not available');
                return;
            }

            const response = await fetch('http://192.168.100.107:8000/balance/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-CSRFToken': csrfToken
                }
            });

            const data = await response.json();
            const balance = parseFloat(data.balance).toFixed(2);
            const formattedBalance = Number(balance).toLocaleString();
            setBalance(formattedBalance);

            const firstName = data.first_name;
            const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
            setFirstName(capitalizedFirstName);

            // Determine if the user is a vendor
            setIsVendor(data.user_type === 'vendor'); // Adjust based on your user type field
        } catch (error) {
            console.error("Error fetching balance:", error);
            Alert.alert('Error', 'Unable to fetch balance.');
        }
    };

    const fetchFeaturedFoods = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken || !csrfToken) {
                console.error('Token or CSRF Token not available');
                return;
            }

            const response = await fetch('http://192.168.100.107:8000/featured-foods/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-CSRFToken': csrfToken
                }
            });

            const data = await response.json();
            setSpecialPromos(data.slice(0, 4)); // Limit to 4 items
        } catch (error) {
            console.error("Error fetching featured foods:", error);
            Alert.alert('Error', 'Unable to fetch featured foods.');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (csrfToken) {
                fetchBalance();
                fetchFeaturedFoods();
                fetchUserDetails(); // Add this line

            }
        }, [csrfToken])
    );

    useEffect(() => {
        const checkNotifications = async () => {
            const notificationsRead = await AsyncStorage.getItem('notificationsRead');
            setHasUnreadNotifications(notificationsRead !== 'true');
        };

        checkNotifications();
    }, []);

    const handleNotificationsPress = async () => {
        await AsyncStorage.setItem('notificationsRead', 'true');
        setHasUnreadNotifications(false);
        navigation.navigate("Notif");
    };

    const filterFeatures = () => {
        if (userDetails.is_staff) {
            // Remove 'Top Up', 'Foods', and 'Diet Tracker' features for staff users
            return featuresData.filter(item => item.id !== 1 && item.id !== 2 && item.id !== 3);
        }
        return featuresData;
    };
    
    
    
    function renderUserDetails() {
        return (
            <View style={{  backgroundColor: COLORS.lightGray, borderRadius: 10 }}>
                {/* <Text style={{ ...FONTS.h3, color: COLORS.black, marginBottom: SIZES.base }}>User Details</Text> */}
                
                {/* Vendor Badge */}
                {userDetails.is_staff && (
                    <View style={{
                        backgroundColor: COLORS.primary,
                        // paddingVertical: SIZES.base,
                        paddingHorizontal: SIZES.padding,
                        borderRadius: 20,
                        alignSelf: 'flex-start',
                        // marginBottom: SIZES.base,
                    }}>
                        <Text style={{ ...FONTS.body4, color: COLORS.white }}>Vendor Access</Text>
                    </View>
                )}
                
                
            </View>
        );
    }
    

    
    function renderHeader() {
        return (
            <View style={{ flexDirection: 'row', marginVertical: SIZES.padding*2, marginHorizontal: SIZES.padding * -1 }}>
                <View style={{ flex: 1 }}>
                    <Image
                        source={images.juanbytesLogo}
                        resizeMode="contain"
                        style={{
                            width: 100,
                            height: 100,
                        }}
                    />
                </View>

                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableOpacity
                        style={{
                            height: 40,
                            width: 40,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: COLORS.lightGray
                        }}
                        onPress={handleNotificationsPress}
                    >
                        <Image
                            source={icons.bell}
                            style={{
                                width: 20,
                                height: 20,
                                tintColor: COLORS.secondary
                            }}
                        />
                        {hasUnreadNotifications && (
                            <View
                                style={{
                                    position: 'absolute',
                                    top: -5,
                                    right: -5,
                                    height: 10,
                                    width: 10,
                                    backgroundColor: COLORS.red,
                                    borderRadius: 5
                                }}
                            >
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    function renderUserBalance() {
        return (
            <View
                style={{
                    height: 100,
                    borderRadius: 30,
                    backgroundColor: COLORS.lightGray,
                    paddingHorizontal: SIZES.padding * 3,
                    paddingVertical: SIZES.padding,
                    marginHorizontal: SIZES.padding * -1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: "0px 3px 4.65px rgba(0, 0, 0, 0.2)",
                    elevation: 6,
                }}
            >
                <View>
                    <Text style={{ ...FONTS.body3, color: COLORS.gray }}>Available Balance</Text>
                    <Text style={{ ...FONTS.h2, color: COLORS.black }}>₱{balance}</Text>
                </View>
                <View>
                    <TouchableOpacity
                        style={{
                            width: 35,
                            height: 35,
                            borderRadius: 20,
                            backgroundColor: COLORS.lightorrange,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                        onPress={() => navigation.navigate("SendMoney")}
                    >
                        <Image
                            source={icons.send}
                            resizeMode="contain"
                            style={{
                                width: 20,
                                height: 20,
                                tintColor: COLORS.white
                            }}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    
    function renderFeatures() {
        const Header = () => (
            <View style={{ marginBottom: SIZES.padding * 2 }}>
                <Text style={{ ...FONTS.h3, color: COLORS.black }}>Features</Text>
            </View>
        );

        const renderItem = ({ item }) => (
            <TouchableOpacity
                style={{ marginBottom: SIZES.padding * 2, marginHorizontal: SIZES.padding * -1, width: 60, alignItems: 'center' }}
                onPress={() => {
                    if (item.screen) {
                        navigation.navigate(item.screen);
                    } else {
                        console.log(item.description);
                    }
                }}
            >
                <View
                    style={{
                        height: 50,
                        width: 50,
                        marginBottom: 5,
                        borderRadius: 20,
                        backgroundColor: item.backgroundColor,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.15,
                        shadowRadius: 2.84,
                        elevation: 3,
                    }}
                >
                    <Image
                        source={item.icon}
                        resizeMode="contain"
                        style={{
                            height: 20,
                            width: 20,
                            tintColor: item.color
                        }}
                    />
                </View>
                <Text style={{ color: COLORS.black, textAlign: 'center', flexWrap: 'wrap', ...FONTS.body4 }}>{item.description}</Text>
            </TouchableOpacity>
        );

        return (
            <FlatList
                ListHeaderComponent={Header}
                data={filterFeatures()}
                numColumns={4}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                renderItem={renderItem}
                style={{ marginTop: SIZES.padding * 2 }}
            />
        );
    }

    function renderPromos() {
        const HeaderComponent = () => (
            <View>
                {renderHeader()}
                {renderUserDetails()}
                {renderUserBalance()}
                {renderFeatures()}
                {renderPromoHeader()}
                
            </View>
        );

        const renderPromoHeader = () => {
            // Check if userDetails.is_staff is true
            if (userDetails.is_staff) {
                // Do not render the header
                return null;
            }
        
            // Render the header if userDetails.is_staff is false
            return (
                <View
                    style={{
                        flexDirection: 'row',
                        marginBottom: SIZES.padding
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={{ ...FONTS.h3, color: COLORS.black }}>Order Now!</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate("FeaturedFoods")}>
                        <Text style={{ color: COLORS.primary, ...FONTS.body4 }}>View All</Text>
                    </TouchableOpacity>
                </View>
            );
        };
        
        const renderItem = ({ item }) => {
            // Check if userDetails.is_staff is true
            if (userDetails.is_staff) {
                // Do not render the item
                return null;
            }
        
            // Render the item if userDetails.is_staff is false
            return (
                <TouchableOpacity
                    style={{ paddingVertical: SIZES.base, width: SIZES.width / 2.2, paddingHorizontal: SIZES.base, marginHorizontal: SIZES.padding * -2 }}
                    onPress={() => navigation.navigate("OrderCreate", { meal: item.food, canteenName: item.canteenName })}
                >
                    <View
                        style={{
                            height: 150,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            backgroundColor: COLORS.lightGray,
                            boxShadow: "0px 3px 4.65px rgba(0, 0, 0, 0.2)",
                            elevation: 6,
                        }}
                    >
                        <Image
                            source={images.promoBanner}
                            resizeMode="cover"
                            style={{
                                width: "100%",
                                height: "100%",
                                borderTopLeftRadius: 20,
                                borderTopRightRadius: 20,
                            }}
                        />
                    </View>
                    <View
                        style={{
                            padding: SIZES.padding,
                            backgroundColor: COLORS.white,
                            borderBottomLeftRadius: 20,
                            borderBottomRightRadius: 20,
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                        }}
                    >
                        <Text style={{ ...FONTS.h4, color: COLORS.black }}>{item.food.name}</Text>
                        <Text style={{ ...FONTS.body4, color: COLORS.black }}>{item.food.description}</Text>
                    </View>
                </TouchableOpacity>
            );
        };
        

        return (
            <FlatList
                ListHeaderComponent={HeaderComponent}
                contentContainerStyle={{ paddingHorizontal: SIZES.padding * 4 }}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                data={specialPromos}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                    <View style={{ marginBottom: 80 }} />
                }
            />
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white, marginBottom: SIZES.padding }}>
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ ...FONTS.h3 }}>Loading...</Text>
                </View>
            ) : (
                renderPromos()
            )}
        </SafeAreaView>
    );
};

export default Home;
