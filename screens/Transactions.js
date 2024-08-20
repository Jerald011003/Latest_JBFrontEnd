import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, FlatList, Image, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { COLORS, SIZES, FONTS, icons } from "../constants";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Transactions = ({ navigation }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [csrfToken, setCsrfToken] = useState('');
    const [accessToken, setAccessToken] = useState('');

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

    // Fetch Access Token
    useEffect(() => {
        const fetchAccessToken = async () => {
            try {
                const token = await AsyncStorage.getItem('accessToken');
                setAccessToken(token);
            } catch (error) {
                console.error('Error fetching access token', error);
            }
        };

        fetchAccessToken();
    }, []);

    // Fetch Transactions
    const fetchTransactions = async () => {
        try {
            if (!accessToken || !csrfToken) {
                console.error('Token or CSRF Token not available');
                return;
            }
    
            const response = await fetch('http://192.168.100.107:8000/transactions/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-CSRFToken': csrfToken
                }
            });

            if (response.ok) {
                const data = await response.json();
                const sortedTransactions = data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setTransactions(sortedTransactions);
            } else {
                throw new Error('Failed to fetch transactions');
            }

            setLoading(false);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            Alert.alert('Error', 'Unable to fetch transactions.');
            setLoading(false);
        }
    };    

    useEffect(() => {
        if (accessToken && csrfToken) {
            fetchTransactions();
        }
    }, [accessToken, csrfToken]);

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
                    <Text style={styles.title}>Transactions</Text>
                </View>
            </View>
        );
    }

    const renderTransactionItem = ({ item, index }) => (
        <View style={styles.transactionItem}>
            <Text style={styles.transactionDate}>{item.date}</Text>
            <Text style={styles.transactionDescription}>{`Send Money to ${item.recipient}`}</Text>
            <Text style={styles.transactionDescription}>{`Send Money from ${item.sender}`}</Text>
            <Text style={[styles.transactionAmount, item.amount < 0 ? styles.debit : styles.credit]}>
                {item.amount}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <Text>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }
    
    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <Text>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }
    

    return (
        <SafeAreaView style={styles.container}>
        {renderHeader()}
        <FlatList
            contentContainerStyle={styles.listContainer}
            data={transactions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderTransactionItem}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<View style={styles.footer}></View>}
        />
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
    listContainer: {
        paddingHorizontal: SIZES.padding * 3,
    },
    transactionItem: {
        padding: SIZES.padding,
        marginVertical: SIZES.base,
        borderRadius: 10,
        backgroundColor: COLORS.lightGray,
        boxShadow: "0px 3px 4.65px rgba(0, 0, 0, 0.2)",
        elevation: 3,
    },
    transactionDate: {
        ...FONTS.body4,
        color: COLORS.gray,
    },
    transactionDescription: {
        ...FONTS.body3,
        color: COLORS.black,
    },
    transactionAmount: {
        ...FONTS.h4,
        marginTop: 5,
    },
    debit: {
        color: COLORS.red,
    },
    credit: {
        color: COLORS.green,
    },
    footer: {
        marginBottom: 80,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Transactions;
