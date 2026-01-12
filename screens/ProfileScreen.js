import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';

const AVATARS = ['😊', '😎', '🤓', '😇', '🥳', '🤩', '😸', '🦊', '🐼', '🐨', '🦁', '🐯'];

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    avatar: '😊',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await AsyncStorage.getItem('profile');
      if (profileData) {
        setProfile(JSON.parse(profileData));
      }
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
    }
  };

  const saveProfile = async (newProfile) => {
    try {
      await AsyncStorage.setItem('profile', JSON.stringify(newProfile));
      setProfile(newProfile);
    } catch (error) {
      console.error('Profil kaydedilirken hata:', error);
    }
  };

  const updateProfile = () => {
    if (!profile.name.trim()) {
      Alert.alert('Uyarı', 'Lütfen isim girin!');
      return;
    }
    saveProfile(profile);
    setModalVisible(false);
    Alert.alert('Başarılı', 'Profil güncellendi!');
  };

  const sendSummaryEmail = async () => {
    if (!profile.email) {
      Alert.alert('Uyarı', 'Lütfen önce e-posta adresinizi girin!');
      return;
    }

    try {
      // Verileri topla
      const expenses = await AsyncStorage.getItem('expenses');
      const budget = await AsyncStorage.getItem('budget');
      const reminders = await AsyncStorage.getItem('reminders');

      const expensesData = expenses ? JSON.parse(expenses) : [];
      const budgetData = budget ? JSON.parse(budget) : { monthly: 0, spent: 0 };
      const remindersData = reminders ? JSON.parse(reminders) : [];

      const totalExpense = expensesData.reduce((sum, e) => sum + e.amount, 0);
      const remaining = budgetData.monthly - budgetData.spent;

      const summary = `
📊 Smart Spend - Hesap Özeti
━━━━━━━━━━━━━━━━━━━━━━━━
👤 ${profile.name}
📅 ${new Date().toLocaleDateString('tr-TR')}

💰 BÜTÇE
Aylık Bütçe: ₺${budgetData.monthly.toFixed(2)}
Harcanan: ₺${budgetData.spent.toFixed(2)}
Kalan: ₺${remaining.toFixed(2)}

📝 HARCAMALAR
Toplam: ₺${totalExpense.toFixed(2)}
Kayıt: ${expensesData.length} adet

🔔 HATIRLATICILAR
Aktif: ${remindersData.length} adet
Aylık Toplam: ₺${remindersData.reduce((sum, r) => sum + r.amount, 0).toFixed(2)}
      `;

      // Email gönderme simülasyonu (gerçek uygulamada backend'e istek atılmalı)
      Alert.alert(
        '📧 Özet Hazır',
        `E-posta ${profile.email} adresine gönderilecek:\n\n${summary}`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Gönder',
            onPress: () => {
              // Burada gerçek email API'si kullanılabilir
              Alert.alert('✅ Başarılı', 'Özet e-postanıza gönderildi!');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Özet oluşturulurken hata:', error);
      Alert.alert('Hata', 'Özet oluşturulamadı!');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profil</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Hesap Bilgileri
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[styles.avatarContainer, { backgroundColor: colors.light }]}
            onPress={() => setAvatarModalVisible(true)}
          >
            <Text style={styles.avatar}>{profile.avatar}</Text>
            <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="pencil" size={12} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={[styles.profileName, { color: colors.text }]}>
            {profile.name || 'İsim belirtilmemiş'}
          </Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
            {profile.email || 'E-posta eklenmemiş'}
          </Text>

          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.light }]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="create-outline" size={18} color={colors.primary} />
            <Text style={[styles.editButtonText, { color: colors.primary }]}>
              Profili Düzenle
            </Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Ionicons name="analytics" size={20} color={colors.text} /> İşlemler
          </Text>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.light }]}
            onPress={sendSummaryEmail}
          >
            <View style={styles.actionLeft}>
              <Ionicons name="mail" size={24} color={colors.primary} />
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>
                  Özet Gönder
                </Text>
                <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                  Hesap özetini e-postana gönder
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Ionicons name="stats-chart" size={20} color={colors.text} /> İstatistikler
          </Text>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.light }]}>
              <Ionicons name="wallet" size={28} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {profile.expenseCount || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Harcama
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.light }]}>
              <Ionicons name="cash" size={28} color={colors.success} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {profile.budgetCount || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Gelir Kaydı
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.light }]}>
              <Ionicons name="notifications" size={28} color={colors.warning} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {profile.reminderCount || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Hatırlatıcı
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Profili Düzenle
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>İsim</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                placeholder="İsminizi girin"
                placeholderTextColor={colors.textSecondary}
                value={profile.name}
                onChangeText={(text) => setProfile({ ...profile, name: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>E-posta</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                placeholder="ornek@email.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                value={profile.email}
                onChangeText={(text) => setProfile({ ...profile, email: text })}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={updateProfile}
            >
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Avatar Picker Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={avatarModalVisible}
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.avatarModalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Avatar Seç</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.avatarOption,
                    { backgroundColor: colors.light },
                    profile.avatar === emoji && {
                      borderColor: colors.primary,
                      borderWidth: 3,
                    },
                  ]}
                  onPress={() => {
                    setProfile({ ...profile, avatar: emoji });
                    saveProfile({ ...profile, avatar: emoji });
                    setAvatarModalVisible(false);
                  }}
                >
                  <Text style={styles.avatarEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
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
  profileCard: {
    margin: 20,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 50,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  avatarModalContent: {
    margin: 20,
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  saveButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 32,
  },
});