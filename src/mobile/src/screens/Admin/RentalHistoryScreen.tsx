import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Share,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { reservationService } from '../../services/reservationService';
import { userService } from '../../services/userService';
import { spotService } from '../../services/spotService';
import { Reservation, Spot, User } from '../../types';
import { AppTextInput as TextInput } from '../../components/AppTextInput';

interface DetailedReservation extends Reservation {
  userName: string;
  spotNumber: string;
  spotLocation: string;
}

export const RentalHistoryScreen = () => {
  const { user: currentUser } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  async function loadData() {
    setLoading(true);
    try {
      const [reservationData, userData, spotData] = await Promise.all([
        reservationService.listUserReservations(),
        userService.listAll(),
        spotService.listAll(),
      ]);
      setReservations(reservationData);
      setUsers(userData);
      setSpots(spotData);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o histórico.');
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

  const detailed: DetailedReservation[] = useMemo(() =>
    reservations.map((reservation) => {
      const resident = users.find((item) => item.id === reservation.userId);
      const spot = spots.find((item) => item.id === reservation.spotId);
      return {
        ...reservation,
        userName: resident?.name || 'Usuário desconhecido',
        spotNumber: spot?.number || spot?.spotNumber || 'Vaga desconhecida',
        spotLocation: spot?.location || 'Local desconhecido',
      };
    }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),
  [reservations, users, spots]);

  const filtered = detailed.filter((item) => {
    if (selectedUserId !== 'all' && item.userId !== selectedUserId) return false;
    const reservationStart = new Date(item.startTime);
    const reservationEnd = new Date(item.endTime);
    if (startDate) {
      const from = new Date(`${startDate}T00:00:00`);
      if (reservationEnd < from) return false;
    }
    if (endDate) {
      const to = new Date(`${endDate}T23:59:59.999`);
      if (reservationStart > to) return false;
    }
    return true;
  });

  function clearFilters() {
    setSelectedUserId('all');
    setStartDate('');
    setEndDate('');
  }

  function formatDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Data inválida' : date.toLocaleDateString('pt-BR');
  }

  function escapeCsv(value: string) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  async function downloadReport() {
    if (filtered.length === 0) {
      Alert.alert('Aviso', 'Não há registros para exportar.');
      return;
    }
    const rows = [
      ['ID Reserva', 'Vaga', 'Localização', 'Residente', 'Data Início', 'Data Fim'],
      ...filtered.map((item) => [
        item.id,
        item.spotNumber,
        item.spotLocation,
        item.userName,
        formatDate(item.startTime),
        formatDate(item.endTime),
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => escapeCsv(value)).join(',')).join('\n');
    await Share.share({
      title: 'Relatório de histórico de aluguéis',
      message: csv,
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Histórico de Aluguéis</Text>
          <Text style={styles.subtitle}>{filtered.length} reserva(s)</Text>
        </View>
        <TouchableOpacity style={styles.downloadButton} onPress={downloadReport}>
          <Text style={styles.downloadButtonText}>Compartilhar CSV</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal style={styles.userFilter} showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.userChip, selectedUserId === 'all' && styles.userChipActive]}
          onPress={() => setSelectedUserId('all')}
        >
          <Text style={[styles.userChipText, selectedUserId === 'all' && styles.userChipTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        {users.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.userChip, selectedUserId === item.id && styles.userChipActive]}
            onPress={() => setSelectedUserId(item.id)}
          >
            <Text style={[styles.userChipText, selectedUserId === item.id && styles.userChipTextActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.periodRow}>
        <View style={styles.dateField}>
          <Text style={styles.label}>Início</Text>
          <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="AAAA-MM-DD" />
        </View>
        <View style={styles.dateField}>
          <Text style={styles.label}>Fim</Text>
          <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="AAAA-MM-DD" />
        </View>
        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
          <Text style={styles.clearButtonText}>Limpar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          onRefresh={loadData}
          refreshing={loading}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum aluguel encontrado.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.spotName}>Vaga {item.spotNumber}</Text>
              <Text style={styles.info}>📍 {item.spotLocation}</Text>
              <Text style={styles.info}>👤 {item.userName}</Text>
              <Text style={styles.info}>De: {formatDate(item.startTime)}</Text>
              <Text style={styles.info}>Até: {formatDate(item.endTime)}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E3A8A' },
  subtitle: { color: '#64748B', fontSize: 13 },
  denied: { margin: 20, color: '#DC2626', textAlign: 'center', fontWeight: 'bold' },
  downloadButton: { backgroundColor: '#10B981', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9 },
  downloadButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  userFilter: { maxHeight: 42, marginBottom: 8 },
  userChip: { backgroundColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 11, paddingVertical: 8, marginRight: 6 },
  userChipActive: { backgroundColor: '#1E3A8A' },
  userChipText: { color: '#475569', fontSize: 12 },
  userChipTextActive: { color: '#fff', fontWeight: 'bold' },
  periodRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 10 },
  dateField: { flex: 1 },
  label: { color: '#334155', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 8 },
  clearButton: { backgroundColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 10, height: 38, justifyContent: 'center' },
  clearButtonText: { color: '#475569', fontWeight: 'bold', fontSize: 12 },
  empty: { textAlign: 'center', color: '#64748B', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  spotName: { fontSize: 17, fontWeight: 'bold', color: '#0F172A', marginBottom: 6 },
  info: { color: '#475569', marginBottom: 3 },
});
