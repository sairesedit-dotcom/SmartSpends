import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { useTheme } from '../ThemeContext';

const screenWidth = Dimensions.get('window').width;

const CATEGORIES = [
  { id: 'food', name: 'Yemek', icon: 'restaurant', color: '#FF6B6B' },
  { id: 'transport', name: 'Ulaşım', icon: 'car', color: '#4ECDC4' },
  { id: 'entertainment', name: 'Eğlence', icon: 'game-controller', color: '#95E1D3' },
  { id: 'shopping', name: 'Alışveriş', icon: 'cart', color: '#FFD93D' },
  { id: 'health', name: 'Sağlık', icon: 'medical', color: '#6C5CE7' },
  { id: 'other', name: 'Diğer', icon: 'ellipsis-horizontal', color: '#A8A8A8' },
];

export default function ExpensesScreen() {
  const { colors, isDark } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [note, setNote] = useState('');
  const [showChart, setShowChart] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const storedExpenses = await AsyncStorage.getItem('expenses');
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses));
      }
    } catch (error) {
      console.error('Harcamalar yüklenirken hata:', error);
    }
  };

  const saveExpenses = async (newExpenses) => {
    try {
      await AsyncStorage.setItem('expenses', JSON.stringify(newExpenses));
      setExpenses(newExpenses);
    } catch (error) {
      console.error('Harcamalar kaydedilirken hata:', error);
    }
  };

  const addExpense = async () => {
    if (!amount || !selectedCategory) {
      Alert.alert('Uyarı', 'Lütfen miktar ve kategori seçin!');
      return;
    }

    const newExpense = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      category: selectedCategory,
      note: note,
      date: new Date().toISOString(),
    };

    const updatedExpenses = [newExpense, ...expenses];
    await saveExpenses(updatedExpenses);

    // Bütçeden düş
    try {
      const budgetData = await AsyncStorage.getItem('budget');
      if (budgetData) {
        const budget = JSON.parse(budgetData);
        budget.spent = (budget.spent || 0) + parseFloat(amount);
        await AsyncStorage.setItem('budget', JSON.stringify(budget));
      }
    } catch (error) {
      console.error('Bütçe güncellenirken hata:', error);
    }

    setAmount('');
    setSelectedCategory(null);
    setNote('');
    setModalVisible(false);
  };

  const deleteExpense = (id) => {
    Alert.alert(
      'Harcama Sil',
      'Bu harcamayı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const expenseToDelete = expenses.find((e) => e.id === id);
            const updatedExpenses = expenses.filter((e) => e.id !== id);
            await saveExpenses(updatedExpenses);

            // Bütçeye geri ekle
            try {
              const budgetData = await AsyncStorage.getItem('budget');
              if (budgetData && expenseToDelete) {
                const budget = JSON.parse(budgetData);
                budget.spent = (budget.spent || 0) - expenseToDelete.amount;
                await AsyncStorage.setItem('budget', JSON.stringify(budget));
              }
            } catch (error) {
              console.error('Bütçe güncellenirken hata:', error);
            }
          },
        },
      ]
    );
  };

  const getTotalExpense = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getCategoryData = () => {
    const categoryTotals = {};
    const total = getTotalExpense();
    
    expenses.forEach((expense) => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
    });

    return Object.keys(categoryTotals).map((categoryId) => {
      const category = CATEGORIES.find((c) => c.id === categoryId);
      const amount = categoryTotals[categoryId];
      const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
      return {
        name: category.name,
        amount: categoryTotals[categoryId],
        color: category.color,
        legendFontColor: '#333',
        legendFontSize: 14,
        percentage: percentage,
      };
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderExpenseItem = (item) => {
    const category = CATEGORIES.find((c) => c.id === item.category);

    return (
      <View key={item.id} style={styles.expenseItem}>
        <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
          <Ionicons name={category.icon} size={24} color="#fff" />
        </View>

        <View style={styles.expenseDetails}>
          <Text style={styles.categoryName}>{category.name}</Text>
          {item.note ? <Text style={styles.noteText}>{item.note}</Text> : null}
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        </View>

        <View style={styles.expenseRight}>
          <Text style={styles.amountText}>₺{item.amount.toFixed(2)}</Text>
          <TouchableOpacity onPress={() => deleteExpense(item.id)}>
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const chartData = getCategoryData();
  const totalExpense = getTotalExpense();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Harcamalar</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Harcama Takip</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={[styles.totalCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.totalLabel}>Toplam Harcama</Text>
          <Text style={styles.totalAmount}>₺{totalExpense.toFixed(2)}</Text>
          <Text style={styles.totalCount}>{expenses.length} harcama</Text>
        </View>

        {expenses.length > 0 && (
          <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Kategori Dağılımı</Text>
              <TouchableOpacity onPress={() => setShowChart(!showChart)}>
                <Ionicons 
                  name={showChart ? 'chevron-up' : 'chevron-down'} 
                  size={24} 
                  color={colors.text} 
                />
              </TouchableOpacity>
            </View>

            {showChart && (
              <>
                <PieChart
                  data={chartData}
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

                <View style={styles.categorySummary}>
                  {chartData.map((item, index) => (
                    <View key={index} style={styles.summaryItem}>
                      <View style={styles.summaryLeft}>
                        <View 
                          style={[styles.colorDot, { backgroundColor: item.color }]} 
                        />
                        <Text style={[styles.summaryName, { color: colors.text }]}>{item.name}</Text>
                      </View>
                      <View style={styles.summaryRight}>
                        <Text style={[styles.summaryPercentage, { color: colors.primary }]}>%{item.percentage}</Text>
                        <Text style={[styles.summaryAmount, { color: colors.text }]}>₺{item.amount.toFixed(2)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {expenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={80} color="#DDD" />
            <Text style={styles.emptyText}>Henüz harcama eklenmemiş</Text>
            <Text style={styles.emptySubtext}>
              Harcama eklemek için + butonuna tıklayın
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.listTitle}>Son Harcamalar</Text>
            <View style={styles.expensesList}>
              {expenses.map((item) => renderExpenseItem(item))}
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Harcama</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Miktar (₺)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kategori</Text>
              <View style={styles.categoriesContainer}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category.id && {
                        backgroundColor: category.color,
                      },
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Ionicons
                      name={category.icon}
                      size={24}
                      color={selectedCategory === category.id ? '#fff' : category.color}
                    />
                    <Text
                      style={[
                        styles.categoryButtonText,
                        selectedCategory === category.id && { color: '#fff' },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Not (Opsiyonel)</Text>
              <TextInput
                style={styles.input}
                placeholder="Açıklama ekleyin..."
                value={note}
                onChangeText={setNote}
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={addExpense}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
    backgroundColor: '#6C5CE7',
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
  chartContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  categorySummary: {
    marginTop: 20,
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  summaryName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summaryPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6C5CE7',
    marginBottom: 2,
  },
  summaryAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  expensesList: {
    paddingHorizontal: 20,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseDetails: {
    flex: 1,
    marginLeft: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  noteText: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 4,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
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
    marginBottom: 24,
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
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
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