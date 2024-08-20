import React, { useState, useEffect } from "react";
import { Alert, SafeAreaView, View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { COLORS, SIZES, FONTS, icons, images } from "../constants";
import AsyncStorage from '@react-native-async-storage/async-storage';

const User = ({ navigation }) => {
    const [userDetails, setUserDetails] = useState({});
    const [csrfToken, setCsrfToken] = useState('');

    const user = {
        name: "Juan Dela Cruz",
        profilePic: images.promoBanner, // Replace with actual image source
        profileLimits: "Basic",
        linkedAccounts: [
            { type: "Bank Account", value: "**** 1234" },
            { type: "Paypal", value: "example@paypal.com" }
        ],
        qrCodes: "View QR Code",
        nfcTag: "View NFC Tag",
        juanByteScore: "1234",
        isBetaFeature: true
    };

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
        const fetchUserDetails = async () => {
            try {
                const accessToken = await AsyncStorage.getItem('accessToken');
                if (!accessToken || !csrfToken) {
                    console.error('Token or CSRF Token not available');
                    return;
                }
    
                const response = await fetch('http://192.168.100.107:8000/details/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'X-CSRFToken': csrfToken,
                        'Content-Type': 'application/json',
                    }
                });
                const data = await response.json();
                setUserDetails(data);
            } catch (error) {
                console.error("Error fetching user details:", error);
                Alert.alert('Error', 'Unable to fetch user details.');
            }
        };
    
        if (csrfToken) {
            fetchUserDetails();
        }
    }, [csrfToken]);

    const handleSignOut = async () => {
        try {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }], // Ensure navigation resets to Login screen
            });
        } catch (error) {
            console.error('Error signing out', error);
            Alert.alert('Error', 'Unable to sign out.');
        }
    };

    // Helper function to capitalize the first letter
    const capitalizeFirstLetter = (string) => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };

    // Combine names and capitalize the first letter
    const firstName = capitalizeFirstLetter(userDetails.first_name);
    const lastName = capitalizeFirstLetter(userDetails.last_name);
    const fullName = `${firstName} ${lastName}`;

    function renderProfile() {
        return (
            <View style={styles.profileContainer}>
                <Image source={user.profilePic} style={styles.profilePic} />
                <Text style={styles.userName}>{fullName}</Text>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Profile")}>
                    <Text style={styles.buttonText}>View Profile</Text>
                </TouchableOpacity>
            </View>
        );
    }

    function renderProfileLimits() {
        return (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Profile Limits</Text>
                <Text style={styles.cardContent}>{user.profileLimits}</Text>
            </View>
        );
    }

    function renderLinkedAccounts() {
        return (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Linked Accounts</Text>
                {user.linkedAccounts.map((account, index) => (
                    <Text key={index} style={styles.cardContent}>
                        {account.type}: {account.value}
                    </Text>
                ))}
            </View>
        );
    }

    function renderQrCodes() {
        return (
            <TouchableOpacity style={styles.card} onPress={() => console.log("View QR Code")}>
                <Text style={styles.cardTitle}>My QR Codes</Text>
                <Text style={styles.cardContent}>{user.qrCodes}</Text>
            </TouchableOpacity>
        );
    }

    function renderNfcTag() {
        return (
            <TouchableOpacity style={styles.card} onPress={() => console.log("View NFC Tag")}>
                <Text style={styles.cardTitle}>NFC Tag Linked</Text>
                <Text style={styles.cardContent}>{user.nfcTag}</Text>
            </TouchableOpacity>
        );
    }

    function renderJuanByteScore() {
        return (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>JuanByte Score</Text>
                <Text style={styles.cardContent}>{user.juanByteScore}</Text>
            </View>
        );
    }

    function renderBetaFeatures() {
        return (
            user.isBetaFeature && (
                <View style={styles.card}>
                    <TouchableOpacity style={styles.button} onPress={() => console.log("Verify Account")}>
                        <Text style={styles.buttonText}>Verify Account (Beta)</Text>
                    </TouchableOpacity>
                </View>
            )
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
            >
                {renderProfile()}
                {renderProfileLimits()}
                {renderLinkedAccounts()}
                {renderQrCodes()}
                {renderNfcTag()}
                {renderJuanByteScore()}
                {renderBetaFeatures()}
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Text style={styles.signOutButtonText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    profileContainer: {
        alignItems: 'center',
        marginVertical: SIZES.padding * 7,
    },
    profilePic: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: COLORS.primary,
        marginBottom: SIZES.base,
    },
    userName: {
        ...FONTS.h2,
        color: COLORS.black,
        marginBottom: SIZES.base,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.base,
        paddingHorizontal: SIZES.padding * 2,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: COLORS.white,
        ...FONTS.h4,
    },
    card: {
        backgroundColor: COLORS.lightGray,
        marginVertical: SIZES.base,
        padding: SIZES.padding,
        borderRadius: 10,
        boxShadow: "0px 3px 4.65px rgba(0, 0, 0, 0.2)",
        elevation: 6,
    },
    cardTitle: {
        ...FONTS.h4,
        color: COLORS.black,
        marginBottom: SIZES.base,
    },
    cardContent: {
        ...FONTS.body4,
        color: COLORS.gray,
    },
    scrollContainer: {
        paddingHorizontal: SIZES.padding * 2.5,
        paddingBottom: SIZES.padding * 5,
    },
    signOutButton: {
        backgroundColor: COLORS.red, // Change to your desired color
        paddingVertical: SIZES.base,
        paddingHorizontal: SIZES.padding * 2,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: SIZES.padding * 2,
    },
    signOutButtonText: {
        color: COLORS.white,
        ...FONTS.h4,
    },
});

export default User;
