import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet, Button, View, Alert, Modal, TextInput, TouchableOpacity, Image } from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, icons, images } from '../constants';

const PayNFC = ({ navigation, route }) => {
  const [nfcData, setNfcData] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const { order } = route.params;

  useEffect(() => {
    const initializeNfc = async () => {
      try {
        await NfcManager.start();
        console.log('NFC Manager started successfully.');
      } catch (error) {
        console.error('Error starting NFC Manager:', error);
      }
    };

    initializeNfc();

    return () => {
      try {
        // NfcManager.stop();
        // NfcManager.setEventListenerOff();
      } catch (error) {
        console.error('Error during NFC cleanup:', error);
      }
    };
  }, []);

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
        if (token) setAccessToken(token);
      } catch (error) {
        console.error('Error fetching access token', error);
      }
    };

    fetchCsrfToken();
    fetchAccessToken();
  }, []);

  const handleTagDiscovered = async (tag) => {
    console.log('NFC Tag discovered:', tag);
    const parsedData = parseNfcTag(tag);
    setNfcData(parsedData);
    if (parsedData) setModalVisible(true);
  };

  const readNfcTag = async () => {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      console.log('NFC Tag:', tag);
      if (tag.ndefMessage && tag.ndefMessage.length > 0) {
        const parsedData = parseNfcTag(tag);
        setNfcData(parsedData);
        if (parsedData) setModalVisible(true);
      } else {
        setNfcData('No valid NFC data found.');
      }
    } catch (error) {
      console.error('Error reading NFC tag:', error);
      setNfcData('Error reading NFC tag.');
    } finally {
      await NfcManager.cancelTechnologyRequest();
    }
  };

  const parseNfcTag = (tag) => {
    if (tag && tag.ndefMessage && tag.ndefMessage.length > 0) {
      const payload = tag.ndefMessage[0]?.payload;
      if (Array.isArray(payload) && payload.length > 3) {
        const text = String.fromCharCode(...payload.slice(3));
        const [email, phoneNumber, password] = text.split(';').map(item => item.trim());
        return { email, phoneNumber, password }; // Ensure this is for the buyer
      }
    }
    return null;
  };

  const verifyUserAndPassword = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch('http://192.168.100.107:8000/verify-user/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email: nfcData.email,
          phone_number: nfcData.phoneNumber,
          password: nfcData.password, // Include the password here
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`User verification failed: ${errorData.message}`);
      }

      // Process payment if verification is successful
      await processPayment(nfcData.phoneNumber, order.total_price);

      Alert.alert('Success', 'Verification successful.');
      navigation.navigate('OrderList', { refresh: true });

    } catch (error) {
      console.error('Error during verification:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsVerifying(false);
      setModalVisible(false);
    }
  };

  const processPayment = async (payerPhoneNumber, amount) => {
    try {
      if (!accessToken) {
        Alert.alert('Error', 'Access token not available.');
        return;
      }

      // Use the vendor's phone number for the transfer
      const response = await fetch('http://192.168.100.107:8000/transferbuyerandvendor/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_phone_number: order.user_phone_number, // buyer's phone number
          amount: amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error processing payment: ${errorData.message}`);
      }

      await fetch(`http://192.168.100.107:8000/orders/${order.id}/pay/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-CSRFToken': csrfToken,
        },
      });

    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'The buyer dont have enough balance.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={icons.back}
            style={styles.iconImage}
          />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Pay NFC</Text>
        </View>
      </View>
      <View style={styles.innerContainer}>
        <Image
          source={images.NFCScan} // Your GIF image
          style={styles.nfcScanImage}
        />
        <TouchableOpacity
          style={[styles.button, isVerifying && styles.buttonDisabled]}
          onPress={readNfcTag}
          disabled={isVerifying}
        >
          <Text style={styles.buttonText}>Read NFC Tag</Text>
        </TouchableOpacity>
        {!nfcData ? (
          <Text style={styles.nfcDataText}></Text>
        ) : (
          <Text style={styles.nfcDataText}>User verification successful</Text>
        )}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Confirm Payment</Text>
            <Text style={styles.modalText}>Vendor Email: {order?.vendor}</Text>
            <Text style={styles.modalText}>Vendor Phone no.: {order?.vendor_phone_number}</Text>
            <Text style={styles.modalText}>Buyer Phone no.: {order?.user_phone_number}</Text>
            <Text style={styles.modalText}>Enter your password to confirm the payment of ₱{order?.total_price}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.black}
              secureTextEntry
              value={nfcData?.password || password}
              onChangeText={setPassword}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={verifyUserAndPassword} disabled={isVerifying}>
                <Text style={styles.buttonText}>{isVerifying ? 'Verifying...' : 'Confirm Payment'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  nfcScanImage: {
    width: 200, // Adjust size as needed
    height: 200, // Adjust size as needed
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: 'gray',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    color: 'black',
  },
  iconButton: {
    position: 'absolute',
    left: 10,
    padding: 10,
  },
  headerIcon: {
    color: COLORS.white,
    fontSize: 24,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    color: 'black',
  },
  title: {
    color: COLORS.white,
    fontSize: 20,
    color: 'black',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  nfcDataText: {
    marginTop: 20,
    fontSize: 16,
    color: COLORS.black,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: 'black',
  },
  input: {
    height: 40,
    borderColor: COLORS.grey,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    width: '100%',
    marginBottom: 20,
    color: 'black',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  iconImage: {
    width: 20,
    height: 20,
    tintColor: COLORS.black,
  },
});

export default PayNFC;
