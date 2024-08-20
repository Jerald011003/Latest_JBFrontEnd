import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONTS, icons } from "../constants";

const FeaturedFoods = ({ navigation }) => {
    const [featuredFoods, setFeaturedFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [csrfToken, setCsrfToken] = useState('');

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

    useEffect(() => {
        const fetchFeaturedFoods = async () => {
            try {
                const accessToken = await AsyncStorage.getItem('accessToken');
                if (!accessToken || !csrfToken) {
                    console.error('Token or CSRF Token not available');
                    return;
                }

                const response = await fetch('http://192.168.100.107:8000/featured-foods/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'X-CSRFToken': csrfToken,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                setFeaturedFoods(data);
            } catch (error) {
                console.error("Error fetching featured foods:", error);
                Alert.alert('Error', 'Unable to fetch featured foods.');
            } finally {
                setLoading(false);
            }
        };

        if (csrfToken) {
            fetchFeaturedFoods();
        }
    }, [csrfToken]);

    function renderHeader() {
        return (
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
                    <Text style={styles.title}>Featured Foods</Text>
                </View>

                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => console.log("Settings")}
                >
                    <Image
                        source={icons.settings}
                        style={styles.icon}
                    />
                </TouchableOpacity>
            </View>
        );
    }

    function renderFeaturedFood({ item }) {
        return (
            <View style={styles.foodItem}>
                <Text style={styles.foodName}>{item.food.name}</Text>
                <Text style={styles.foodDescription}>{item.food.description}</Text>
                <Text style={styles.foodPrice}>₱{item.food.price}</Text>
                <Text style={styles.foodVendor}>Vendor Phone no.: {item.food.vendor_phone_number || "Vendor information not available"}</Text>
                <TouchableOpacity
                    style={styles.buyNowButton}
                    onPress={() => navigation.navigate('OrderCreate', { meal: item.food, canteenName: 'CanteenName' })}
                >
                    <Text style={styles.buyNowButtonText}>Buy Now</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <View style={styles.content}>
                {loading ? (
                    <Text>Loading...</Text>
                ) : (
                    <FlatList
                        data={featuredFoods}
                        keyExtractor={item => item.food.id.toString()}
                        renderItem={renderFeaturedFood}
                        contentContainerStyle={styles.foodList}
                        numColumns={2}
                        columnWrapperStyle={styles.columnWrapper}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        marginVertical: SIZES.padding * 5,
        paddingHorizontal: SIZES.padding * 3,
        alignItems: 'center',
    },
    iconButton: {
        width: 45,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        height: 20,
        width: 20,
        tintColor: COLORS.black,
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
    content: {
        paddingHorizontal: SIZES.padding * 3,
        flex: 1,
    },
    foodItem: {
        flex: 1,
        padding: SIZES.padding,
        margin: SIZES.base,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: 10,
        backgroundColor: COLORS.white,
        boxShadow: "0px 3px 4.65px rgba(0, 0, 0, 0.2)",
        elevation: 3,
    },
    foodName: {
        ...FONTS.body3,
        color: COLORS.black,
    },
    foodDescription: {
        ...FONTS.body4,
        color: COLORS.gray,
    },
    foodPrice: {
        ...FONTS.body4,
        color: COLORS.primary,
    },
    foodVendor: {
        ...FONTS.body4,
        color: COLORS.gray,
    },
    buyNowButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: SIZES.padding,
        paddingHorizontal: SIZES.base,
        marginTop: SIZES.padding,
    },
    buyNowButtonText: {
        textAlign: 'center',
        color: COLORS.white,
        ...FONTS.body3,
    },
    foodList: {
        marginBottom: SIZES.padding * 3,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
});

export default FeaturedFoods;
