import React from "react";
import { SafeAreaView, View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, SIZES, FONTS, icons } from "../constants";

const DietTracker = ({ navigation }) => {
    // Sample data
    const dailyIntake = [
        { id: '1', food: 'Breakfast', calories: 400, status: 'Healthy' },
        { id: '2', food: 'Lunch', calories: 700, status: 'Unhealthy' },
        { id: '3', food: 'Dinner', calories: 500, status: 'Healthy' },
        { id: '4', food: 'Snack', calories: 200, status: 'Healthy' },
    ];

    const todayCalories = 1800; // Sample value
    const monthCalories = 54000; // Sample value

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
                    <Text style={styles.title}>Diet Tracker</Text>
                </View>

                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => console.log("Settings")}
                >
                    <Image
                        source={icons.settings}
                        style={styles.icon}
                    />
                </TouchableOpacity>
            </View>
        );
    }

    function renderCalorieStats() {
        return (
            <View style={styles.calorieContainer}>
                <View style={styles.calorieBox}>
                    <Text style={styles.calorieLabel}>Calories Today</Text>
                    <Text style={styles.calorieAmount}>{todayCalories} kcal</Text>
                </View>
                <View style={styles.calorieBox}>
                    <Text style={styles.calorieLabel}>Calories This Month</Text>
                    <Text style={styles.calorieAmount}>{monthCalories} kcal</Text>
                </View>
            </View>
        );
    }

    function renderDailyIntake({ item }) {
        return (
            <View style={styles.intakeItem}>
                <View style={styles.intakeInfo}>
                    <Text style={styles.foodName}>{item.food}</Text>
                    <Text style={styles.calories}>{item.calories} kcal</Text>
                </View>
                <Text style={[styles.status, item.status === 'Healthy' ? styles.healthy : styles.unhealthy]}>
                    {item.status}
                </Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <View style={styles.content}>
                {renderCalorieStats()}
                <FlatList
                    data={dailyIntake}
                    keyExtractor={item => item.id}
                    renderItem={renderDailyIntake}
                    contentContainerStyle={styles.intakeList}
                />
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
    content: {
        paddingHorizontal: SIZES.padding * 3,
        flex: 1,
    },
    calorieContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SIZES.padding * 3,
    },
    calorieBox: {
        width: '48%',
        padding: SIZES.padding,
        borderRadius: 10,
        backgroundColor: COLORS.lightGray,
        alignItems: 'center',
        boxShadow: "0px 3px 4.65px rgba(0, 0, 0, 0.2)",
        elevation: 3,
    },
    calorieLabel: {
        ...FONTS.body4,
        color: COLORS.gray,
    },
    calorieAmount: {
        ...FONTS.h2,
        color: COLORS.primary,
    },
    intakeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SIZES.padding,
        marginBottom: SIZES.base,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    intakeInfo: {
        flex: 1,
    },
    foodName: {
        ...FONTS.body3,
        color: COLORS.black,
    },
    calories: {
        ...FONTS.body4,
        color: COLORS.gray,
    },
    status: {
        ...FONTS.body4,
        borderRadius: 5,
        paddingVertical: 2,
        paddingHorizontal: 8,
        textAlign: 'center',
    },
    healthy: {
        backgroundColor: COLORS.green,
        color: COLORS.white,
    },
    unhealthy: {
        backgroundColor: COLORS.red,
        color: COLORS.white,
    },
    intakeList: {
        marginBottom: SIZES.padding * 3,
    },
});

export default DietTracker;
