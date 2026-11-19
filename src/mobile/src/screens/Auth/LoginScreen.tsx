import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { BrandLogo } from '../../components/BrandLogo';
import { colors } from '../../theme';

export const LoginScreen = ({ navigation }: any) => {
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Atenção', 'Informe e-mail e senha.');
      return;
    }

    try {
      await signIn(email.trim(), password);
    } catch (error: any) {
      console.log('--- ERRO DETALHADO DO LOGIN ---');
      console.log('Status HTTP:', error.response?.status);
      console.log('Dados do Backend:', error.response?.data);
      console.log('Mensagem de Erro:', error.message);

      if (error.code === 'ECONNABORTED' || !error.response) {
        Alert.alert(
          'Servidor Inicializando',
          'A API no Render está acordando. Aguarde 30 segundos e tente novamente.'
        );
      } else if (error.response?.status === 502 || error.response?.status === 504) {
        Alert.alert(
          'Gateway / Microsserviço Dormindo',
          'O serviço de autenticação do Pedro está acordando no Render. Acesse a URL de health e tente em 30s.'
        );
      } else {
        const backendMessage = 
          error.response?.data?.message || 
          error.response?.data?.error || 
          JSON.stringify(error.response?.data) || 
          'Falha de autenticação.';
        Alert.alert(`Erro ${error.response?.status || ''}`, backendMessage);
      }
    }
  }


  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <BrandLogo size={68} />
        <View style={styles.divider} />
        <Text style={styles.title}>Bem-vindo(a) de volta!</Text>
        <Text style={styles.subtitle}>Insira suas credenciais para acessar o Vaga Livre.</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
        style={styles.input}
        placeholder="usuario@exemplo.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
        <Text style={styles.label}>Senha</Text>
        <TextInput
        style={styles.input}
        placeholder="********"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 16 }}>
        <Text style={styles.linkText}>Não tem uma conta? <Text style={styles.linkStrong}>Cadastre-se</Text></Text>
      </TouchableOpacity>
      </View>
      <Text style={styles.footer}>© 2026 Vaga Livre. Todos os direitos reservados.</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 18, backgroundColor: '#F8FAFC' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginTop: 18, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8, marginBottom: 22 },
  label: { color: '#334155', fontWeight: '600', fontSize: 13, marginBottom: 7 },
  input: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 7, borderWidth: 1, borderColor: '#CBD5E1', marginBottom: 16, color: '#0F172A' },
  button: { backgroundColor: '#0CA789', padding: 15, borderRadius: 7, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkText: { color: '#475569', textAlign: 'center', fontWeight: '500' },
  linkStrong: { color: '#0CA789', fontWeight: '700' },
  footer: { textAlign: 'center', color: '#64748B', fontSize: 12, marginTop: 18 },
});