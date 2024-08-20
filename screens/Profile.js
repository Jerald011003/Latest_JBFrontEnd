import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, Image, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView } from "react-native";
import { COLORS, SIZES, FONTS, icons, images } from "../constants";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = ({ navigation }) => {
    const [userDetails, setUserDetails] = useState({});
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
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
                        'X-CSRFToken': csrfToken
                    }
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                setUserDetails(data);
                setHeight(data.height);
                setWeight(data.weight);
            } catch (error) {
                console.error("Error fetching user details:", error);
                Alert.alert('Error', 'Unable to fetch user details.');
            }
        };

        if (csrfToken) {
            fetchUserDetails();
        }
    }, [csrfToken]);

    const handleUpdate = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken || !csrfToken) {
                console.error('Token or CSRF Token not available');
                return;
            }
    
            const response = await fetch('http://192.168.100.107:8000/update-height-weight/', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    height: parseFloat(height),
                    weight: parseFloat(weight),
                }),
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
            setUserDetails(data);
            Alert.alert('Success', 'Profile updated successfully.');
            navigation.navigate('Home'); // Navigate to the 'User' screen
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert('Error', 'Unable to update profile.');
        }
    };
    

    // Calculate BMI
    const calculateBMI = () => {
        const heightInMeters = parseFloat(height) / 100; // assuming height is in cm
        const weightInKg = parseFloat(weight);
        if (heightInMeters && weightInKg) {
            return (weightInKg / (heightInMeters * heightInMeters)).toFixed(2);
        }
        return "N/A";
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
                    <Text style={styles.title}>Profile</Text>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* <View style={styles.profileContainer}>
                    <Image source={userDetails.profilePic || images.promoBanner} style={styles.profilePic} />
                    <Text style={styles.userName}>{`${userDetails.first_name} ${userDetails.last_name}`}</Text>
                </View> */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Profile Details</Text>
                    <Text style={styles.detailText}>First Name: {userDetails.first_name}</Text>
                    <Text style={styles.detailText}>Last Name: {userDetails.last_name}</Text>
                    <Text style={styles.detailText}>Phone Number: {userDetails.phone_number}</Text>
                    <Text style={styles.detailText}>Email: {userDetails.email}</Text>
                    
                    <Text style={styles.detailText}>Balance: {userDetails.balance}</Text>
                   
                    <Text style={styles.detailText}>Date Joined: {userDetails.date_joined}</Text>

                    <Text style={styles.detailText}>
                        Vendor: {userDetails.is_staff ? '✔️' : '❌'}
                    </Text>
                    
                    <TextInput
                        style={styles.input}
                        placeholder={userDetails.height ? `${userDetails.height}` : 'Enter height'}
                        value={height}
                        onChangeText={setHeight}
                        placeholderTextColor={COLORS.black}
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder={userDetails.weight ? `${userDetails.weight}` : 'Enter weight'}
                        value={weight}
                        onChangeText={setWeight}
                        placeholderTextColor={COLORS.black}
                        keyboardType="numeric"
                    />
                    <Text style={styles.bmiText}>BMI: {userDetails.bmi}</Text>
                    <TouchableOpacity style={styles.button} onPress={handleUpdate}>
                        <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
                color: 'black',

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
    profileContainer: {
        alignItems: 'center',
        marginVertical: SIZES.padding * 2,
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
    card: {
        backgroundColor: COLORS.lightGray,
        marginVertical: SIZES.base,
        padding: SIZES.padding,
        borderRadius: 10,
        boxShadow: "0px 3px 4.65px rgba(0, 0, 0, 0.2)",
        elevation: 6,
        color: 'black',
    },
    cardTitle: {
        ...FONTS.h4,
        color: COLORS.black,
        marginBottom: SIZES.base,
        color: 'black',

    },
    detailText: {
        ...FONTS.body3,
        color: COLORS.darkGray,
        marginBottom: SIZES.base,
        color: 'black',

    },
    input: {
        backgroundColor: COLORS.white,
        padding: SIZES.padding,
        borderRadius: 10,
        marginVertical: SIZES.base,
        borderWidth: 1,
        borderColor: COLORS.gray,
        color: 'black',

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
    bmiText: {
        ...FONTS.h4,
        color: COLORS.black,
        marginBottom: SIZES.base,
    },
    scrollContainer: {
        paddingHorizontal: SIZES.padding * 2.5,
        paddingBottom: SIZES.padding * 5,
        
    },
});

export default Profile;
