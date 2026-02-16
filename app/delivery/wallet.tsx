import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '@/services/api';

type Txn = { id: string; type: 'credit' | 'debit'; amount: number; description?: string; created_at: string };

export default function WalletScreen() {
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('NGN');
  const [virtualAccount, setVirtualAccount] = useState<any | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [amount, setAmount] = useState<string>('');
  const [bankCode, setBankCode] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [withdrawing, setWithdrawing] = useState<boolean>(false);
  const [settingUp, setSettingUp] = useState<boolean>(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const w = await apiService.wallet.getWallet();
      setBalance(Number(w.balance || 0));
      setCurrency(w.currency || 'NGN');
      setVirtualAccount(w.paystack_virtual_account || null);
      const list = await apiService.wallet.getTransactions();
      setTxns(list);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const setupDVA = async () => {
    setSettingUp(true);
    try {
      const res = await apiService.wallet.setup();
      setVirtualAccount(res?.paystack_virtual_account || null);
      Alert.alert('Dedicated Account Ready', 'Bank account created for top-ups.');
    } catch {
      Alert.alert('Error', 'Failed to set up dedicated account');
    } finally {
      setSettingUp(false);
    }
  };

  const withdraw = async () => {
    if (!amount || !bankCode || !accountNumber) {
      Alert.alert('Missing fields', 'Enter amount, bank code, and account number.');
      return;
    }
    const amt = Number(amount);
    if (!(amt > 0)) {
      Alert.alert('Invalid amount', 'Amount must be greater than zero.');
      return;
    }
    if (amt > balance) {
      Alert.alert('Insufficient balance', 'Reduce the amount and try again.');
      return;
    }
    setWithdrawing(true);
    try {
      await apiService.wallet.withdraw(amt, bankCode, accountNumber, accountName);
      Alert.alert('Withdrawal Initiated', 'Transfer is processing.');
      setAmount('');
      loadAll();
    } catch (e: any) {
      Alert.alert('Failed', e?.message || 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  const renderTxn = ({ item }: { item: Txn }) => {
    const sign = item.type === 'credit' ? '+' : '-';
    const color = item.type === 'credit' ? '#2F855A' : '#C53030';
    return (
      <View style={styles.txnRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.txnDesc}>{item.description || item.type.toUpperCase()}</Text>
          <Text style={styles.txnDate}>{new Date(item.created_at).toLocaleString()}</Text>
        </View>
        <Text style={[styles.txnAmount, { color }]}>{sign} {currency} {Number(item.amount).toFixed(2)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Wallet</Text>
        <Text style={styles.subtitle}>Top up via dedicated account or withdraw earnings</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Available Balance</Text>
        <Text style={styles.balance}>{currency} {balance.toFixed(2)}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Top-up via Dedicated Account</Text>
        {virtualAccount ? (
          <View>
            <Text style={styles.detail}>Bank: {virtualAccount.bank?.name || '—'}</Text>
            <Text style={styles.detail}>Account Number: {virtualAccount.account_number || '—'}</Text>
            <Text style={styles.detail}>Account Name: {virtualAccount.account_name || '—'}</Text>
            <Text style={styles.hint}>Transfer to this account from your banking app. Funds will reflect automatically.</Text>
          </View>
        ) : (
          <TouchableOpacity disabled={settingUp} onPress={setupDVA} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{settingUp ? 'Setting up...' : 'Generate Account'}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Withdraw</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <TextInput
            style={styles.input}
            placeholder="Bank Code (e.g., 058)"
            value={bankCode}
            onChangeText={setBankCode}
          />
        </View>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Account Number"
            keyboardType="numeric"
            value={accountNumber}
            onChangeText={setAccountNumber}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Account Name (Optional)"
            value={accountName}
            onChangeText={setAccountName}
          />
        </View>
        <TouchableOpacity disabled={withdrawing} onPress={withdraw} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{withdrawing ? 'Processing...' : 'Withdraw'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Transactions</Text>
        <FlatList
          data={txns}
          keyExtractor={(i) => i.id}
          renderItem={renderTxn}
          ListEmptyComponent={
            <Text style={styles.hint}>No transactions yet</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { backgroundColor: '#FFFFFF', padding: 20, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#1A202C', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#718096' },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  label: { fontSize: 12, color: '#718096' },
  balance: { fontSize: 28, fontWeight: '800', color: '#1A202C', marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A202C', marginBottom: 8 },
  detail: { fontSize: 14, color: '#2D3748', marginBottom: 4 },
  hint: { fontSize: 12, color: '#718096' },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  input: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#1A202C',
  },
  primaryButton: {
    backgroundColor: '#4C6EF5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700' },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  txnDesc: { fontSize: 14, color: '#1A202C', fontWeight: '600' },
  txnDate: { fontSize: 12, color: '#718096' },
  txnAmount: { fontSize: 14, fontWeight: '800' },
});
