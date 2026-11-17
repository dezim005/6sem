import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';

// Telas
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { SpotsScreen } from '../screens/Spots/SpotsScreen';
import { ReservationsScreen } from '../screens/Reservations/ReservationsScreen';
import { NotificationsScreen } from '../screens/Notifications/NotificationsScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { AdminUsersScreen } from '../screens/Admin/AdminUsersScreen';

const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

// Barra de Abas Inferior (Após Login)
function MainTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1E3A8A' },
        headerTintColor: '#FFFFFF',
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 6 },
      }}
    >
      <Tab.Screen name="Vagas" component={SpotsScreen} options={{ title: 'Vagas' }} />
      <Tab.Screen name="Reservas" component={ReservationsScreen} options={{ title: 'Agendamentos' }} />
      <Tab.Screen name="Avisos" component={NotificationsScreen} options={{ title: 'Notificações' }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} options={{ title: 'Meu Perfil' }} />
    </Tab.Navigator>
  );
}

// Navegador Raiz que alterna entre Autenticação e Sistema Interno
export const AppNavigator = () => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (
        // Fluxo Deslogado
        <RootStack.Screen name="Auth" component={LoginScreen} />
      ) : (
        // Fluxo Logado (Abas + Telas Modais/Pilhas como Admin)
        <>
          <RootStack.Screen name="Main" component={MainTabs} />
          <RootStack.Screen 
            name="AdminUsers" 
            component={AdminUsersScreen} 
            options={{ headerShown: true, title: 'Moderação de Moradores', headerStyle: { backgroundColor: '#1E3A8A' }, headerTintColor: '#fff' }} 
          />
        </>
      )}
    </RootStack.Navigator>
  );
};