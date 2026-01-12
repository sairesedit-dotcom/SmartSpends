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
  const [language, setLanguage] = useState('tr');
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setLanguage(parsed.language || 'tr');
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

  const changeLanguage = (lang) => {
    setLanguage(lang);
    saveSettings('language', lang);
    Alert.alert(
      lang === 'tr' ? 'Dil Değiştirildi' : 'Language Changed',
      lang === 'tr' ? 'Türkçe olarak ayarlandı' : 'Set to English'
    );
  };

  const toggleNotifications = (value) => {
    setNotifications(value);
    saveSettings('notifications', value);
  };

  const clearAllData = () => {
    Alert.alert(
      language === 'tr' ? 'Tüm Verileri Sil' : 'Clear All Data',
      language === 'tr'
        ? 'Tüm harcamalar, bütçe ve hatırlatıcılar silinecek. Emin misiniz?'
        : 'All expenses, budget, and reminders will be deleted. Are you sure?',
      [
        { text: language === 'tr' ? 'İptal' : 'Cancel', style: 'cancel' },
        {
          text: language === 'tr' ? 'Sil' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['expenses', 'budget', 'reminders']);
            Alert.alert(
              language === 'tr' ? 'Başarılı' : 'Success',
              language === 'tr' ? 'Tüm veriler silindi' : 'All data cleared'
            );
          },
        },
      ]
    );
  };

  const texts = {
    tr: {
      title: 'Ayarlar',
      subtitle: 'Uygulama Ayarları',
      appearance: 'Görünüm',
      darkMode: 'Karanlık Mod',
      theme: 'Tema Rengi',
      language: 'Dil',
      notifications: 'Bildirimler',
      data: 'Veri Yönetimi',
      clearData: 'Tüm Verileri Sil',
      about: 'Uygulama Hakkında',
      version: 'Versiyon',
    },
    en: {
      title: 'Settings',
      subtitle: 'App Settings',
      appearance: 'Appearance',
      darkMode: 'Dark Mode',
      theme: 'Theme Color',
      language: 'Language',
      notifications: 'Notifications',
      data: 'Data Management',
      clearData: 'Clear All Data',
      about: 'About',
      version: 'Version',
    },
  };

  const t = texts[language];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.title}</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {t.subtitle}
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Appearance Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Ionicons name="color-palette" size={20} color={colors.text} /> {t.appearance}
          </Text>

          {/* Dark Mode */}
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
                  {t.darkMode}
                </Text>
                <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
                  {isDark
                    ? language === 'tr'
                      ? 'Karanlık tema aktif'
                      : 'Dark theme active'
                    : language === 'tr'
                    ? 'Aydınlık tema aktif'
                    : 'Light theme active'}
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

        {/* Theme Color */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Ionicons name="color-filter" size={20} color={colors.text} /> {t.theme}
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

        {/* Language */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Ionicons name="language" size={20} color={colors.text} /> {t.language}
          </Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                { backgroundColor: colors.input, borderColor: colors.border },
                language === 'tr' && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => changeLanguage('tr')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  { color: colors.text },
                  language === 'tr' && { color: '#fff' },
                ]}
              >
                🇹🇷 Türkçe
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageButton,
                { backgroundColor: colors.input, borderColor: colors.border },
                language === 'en' && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => changeLanguage('en')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  { color: colors.text },
                  language === 'en' && { color: '#fff' },
                ]}
              >
                🇬🇧 English
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.light }]}>
                <Ionicons name="notifications" size={22} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.settingText, { color: colors.text }]}>
                  {t.notifications}
                </Text>
                <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
                  {notifications
                    ? language === 'tr'
                      ? 'Bildirimler açık'
                      : 'Notifications on'
                    : language === 'tr'
                    ? 'Bildirimler kapalı'
                    : 'Notifications off'}
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

        {/* Data Management */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Ionicons name="server" size={20} color={colors.text} /> {t.data}
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
            <Text style={styles.dangerButtonText}>{t.clearData}</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Ionicons name="information-circle" size={20} color={colors.text} /> {t.about}
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
              {t.version}: 1.0.0
            </Text>
          </View>
          <Text style={[styles.copyright, { color: colors.textTertiary }]}>
            © 2025 Smart Spend
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingSubtext: {
    fontSize: 13,
    marginTop: 2,
  },
  themeGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  themeButton: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeButtonSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  themeNames: {
    flexDirection: 'row',
    gap: 12,
  },
  themeName: {
    flex: 1,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  languageButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
  },
  copyright: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});