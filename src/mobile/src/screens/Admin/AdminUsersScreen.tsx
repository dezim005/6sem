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
import { userService } from '../../services/userService';
import { User } from '../../types';

export const AdminUsersScreen = () => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function loadPending() {
    setLoading(true);
    try {
      // Busca todos os moradores pendentes de todos os condomínios
      const data = await userService.listPendingUsers();
      const list = Array.isArray(data) ? data : (data as any)?.data || [];
      setPendingUsers(list);
    } catch (error) {
      console.error('Erro ao buscar usuários pendentes:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de aprovação.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  async function handleStatusChange(userId: string, status: 'approved' | 'denied') {
    setProcessingId(userId);
    try {
      await userService.updateUserStatus(userId, status);
      Alert.alert('Sucesso', `Morador ${status === 'approved' ? 'aprovado' : 'recusado'} com sucesso!`);
      // Remove o morador aprovado/recusado da lista na tela
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao atualizar status.');
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Solicitações de Acesso</Text>
        <Text style={styles.subtitle}>Exibindo pendências de todos os condomínios</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 40 }} />
      ) : pendingUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyText}>Nenhuma solicitação pendente no momento.</Text>
        </View>
      ) : (
        <FlatList
          data={pendingUsers}
          keyExtractor={(item) => item.id}
          onRefresh={loadPending}
          refreshing={loading}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.statusBadge}>Pendente</Text>
              </View>

              <Text style={styles.cardEmail}>✉️ {item.email}</Text>
              
              {/* Exibe o condomínio do morador */}
              <Text style={styles.cardCondo}>
                🏢 Condomínio: {item.condominiumName || item.condominiumId || 'Não informado'}
              </Text>

              {(item.apartment || item.block) && (
                <Text style={styles.cardUnit}>
                  🏠 Apto: {item.apartment || '-'} | Bloco: {item.block || '-'}
                </Text>
              )}

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={() => handleStatusChange(item.id, 'approved')}
                  disabled={processingId === item.id}
                >
                  {processingId === item.id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.btnText}>Aprovar</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.denyBtn]}
                  onPress={() => handleStatusChange(item.id, 'denied')}
                  disabled={processingId === item.id}
                >
                  <Text style={styles.btnText}>Recusar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  header: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1E3A8A' },
  subtitle: { fontSize: 13, color: '#64748B' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#64748B' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  statusBadge: { backgroundColor: '#FEF3C7', color: '#D97706', fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  cardEmail: { fontSize: 13, color: '#475569', marginBottom: 4 },
  cardCondo: { fontSize: 13, fontWeight: '600', color: '#2563EB', marginBottom: 2 },
  cardUnit: { fontSize: 13, color: '#64748B', marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  approveBtn: { backgroundColor: '#10B981' },
  denyBtn: { backgroundColor: '#EF4444' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});