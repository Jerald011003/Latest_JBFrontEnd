import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './screens/Login';
import SignUp from './screens/SignUp';
import Tabs from './navigation/tabs'; // Adjust the import path as necessary
import Food from "./screens/Food";
import Scan  from './screens/Scan';
import DietTracker from "./screens/DietTracker"
import User from "./screens/User"
import Notif from './screens/Notif';
import Profile from './screens/Profile';
import SendMoney from './screens/SendMoney';
import Wallet from './screens/Wallet';
import Transactions from './screens/Transactions';
import TopUp from './screens/TopUp';

// Food System
import AllCanteens from './screens/FoodDetails/FoodCanteen/AllCanteens';
import AllFoods from './screens/FoodDetails/FoodCanteen/AllFoods';
import OrderCreate from './screens/FoodDetails/FoodCanteen/OrderCreate';
import OrderList from './screens/FoodDetails/FoodCanteen/OrderList';
import FeaturedFoods from './screens/FeaturedFoods';

// NFC Feature

import PayNFC from './screens/PayNFC';


const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ headerShown: false }} // Hides the header for this screen
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUp} 
          options={{ headerShown: false }} // Hides the header for this screen
        />
        <Stack.Screen 
          name="HomeTabs" 
          component={Tabs} // Use Tabs as the home screen
          options={{ headerShown: false }} // Hides the header for this screen
        />
        <Stack.Screen 
          name="Food" 
          component={Food} // Use Tabs as the home screen
          options={{ headerShown: false }} // Hides the header for this screen
        />
        <Stack.Screen 
          name="Scan" 
          component={Scan} // Use Tabs as the home screen
          options={{ headerShown: false }} // Hides the header for this screen
        />
        <Stack.Screen 
          name="DietTracker" 
          component={DietTracker} // Use Tabs as the home screen
          options={{ headerShown: false }} // Hides the header for this screen
        />
        <Stack.Screen 
          name="User" 
          component={User} // Use Tabs as the home screen
          options={{ headerShown: false }} // Hides the header for this screen
        />

        <Stack.Screen 
          name="AllCanteens" 
          component={AllCanteens} // Use Tabs as the home screen
          options={{ headerShown: false }} // Hides the header for this screen
        />

        <Stack.Screen 
          name="AllFoods" 
          component={AllFoods} // Use Tabs as the home screen
          options={{ headerShown: false }} // Hides the header for this screen
        />

        <Stack.Screen 
          name="OrderCreate" 
          component={OrderCreate} // Use Tabs as the home screen
          options={{ headerShown: false }} // Hides the header for this screen
        />

        <Stack.Screen 
          name="OrderList" 
          component={OrderList} // Use Tabs as the home screen
          options={{ headerShown: false }} // Hides the header for this screen
        />

        <Stack.Screen 
          name="FeaturedFoods" 
          component={FeaturedFoods} // Use Tabs as the home screen
          options={{ headerShown: false }} // Hides the header for this screen
        />

        <Stack.Screen 
          name="PayNFC" 
          component={PayNFC} // Use Tabs as the home screen
          options={{ headerShown: false }} // Hides the header for this screen
        />
        <Stack.Screen 
          name="Notif" 
          component={Notif} // Use Tabs as the home screen
          options={{ headerShown: false }} // Hides the header for this screen
        />
        <Stack.Screen 
          name="Profile" 
          component={Profile} // Use Tabs as the home screen
          options={{ headerShown: false }} // Hides the header for this screen
        />
        <Stack.Screen 
          name="SendMoney" 
          component={SendMoney} // Use Tabs as the home screen
          options={{ headerShown: false }} // Hides the header for this screen
        />
        <Stack.Screen 
          name="Wallet" 
          component={Wallet} // Use Tabs as the home screen
          options={{ headerShown: false }} // Hides the header for this screen
        />
        <Stack.Screen 
          name="Transactions" 
          component={Transactions} // Use Tabs as the home screen
          options={{ headerShown: false }} // Hides the header for this screen
        />
        <Stack.Screen 
          name="TopUp" 
          component={TopUp} // Use Tabs as the home screen
          options={{ headerShown: false }} // Hides the header for this screen
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
