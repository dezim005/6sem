import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { reservationService } from '../../services/reservationService';
import { spotService } from '../../services/spotService';
import { useAuth } from '../../contexts/AuthContext';
import { Reservation } from '../../types';

export const ReservationsScreen = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [spotNames, setSpotNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function loadReservations() {
    setLoading(true);
    try {
      const [data, spots] = await Promise.all([
        reservationService.listUserReservations(user?.id),
        spotService.listAll(),
      ]);
      setReservations(data);
      setSpotNames(Object.fromEntries(
        spots.map((spot) => [
          spot.id,
          spot.number || spot.spotNumber || spot.id,
        ])
      ));
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus agendamentos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReservations();
  }, [user?.id]);

  async function handleCancel(id: string) {
    Alert.alert(
      'Cancelar Reserva',
      'Tem certeza de que deseja liberar esta vaga?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(id);
            try {
              if (!user?.id) {
                Alert.alert('Erro', 'Usuário não autenticado.');
                setCancellingId(null);
                return;
              }
              await reservationService.cancelReservation(id, user.id);
              Alert.alert('Sucesso', 'Reserva cancelada com sucesso!');
              setReservations((prev) => prev.filter((r) => r.id !== id));
            } catch (error: any) {
              Alert.alert('Erro', error.response?.data?.message || 'Falha ao cancelar reserva.');
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Agendamentos</Text>
      <Text style={styles.subtitle}>Histórico de vagas reservadas por você</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 40 }} />
      ) : reservations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyText}>Você não possui nenhuma reserva ativa.</Text>
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.id}
          onRefresh={loadReservations}
          refreshing={loading}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.spotText}>
                  Vaga {item.spotNumber || spotNames[item.spotId] || item.spotId}
                </Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Confirmada</Text>
                </View>
              </View>

              {item.vehiclePlate ? (
                <Text style={styles.infoText}>🚘 Veículo: <Text style={styles.bold}>{item.vehiclePlate}</Text></Text>
              ) : null}
              <Text style={styles.infoText}>⏰ Início: {new Date(item.startTime).toLocaleString('pt-BR')}</Text>
              <Text style={styles.infoText}>⏰ Fim: {new Date(item.endTime).toLocaleString('pt-BR')}</Text>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleCancel(item.id)}
                disabled={cancellingId === item.id}
              >
                {cancellingId === item.id ? (
                  <ActivityIndicator color="#EF4444" size="small" />
                ) : (
                  <Text style={styles.cancelBtnText}>Cancelar Agendamento</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#1F2937' },
  subtitle: { fontSize: 13, color: '#64748B', marginBottom: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#64748B' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  spotText: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  activeBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  activeBadgeText: { color: '#059669', fontSize: 12, fontWeight: 'bold' },
  infoText: { fontSize: 13, color: '#475569', marginBottom: 4 },
  bold: { fontWeight: 'bold', color: '#1E293B' },
  cancelBtn: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
  },
  cancelBtnText: { color: '#DC2626', fontWeight: 'bold', fontSize: 13 },
});