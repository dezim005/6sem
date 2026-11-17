import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.role}>Perfil: {user?.role === 'manager' ? 'Síndico (Gestor)' : 'Morador'}</Text>

      {user?.role === 'manager' && (
        <TouchableOpacity style={styles.adminButton} onPress={() => navigation.navigate('AdminUsers')}>
          <Text style={styles.adminText}>⚙️ Gestão de Moradores (Aprovações)</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#0F172A' },
  email: { fontSize: 16, color: '#64748B', marginBottom: 8 },
  role: { fontSize: 14, fontWeight: '600', color: '#2563EB', marginBottom: 24 },
  adminButton: { backgroundColor: '#1E3A8A', padding: 14, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 12 },
  adminText: { color: '#fff', fontWeight: 'bold' },
  logoutButton: { backgroundColor: '#EF4444', padding: 14, borderRadius: 8, width: '100%', alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: 'bold' }
});