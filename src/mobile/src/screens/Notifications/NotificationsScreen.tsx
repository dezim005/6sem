import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const NotificationsScreen = () => (
  <View style={styles.center}><Text style={styles.title}>Central de Notificações</Text></View>
);
const styles = StyleSheet.create({ center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, title: { fontSize: 20, fontWeight: 'bold', color: '#1E3A8A' } });