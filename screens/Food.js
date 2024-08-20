import React, { useState, useEffect } from 'react';
import {
    SafeAreaView, View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator
} from 'react-native';
import { COLORS, SIZES, FONTS, icons, images } from '../constants';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Food = () => {
    const navigation = useNavigation();
    const [canteens, setCanteens] = useState([]);
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
    }, []); // Empty dependency array to ensure this runs only once

    const fetchCanteens = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken || !csrfToken) {
                console.error('Access token or CSRF token not available');
                return;
            }

            const response = await fetch('http://192.168.100.107:8000/canteens/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            setCanteens(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching canteens:", error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            if (csrfToken) {
                fetchCanteens();
            }
        }, [csrfToken])
    );

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
                    <Text style={styles.title}>Choose your Canteen</Text>
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

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => navigation.navigate('AllCanteens', { canteenId: item.id, canteenName: item.name })}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={images.promoBanner}
                    resizeMode="cover"
                    style={styles.image}
                />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
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
                data={canteens}
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
        paddingHorizontal: SIZES.padding,
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
    listContainer: {
        paddingHorizontal: SIZES.padding,
    },
    cardContainer: {
        marginHorizontal: SIZES.padding,
        marginVertical: SIZES.base,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: COLORS.white,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    imageContainer: {
        height: 180,
        backgroundColor: COLORS.lightGray,

        overflow: 'hidden',
    },
    image: {
        width: "100%",
        height: "100%",
        // borderTopLeftRadius: 20,
        // borderTopRightRadius: 20,
        // resizeMode: "cover",
    },
    textContainer: {
        padding: SIZES.padding,
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    cardTitle: {
        ...FONTS.h4,
        color: COLORS.black,
    },
    cardDescription: {
        ...FONTS.body4,
        color: COLORS.gray,
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

export default Food;
