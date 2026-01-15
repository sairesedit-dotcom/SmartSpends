import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useTheme } from '../ThemeContext';

// Bildirim davranışını ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const SUBSCRIPTION_SERVICES = {
  'Spotify': { icon: 'musical-notes', color: '#1DB954', amount: '19.99' },
  'Netflix': { icon: 'play-circle', color: '#E50914', amount: '99.99' },
  'YouTube Premium': { icon: 'logo-youtube', color: '#FF0000', amount: '29.99' },
  'Apple Music': { icon: 'musical-note', color: '#FC3C44', amount: '16.99' },
  'Disney+': { icon: 'film', color: '#113CCF', amount: '79.99' },
  'Amazon Prime': { icon: 'cart', color: '#FF9900', amount: '39.90' },
  'BluTV': { icon: 'tv', color: '#0099FF', amount: '59.99' },
  'Exxen': { icon: 'tv', color: '#FFD700', amount: '49.99' },
  'TOD': { icon: 'tv', color: '#FF6B00', amount: '29.99' },
  'iCloud': { icon: 'cloud', color: '#007AFF', amount: '9.99' },
  'Diğer': { icon: 'card', color: '#888', amount: '' },
};

export default function RemindersScreen() {
  const { colors, isDark } = useTheme();
  const [reminders, setReminders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [selectedIcon, setSelectedIcon] = useState('Diğer');

  const handleServiceSelect = (serviceName) => {
    setSelectedIcon(serviceName);
    setName(serviceName);
    if (SUBSCRIPTION_SERVICES[serviceName].amount) {
      setAmount(SUBSCRIPTION_SERVICES[serviceName].amount);
    }
  };

  useEffect(() => {
    loadReminders();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6C5CE7',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert('Uyarı', 'Bildirim izni verilmedi!');
      }
    }
  };

  const loadReminders = async () => {
    try {
      const storedReminders = await AsyncStorage.getItem('reminders');
      if (storedReminders) {
        setReminders(JSON.parse(storedReminders));
      }
    } catch (error) {
      console.error('Hatırlatıcılar yüklenirken hata:', error);
    }
  };

  const saveReminders = async (newReminders) => {
    try {
      await AsyncStorage.setItem('reminders', JSON.stringify(newReminders));
      setReminders(newReminders);
    } catch (error) {
      console.error('Hatırlatıcılar kaydedilirken hata:', error);
    }
  };

  const scheduleNotification = async (reminder) => {
    try {
      // Bildirim için tarih hesapla
      const now = new Date();
      const notificationDate = new Date();
      notificationDate.setDate(parseInt(day));
      notificationDate.setHours(parseInt(hour));
      notificationDate.setMinutes(parseInt(minute));
      notificationDate.setSeconds(0);

      // Eğer tarih geçmişse, bir sonraki aya ayarla
      if (notificationDate < now) {
        notificationDate.setMonth(notificationDate.getMonth() + 1);
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `💳 Ödeme Hatırlatıcısı`,
          body: `${reminder.name} - ₺${reminder.amount} ödemeniz var!`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: notificationDate,
          repeats: true,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Bildirim oluşturulurken hata:', error);
      return null;
    }
  };

  const addReminder = async () => {
    if (!name || !amount || !day || !hour || !minute) {
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun!');
      return;
    }

    const dayNum = parseInt(day);
    if (dayNum < 1 || dayNum > 31) {
      Alert.alert('Uyarı', 'Gün 1-31 arasında olmalıdır!');
      return;
    }

    const hourNum = parseInt(hour);
    if (hourNum < 0 || hourNum > 23) {
      Alert.alert('Uyarı', 'Saat 0-23 arasında olmalıdır!');
      return;
    }

    const minuteNum = parseInt(minute);
    if (minuteNum < 0 || minuteNum > 59) {
      Alert.alert('Uyarı', 'Dakika 0-59 arasında olmalıdır!');
      return;
    }

    const newReminder = {
      id: Date.now().toString(),
      name,
      amount: parseFloat(amount),
      day: dayNum,
      hour: hourNum,
      minute: minuteNum,
      icon: selectedIcon,
      createdAt: new Date().toISOString(),
    };

    // Bildirimi planla
    const notificationId = await scheduleNotification(newReminder);
    if (notificationId) {
      newReminder.notificationId = notificationId;
    }

    const updatedReminders = [newReminder, ...reminders];
    await saveReminders(updatedReminders);

    setName('');
    setAmount('');
    setDay('');
    setHour('12');
    setMinute('00');
    setSelectedIcon('Diğer');
    setModalVisible(false);

    Alert.alert('Başarılı', 'Hatırlatıcı oluşturuldu!');
  };

  const deleteReminder = (id, notificationId) => {
    Alert.alert(
      'Hatırlatıcı Sil',
      'Bu hatırlatıcıyı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            // Bildirimi iptal et
            if (notificationId) {
              await Notifications.cancelScheduledNotificationAsync(notificationId);
            }

            const updatedReminders = reminders.filter((r) => r.id !== id);
            saveReminders(updatedReminders);
          },
        },
      ]
    );
  };

  const getNextPaymentDate = (day) => {
    const now = new Date();
    const nextDate = new Date(now.getFullYear(), now.getMonth(), day);
    
    if (nextDate < now) {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    
    return nextDate.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
    });
  };

  const getTotalMonthlyPayments = () => {
    return reminders.reduce((sum, reminder) => sum + reminder.amount, 0);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Hatırlatıcılar</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Düzenli Ödeme Takibi</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Total Card */}
        <View style={[styles.totalCard, { backgroundColor: colors.danger }]}>
          <Text style={styles.totalLabel}>Aylık Toplam Ödeme</Text>
          <Text style={styles.totalAmount}>₺{getTotalMonthlyPayments().toFixed(2)}</Text>
          <Text style={styles.totalCount}>{reminders.length} hatırlatıcı</Text>
        </View>

        {/* Reminders List */}
        {reminders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={80} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Henüz hatırlatıcı eklenmemiş</Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
              + butonuna tıklayarak hatırlatıcı ekleyin
            </Text>
          </View>
        ) : (
          <View style={styles.remindersList}>
            {reminders.map((reminder) => (
              <View key={reminder.id} style={[styles.reminderItem, { backgroundColor: colors.card }]}>
                <View style={[styles.reminderIcon, { backgroundColor: colors.light }]}>
                  <Ionicons 
                    name={SUBSCRIPTION_SERVICES[reminder.icon]?.icon || 'card'} 
                    size={28} 
                    color={SUBSCRIPTION_SERVICES[reminder.icon]?.color || colors.primary} 
                  />
                </View>

                <View style={styles.reminderDetails}>
                  <Text style={[styles.reminderName, { color: colors.text }]}>{reminder.name}</Text>
                  <View style={styles.reminderInfo}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.reminderDate, { color: colors.textSecondary }]}>
                      Her ayın {reminder.day}'i • {String(reminder.hour).padStart(2, '0')}:{String(reminder.minute).padStart(2, '0')}
                    </Text>
                  </View>
                  <Text style={[styles.nextPayment, { color: colors.primary }]}>
                    Sonraki: {getNextPaymentDate(reminder.day)}
                  </Text>
                </View>

                <View style={styles.reminderRight}>
                  <Text style={[styles.reminderAmount, { color: colors.text }]}>₺{reminder.amount.toFixed(2)}</Text>
                  <TouchableOpacity 
                    onPress={() => deleteReminder(reminder.id, reminder.notificationId)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Add Reminder Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Yeni Hatırlatıcı</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Service Selection */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Popüler Abonelikler</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.iconScroll}
                >
                  {Object.keys(SUBSCRIPTION_SERVICES).map((serviceName) => (
                    <TouchableOpacity
                      key={serviceName}
                      style={[
                        styles.serviceButton,
                        { backgroundColor: colors.input },
                        selectedIcon === serviceName && {
                          backgroundColor: SUBSCRIPTION_SERVICES[serviceName].color,
                          borderColor: SUBSCRIPTION_SERVICES[serviceName].color,
                        }
                      ]}
                      onPress={() => handleServiceSelect(serviceName)}
                    >
                      <Ionicons 
                        name={SUBSCRIPTION_SERVICES[serviceName].icon} 
                        size={24} 
                        color={selectedIcon === serviceName ? '#fff' : SUBSCRIPTION_SERVICES[serviceName].color} 
                      />
                      <Text style={[
                        styles.serviceButtonText,
                        { color: selectedIcon === serviceName ? '#fff' : colors.text }
                      ]}>
                        {serviceName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Ödeme Adı</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                  placeholder="Örn: Spotify Premium"
                  placeholderTextColor={colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Tutar (₺)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Ödeme Günü (1-31)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                  placeholder="Örn: 15"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  value={day}
                  onChangeText={setDay}
                  maxLength={2}
                />
              </View>

              <View style={styles.timeRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Saat (0-23)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                    placeholder="12"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                    value={hour}
                    onChangeText={setHour}
                    maxLength={2}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Dakika (0-59)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                    placeholder="00"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                    value={minute}
                    onChangeText={setMinute}
                    maxLength={2}
                  />
                </View>
              </View>

              <View style={[styles.infoBox, { backgroundColor: colors.light }]}>
                <Ionicons name="information-circle" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.primary }]}>
                  Bildirim her ay {day || '?'}. gün saat {hour || '?'}:{minute || '?'}'da gelecek
                </Text>
              </View>

              <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={addReminder}>
                <Text style={styles.saveButtonText}>Hatırlatıcı Oluştur</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  totalCard: {
    backgroundColor: '#FF6B6B',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: -1,
  },
  totalCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  remindersList: {
    paddingHorizontal: 20,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reminderIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F0EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderDetails: {
    flex: 1,
    marginLeft: 12,
  },
  reminderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  reminderDate: {
    fontSize: 13,
    color: '#888',
  },
  nextPayment: {
    fontSize: 12,
    color: '#6C5CE7',
    fontWeight: '500',
  },
  reminderRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  reminderAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#AAA',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 8,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '85%',
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
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
  },
  iconScroll: {
    marginHorizontal: -8,
    marginBottom: 8,
  },
  serviceButton: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginHorizontal: 4,
    minWidth: 110,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  serviceButtonText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
  timeRow: {
    flexDirection: 'row',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EEFF',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#6C5CE7',
  },
  saveButton: {
    backgroundColor: '#6C5CE7',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});