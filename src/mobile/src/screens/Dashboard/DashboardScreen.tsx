import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { spotService } from '../../services/spotService';
import { reservationService } from '../../services/reservationService';
import { useAuth } from '../../contexts/AuthContext';
import { Reservation, Spot } from '../../types';
import { AppTextInput as TextInput } from '../../components/AppTextInput';

function hasAvailability(spot: Spot): boolean {
  return spot.isAvailable !== false && Array.isArray(spot.availability) && spot.availability.length > 0;
}

function isSpotFree(spot: Spot, reservations: Reservation[]): boolean {
  if (!hasAvailability(spot) || !spot.availability) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return spot.availability.some((slot) => {
    const slotStart = new Date(slot.startTime);
    const slotEnd = new Date(slot.endTime);
    if (Number.isNaN(slotStart.getTime()) || Number.isNaN(slotEnd.getTime())) return false;

    const cursor = new Date(slotStart);
    cursor.setHours(0, 0, 0, 0);
    const end = new Date(slotEnd);
    end.setHours(23, 59, 59, 999);

    for (let guard = 0; cursor <= end && guard < 400; guard++) {
      if (cursor >= today) {
        const dayStart = new Date(cursor);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(cursor);
        dayEnd.setHours(23, 59, 59, 999);
        const hasConflict = reservations.some((reservation) =>
          reservation.spotId === spot.id &&
          new Date(reservation.startTime) <= dayEnd &&
          new Date(reservation.endTime) >= dayStart
        );
        if (!hasConflict) return true;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return false;
  });
}

export const DashboardScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  async function loadData() {
    setLoading(true);
    try {
      const [spotData, reservationData] = await Promise.all([
        spotService.listAll(user?.condominiumId),
        reservationService.listUserReservations(),
      ]);
      setSpots(spotData);
      setReservations(reservationData);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o painel.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [user?.condominiumId]);

  const filtered = spots.filter((spot) => {
    if (!isSpotFree(spot, reservations)) return false;
    const number = String(spot.number || spot.spotNumber || '').toLowerCase();
    const location = String(spot.location || '').toLowerCase();
    const normalizedQuery = query.trim().toLowerCase();
    return number.includes(normalizedQuery) || location.includes(normalizedQuery);
  });

  return (
    <View style={styles.container}>
      <View style={styles.panelCard}>
        <Text style={styles.title}>Disponibilidade de Vagas</Text>
        <Text style={styles.subtitle}>Só aparecem vagas com pelo menos um dia livre.</Text>
      <TextInput
        style={styles.search}
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar por número ou localização..."
      />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          onRefresh={loadData}
          refreshing={loading}
          ListEmptyComponent={<Text style={styles.empty}>Nenhuma vaga encontrada.</Text>}
          renderItem={({ item }) => {
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.spotName}>Vaga {item.number || item.spotNumber}</Text>
                  <Text style={[styles.badge, styles.available]}>Disponível</Text>
                </View>
                <Text style={styles.info}>📍 {item.location}</Text>
                <Text style={styles.info}>👤 Anunciada por: {item.ownerName || 'Morador'}</Text>
                {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate('Spots')}
                >
                  <Text style={styles.buttonText}>Abrir vagas para reserva</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 12 },
  panelCard: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E8EEF5', padding: 14, marginBottom: 10 },
  title: { fontSize: 20, fontWeight: '800', color: '#1F2937', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#64748B', marginBottom: 12 },
  search: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 7, paddingHorizontal: 12, paddingVertical: 10 },
  empty: { textAlign: 'center', color: '#64748B', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E8EEF5', elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  spotName: { fontSize: 18, fontWeight: '800', color: '#0CA789' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, fontSize: 12, fontWeight: 'bold', overflow: 'hidden' },
  available: { color: '#047857', backgroundColor: '#86EFAC' },
  unavailable: { color: '#991B1B', backgroundColor: '#FEE2E2' },
  info: { color: '#475569', marginBottom: 4 },
  description: { color: '#64748B', fontStyle: 'italic', marginTop: 4 },
  button: { marginTop: 10, backgroundColor: '#85E085', borderRadius: 7, paddingVertical: 11, alignItems: 'center' },
  buttonText: { color: '#14532D', fontWeight: '800' },
});
