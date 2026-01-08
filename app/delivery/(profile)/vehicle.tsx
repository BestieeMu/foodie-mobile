import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VehicleInfo {
  vehicleType: string;
  model: string;
  plateNumber: string;
  color: string;
}

const STORAGE_KEY = 'driver_vehicle_info';

export default function VehicleInfoScreen() {
  const [info, setInfo] = useState<VehicleInfo>({ vehicleType: '', model: '', plateNumber: '', color: '' });

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) setInfo(JSON.parse(saved));
    })();
  }, []);

  const update = (key: keyof VehicleInfo, value: string) => setInfo((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    Alert.alert('Saved', 'Vehicle info updated');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Vehicle Info</Text>
        <Text style={styles.subtitle}>Keep details accurate for smooth deliveries</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Vehicle Type</Text>
          <TextInput style={styles.input} value={info.vehicleType} onChangeText={(t) => update('vehicleType', t)} placeholder="Bike / Car / Scooter" />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Model</Text>
          <TextInput style={styles.input} value={info.model} onChangeText={(t) => update('model', t)} placeholder="e.g. Toyota Corolla" />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Plate Number</Text>
          <TextInput style={styles.input} value={info.plateNumber} onChangeText={(t) => update('plateNumber', t)} placeholder="e.g. ABC-1234" />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Color</Text>
          <TextInput style={styles.input} value={info.color} onChangeText={(t) => update('color', t)} placeholder="e.g. Blue" />
        </View>

        <TouchableOpacity style={styles.button} onPress={save}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { backgroundColor: '#FFFFFF', padding: 20, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#1A202C' },
  subtitle: { marginTop: 4, fontSize: 14, color: '#718096' },
  form: { backgroundColor: '#FFFFFF', margin: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 12 },
  field: { marginBottom: 12 },
  label: { fontSize: 13, color: '#718096', marginBottom: 6 },
  input: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#2D3748' },
  button: { marginTop: 8, backgroundColor: '#4C6EF5', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});