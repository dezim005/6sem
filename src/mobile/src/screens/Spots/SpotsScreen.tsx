import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { spotService } from '../../services/spotService';
import { reservationService } from '../../services/reservationService';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import { Spot } from '../../types';

// ============================================================================
// 1. HELPER: CATEGORIA / TIPO DA VAGA
// ============================================================================
function getNormalizedCategory(spot: any): { key: string; label: string } {
  if (!spot) return { key: 'standard', label: 'Padrão' };
  const rawType = String(
    spot.type ||
    spot.category ||
    spot.vehicleType ||
    spot.spotType ||
    spot.tipo ||
    spot.categoria ||
    ''
  ).toLowerCase().trim();

  if (rawType.includes('suv')) return { key: 'suv', label: 'SUV' };
  if (rawType.includes('moto') || rawType.includes('motorcycle')) return { key: 'motorcycle', label: 'Moto' };
  if (rawType.includes('compact') || rawType.includes('compacto')) return { key: 'compact', label: 'Compacto' };
  return { key: 'standard', label: 'Padrão' };
}

// ============================================================================
// 2. HELPER: EXTRAÇÃO DOS DIAS DISPONÍVEIS DA VAGA
// ============================================================================
function getAvailableDates(spot: any): string[] {
  if (!spot) return [];
  if (spot.isAvailable === false) return [];

  // Espelha o calendário da versão web: availability define os dias livres
  // e reservations remove dias já reservados.
  const intervals = spot.availability || spot.availabilities || spot.schedules || spot.disponibilidades;
  if (Array.isArray(intervals) && intervals.length > 0) {
    const datesSet = new Set<string>();
    intervals.forEach((interval: any) => {
      const start = new Date(interval.startDate || interval.startTime || interval.start);
      const end = new Date(interval.endDate || interval.endTime || interval.end);
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const curr = new Date(start);
        while (curr <= end) {
          const dateStr = [
            curr.getUTCFullYear(),
            String(curr.getUTCMonth() + 1).padStart(2, '0'),
            String(curr.getUTCDate()).padStart(2, '0'),
          ].join('-');
          const today = new Date();
          const todayStr = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, '0'),
            String(today.getDate()).padStart(2, '0'),
          ].join('-');
          if (dateStr >= todayStr) datesSet.add(dateStr);
          curr.setUTCDate(curr.getUTCDate() + 1);
        }
      }
    });
    const reservations = Array.isArray(spot.reservations) ? spot.reservations : [];
    return Array.from(datesSet).filter((dateStr) => {
      const dayStart = new Date(`${dateStr}T00:00:00Z`);
      const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);
      return !reservations.some((reservation: any) => {
        const start = new Date(reservation.startTime);
        const end = new Date(reservation.endTime);
        return start <= dayEnd && end >= dayStart;
      });
    }).sort();
  }

  return [];
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export const SpotsScreen = () => {
  const { user } = useAuth();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Controle do Modal de Reserva
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedSpot, setSelectedSpot] = useState<any | null>(null);
  // Controle do Calendário no Modal
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10); // 10 = Novembro (0-indexed)
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);

  async function loadSpots() {
    setLoading(true);
    try {
      const data = await spotService.listAll(user?.condominiumId);
      setSpots(data);
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as vagas do condomínio.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSpots();
  }, [user?.condominiumId]);

  function handleOpenBooking(spot: any) {
    const availableDates = getAvailableDates(spot);
    if (availableDates.length === 0) {
      Alert.alert('Vaga Indisponível', 'Não há dias disponíveis cadastrados para esta vaga no momento.');
      return;
    }

    setSelectedSpot(spot);
    // Se a primeira data disponível existir, define o mês do calendário para ela
    if (availableDates.length > 0) {
      const firstDate = new Date(availableDates[0] + 'T00:00:00');
      if (!isNaN(firstDate.getTime())) {
        setCurrentYear(firstDate.getFullYear());
        setCurrentMonth(firstDate.getMonth());
      }
      setSelectedDates([availableDates[0]]);
    } else {
      setSelectedDates([]);
    }
    setModalVisible(true);
  }

  function toggleDateSelection(dateStr: string, isAvailable: boolean) {
    if (!isAvailable) return;

    if (selectedDates.includes(dateStr)) {
      if (selectedDates.length === 1) return; // mantém pelo menos uma
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    } else {
      // Ordena as datas selecionadas
      const updated = [...selectedDates, dateStr].sort();
      setSelectedDates(updated);
    }
  }

  async function handleConfirmBooking() {
    if (!selectedSpot || selectedDates.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um dia disponível no calendário.');
      return;
    }
    if (!user?.id) {
      Alert.alert('Erro', 'Você precisa estar autenticado para reservar.');
      return;
    }

    const sortedDates = [...selectedDates].sort();
    for (let i = 1; i < sortedDates.length; i++) {
      const previous = new Date(`${sortedDates[i - 1]}T00:00:00Z`);
      const current = new Date(`${sortedDates[i]}T00:00:00Z`);
      const expected = new Date(previous);
      expected.setUTCDate(expected.getUTCDate() + 1);
      if (current.getTime() !== expected.getTime()) {
        Alert.alert(
          'Período inválido',
          'Selecione dias consecutivos dentro do período disponível.'
        );
        return;
      }
    }

    setBookingLoading(true);
    try {
      const [startYear, startMonth, startDay] = sortedDates[0].split('-').map(Number);
      const [endYear, endMonth, endDay] =
        sortedDates[sortedDates.length - 1].split('-').map(Number);
      const startTime = new Date(Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0, 0)).toISOString();
      const endTime = new Date(Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59, 999)).toISOString();

      await reservationService.createReservation({
        spotId: selectedSpot.id,
        userId: user.id,
        startTime,
        endTime,
      });

      const spotName = selectedSpot.spotNumber || selectedSpot.number || selectedSpot.id;
      try {
        await notificationService.sendReservationConfirmed({
          userId: user.id,
          userEmail: user.email,
          title: 'Reserva Confirmada',
          message: `Sua reserva da vaga ${spotName} foi confirmada com sucesso no sistema Vaga Livre!`,
        });
      } catch (notificationError) {
        console.error('Falha ao enviar notificação da reserva:', notificationError);
      }

      Alert.alert('Sucesso! 🎉', `Vaga ${spotName} reservada com sucesso!`);
      setModalVisible(false);
      loadSpots();
    } catch (error: any) {
      Alert.alert('Erro na Reserva', error.response?.data?.message || 'Falha ao agendar vaga.');
    } finally {
      setBookingLoading(false);
    }
  }

  // Gera a matriz de dias do mês atual para o calendário
  function renderCalendarDays(availableDatesList: string[]) {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Domingo

    const days = [];
    // Espaços vazios antes do primeiro dia
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const fullDateStr = `${currentYear}-${monthStr}-${dayStr}`;

      const isAvailable = availableDatesList.includes(fullDateStr);
      const isSelected = selectedDates.includes(fullDateStr);

      days.push(
        <TouchableOpacity
          key={fullDateStr}
          style={[
            styles.calendarCell,
            isAvailable && styles.cellAvailable,
            isSelected && styles.cellSelected,
          ]}
          onPress={() => toggleDateSelection(fullDateStr, isAvailable)}
          disabled={!isAvailable}
        >
          <Text
            style={[
              styles.cellText,
              isAvailable && styles.cellTextAvailable,
              isSelected && styles.cellTextSelected,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  }

  const monthNames = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ];

  // Filtros
  const filteredSpots = spots.filter((s: any) => {
    const num = String(s.spotNumber || s.number || s.numero || '').toLowerCase();
    const loc = String(s.location || s.localizacao || '').toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || num.includes(query) || loc.includes(query);
    const categoryInfo = getNormalizedCategory(s);
    const matchesCategory = selectedCategory === 'all' || categoryInfo.key === selectedCategory;
    const isConfigured = s.isAvailable !== false && getAvailableDates(s).length > 0;
    return isConfigured && matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      {/* Busca */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Buscar por número ou localização..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categorias */}
      <View style={styles.filterBar}>
        {[
          { key: 'all', label: 'Todas' },
          { key: 'standard', label: 'Padrão' },
          { key: 'suv', label: 'SUV' },
          { key: 'compact', label: 'Compacto' },
          { key: 'motorcycle', label: 'Moto' },
        ].map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.filterChip, selectedCategory === cat.key && styles.filterChipActive]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <Text style={[styles.filterText, selectedCategory === cat.key && styles.filterTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Listagem */}
      {loading ? (
        <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 40 }} />
      ) : filteredSpots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🅿️</Text>
          <Text style={styles.emptyText}>Nenhuma vaga encontrada no momento.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSpots}
          keyExtractor={(item) => String(item.id)}
          onRefresh={loadSpots}
          refreshing={loading}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }: { item: any }) => {
            const spotNum = item.spotNumber || item.number || item.numero || item.id;
            const spotLoc = item.location || item.localizacao || 'Térreo';
            const ownerName = item.ownerName || item.announcedBy || item.user?.name || 'Morador';
            const availableDates = getAvailableDates(item);
            const hasDates = availableDates.length > 0;
            const { label: categoryLabel } = getNormalizedCategory(item);

            return (
              <View style={[styles.card, !hasDates && styles.cardOccupied]}>
                <View style={styles.cardHeader}>
                  <View style={styles.spotTitleRow}>
                    <Text style={styles.spotIcon}>🅿️</Text>
                    <Text style={styles.spotTitle}>Vaga {spotNum}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      hasDates ? styles.statusBadgeAvailable : styles.statusBadgeOccupied,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        hasDates ? styles.statusTextAvailable : styles.statusTextOccupied,
                      ]}
                    >
                      {hasDates ? 'Disponível' : 'Indisponível'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.infoLine}>📍 {spotLoc}</Text>
                <Text style={styles.infoLine}>🏷️ Tipo: <Text style={styles.boldText}>{categoryLabel}</Text></Text>
                <Text style={styles.infoLine}>👤 Anunciada por: {ownerName}</Text>

                {item.description ? (
                  <Text style={styles.descriptionText}>"{item.description}"</Text>
                ) : null}

                {hasDates ? (
                  <TouchableOpacity
                    style={styles.reserveButton}
                    onPress={() => handleOpenBooking(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.reserveButtonText}>👁️ Ver Disponibilidade e Reservar</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.disabledButton}>
                    <Text style={styles.disabledButtonText}>🔒 Sem Dias Disponíveis</Text>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}

      {/* Modal de Agendamento com CALENDÁRIO VISUAL (Idêntico à Web) */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Reservar Vaga: {selectedSpot?.spotNumber || selectedSpot?.number || selectedSpot?.numero}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              📍 {selectedSpot?.location || 'Localização Padrão'} • Tipo: {getNormalizedCategory(selectedSpot).label}
            </Text>
            <Text style={styles.calendarHint}>
              Selecione o período no calendário abaixo. Apenas os dias disponíveis (em verde) podem ser selecionados.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Controles de Mês do Calendário */}
              <View style={styles.calendarHeader}>
                <TouchableOpacity
                  onPress={() => {
                    if (currentMonth === 0) {
                      setCurrentMonth(11);
                      setCurrentYear(currentYear - 1);
                    } else {
                      setCurrentMonth(currentMonth - 1);
                    }
                  }}
                  style={styles.monthNavBtn}
                >
                  <Text style={styles.monthNavText}>‹</Text>
                </TouchableOpacity>

                <Text style={styles.monthTitle}>
                  {monthNames[currentMonth]} {currentYear}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    if (currentMonth === 11) {
                      setCurrentMonth(0);
                      setCurrentYear(currentYear + 1);
                    } else {
                      setCurrentMonth(currentMonth + 1);
                    }
                  }}
                  style={styles.monthNavBtn}
                >
                  <Text style={styles.monthNavText}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Cabeçalho dos Dias da Semana */}
              <View style={styles.weekDaysRow}>
                {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'].map((w) => (
                  <Text key={w} style={styles.weekDayText}>{w}</Text>
                ))}
              </View>

              {/* Grade de Dias */}
              <View style={styles.calendarGrid}>
                {renderCalendarDays(getAvailableDates(selectedSpot))}
              </View>

              {/* Resumo dos Dias Selecionados */}
              <View style={styles.selectedSummary}>
                <Text style={styles.selectedSummaryText}>
                  Dias selecionados: <Text style={styles.boldText}>{selectedDates.length} dia(s)</Text>
                  {selectedDates.length > 0 && ` (${selectedDates[0]} até ${selectedDates[selectedDates.length - 1]})`}
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={() => setModalVisible(false)}
                  disabled={bookingLoading}
                >
                  <Text style={styles.cancelModalBtnText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.confirmModalBtn,
                    selectedDates.length === 0 && styles.confirmBtnDisabled,
                  ]}
                  onPress={handleConfirmBooking}
                  disabled={bookingLoading || selectedDates.length === 0}
                >
                  {bookingLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.confirmModalBtnText}>Confirmar Reserva</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ============================================================================
