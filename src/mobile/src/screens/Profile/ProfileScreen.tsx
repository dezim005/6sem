import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { condominiumService } from '../../services/condominiumService';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, signOut, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [apartment, setApartment] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [condominiumName, setCondominiumName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setApartment(user.apartment || '');
    setDateOfBirth(user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '');
    setCpf(user.cpf || '');
    setPhone(user.phone || '');
    setDescription(user.description || '');
    if (user.condominiumId) {
      condominiumService.listAll()
        .then((items) => setCondominiumName(
          items.find((item) => item.id === user.condominiumId)?.name || 'Não informado'
        ))
        .catch(() => setCondominiumName(user.condominiumName || 'Não informado'));
    }
  }, [user]);

  async function handleSave() {
    if (name.trim().length < 2) {
      Alert.alert('Atenção', 'O nome deve ter pelo menos 2 caracteres.');
      return;
    }
    setSaving(true);
    const result = await updateProfile({
      name: name.trim(),
      apartment: apartment.trim(),
      dateOfBirth: dateOfBirth.trim() || undefined,
      cpf: cpf.trim() || undefined,
      phone: phone.trim() || undefined,
      description: description.trim() || undefined,
    });
    setSaving(false);
    Alert.alert(result.success ? 'Sucesso' : 'Erro', result.message);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{name.charAt(0).toUpperCase() || 'U'}</Text></View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>Perfil: {user?.role === 'manager' ? 'Síndico (Gestor)' : 'Morador'}</Text>
      </View>

      <Text style={styles.fieldLabel}>Nome completo</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.fieldLabel}>Email</Text>
      <TextInput style={[styles.input, styles.disabled]} value={user?.email || ''} editable={false} />

      {condominiumName ? (
        <>
          <Text style={styles.fieldLabel}>Condomínio</Text>
          <TextInput style={[styles.input, styles.disabled]} value={condominiumName} editable={false} />
        </>
      ) : null}

      <Text style={styles.fieldLabel}>Apartamento / bloco</Text>
      <TextInput style={styles.input} value={apartment} onChangeText={setApartment} placeholder="Ex: Bloco A, Apto 101" />

      <Text style={styles.fieldLabel}>Data de nascimento</Text>
      <TextInput style={styles.input} value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="AAAA-MM-DD" />

      <Text style={styles.fieldLabel}>CPF</Text>
      <TextInput style={styles.input} value={cpf} onChangeText={setCpf} placeholder="XXX.XXX.XXX-XX" />

      <Text style={styles.fieldLabel}>Telefone</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="(XX) XXXXX-XXXX" keyboardType="phone-pad" />

      <Text style={styles.fieldLabel}>Descrição</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Uma breve descrição sobre você"
        multiline
        maxLength={200}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Salvar Configurações</Text>}
      </TouchableOpacity>

      {user?.role === 'manager' && (
        <TouchableOpacity style={styles.adminButton} onPress={() => navigation.navigate('AdminUsers')}>
          <Text style={styles.adminText}>⚙️ Aprovações de Cadastro</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20, paddingBottom: 40 },
  profileHeader: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#1E3A8A', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#0F172A' },
  email: { fontSize: 16, color: '#64748B', marginBottom: 8 },
  role: { fontSize: 14, fontWeight: '600', color: '#2563EB', marginBottom: 24 },
  fieldLabel: { color: '#334155', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11, color: '#0F172A' },
  disabled: { backgroundColor: '#E2E8F0', color: '#64748B' },
  textArea: { minHeight: 88, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#2563EB', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 18, marginBottom: 12 },
  saveText: { color: '#fff', fontWeight: 'bold' },
  adminButton: { backgroundColor: '#1E3A8A', padding: 14, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 12 },
  adminText: { color: '#fff', fontWeight: 'bold' },
  logoutButton: { backgroundColor: '#EF4444', padding: 14, borderRadius: 8, width: '100%', alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: 'bold' }
});