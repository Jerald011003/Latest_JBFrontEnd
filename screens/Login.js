import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SIZES, FONTS, images, icons } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('http://192.168.100.107:8000/csrf/', {
          method: 'GET',
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error('Error fetching CSRF token', error);
      }
    };

    const loadCredentials = async () => {
      try {
        const savedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
        const savedPassword = await AsyncStorage.getItem('password');
        if (savedPhoneNumber) setPhoneNumber(savedPhoneNumber);
        if (savedPassword) setPassword(savedPassword);
      } catch (error) {
        console.error('Error loading credentials', error);
      }
    };

    fetchCsrfToken();
    loadCredentials();
  }, []);

  const handleSubmit = async () => {
    if (!csrfToken) {
      console.error('CSRF Token not available');
      return;
    }

    try {
      const response = await fetch('http://192.168.100.107:8000/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken, // Include CSRF token if CSRF protection is enabled
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();

      await AsyncStorage.setItem('accessToken', data.access);
      await AsyncStorage.setItem('refreshToken', data.refresh);
      await AsyncStorage.setItem('phoneNumber', phoneNumber);
      await AsyncStorage.setItem('password', password);
      Alert.alert('Success', 'Login successful');

      // Navigate to the HomeTabs screen
      navigation.navigate('HomeTabs');
    } catch (error) {
      console.error('Error logging in', error);
      Alert.alert('Login failed', 'Invalid phone number or incorrect password.');
    }
  };

  const renderHeader = () => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SIZES.padding * 6,
        paddingHorizontal: SIZES.padding * 2
      }}
      onPress={() => console.log("Login")}
    >
    </TouchableOpacity>
  );

  const renderLogo = () => (
    <View
      style={{
        marginTop: SIZES.padding * 5,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Image
        source={images.juanbytesLogo}
        resizeMode="contain"
        style={{
          width: "100%",
          height: "100%",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20
        }}
      />
    </View>
  );

  const renderForm = () => (
    <View
      style={{
        marginTop: SIZES.padding * 3,
        marginHorizontal: SIZES.padding * 3,
      }}
    >
      {/* Phone Number */}
      <View style={{ marginTop: SIZES.padding * 2 }}>
        <Text style={{ color: COLORS.primary, ...FONTS.body3 }}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholderTextColor={COLORS.black} // Ensure placeholder color is set
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />
      </View>

      {/* Password */}
      <View style={{ marginTop: SIZES.padding * 2 }}>
        <Text style={{ color: COLORS.primary, ...FONTS.body3 }}>Password</Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor={COLORS.black} // Ensure placeholder color is set
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Image
              source={showPassword ? icons.disable_eye : icons.eye}
              style={styles.eyeIconImage}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderButton = () => (
    <View style={{ margin: SIZES.padding * 3 }}>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSignUpLink = () => (
    <View style={{ margin: SIZES.padding * 3, alignItems: 'center' }}>
      <Text style={{ ...FONTS.body3, lineHeight: SIZES.padding * 1.5, color: COLORS.black, }}>
        Don't have an account?{' '}
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={{ color: COLORS.primary, ...FONTS.body3, lineHeight: SIZES.padding * 1.5 }}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : null}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={[COLORS.white, COLORS.white]}
        style={{ flex: 1 }}
      >
        <ScrollView>
          {renderHeader()}
          {renderLogo()}
          {renderForm()}
          {renderButton()}
          {renderSignUpLink()}
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  input: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.black,
    height: 40,
    color: COLORS.black,
    ...FONTS.body3,
    marginVertical: SIZES.padding
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
    bottom: 10,
    height: 30,
    width: 30
  },
  eyeIconImage: {
    height: 20,
    width: 20,
    tintColor: COLORS.black
  },
  loginButton: {
    height: 60,
    backgroundColor: COLORS.black,
    borderRadius: SIZES.radius / 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: COLORS.white,
    ...FONTS.h3
  }
});

export default Login;
