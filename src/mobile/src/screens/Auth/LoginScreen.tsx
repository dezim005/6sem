import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

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
    <View style={styles.container}>
      <Text style={styles.title}>VagaLivre</Text>
      <Text style={styles.subtitle}>Gestão Inteligente de Vagas</Text>

      <TextInput
        style={styles.input}
        placeholder="Seu e-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Sua senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 16 }}>
        <Text style={styles.linkText}>Não possui conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F8FAFC' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1E3A8A', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: '#fff', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', marginBottom: 16 },
  button: { backgroundColor: '#2563EB', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkText: { color: '#2563EB', textAlign: 'center', fontWeight: '500' }
});