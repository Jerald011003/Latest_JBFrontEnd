import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, FlatList } from "react-native";
import { COLORS, SIZES, FONTS, icons } from "../constants";
import AsyncStorage from '@react-native-async-storage/async-storage';

const TopUp = ({ navigation }) => {
    const [depositAmount, setDepositAmount] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('0.00');
    const [feeAmount, setFeeAmount] = useState('0.00');
    const [csrfToken, setCsrfToken] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [topUpStatus, setTopUpStatus] = useState(null);
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [canPay, setCanPay] = useState(true);
    const [topUpRequests, setTopUpRequests] = useState([]);
    const [userId, setUserId] = useState(null);
    const [userDetails, setUserDetails] = useState({});
    
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

        const fetchAccessToken = async () => {
            try {
                const token = await AsyncStorage.getItem('accessToken');
                setAccessToken(token);
            } catch (error) {
                console.error('Error fetching access token', error);
            }
        };

        fetchCsrfToken();
        fetchAccessToken();
    }, []);

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!accessToken || !csrfToken) return;

            try {
                const response = await fetch('http://192.168.100.107:8000/details/', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'X-CSRFToken': csrfToken,
                    },
                });
                const data = await response.json();
                setUserId(data.id); // Assuming response contains user ID
                setUserDetails(data);
            } catch (error) {
                console.error("Error fetching user details:", error);
                Alert.alert('Error', 'Unable to fetch user details.');
            }
        };

        fetchUserDetails();
    }, [csrfToken, accessToken]);

    useEffect(() => {
        const fetchBalance = async () => {
            if (!accessToken || !csrfToken) return;

            try {
                const response = await fetch('http://192.168.100.107:8000/balance/', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'X-CSRFToken': csrfToken,
                    },
                });
                const data = await response.json();
                const balance = parseFloat(data.balance).toFixed(2);
                const formattedBalance = Number(balance).toLocaleString();
                setBalance(formattedBalance);
            } catch (error) {
                console.error("Error fetching balance:", error);
                Alert.alert('Error', 'Unable to fetch balance.');
            }
        };

        fetchBalance();
    }, [csrfToken, accessToken]);

    useEffect(() => {
        const fetchTopUpRequests = async () => {
            if (!accessToken || !csrfToken) return;
    
            try {
                const response = await fetch('http://192.168.100.107:8000/top-up-requests/', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'X-CSRFToken': csrfToken,
                    },
                });
                const data = await response.json();
                // Filter requests where the user's first name matches the top-up request's user_first_name
                const userRequests = data.filter(request => request.user_first_name === userDetails.first_name);
    
                setTopUpRequests(userRequests);
            } catch (error) {
                console.error("Error fetching top-up requests:", error);
                Alert.alert('Error', 'Unable to fetch top-up requests.');
            }
        };
        
        fetchTopUpRequests();
    }, [csrfToken, accessToken, userDetails.first_name]); // Added userDetails.first_name as a dependency
    

    const handleTopUp = async () => {
        if (!accessToken || !csrfToken) {
            Alert.alert('Error', 'Tokens not available');
            return;
        }
    
        setLoading(true);
        setCanPay(false);
    
        try {
            const response = await fetch('http://192.168.100.107:8000/top-up-requests/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: parseFloat(depositAmount),
                }),
            });
            const data = await response.json();
            const { is_approved } = data;
            setTopUpStatus(is_approved ? "Top-up request approved. Please pay at the finance office." : "Top-up request submitted. Awaiting approval.");
            Alert.alert('Success', 'Top-up request submitted.');
    
            // Reload the screen
            navigation.navigate('TopUp');
        } catch (error) {
            console.error('Error submitting top-up request:', error);
            Alert.alert('Error', 'Unable to submit top-up request.');
            setCanPay(true);
        } finally {
            setLoading(false);
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
                    <Text style={styles.title}>Top Up</Text>
                </View>
            </View>
        );
    }

    function renderTopUpForm() {
        const feePercentage = 0.05;

        return (
            <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Top-Up Money</Text>
                <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={depositAmount}
                    placeholderTextColor={COLORS.gray}
                    onChangeText={text => {
                        const amount = parseFloat(text) || 0;
                        const fee = amount * feePercentage;
                        setDepositAmount(text);
                        setFeeAmount(fee.toFixed(2));
                        setPaymentAmount((amount + fee).toFixed(2));
                    }}
                />

                <View style={styles.amountContainer}>
                    <View>
                        <Text style={styles.amountLabel}>Fee:</Text>
                        <Text style={styles.amountLabel}>Total Amount to Pay:</Text>
                    </View>
                    <View>
                        <Text style={styles.amountValue}>₱{feeAmount || "0.00"}</Text>
                        <Text style={styles.amountValue}>₱{paymentAmount || "0.00"}</Text>
                    </View>
                </View>

                {topUpStatus && (
                    <View style={styles.statusContainer}>
                        <Text style={styles.statusText}>{topUpStatus}</Text>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.button, !canPay && styles.buttonDisabled]}
                    onPress={handleTopUp}
                    disabled={!canPay}
                >
                    <Text style={styles.buttonText}>{loading ? "Processing..." : "Pay"}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    function renderTopUpRequests() {
        const renderItem = ({ item }) => (
            <View style={styles.requestContainer} key={item.id ? item.id.toString() : item.toString()}>
                <Text style={styles.requestText}>Name: {item.user_first_name}</Text>
                <Text style={styles.requestText}>Amount: ₱{item.amount}</Text>
                <Text style={styles.requestText}>
                    Date: {new Date(item.created_at).toLocaleDateString()} 
                    {' '}
                    {new Date(item.created_at).toLocaleTimeString()} {/* Added time */}
                </Text>
                <Text style={styles.requestText}>Status: {item.is_approved ? "Approved" : "Pending"}</Text>
            </View>
        );
    
        return (
            <View style={styles.requestsSection}>
                <FlatList
                    data={topUpRequests}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
                    contentContainerStyle={styles.requestsList}
                />
            </View>
        );
    }
    
    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Available Balance:</Text>
                <Text style={styles.balanceValue}>₱{balance || "0.00"}</Text>
            </View>
            {renderTopUpForm()}
            {renderTopUpRequests()}
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
        marginVertical: SIZES.padding * 5, // Reduced margin
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
    formContainer: {
        marginVertical: SIZES.padding, // Adjusted margin
        paddingHorizontal: SIZES.padding * 3,
    },
    formTitle: {
        ...FONTS.h4,
        color: COLORS.black,
        marginBottom: SIZES.base,
    },
    input: {
        height: 50,
        borderColor: COLORS.gray,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: SIZES.base,
        paddingHorizontal: SIZES.padding,
        fontSize: SIZES.body3,
        color: COLORS.black,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: SIZES.base,
        padding: SIZES.padding,
        borderRadius: 10,
        backgroundColor: COLORS.lightGray,
        boxShadow: "0px 3px 4.65px rgba(0, 0, 0, 0.2)",
        elevation: 6,
    },
    amountLabel: {
        ...FONTS.body4,
        color: COLORS.gray,
    },
    amountValue: {
        ...FONTS.h4,
        color: COLORS.black,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.base,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: COLORS.gray,
    },
    buttonText: {
        color: COLORS.white,
        ...FONTS.h4,
    },
    statusContainer: {
        marginVertical: SIZES.base,
        padding: SIZES.padding,
        borderRadius: 10,
        backgroundColor: COLORS.lightGray,
        alignItems: 'center',
    },
    statusText: {
        ...FONTS.body4,
        color: COLORS.gray,
    },
    balanceContainer: {
        paddingHorizontal: SIZES.padding * 3,
        paddingVertical: SIZES.padding,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray,
        backgroundColor: COLORS.lightGray,
        alignItems: 'center',
    },
    balanceLabel: {
        ...FONTS.body4,
        color: COLORS.gray,
    },
    balanceValue: {
        ...FONTS.h4,
        color: COLORS.black,
    },
    requestContainer: {
        padding: SIZES.padding,
        marginBottom: SIZES.base,
        borderRadius: 10,
        backgroundColor: COLORS.lightGray,
        boxShadow: "0px 3px 4.65px rgba(0, 0, 0, 0.2)",
        elevation: 6,
    },
    requestText: {
        ...FONTS.body4,
        color: COLORS.gray,
        marginBottom: SIZES.base / 2,
    },
    requestsList: {
        paddingHorizontal: SIZES.padding * 1,
    },
    requestsSection: {
        marginVertical: SIZES.padding, // Reduced margin
        paddingHorizontal: SIZES.padding * 3,
    },
});

export default TopUp;
