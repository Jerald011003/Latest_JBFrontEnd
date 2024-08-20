import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from "react-native";
import { COLORS, SIZES, FONTS, icons } from "../../../constants";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AllCanteens = ({ route }) => {
    const { canteenId, canteenName } = route.params;
    const navigation = useNavigation();
    const [categories, setCategories] = useState([]);
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

    const fetchCategories = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken || !csrfToken) {
                console.error('Access token or CSRF token not available');
                return;
            }

            const response = await fetch(`http://192.168.100.107:8000/canteens/${canteenId}/categories/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (csrfToken) {
            fetchCategories();
        }
    }, [csrfToken]);

    const getIcon = (categoryName) => {
        switch (categoryName) {
            case 'Main Course':
                return icons.maincourse;
            case 'Beverages':
                return icons.beverages;
            case 'Snacks':
                return icons.snacks;
            default:
                return icons.otherfoods;
        }
    };

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
                    <Text style={styles.title}>{canteenName}</Text>
                </View>
            </View>
        );
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => navigation.navigate("AllFoods", { categoryId: item.id, categoryName: item.name, canteenName: canteenName })}
        >
            <View style={styles.iconContainer}>
                <Image
                    source={getIcon(item.name)}
                    style={styles.icon}
                />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{item.name}</Text>
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
                data={categories}
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
        paddingHorizontal: SIZES.padding ,
    },
    cardContainer: {
        marginVertical: SIZES.shortbase,
        marginHorizontal: SIZES.padding,
        padding: SIZES.padding * 4,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        alignItems: 'center',
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
    iconContainer: {
        marginBottom: SIZES.base,
    },
    icon: {
        height: 30,
        width: 30,
    },
    textContainer: {
        alignItems: 'center',
    },
    cardTitle: {
        ...FONTS.h4,
        color: COLORS.black,
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

export default AllCanteens;
