import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS, images, icons } from "../../../constants";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AllFoods = ({ route }) => {
    const { categoryId, categoryName, canteenName } = route.params;
    const navigation = useNavigation();
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [csrfToken, setCsrfToken] = useState('');

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

    const fetchMeals = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken || !csrfToken) {
                console.error('Access token or CSRF token not available');
                return;
            }

            const response = await fetch(`http://192.168.100.107:8000/categories/${categoryId}/foods/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            setMeals(data);
        } catch (error) {
            console.error("Error fetching meals:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (csrfToken) {
            fetchMeals();
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
                    <Text style={styles.title}>{categoryName} at {canteenName}</Text>
                </View>
            </View>
        );
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => navigation.navigate("OrderCreate", { meal: item, canteenName })}
        >
            <View style={styles.imageContainer}>
                <Image source={images.promoBanner} style={styles.image} />
            </View>
            <View style={styles.textContainer}>
                <View style={styles.vendorContainer}>
                    <Image source={images.juanbytesLogo} style={styles.vendorLogo} />
                </View>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardPrice}>₱{item.price}</Text>
                <Text style={styles.vendorName}>{item.vendor}</Text>

            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <FlatList
                contentContainerStyle={styles.listContainer}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                data={meals}
                keyExtractor={item => `${item.id}`}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={<View style={styles.footer} />}
            />
        </SafeAreaView>
    );
}

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
    icon: {
        height: 20,
        width: 20,
        tintColor: COLORS.black,
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
    listContainer: {
        paddingHorizontal: SIZES.padding * 3,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    cardContainer: {
        marginVertical: SIZES.base,
        width: SIZES.width / 2.2,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 3,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        padding: SIZES.padding,
    },
    imageContainer: {
        width: '100%',
        height: 100,
        marginBottom: SIZES.base,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    textContainer: {
        alignItems: 'center',
    },
    cardTitle: {
        ...FONTS.h5,
        color: COLORS.black,
        marginBottom: SIZES.base / 2,
    },
    cardPrice: {
        ...FONTS.h5,
        color: COLORS.black,
        marginBottom: SIZES.base,
    },
    vendorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    vendorLogo: {
        width: 40,
        height: 40,
        resizeMode: 'contain',


    },
    vendorName: {
        ...FONTS.body5,
        color: COLORS.gray,
        // backgroundColor: COLORS.primary,
        // padding: SIZES.shortbase,
        // borderRadius: 20,
        // alignSelf: 'flex-start',
    },
    footer: {
        marginBottom: 80,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AllFoods;
