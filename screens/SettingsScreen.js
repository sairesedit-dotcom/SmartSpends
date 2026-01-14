import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';

export default function SettingsScreen() {
  const { theme, setTheme, isDark, toggleDarkMode, colors, THEMES } = useTheme();
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setNotifications(parsed.notifications !== false);
      }
    } catch (error) {
      console.error('Ayarlar yüklenirken hata:', error);
    }
  };

  const saveSettings = async (key, value) => {
    try {
      const settings = await AsyncStorage.getItem('settings');
      const current = settings ? JSON.parse(settings) : {};
      current[key] = value;
      await AsyncStorage.setItem('settings', JSON.stringify(current));
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error);
    }
  };

  const toggleNotifications = (value) => {
    setNotifications(value);
    saveSettings('notifications', value);
  };

  const clearAllData = () => {
    Alert.alert(
      'Tüm Verileri Sil',
      'Tüm harcamalar, bütçe ve hatırlatıcılar silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['expenses', 'budget', 'reminders']);
            Alert.alert('Başarılı', 'Tüm veriler silindi');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ayarlar</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Uygulama Ayarları
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Görünüm Bölümü */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Ionicons name="color-palette" size={20} color={colors.text} /> Görünüm
          </Text>

          {/* Karanlık Mod */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: isDark ? colors.primary : colors.light },
                ]}
              >
                <Ionicons
                  name={isDark ? 'moon' : 'sunny'}
                  size={22}
                  color={isDark ? '#fff' : colors.primary}
                />
              </View>
              <View>
                <Text style={[styles.settingText, { color: colors.text }]}>
                  Karanlık Mod
                </Text>
                <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
                  {isDark ? 'Karanlık tema aktif' : 'Aydınlık tema aktif'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleDarkMode}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Tema Rengi */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Ionicons name="color-filter" size={20} color={colors.text} /> Tema Rengi
          </Text>
          <View style={styles.themeGrid}>
            {Object.keys(THEMES).map((themeName) => (
              <TouchableOpacity
                key={themeName}
                style={[
                  styles.themeButton,
                  { backgroundColor: THEMES[themeName].primary },
                  theme === themeName && styles.themeButtonSelected,
                ]}
                onPress={() => setTheme(themeName)}
              >
                {theme === themeName && (
                  <Ionicons name="checkmark-circle" size={28} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.themeNames}>
            {Object.keys(THEMES).map((themeName) => (
              <Text
                key={themeName}
                style={[styles.themeName, { color: colors.textSecondary }]}
              >
                {THEMES[themeName].name}
              </Text>
            ))}
          </View>
        </View>

        {/* Bildirimler */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.light }]}>
                <Ionicons name="notifications" size={22} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.settingText, { color: colors.text }]}>
                  Bildirimler
                </Text>
                <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
                  {notifications ? 'Bildirimler açık' : 'Bildirimler kapalı'}
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Veri Yönetimi */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Ionicons name="server" size={20} color={colors.text} /> Veri Yönetimi
          </Text>
          <TouchableOpacity
            style={[
              styles.dangerButton,
              {
                backgroundColor: isDark ? '#3a1a1a' : '#FFF5F5',
                borderColor: isDark ? '#5a2a2a' : '#FFE5E5',
              },
            ]}
            onPress={clearAllData}
          >
            <Ionicons name="trash" size={20} color="#FF6B6B" />
            <Text style={styles.dangerButtonText}>Tüm Verileri Sil</Text>
          </TouchableOpacity>
        </View>

        {/* Hakkında */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Ionicons name="information-circle" size={20} color={colors.text} /> Uygulama Hakkında
          </Text>
          <View style={styles.infoRow}>
            <Ionicons name="apps" size={18} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Smart Spend
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="code-slash" size={18} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Versiyon: 1.0.0
            </Text>
          </View>
          <Text style={[styles.copyright, { color: colors.textTertiary }]}>
            © 2026 Smart Spend
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 32, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 16, marginTop: 4 },
  section: { marginHorizontal: 20, marginTop: 20, padding: 20, borderRadius: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconContainer: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingText: { fontSize: 16, fontWeight: '600' },
  settingSubtext: { fontSize: 13, marginTop: 2 },
  themeGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  themeButton: { flex: 1, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  themeButtonSelected: { borderWidth: 3, borderColor: '#fff', elevation: 8 },
  themeNames: { flexDirection: 'row', gap: 12 },
  themeName: { flex: 1, fontSize: 12, textAlign: 'center', fontWeight: '500' },
  dangerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 12, borderWidth: 1 },
  dangerButtonText: { fontSize: 15, fontWeight: '600', color: '#FF6B6B' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  infoText: { fontSize: 14 },
  copyright: { fontSize: 12, textAlign: 'center', marginTop: 12 },
});