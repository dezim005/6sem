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
  TextInput,
  ScrollView,
} from 'react-native';
import { spotService } from '../../services/spotService';
import { useAuth } from '../../contexts/AuthContext';
import { Spot } from '../../types';

export const MySpotsScreen = () => {
  const { user } = useAuth();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [registerVisible, setRegisterVisible] = useState(false);
  const [availabilityVisible, setAvailabilityVisible] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [number, setNumber] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('standard');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadSpots() {
    setLoading(true);
    try {
      const data = await spotService.listAll();
      setSpots(user?.role === 'manager'
        ? data
        : data.filter((spot) => spot.ownerId === user?.id));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar suas vagas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSpots();
  }, [user?.id, user?.role]);

  async function handleRegister() {
    if (!user?.id) return;
    if (number.trim().length === 0 || location.trim().length < 5) {
      Alert.alert('Atenção', 'Informe o número e uma localização com pelo menos 5 caracteres.');
      return;
    }
    setSaving(true);
    try {
      await spotService.create({
        number: number.trim(),
        type,
        location: location.trim(),
        description: description.trim() || undefined,
        ownerId: user.id,
      });
      Alert.alert('Sucesso', 'Vaga cadastrada com sucesso.');
      setRegisterVisible(false);
      setNumber('');
      setLocation('');
      setDescription('');
      await loadSpots();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível cadastrar a vaga.');
    } finally {
      setSaving(false);
    }
  }

  function openAvailability(spot: Spot) {
    setSelectedSpot(spot);
    const slot = spot.availability?.[0];
    setStartDate(slot ? slot.startTime.split('T')[0] : '');
    setEndDate(slot ? slot.endTime.split('T')[0] : '');
    setAvailabilityVisible(true);
  }

  async function handleAvailability() {
    if (!selectedSpot || !startDate || !endDate) {
      Alert.alert('Atenção', 'Informe as datas de início e fim.');
      return;
    }
    if (endDate < startDate) {
      Alert.alert('Atenção', 'A data final não pode ser anterior à inicial.');
      return;
    }
    setSaving(true);
    try {
      await spotService.updateAvailability(selectedSpot.id, [{
        id: `slot-${Date.now()}`,
        spotId: selectedSpot.id,
        startTime: new Date(`${startDate}T00:00:00Z`).toISOString(),
        endTime: new Date(`${endDate}T23:59:59.999Z`).toISOString(),
        isRecurring: false,
      }]);
      Alert.alert('Sucesso', 'Disponibilidade atualizada.');
      setAvailabilityVisible(false);
      await loadSpots();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível salvar a disponibilidade.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{user?.role === 'manager' ? 'Todas as Vagas' : 'Minhas Vagas'}</Text>
          <Text style={styles.subtitle}>Cadastro e disponibilidade</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setRegisterVisible(true)}>
          <Text style={styles.addButtonText}>+ Nova</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={spots}
          keyExtractor={(item) => item.id}
          onRefresh={loadSpots}
          refreshing={loading}
          ListEmptyComponent={<Text style={styles.empty}>Você ainda não cadastrou vagas.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.spotName}>Vaga {item.number || item.spotNumber}</Text>
              <Text style={styles.info}>📍 {item.location}</Text>
              {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
              <TouchableOpacity style={styles.manageButton} onPress={() => openAvailability(item)}>
                <Text style={styles.manageButtonText}>Gerenciar Disponibilidade</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal visible={registerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cadastrar Nova Vaga</Text>
            <TextInput style={styles.input} placeholder="Número da vaga" value={number} onChangeText={setNumber} />
            <TextInput style={styles.input} placeholder="Detalhes da localização" value={location} onChangeText={setLocation} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Observações" value={description} onChangeText={setDescription} multiline />
            <View style={styles.typeRow}>
              {[
                ['standard', 'Padrão'],
                ['compact', 'Compacto'],
                ['suv', 'SUV'],
                ['motorcycle', 'Moto'],
              ].map(([value, label]) => (
                <TouchableOpacity key={value} style={[styles.typeChip, type === value && styles.typeChipActive]} onPress={() => setType(value)}>
                  <Text style={[styles.typeText, type === value && styles.typeTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setRegisterVisible(false)}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleRegister} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Cadastrar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={availabilityVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Disponibilidade - Vaga {selectedSpot?.number || selectedSpot?.spotNumber}</Text>
            <Text style={styles.fieldLabel}>Data inicial (AAAA-MM-DD)</Text>
            <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="2026-11-20" />
            <Text style={styles.fieldLabel}>Data final (AAAA-MM-DD)</Text>
            <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="2026-11-30" />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setAvailabilityVisible(false)}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAvailability} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E3A8A' },
  subtitle: { color: '#64748B', fontSize: 13 },
  addButton: { backgroundColor: '#2563EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  empty: { textAlign: 'center', color: '#64748B', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  spotName: { fontSize: 17, fontWeight: 'bold', color: '#0F172A', marginBottom: 6 },
  info: { color: '#475569', marginBottom: 4 },
  description: { color: '#64748B', fontStyle: 'italic', marginBottom: 8 },
  manageButton: { marginTop: 8, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  manageButtonText: { color: '#1D4ED8', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, maxHeight: '90%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 14 },
  fieldLabel: { color: '#334155', fontSize: 13, fontWeight: '600', marginTop: 8, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, color: '#0F172A' },
  textArea: { minHeight: 72, textAlignVertical: 'top' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  typeChip: { backgroundColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 7 },
  typeChipActive: { backgroundColor: '#1E3A8A' },
  typeText: { color: '#475569', fontSize: 12 },
  typeTextActive: { color: '#fff', fontWeight: 'bold' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelButton: { flex: 1, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingVertical: 11, alignItems: 'center' },
  cancelText: { color: '#475569', fontWeight: 'bold' },
  saveButton: { flex: 1, backgroundColor: '#2563EB', borderRadius: 8, paddingVertical: 11, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold' },
});
