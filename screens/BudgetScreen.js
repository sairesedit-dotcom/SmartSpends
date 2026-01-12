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
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function BudgetScreen() {
  const [budget, setBudget] = useState({
    monthly: 0,
    spent: 0,
    incomes: [],
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [incomeModalVisible, setIncomeModalVisible] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [incomeName, setIncomeName] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeDate, setIncomeDate] = useState('');
  const [showBudgetChart, setShowBudgetChart] = useState(true);

  useEffect(() => {
    loadBudget();
    const interval = setInterval(loadBudget, 1000); // Her saniye güncelle
    return () => clearInterval(interval);
  }, []);

  const loadBudget = async () => {
    try {
      const budgetData = await AsyncStorage.getItem('budget');
      if (budgetData) {
        setBudget(JSON.parse(budgetData));
      }
    } catch (error) {
      console.error('Bütçe yüklenirken hata:', error);
    }
  };

  const saveBudget = async (newBudget) => {
    try {
      await AsyncStorage.setItem('budget', JSON.stringify(newBudget));
      setBudget(newBudget);
    } catch (error) {
      console.error('Bütçe kaydedilirken hata:', error);
    }
  };

  const updateMonthlyBudget = () => {
    if (!monthlyBudget) {
      Alert.alert('Uyarı', 'Lütfen bir tutar girin!');
      return;
    }

    const newBudget = {
      ...budget,
      monthly: parseFloat(monthlyBudget),
    };

    saveBudget(newBudget);
    setMonthlyBudget('');
    setModalVisible(false);
  };

  const addIncome = () => {
    if (!incomeName || !incomeAmount || !incomeDate) {
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun!');
      return;
    }

    const newIncome = {
      id: Date.now().toString(),
      name: incomeName,
      amount: parseFloat(incomeAmount),
      date: incomeDate,
      addedAt: new Date().toISOString(),
    };

    const newBudget = {
      ...budget,
      incomes: [newIncome, ...(budget.incomes || [])],
      monthly: budget.monthly + parseFloat(incomeAmount),
    };

    saveBudget(newBudget);
    setIncomeName('');
    setIncomeAmount('');
    setIncomeDate('');
    setIncomeModalVisible(false);
  };

  const deleteIncome = (id) => {
    Alert.alert(
      'Gelir Sil',
      'Bu geliri silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            const incomeToDelete = budget.incomes.find((i) => i.id === id);
            const newBudget = {
              ...budget,
              incomes: budget.incomes.filter((i) => i.id !== id),
              monthly: budget.monthly - incomeToDelete.amount,
            };
            saveBudget(newBudget);
          },
        },
      ]
    );
  };

  const remaining = budget.monthly - budget.spent;
  const percentage = budget.monthly > 0 ? (budget.spent / budget.monthly) * 100 : 0;

  const getBudgetChartData = () => {
    if (budget.monthly === 0) return [];
    
    const spent = budget.spent;
    const remaining = Math.max(0, budget.monthly - spent);
    
    return [
      {
        name: 'Harcanan',
        amount: spent,
        color: percentage > 100 ? '#FF6B6B' : percentage > 75 ? '#FFD93D' : '#FF6B6B',
        legendFontColor: '#333',
        legendFontSize: 14,
        percentage: ((spent / budget.monthly) * 100).toFixed(1),
      },
      {
        name: 'Kalan',
        amount: remaining,
        color: '#4ECDC4',
        legendFontColor: '#333',
        legendFontSize: 14,
        percentage: ((remaining / budget.monthly) * 100).toFixed(1),
      },
    ].filter(item => item.amount > 0);
  };

  const budgetChartData = getBudgetChartData();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bütçe</Text>
        <Text style={styles.headerSubtitle}>Gelir ve Gider Takibi</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Budget Overview */}
        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetLabel}>Aylık Bütçe</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Ionicons name="create-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.budgetAmount}>₺{budget.monthly.toFixed(2)}</Text>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: percentage > 100 ? '#FF6B6B' : percentage > 75 ? '#FFD93D' : '#4ECDC4'
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {percentage.toFixed(0)}% Kullanıldı
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#4ECDC4' }]}>
            <Ionicons name="trending-down" size={28} color="#fff" />
            <Text style={styles.statLabel}>Harcanan</Text>
            <Text style={styles.statAmount}>₺{budget.spent.toFixed(2)}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: remaining >= 0 ? '#95E1D3' : '#FF6B6B' }]}>
            <Ionicons name="wallet" size={28} color="#fff" />
            <Text style={styles.statLabel}>Kalan</Text>
            <Text style={styles.statAmount}>₺{remaining.toFixed(2)}</Text>
          </View>
        </View>

        {/* Budget Chart */}
        {budget.monthly > 0 && budgetChartData.length > 0 && (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Bütçe Dağılımı</Text>
              <TouchableOpacity onPress={() => setShowBudgetChart(!showBudgetChart)}>
                <Ionicons 
                  name={showBudgetChart ? 'chevron-up' : 'chevron-down'} 
                  size={24} 
                  color="#333" 
                />
              </TouchableOpacity>
            </View>

            {showBudgetChart && (
              <>
                <PieChart
                  data={budgetChartData}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />

                <View style={styles.budgetSummary}>
                  {budgetChartData.map((item, index) => (
                    <View key={index} style={styles.summaryItem}>
                      <View style={styles.summaryLeft}>
                        <View 
                          style={[styles.colorDot, { backgroundColor: item.color }]} 
                        />
                        <Text style={styles.summaryName}>{item.name}</Text>
                      </View>
                      <View style={styles.summaryRight}>
                        <Text style={styles.summaryPercentage}>%{item.percentage}</Text>
                        <Text style={styles.summaryAmount}>₺{item.amount.toFixed(2)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {/* Incomes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gelirler</Text>
            <TouchableOpacity 
              style={styles.addIncomeButton}
              onPress={() => setIncomeModalVisible(true)}
            >
              <Ionicons name="add" size={20} color="#6C5CE7" />
              <Text style={styles.addIncomeText}>Gelir Ekle</Text>
            </TouchableOpacity>
          </View>

          {budget.incomes && budget.incomes.length > 0 ? (
            budget.incomes.map((income) => (
              <View key={income.id} style={styles.incomeItem}>
                <View style={styles.incomeIcon}>
                  <Ionicons name="cash" size={24} color="#4ECDC4" />
                </View>
                <View style={styles.incomeDetails}>
                  <Text style={styles.incomeName}>{income.name}</Text>
                  <Text style={styles.incomeDate}>Tarih: {income.date}</Text>
                </View>
                <View style={styles.incomeRight}>
                  <Text style={styles.incomeAmount}>+₺{income.amount.toFixed(2)}</Text>
                  <TouchableOpacity onPress={() => deleteIncome(income.id)}>
                    <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="cash-outline" size={60} color="#DDD" />
              <Text style={styles.emptyText}>Henüz gelir eklenmemiş</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Budget Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Aylık Bütçe Belirle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Aylık Bütçe (₺)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={monthlyBudget}
                onChangeText={setMonthlyBudget}
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={updateMonthlyBudget}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Income Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={incomeModalVisible}
        onRequestClose={() => setIncomeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gelir Ekle</Text>
              <TouchableOpacity onPress={() => setIncomeModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gelir Adı</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Burs, Harçlık, Maaş"
                value={incomeName}
                onChangeText={setIncomeName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Miktar (₺)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={incomeAmount}
                onChangeText={setIncomeAmount}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Alınma Tarihi</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Her ayın 1'i, 15 Ocak"
                value={incomeDate}
                onChangeText={setIncomeDate}
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={addIncome}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
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
  budgetCard: {
    backgroundColor: '#6C5CE7',
    margin: 20,
    padding: 24,
    borderRadius: 16,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  budgetAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    letterSpacing: -1,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  statAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addIncomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EEFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  addIncomeText: {
    fontSize: 14,
    color: '#6C5CE7',
    fontWeight: '600',
  },
  incomeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  incomeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8F8F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomeDetails: {
    flex: 1,
    marginLeft: 12,
  },
  incomeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  incomeDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  incomeRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  incomeAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#AAA',
    marginTop: 12,
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
  saveButton: {
    backgroundColor: '#6C5CE7',
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
});