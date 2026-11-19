import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createNavigationContainerRef } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

// Telas
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { SpotsScreen } from '../screens/Spots/SpotsScreen';
import { ReservationsScreen } from '../screens/Reservations/ReservationsScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { AdminUsersScreen } from '../screens/Admin/AdminUsersScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen';
import { MySpotsScreen } from '../screens/Spots/MySpotsScreen';
import { RegisterCondominiumScreen } from '../screens/Admin/RegisterCondominiumScreen';
import { RentalHistoryScreen } from '../screens/Admin/RentalHistoryScreen';
import { ManageUsersScreen } from '../screens/Admin/ManageUsersScreen';
import { BrandLogo } from '../components/BrandLogo';
import { colors } from '../theme';

const RootStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

export const navigationRef = createNavigationContainerRef();

const menuItems = [
  { name: 'Painel', label: 'Painel', route: 'Dashboard' },
  { name: 'MinhasVagas', label: 'Minhas Vagas', route: 'MySpots' },
  { name: 'MinhasReservas', label: 'Minhas Reservas', route: 'Reservations' },
  { name: 'Reservar', label: 'Reservar Vaga', route: 'Spots' },
];

function MainNavigator() {
  const { user, signOut } = useAuth();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const openDrawer = () => setDrawerVisible(true);
  const navigateTo = (route: string) => {
    setDrawerVisible(false);
    if (navigationRef.isReady()) {
      navigationRef.navigate({
        name: 'Main',
        params: { screen: route },
      } as never);
    }
  };

  return (
    <>
      <MainStack.Navigator
        screenOptions={({ navigation }) => ({
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#1F2937',
          headerTitleStyle: { color: '#1F2937', fontWeight: '700' },
          headerShadowVisible: true,
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerMenuButton}
              onPress={openDrawer}
              accessibilityLabel="Abrir menu"
            >
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerAvatar}
              onPress={() => navigation.navigate('Profile')}
              accessibilityLabel="Abrir perfil"
            >
              <Text style={styles.headerAvatarText}>
                {(user?.name?.trim().charAt(0) || 'U').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ),
        })}
      >
        <MainStack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Painel' }} />
        <MainStack.Screen name="MySpots" component={MySpotsScreen} options={{ title: 'Minhas Vagas' }} />
        <MainStack.Screen name="Reservations" component={ReservationsScreen} options={{ title: 'Minhas Reservas' }} />
        <MainStack.Screen name="Spots" component={SpotsScreen} options={{ title: 'Reservar Vaga' }} />
        <MainStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Meu Perfil' }} />
        <MainStack.Screen
          name="AdminUsers"
          component={AdminUsersScreen}
          options={{ title: 'Aprovações' }}
        />
        <MainStack.Screen
          name="RegisterCondominium"
          component={RegisterCondominiumScreen}
          options={{ title: 'Cadastrar Condomínio' }}
        />
        <MainStack.Screen
          name="RentalHistory"
          component={RentalHistoryScreen}
          options={{ title: 'Histórico de Aluguéis' }}
        />
        <MainStack.Screen
          name="ManageUsers"
          component={ManageUsersScreen}
          options={{ title: 'Gerenciar Usuários' }}
        />
      </MainStack.Navigator>

      <Modal
        visible={drawerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDrawerVisible(false)}
      >
        <View style={styles.drawerOverlay}>
          <TouchableOpacity
            style={styles.drawerBackdrop}
            activeOpacity={1}
            onPress={() => setDrawerVisible(false)}
          />
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <BrandLogo compact size={48} />
              <Text style={styles.drawerWordmark}>VAGA LIVRE</Text>
            </View>

            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.route}
                style={styles.drawerItem}
                onPress={() => {
                  navigateTo(item.route);
                }}
              >
                <Text style={styles.drawerItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}

            {user?.role === 'manager' ? (
              <>
                <Text style={styles.drawerSectionTitle}>Administração</Text>
                <TouchableOpacity style={styles.drawerItem} onPress={() => navigateTo('RegisterCondominium')}>
                  <Text style={styles.drawerItemText}>Cadastrar Condomínio</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => navigateTo('ManageUsers')}>
                  <Text style={styles.drawerItemText}>Gerenciar Usuários</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => navigateTo('RentalHistory')}>
                  <Text style={styles.drawerItemText}>Histórico de Aluguéis</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => navigateTo('AdminUsers')}>
                  <Text style={styles.drawerItemText}>Aprovações</Text>
                </TouchableOpacity>
              </>
            ) : null}

            <TouchableOpacity
              style={styles.drawerProfileItem}
              onPress={() => navigateTo('Profile')}
            >
              <Text style={styles.drawerProfileItemText}>Ver Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.drawerLogoutItem}
              onPress={() => {
                setDrawerVisible(false);
                signOut();
              }}
            >
              <Text style={styles.drawerLogoutText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
     <>
       <RootStack.Screen name="Auth" component={LoginScreen} />
       <RootStack.Screen 
         name="Register" 
         component={RegisterScreen} 
         options={{ headerShown: true, title: 'Criar Nova Conta', headerStyle: { backgroundColor: '#1E3A8A' }, headerTintColor: '#fff' }} 
       />
     </>
   ) : (
        // Fluxo Logado com navegação lateral
        <>
          <RootStack.Screen name="Main" component={MainNavigator} />
        </>
      )}
    </RootStack.Navigator>
  );
};

const styles = StyleSheet.create({
  headerMenuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    color: '#1F2937',
    fontSize: 24,
    lineHeight: 26,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: 'bold',
  },
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '78%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
  },
  drawerHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  drawerWordmark: {
    color: '#0CA789',
    fontSize: 21,
    fontWeight: '900',
    marginTop: 8,
  },
  drawerAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  drawerAvatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  drawerName: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  drawerEmail: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 2,
  },
  drawerItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  drawerItemText: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '600',
  },
  drawerSectionTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  drawerProfileItem: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  drawerProfileItemText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: 'bold',
  },
  drawerLogoutItem: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  drawerLogoutText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

