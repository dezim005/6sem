import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const AdminUsersScreen = () => (
  <View style={styles.center}><Text style={styles.title}>Aprovação de Moradores (Síndico)</Text></View>
);
const styles = StyleSheet.create({ center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, title: { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A' } });