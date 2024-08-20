import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, FONTS, icons, images } from "../constants";

const Signup = ({ navigation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    fetch('http://192.168.100.107:8000/csrf/')
      .then(response => response.json())
      .then(data => {
        setCsrfToken(data.csrfToken);
      })
      .catch(error => {
        console.error('Error fetching CSRF token', error);
      });
  }, []);

  const handleSubmit = () => {
    if (password !== password2) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }

    fetch('http://192.168.100.107:8000/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        email: email,
        first_name: firstName,
        last_name: lastName,
        password: password,
        password2: password2
      })
    })
    .then(response => response.json())
    .then(data => {
      Alert.alert('Success', 'User registered successfully');
      navigation.navigate('Login');
    })
    .catch(error => {
      console.error('Error registering user', error);
      Alert.alert('Registration failed', 'An error occurred during registration.');
    });
  };

  function renderHeader() {
    return (
      <TouchableOpacity
        style={styles.header}
        onPress={() => navigation.navigate('Login')}
      >
        <Image
          source={icons.back}
          resizeMode="contain"
          style={styles.backIcon}
        />
        <Text style={styles.headerText}>Login</Text>
      </TouchableOpacity>
    );
  }

  function renderLogo() {
    return (
      <View style={styles.logoContainer}>
        <Image
          source={images.juanbytesLogo}
          resizeMode="contain"
          style={styles.logo}
        />
      </View>
    );
  }

  function renderForm() {
    return (
      <View style={styles.formContainer}>
        {/* First Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            placeholderTextColor={COLORS.black}
          />
        </View>

        {/* Last Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
            placeholderTextColor={COLORS.black}
          />
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={COLORS.black}
            keyboardType="email-address"
          />
        </View>

        {/* Phone Number */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter your phone number"
            placeholderTextColor={COLORS.black}
            keyboardType="phone-pad"
          />
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.black}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Image
                source={showPassword ? icons.disable_eye : icons.eye}
                style={styles.eyeImage}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={password2}
              onChangeText={setPassword2}
              placeholder="Confirm your password"
              placeholderTextColor={COLORS.black}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Image
                source={showConfirmPassword ? icons.disable_eye : icons.eye}
                style={styles.eyeImage}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  function renderButton() {
    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : null}
      style={{ flex: 1 }}
    >
      <ScrollView>
        <LinearGradient
          colors={[COLORS.white, COLORS.white]}
          style={{ flex: 1 }}
        >
          {renderHeader()}
          {renderLogo()}
          {renderForm()}
          {renderButton()}
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 16
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.black
  },
  headerText: {
    marginLeft: 12,
    color: COLORS.black,
    ...FONTS.h4
  },
  logoContainer: {
    marginTop: 40,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  formContainer: {
    marginTop: 24,
    marginHorizontal: 24
  },
  inputContainer: {
    marginTop: 16
  },
  label: {
    color: COLORS.lightorrange,
    ...FONTS.body3
  },
  input: {
    marginVertical: 8,
    borderBottomColor: COLORS.black,
    borderBottomWidth: 1,
    height: 40,
    color: COLORS.black,
    ...FONTS.body3
  },
  passwordContainer: {
    position: 'relative'
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
    bottom: 10,
    height: 30,
    width: 30
  },
  eyeImage: {
    height: 20,
    width: 20,
    tintColor: COLORS.black
  },
  buttonContainer: {
    margin: 24
  },
  button: {
    height: 60,
    backgroundColor: COLORS.lightorrange,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: COLORS.white,
    ...FONTS.h3
  }
});

export default Signup;
