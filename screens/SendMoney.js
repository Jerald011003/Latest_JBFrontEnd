import React, { useState, useEffect } from "react";
import { Alert, SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { COLORS, SIZES, FONTS, icons } from "../constants";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SendMoney = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState(null);
    const [csrfToken, setCsrfToken] = useState('');
    const [recipientPhoneNumber, setRecipientPhoneNumber] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [password, setPassword] = useState('');

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

    // Fetch Balance and User Information
    useEffect(() => {
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
            } catch (error) {
                console.error("Error fetching balance:", error);
                Alert.alert('Error', 'Unable to fetch balance.');
            }
        };

        if (csrfToken) {
            fetchBalance();
        }
    }, [csrfToken]);

    const handleTransfer = async () => {
        if (!password) {
            Alert.alert('Error', 'Please enter your password.');
            return;
        }
    
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken || !csrfToken) {
                console.error('Token or CSRF Token not available');
                return;
            }
    
            const passwordResponse = await fetch('http://192.168.100.107:8000/verify-password/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });
    
            if (passwordResponse.status === 200) {
                const transferData = {
                    recipient_phone_number: recipientPhoneNumber,
                    amount: parseFloat(transferAmount),
                };
    
                const transferResponse = await fetch('http://192.168.100.107:8000/transfer/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'X-CSRFToken': csrfToken,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(transferData)
                });
    
                const transferResult = await transferResponse.json();
    
                if (transferResponse.status === 200) {
                    Alert.alert('Success', transferResult.message);
                    setShowPasswordPrompt(false); // Hide the password prompt
    
                    // Reload the screen to reflect the new balance
                    navigation.replace('SendMoney');
                }
            } else {
                Alert.alert('Error', 'Incorrect password.');
            }
        } catch (error) {
            console.error('Error during transfer:', error);
    
            if (error.response && error.response.data && error.response.data.error) {
                const errorMessage = error.response.data.error;
                if (errorMessage === 'Cannot transfer money to yourself') {
                    Alert.alert('Error', errorMessage);
                } else {
                    Alert.alert('Error', 'Unable to complete the transfer.');
                }
            } else {
                Alert.alert('Error', 'Unable to complete the transfer.');
            }
        }
    };
    

    const handleAmountChange = (text) => {
        const cleanedText = text.replace(/[^0-9.]/g, '');

        const parts = cleanedText.split('.');
        if (parts.length > 2) {
            return;
        }

        const formattedText = parts[0] + (parts[1] ? `.${parts[1].slice(0, 2)}` : '');
        setTransferAmount(formattedText);
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
                    <Text style={styles.title}>Send Money</Text>
                </View>

                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => console.log("Settings")}
                >
                    {/* <Image
                        source={icons.settings}
                        style={styles.icon}
                    /> */}
                </TouchableOpacity>
            </View>
        );
    }

    const handleShowPasswordPrompt = () => {
        if (recipientPhoneNumber && transferAmount) {
            setShowPasswordPrompt(true);
        } else {
            Alert.alert('Error', 'Please fill in phone number and amount.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <View style={styles.content}>
                <View style={styles.balanceContainer}>
                    <Text style={styles.balanceLabel}>Available Balance</Text>
                    <Text style={{ ...FONTS.h2, color: COLORS.black }} >₱{balance}</Text>
                </View>

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Phone Number"
                        keyboardType="phone-pad"
                        value={recipientPhoneNumber}
                        placeholderTextColor={COLORS.gray}
                        onChangeText={setRecipientPhoneNumber}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Amount"
                        keyboardType="numeric"
                        value={transferAmount}
                        placeholderTextColor={COLORS.gray}
                        onChangeText={handleAmountChange}
                    />
                    {showPasswordPrompt ? (
                        <View style={styles.passwordPrompt}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Password"
                                secureTextEntry
                                value={password}
                                placeholderTextColor={COLORS.gray}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleTransfer}
                            >
                                <Text style={styles.buttonText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.button, (!recipientPhoneNumber || !transferAmount) && { opacity: 0.5 }]}
                            onPress={handleShowPasswordPrompt}
                            disabled={!recipientPhoneNumber || !transferAmount}
                        >
                            <Text style={styles.buttonText}>Send</Text>
                        </TouchableOpacity>
                    )}
                </View>
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
        marginVertical: SIZES.padding * 4,
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
        color: 'black',

    },
    balanceContainer: {
        marginBottom: SIZES.padding * 2,
        paddingVertical: SIZES.padding,
        paddingHorizontal: SIZES.padding * 2,
        borderRadius: 10,
        backgroundColor: COLORS.lightGray,
        boxShadow: "0px 3px 4.65px rgba(0, 0, 0, 0.2)",
        elevation: 3,
  
    },
    balanceLabel: {
        ...FONTS.body3,
        color: COLORS.gray,
        
    },
    balanceAmount: {
        ...FONTS.h2,
        color: COLORS.black,
        backgroundColor: COLORS.black,

    },
    form: {
        borderRadius: 10,
        backgroundColor: COLORS.lightGray,
        padding: SIZES.padding * 2,
        color: 'black',


    },
    input: {
        height: 50,
        marginBottom: SIZES.padding,
        paddingHorizontal: SIZES.padding,
        borderRadius: 10,
        backgroundColor: COLORS.white,
        borderColor: COLORS.gray,
        borderWidth: 1,
        ...FONTS.body4,
        color: 'black',
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.padding,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
   

    },
    buttonText: {
        color: COLORS.white,
        ...FONTS.h3,
        
    },
    passwordPrompt: {
        marginTop: SIZES.padding * 2,
    }
});

export default SendMoney;
