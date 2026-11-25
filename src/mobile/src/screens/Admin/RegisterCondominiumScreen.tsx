import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { condominiumService } from '../../services/condominiumService';
import { AppTextInput as TextInput } from '../../components/AppTextInput';

export const RegisterCondominiumScreen = () => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  if (user?.role !== 'manager') {
    return (
      <View style={styles.container}>
        <Text style={styles.denied}>Acesso exclusivo para síndicos.</Text>
      </View>
    );
  }

  async function handleSubmit() {
    if (name.trim().length < 3) {
      Alert.alert('Atenção', 'O nome do condomínio deve ter pelo menos 3 caracteres.');
      return;
    }
    if (address.trim().length < 5) {
      Alert.alert('Atenção', 'O endereço deve ter pelo menos 5 caracteres.');
      return;
    }
    setSaving(true);
    try {
      const created = await condominiumService.create({
        name: name.trim(),
        address: address.trim(),
      });
      Alert.alert('Sucesso', `Condomínio "${created.name}" cadastrado com sucesso.`);
      setName('');
      setAddress('');
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível cadastrar o condomínio.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Cadastrar Novo Condomínio</Text>
      <Text style={styles.subtitle}>Informe os dados do condomínio.</Text>

      <Text style={styles.label}>Nome do condomínio</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ex: Residencial Central"
      />

      <Text style={styles.label}>Endereço</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={address}
        onChangeText={setAddress}
        placeholder="Rua, número, bairro e cidade"
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Cadastrar Condomínio</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E3A8A' },
  subtitle: { color: '#64748B', marginBottom: 20 },
  denied: { margin: 20, color: '#DC2626', textAlign: 'center', fontWeight: 'bold' },
  label: { color: '#334155', fontWeight: '600', fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11, marginBottom: 14 },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  button: { backgroundColor: '#2563EB', borderRadius: 8, alignItems: 'center', paddingVertical: 13, marginTop: 4 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
