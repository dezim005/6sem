import React, { useState, useEffect } from 'react';
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
import { Condominium } from '../../types';
import { BrandLogo } from '../../components/BrandLogo';
import { AppTextInput as TextInput } from '../../components/AppTextInput';

export const RegisterScreen = ({ navigation }: any) => {
  const { signUp, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [apartment, setApartment] = useState('');
  const [block, setBlock] = useState('');
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [selectedCondoId, setSelectedCondoId] = useState('');
  const [loadingCondos, setLoadingCondos] = useState(true);

  useEffect(() => {
    async function loadCondominiums() {
      try {
        const data = await condominiumService.listAll();
        const condoList = Array.isArray(data) ? data : (data as any)?.data || [];
        setCondominiums(condoList);
        if (condoList.length > 0) {
          setSelectedCondoId(condoList[0].id);
        }
      } catch (error) {
        console.warn('Falha ao carregar condomínios, usando fallback.');
        setCondominiums([{ id: 'condo-flores', name: 'Residencial Flores' }]);
        setSelectedCondoId('condo-flores');
      } finally {
        setLoadingCondos(false);
      }
    }
    loadCondominiums();
  }, []);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }

    try {
      await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        condominiumId: selectedCondoId,
        apartment: apartment.trim(),
        block: block.trim(),
      });

      Alert.alert(
        'Cadastro Realizado!',
        'Sua solicitação foi enviada. Se você for o primeiro usuário deste condomínio, terá acesso como síndico; caso contrário, aguarde a aprovação.',
        [{ text: 'Ir para Login', onPress: () => navigation.navigate('Auth') }]
      );
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erro ao registrar usuário.';
      Alert.alert('Erro no Cadastro', msg);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <BrandLogo size={58} />
        <View style={styles.divider} />
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Junte-se ao Vaga Livre no seu condomínio</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome completo *"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail *"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha (mínimo 6 caracteres) *"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar Senha *"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 8 }]}
          placeholder="Apto"
          value={apartment}
          onChangeText={setApartment}
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Bloco"
          value={block}
          onChangeText={setBlock}
        />
      </View>

      <Text style={styles.label}>Selecione o Condomínio:</Text>
      {loadingCondos ? (
        <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 8 }} />
      ) : (
        <View style={styles.condoSelector}>
          {condominiums.map((condo) => (
            <TouchableOpacity
              key={condo.id}
              style={[
                styles.condoChip,
                selectedCondoId === condo.id && styles.condoChipActive,
              ]}
              onPress={() => setSelectedCondoId(condo.id)}
            >
              <Text
                style={[
                  styles.condoChipText,
                  selectedCondoId === condo.id && styles.condoChipTextActive,
                ]}
              >
                🏢 {condo.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Cadastrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('Auth')}
        style={{ marginTop: 16 }}
      >
        <Text style={styles.linkText}>Já tem uma conta? Entrar</Text>
      </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 18, backgroundColor: '#F8FAFC', flexGrow: 1, justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#EDF2F7', padding: 20 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 6, marginBottom: 20 },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 12,
  },
  row: { flexDirection: 'row' },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  condoSelector: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  condoChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
    marginBottom: 8,
  },
  condoChipActive: { backgroundColor: '#0CA789' },
  condoChipText: { fontSize: 13, color: '#334155', fontWeight: '500' },
  condoChipTextActive: { color: '#fff', fontWeight: 'bold' },
  button: {
    backgroundColor: '#0CA789',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkText: { color: '#2563EB', textAlign: 'center', fontWeight: '500' },
});