// ESTILOS VISUAIS (ALINHADOS À IDENTIDADE DA WEB)
// ============================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  searchContainer: { marginBottom: 10 },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  filterBar: { flexDirection: 'row', marginBottom: 14, flexWrap: 'wrap', gap: 6 },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  filterChipActive: { backgroundColor: '#1E3A8A' },
  filterText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  filterTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyText: { fontSize: 15, color: '#64748B' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardOccupied: { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1', opacity: 0.85 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  spotTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  spotIcon: { fontSize: 18 },
  spotTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F766E' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeAvailable: { backgroundColor: '#D1FAE5' },
  statusBadgeOccupied: { backgroundColor: '#FEE2E2' },
  statusBadgeText: { fontSize: 12, fontWeight: 'bold' },
  statusTextAvailable: { color: '#059669' },
  statusTextOccupied: { color: '#DC2626' },
  infoLine: { fontSize: 13, color: '#475569', marginBottom: 4 },
  boldText: { fontWeight: 'bold', color: '#1E293B' },
  descriptionText: { fontStyle: 'italic', color: '#64748B', fontSize: 13, marginVertical: 6 },
  reserveButton: {
    backgroundColor: '#85E085',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  reserveButtonText: { color: '#14532D', fontWeight: '800', fontSize: 14 },
  disabledButton: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButtonText: { color: '#64748B', fontWeight: '600', fontSize: 13 },
  // Modal & Calendário
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 14 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  closeIcon: { fontSize: 20, color: '#64748B', padding: 4 },
  modalSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 6 },
  calendarHint: { fontSize: 12, color: '#475569', backgroundColor: '#F1F5F9', padding: 8, borderRadius: 6, marginBottom: 12 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  monthNavBtn: { paddingHorizontal: 12, paddingVertical: 4 },
  monthNavText: { fontSize: 22, fontWeight: 'bold', color: '#1E3A8A' },
  monthTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', textTransform: 'capitalize' },
  weekDaysRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 6 },
  weekDayText: { width: '14%', textAlign: 'center', fontSize: 12, color: '#64748B', fontWeight: '600' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  calendarCell: {
    width: '14.28%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 6,
  },
  cellAvailable: { backgroundColor: '#D1FAE5' },
  cellSelected: { backgroundColor: '#22C55E' },
  cellText: { fontSize: 13, color: '#94A3B8' },
  cellTextAvailable: { color: '#065F46', fontWeight: 'bold' },
  cellTextSelected: { color: '#FFFFFF', fontWeight: 'bold' },
  selectedSummary: { backgroundColor: '#F8FAFC', padding: 8, borderRadius: 6, marginBottom: 12 },
  selectedSummaryText: { fontSize: 12, color: '#334155' },
  fieldLabel: { fontSize: 13, fontWeight: 'bold', color: '#334155', marginBottom: 4 },
  plateInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    marginBottom: 14,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelModalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#E2E8F0', alignItems: 'center' },
  cancelModalBtnText: { color: '#475569', fontWeight: 'bold' },
  confirmModalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#22C55E', alignItems: 'center' },
  confirmBtnDisabled: { backgroundColor: '#A7F3D0', opacity: 0.7 },
  confirmModalBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
});