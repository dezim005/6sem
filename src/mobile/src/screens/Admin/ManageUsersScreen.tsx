import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { condominiumService } from '../../services/condominiumService';
import { Condominium, User } from '../../types';
import { AppTextInput as TextInput } from '../../components/AppTextInput';

export const ManageUsersScreen = () => {
  const { user: currentUser, signOut } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewVisible, setViewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [name, setName] = useState('');
  const [apartment, setApartment] = useState('');
  const [roleManager, setRoleManager] = useState(false);
  const [status, setStatus] = useState<'pending' | 'approved' | 'denied'>('approved');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [description, setDescription] = useState('');
  const [condominiumId, setCondominiumId] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [usersData, condominiumsData] = await Promise.all([
        userService.listAll(),
        condominiumService.listAll(),
      ]);
      setUsers(usersData);
      setCondominiums(condominiumsData);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar usuários.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (currentUser?.role === 'manager') loadData();
  }, [currentUser?.role]);

  if (currentUser?.role !== 'manager') {
    return <View style={styles.container}><Text style={styles.denied}>Acesso exclusivo para síndicos.</Text></View>;
  }

  const filtered = users.filter((item) =>
    `${item.name} ${item.email}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  function openEdit(item: User) {
    setSelectedUser(item);
    setName(item.name || '');
    setApartment(item.apartment || '');
    setRoleManager(item.role === 'manager');
    setStatus(item.status);
    setPhone(item.phone || '');
    setCpf(item.cpf || '');
    setDateOfBirth(item.dateOfBirth ? item.dateOfBirth.split('T')[0] : '');
    setDescription(item.description || '');
    setCondominiumId(item.condominiumId || '');
    setEditVisible(true);
  }

  function openView(item: User) {
    setSelectedUser(item);
    setViewVisible(true);
  }

  function formatCPF(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits.length ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  async function handleSave() {
    if (!selectedUser || name.trim().length < 2) {
      Alert.alert('Atenção', 'Informe um nome válido.');
      return;
    }
    setSaving(true);
    try {
      if (!roleManager && !condominiumId) {
        Alert.alert('Atenção', 'Moradores devem estar associados a um condomínio.');
        setSaving(false);
        return;
      }
      await userService.updateProfile(selectedUser.id, {
        name: name.trim(),
        apartment: apartment.trim(),
        role: roleManager ? 'manager' : 'resident',
        status,
        phone: phone.trim() || undefined,
        cpf: cpf.trim() || undefined,
        dateOfBirth: dateOfBirth.trim() || undefined,
        description: description.trim() || undefined,
        condominiumId: roleManager ? undefined : condominiumId,
      });
      Alert.alert('Sucesso', 'Usuário atualizado.');
      setEditVisible(false);
      await loadData();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível atualizar o usuário.');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(item: User) {
    Alert.alert(
      'Excluir usuário',
      `Deseja excluir ${item.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deleteUser(item.id);
              setUsers((previous) => previous.filter((user) => user.id !== item.id));
              Alert.alert('Sucesso', 'Usuário excluído.');
              if (currentUser?.id === item.id) {
                await signOut();
              }
            } catch (error: any) {
              Alert.alert('Erro', error.response?.data?.message || 'Não foi possível excluir o usuário.');
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciar Usuários</Text>
      <TextInput
        style={styles.search}
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar por nome ou email..."
      />
      {loading ? (
        <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          onRefresh={loadData}
          refreshing={loading}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum usuário encontrado.</Text>}
          renderItem={({ item }) => {
            const condominium = condominiums.find((value) => value.id === item.condominiumId);
            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => openView(item)}
              >
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.info}>✉️ {item.email}</Text>
                <Text style={styles.info}>Perfil: {item.role === 'manager' ? 'Síndico' : 'Morador'}</Text>
                <Text style={styles.info}>Status: {item.status === 'approved' ? 'Aprovado' : item.status === 'pending' ? 'Pendente' : 'Negado'}</Text>
                {condominium ? <Text style={styles.info}>🏢 {condominium.name}</Text> : null}
                {item.apartment ? <Text style={styles.info}>🏠 {item.apartment}</Text> : null}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => openView(item)}
                  >
                    <Text style={styles.viewButtonText}>Ver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editButton} onPress={() => openEdit(item)}>
                    <Text style={styles.editButtonText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                    <Text style={styles.deleteButtonText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <Modal visible={viewVisible} transparent animationType="slide" onRequestClose={() => setViewVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView>
              <View style={styles.viewHeader}>
                <MaterialCommunityIcons name="account-circle-outline" size={28} color="#0CA789" />
                <Text style={styles.modalTitle}>Detalhes de {selectedUser?.name}</Text>
              </View>
              {selectedUser ? (
                <View style={styles.detailList}>
                  <Text style={styles.detailRow}>Nome: {selectedUser.name}</Text>
                  <Text style={styles.detailRow}>Email: {selectedUser.email}</Text>
                  <Text style={styles.detailRow}>
                    Status: {selectedUser.status === 'approved' ? 'Aprovado' : selectedUser.status === 'pending' ? 'Pendente' : 'Negado'}
                  </Text>
                  <Text style={styles.detailRow}>Apartamento: {selectedUser.apartment || 'N/A'}</Text>
                  <Text style={styles.detailRow}>
                    Condomínio: {condominiums.find((item) => item.id === selectedUser.condominiumId)?.name || 'N/A'}
                  </Text>
                  <Text style={styles.detailRow}>Papel: {selectedUser.role === 'manager' ? 'Síndico' : 'Morador'}</Text>
                  <Text style={styles.detailRow}>Data de nascimento: {selectedUser.dateOfBirth || 'N/A'}</Text>
                  <Text style={styles.detailRow}>CPF: {selectedUser.cpf || 'N/A'}</Text>
                  <Text style={styles.detailRow}>Telefone: {selectedUser.phone || 'N/A'}</Text>
                  <Text style={styles.detailRow}>Descrição: {selectedUser.description || 'N/A'}</Text>
                  <Text style={styles.detailRow}>
                    Data cadastro: {selectedUser.registrationDate || selectedUser.createdAt || 'N/A'}
                  </Text>
                </View>
              ) : null}
              <TouchableOpacity style={styles.closeButton} onPress={() => setViewVisible(false)}>
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView>
              <Text style={styles.modalTitle}>Editar Usuário</Text>
              <Text style={styles.label}>Nome</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} />
              <Text style={styles.label}>Email (não editável)</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={selectedUser?.email || ''}
                editable={false}
              />
              <Text style={styles.label}>Apartamento</Text>
              <TextInput style={styles.input} value={apartment} onChangeText={setApartment} />
              <View style={styles.switchRow}>
                <Text style={styles.label}>Papel: Síndico / gerente</Text>
                <Switch value={roleManager} onValueChange={setRoleManager} />
              </View>
              {!roleManager ? (
                <>
                  <Text style={styles.label}>Condomínio</Text>
                  <View style={styles.statusRow}>
                    {condominiums.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.statusChip, condominiumId === item.id && styles.statusChipActive]}
                        onPress={() => setCondominiumId(item.id)}
                      >
                        <Text
                          style={[styles.statusText, condominiumId === item.id && styles.statusTextActive]}
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              ) : null}
              <Text style={styles.label}>Data de nascimento</Text>
              <TextInput
                style={styles.input}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="AAAA-MM-DD"
              />
              <Text style={styles.label}>CPF</Text>
              <TextInput
                style={styles.input}
                value={cpf}
                onChangeText={(value) => setCpf(formatCPF(value))}
                placeholder="XXX.XXX.XXX-XX"
                maxLength={14}
              />
              <Text style={styles.label}>Telefone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={(value) => setPhone(formatPhone(value))}
                placeholder="(XX) XXXXX-XXXX"
                keyboardType="phone-pad"
                maxLength={15}
              />
              <Text style={styles.label}>Breve descrição</Text>
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                value={description}
                onChangeText={setDescription}
                placeholder="Uma breve descrição..."
                multiline
                maxLength={200}
              />

              <Text style={styles.label}>Status</Text>
              <View style={styles.statusRow}>
                {([
                  ['pending', 'Pendente'],
                  ['approved', 'Aprovado'],
                  ['denied', 'Negado'],
                ] as const).map(([value, label]) => (
                  <TouchableOpacity
                    key={value}
                    style={[styles.statusChip, status === value && styles.statusChipActive]}
                    onPress={() => setStatus(value)}
                  >
                    <Text style={[styles.statusText, status === value && styles.statusTextActive]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setEditVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Salvar</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 10 },
  search: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  empty: { textAlign: 'center', color: '#64748B', marginTop: 40 },
  denied: { margin: 20, color: '#DC2626', textAlign: 'center', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  name: { fontSize: 17, fontWeight: 'bold', color: '#0F172A', marginBottom: 6 },
  info: { color: '#475569', marginBottom: 3 },
  actions: { flexDirection: 'row', gap: 6, marginTop: 10 },
  viewButton: { flex: 1, alignItems: 'center', borderRadius: 8, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', paddingVertical: 9 },
  viewButtonText: { color: '#047857', fontWeight: 'bold' },
  editButton: { flex: 1, alignItems: 'center', borderRadius: 8, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', paddingVertical: 9 },
  editButtonText: { color: '#1D4ED8', fontWeight: 'bold' },
  deleteButton: { flex: 1, alignItems: 'center', borderRadius: 8, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', paddingVertical: 9 },
  deleteButtonText: { color: '#DC2626', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, maxHeight: '88%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 14 },
  label: { color: '#334155', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 },
  disabledInput: { backgroundColor: '#F1F5F9', color: '#64748B' },
  descriptionInput: { minHeight: 88, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  statusChip: { backgroundColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 7 },
  statusChipActive: { backgroundColor: '#1E3A8A' },
  statusText: { color: '#475569', fontSize: 12 },
  statusTextActive: { color: '#fff', fontWeight: 'bold' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelButton: { flex: 1, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingVertical: 11, alignItems: 'center' },
  cancelButtonText: { color: '#475569', fontWeight: 'bold' },
  saveButton: { flex: 1, backgroundColor: '#2563EB', borderRadius: 8, paddingVertical: 11, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
  viewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  detailList: { gap: 8, marginBottom: 12 },
  detailRow: { color: '#334155', fontSize: 14, borderBottomWidth: 1, borderBottomColor: '#EEF2F7', paddingBottom: 8 },
  closeButton: { backgroundColor: '#E2E8F0', borderRadius: 8, paddingVertical: 11, alignItems: 'center' },
  closeButtonText: { color: '#475569', fontWeight: 'bold' },
});
