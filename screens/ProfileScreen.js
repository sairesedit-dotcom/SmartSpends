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

const THEMES = {
  purple: { primary: '#6C5CE7', name: 'Mor' },
  blue: { primary: '#4A90E2', name: 'Mavi' },
  green: { primary: '#2ECC71', name: 'Yeşil' },
  orange: { primary: '#E67E22', name: 'Turuncu' },
  pink: { primary: '#E84393', name: 'Pembe' },
};

export default function ProfileScreen() {
  const [language, setLanguage] = useState('tr');
  const [theme, setTheme] = useState('purple');
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
        setTheme(parsed.theme || 'purple');
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

  const changeTheme = (themeName) => {
    setTheme(themeName);
    saveSettings('theme', themeName);
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
      title: 'Profil',
      subtitle: 'Ayarlar ve Kişiselleştirme',
      language: 'Dil',
      theme: 'Tema Rengi',
      notifications: 'Bildirimler',
      data: 'Veri Yönetimi',
      clearData: 'Tüm Verileri Sil',
      version: 'Versiyon',
    },
    en: {
      title: 'Profile',
      subtitle: 'Settings and Customization',
      language: 'Language',
      theme: 'Theme Color',
      notifications: 'Notifications',
      data: 'Data Management',
      clearData: 'Clear All Data',
      version: 'Version',
    },
  };

  const t = texts[language];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.title}</Text>
        <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="language" size={20} color="#333" /> {t.language}
          </Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === 'tr' && { backgroundColor: THEMES[theme].primary },
              ]}
              onPress={() => changeLanguage('tr')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  language === 'tr' && { color: '#fff' },
                ]}
              >
                🇹🇷 Türkçe
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageButton,
                language === 'en' && { backgroundColor: THEMES[theme].primary },
              ]}
              onPress={() => changeLanguage('en')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  language === 'en' && { color: '#fff' },
                ]}
              >
                🇬🇧 English
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="color-palette" size={20} color="#333" /> {t.theme}
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
                onPress={() => changeTheme(themeName)}
              >
                {theme === themeName && (
                  <Ionicons name="checkmark" size={24} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.themeNames}>
            {Object.keys(THEMES).map((themeName) => (
              <Text key={themeName} style={styles.themeName}>
                {THEMES[themeName].name}
              </Text>
            ))}
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={24} color="#333" />
              <Text style={styles.settingText}>{t.notifications}</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#DDD', true: THEMES[theme].primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="server" size={20} color="#333" /> {t.data}
          </Text>
          <TouchableOpacity style={styles.dangerButton} onPress={clearAllData}>
            <Ionicons name="trash" size={20} color="#FF6B6B" />
            <Text style={styles.dangerButtonText}>{t.clearData}</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={20} color="#888" />
            <Text style={styles.infoText}>{t.version}: 1.0.0</Text>
          </View>
          <Text style={styles.copyright}>© 2025 Smart Spend</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignItems: 'center',
  },
  languageButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  themeGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  themeButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeButtonSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  themeNames: {
    flexDirection: 'row',
    gap: 12,
  },
  themeName: {
    flex: 1,
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE5E5',
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
    color: '#888',
  },
  copyright: {
    fontSize: 12,
    color: '#CCC',
    textAlign: 'center',
    marginTop: 8,
  },
});