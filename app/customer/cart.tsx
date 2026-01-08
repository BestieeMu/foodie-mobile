import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, TextInput, Switch, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Trash2, Plus, Minus, Gift, X } from 'lucide-react-native';
import { useCartStore } from '@/stores/cartStore';
import { Button } from '@/components/Button';
import { HeaderBar } from '@/components/HeaderBar';
import { useOrderStore } from '@/stores/orderStore';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/services/api';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cart, removeItem, updateItemQuantity, clearCart } = useCartStore();
  const addOrder = useOrderStore((state) => state.addOrder);
  const user = useAuthStore((state) => state.user);
  const [showSendGiftModal, setShowSendGiftModal] = useState(false);
  const [isGiftOrder, setIsGiftOrder] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState({ name: '', phone: '', address: '' });
  const [showGroupOrderModal, setShowGroupOrderModal] = useState(false);
  const [groupOrderCode, setGroupOrderCode] = useState('');
  const [groupId, setGroupId] = useState<string | null>(null);
  const [showComboModal, setShowComboModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<'address' | 'payment'>('address');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'cash'>('card');

  const loadAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const list = await apiService.addresses.getAll();
      setAddresses(list || []);
      if (!selectedAddressId && list?.length > 0) {
        setSelectedAddressId(list[0].id);
      }
    } catch (e: any) {
      Alert.alert('Failed to load addresses', e?.message || 'Try again.');
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleCreateGroupOrder = async () => {
    try {
      if (!cart) return;
      const res = await apiService.group.create(cart.restaurantId);
      setGroupOrderCode(res.code);
      setGroupId(res.groupId);
    } catch (err: any) {
      Alert.alert('Failed to create group', err?.message || 'Try again.');
    }
  };

  const handleJoinGroupOrder = async () => {
    try {
      if (!joinCodeInput) return;
      const res = await apiService.group.join(joinCodeInput.trim());
      setGroupId(res.groupId);
      setGroupOrderCode(joinCodeInput.trim());
    } catch (err: any) {
      Alert.alert('Failed to join group', err?.message || 'Invalid code.');
    }
  };

  const handleAddItemsToGroup = async () => {
    try {
      if (!cart || !groupId) return;
      await apiService.group.addItem(groupId, { items: cart.items, userId: user?.id });
      Alert.alert('Items added', 'Your items were added to the group cart.');
      setShowGroupOrderModal(false);
    } catch (err: any) {
      Alert.alert('Failed to add items', err?.message || 'Try again.');
    }
  };

  const handleFinalizeGroupOrder = async () => {
    try {
      if (!cart || !user || !groupId) return;
      const addresses = await apiService.addresses.getAll();
      const deliveryAddress = addresses[0];
      if (!deliveryAddress) {
        Alert.alert('No address', 'Add a delivery address to finalize.', [
          { text: 'Add Address', onPress: () => router.push('/customer/addresses') },
          { text: 'Cancel', style: 'cancel' },
        ]);
        return;
      }
      const order = await apiService.group.finalize(groupId, {
        customerId: user.id,
        customer: { name: user.name, phone: user.phone, avatar: user.avatar },
        restaurantId: cart.restaurantId,
        restaurant: cart.restaurant,
        type: 'delivery',
        pickupAddress: cart.restaurant.address ? {
          id: `rest_${cart.restaurant.id}`,
          label: 'Restaurant',
          street: cart.restaurant.address,
          city: '',
          state: '',
          zipCode: '',
          latitude: cart.restaurant.latitude,
          longitude: cart.restaurant.longitude,
          instructions: 'Pickup at restaurant',
        } : undefined,
        deliveryAddress,
      });
      addOrder(order);
      clearCart();
      setShowGroupOrderModal(false);
      router.push(`/customer/order/${order.id}` as any);
    } catch (err: any) {
      Alert.alert('Failed to finalize', err?.message || 'Try again.');
    }
  };

  const handleCheckout = async () => {
    if (!cart || !user) return;

    try {
      await loadAddresses();
      setCurrentStep('address');
      setShowCheckoutModal(true);
    } catch (err: any) {
      Alert.alert('Checkout failed', err?.message || 'Please try again.');
    }
  };

  const suggestComboDeals = () => {
    if (!cart) return [];
    const hasRice = cart.items.some(item => item.menuItem.category === 'Rice Dishes');
    const hasSwallow = cart.items.some(item => item.menuItem.category === 'Swallow');
    
    const suggestions = [];
    if (hasRice && !cart.items.some(item => item.menuItem.name.includes('Plantain'))) {
      suggestions.push('Add Fried Plantain for ₦300');
    }
    if (hasSwallow && !cart.items.some(item => item.menuItem.name.includes('Extra'))) {
      suggestions.push('Add Extra Protein for ₦500');
    }
    if (cart.items.length >= 2) {
      suggestions.push('Save 15% with Party Pack upgrade');
    }
    return suggestions;
  };

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <HeaderBar title="Cart" />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <Text style={styles.emptySubtext}>Add items from a restaurant to get started</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <HeaderBar title="Cart" />
      <View style={styles.container}>
        <FlatList
          data={cart.items}
          ListHeaderComponent={
            <View style={styles.restaurantHeader}>
              <Image source={{ uri: cart.restaurant.image }} style={styles.restaurantImage} />
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{cart.restaurant.name}</Text>
                <Text style={styles.restaurantTime}>{cart.restaurant.deliveryTime}</Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <View style={styles.itemLeft}>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateItemQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus size={16} color="#2D3748" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus size={16} color="#2D3748" />
                  </TouchableOpacity>
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.menuItem.name}</Text>
                  {item.selectedOptions.length > 0 && (
                    <Text style={styles.itemOptions}>
                      {item.selectedOptions.map(({ groupId, optionId }) => {
                        const group = item.menuItem.optionGroups?.find(g => g.id === groupId);
                        const option = group?.options.find(o => o.id === optionId);
                        return option?.name;
                      }).filter(Boolean).join(', ')}
                    </Text>
                  )}
                  <Text style={styles.itemPrice}>₦{(item.price * item.quantity).toLocaleString()}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeItem(item.id)}>
                <Trash2 size={20} color="#F56565" />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: 220 + insets.bottom }
          ]}
          ListFooterComponent={
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>₦{cart.subtotal.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>₦{cart.deliveryFee.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>VAT (7.5%)</Text>
                <Text style={styles.summaryValue}>₦{cart.tax.toLocaleString()}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₦{cart.total.toLocaleString()}</Text>
              </View>
            </View>
          }
        />

        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <View style={styles.footerContent}>
            {suggestComboDeals().length > 0 && (
              <TouchableOpacity 
                style={styles.comboSuggestion}
                onPress={() => setShowComboModal(true)}
              >
                <Text style={styles.comboText}>💡 {suggestComboDeals()[0]}</Text>
              </TouchableOpacity>
            )}
            <View style={styles.footerActions}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setShowGroupOrderModal(true)}
              >
                <Text style={styles.iconButtonText}>👥</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setShowSendGiftModal(true)}
              >
                <Gift size={20} color="#FF6B35" />
              </TouchableOpacity>
            </View>
            <Button
              title={`Checkout • ₦${cart.total.toLocaleString()}`}
              onPress={handleCheckout}
              size="large"
            />
          </View>
        </SafeAreaView>

        <Modal
          visible={showGroupOrderModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowGroupOrderModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Group Order</Text>
                <TouchableOpacity onPress={() => setShowGroupOrderModal(false)}>
                  <X size={24} color="#1A202C" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDescription}>
                Order together with friends! Everyone can add items to the same cart.
              </Text>

              {groupOrderCode ? (
                <View style={styles.groupCodeContainer}>
                  <Text style={styles.groupCodeLabel}>Your Group Order Code:</Text>
                  <Text style={styles.groupCode}>{groupOrderCode}</Text>
                  <Text style={styles.groupCodeHint}>Share this code with your friends</Text>

                  <View style={{ gap: 12, marginTop: 16 }}>
                    <TouchableOpacity style={styles.groupButton} onPress={handleAddItemsToGroup}>
                      <Text style={styles.groupButtonText}>Add My Items</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.groupButtonSecondary} onPress={handleFinalizeGroupOrder}>
                      <Text style={styles.groupButtonSecondaryText}>Finalize Group Order</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.groupActions}>
                  <TouchableOpacity style={styles.groupButton} onPress={handleCreateGroupOrder}>
                    <Text style={styles.groupButtonText}>Create Group Order</Text>
                  </TouchableOpacity>

                  <Text style={styles.inputLabel}>Join with Code</Text>
                  <TextInput
                    style={styles.input}
                    value={joinCodeInput}
                    onChangeText={setJoinCodeInput}
                    placeholder="Enter code (e.g. GO12345)"
                    placeholderTextColor="#A0AEC0"
                    autoCapitalize="none"
                  />

                  <TouchableOpacity style={styles.groupButtonSecondary} onPress={handleJoinGroupOrder}>
                    <Text style={styles.groupButtonSecondaryText}>Join Existing Order</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>

        <Modal
          visible={showComboModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowComboModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Combo Suggestions</Text>
                <TouchableOpacity onPress={() => setShowComboModal(false)}>
                  <X size={24} color="#1A202C" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDescription}>
                Complete your Nigerian meal with these perfect pairings!
              </Text>

              {suggestComboDeals().map((suggestion, index) => (
                <TouchableOpacity key={index} style={styles.comboItem}>
                  <Text style={styles.comboItemText}>{suggestion}</Text>
                  <TouchableOpacity style={styles.addComboButton}>
                    <Text style={styles.addComboButtonText}>Add</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

        <Modal
          visible={showSendGiftModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSendGiftModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Send Food as Gift</Text>
                <TouchableOpacity onPress={() => setShowSendGiftModal(false)}>
                  <X size={24} color="#1A202C" />
                </TouchableOpacity>
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>This is a gift order</Text>
                <Switch
                  value={isGiftOrder}
                  onValueChange={setIsGiftOrder}
                  trackColor={{ false: '#E2E8F0', true: '#FF6B35' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {isGiftOrder && (
                <>
                  <Text style={styles.inputLabel}>Recipient Name</Text>
                  <TextInput
                    style={styles.input}
                    value={giftRecipient.name}
                    onChangeText={(text) => setGiftRecipient({ ...giftRecipient, name: text })}
                    placeholder="Enter recipient's name"
                    placeholderTextColor="#A0AEC0"
                  />

                  <Text style={styles.inputLabel}>Recipient Phone</Text>
                  <TextInput
                    style={styles.input}
                    value={giftRecipient.phone}
                    onChangeText={(text) => setGiftRecipient({ ...giftRecipient, phone: text })}
                    placeholder="Enter recipient's phone"
                    placeholderTextColor="#A0AEC0"
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.inputLabel}>Delivery Address</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={giftRecipient.address}
                    onChangeText={(text) => setGiftRecipient({ ...giftRecipient, address: text })}
                    placeholder="Enter delivery address"
                    placeholderTextColor="#A0AEC0"
                    multiline
                    numberOfLines={3}
                  />
                </>
              )}

              <Button
                title="Continue to Checkout"
                onPress={() => {
                  setShowSendGiftModal(false);
                  handleCheckout();
                }}
                size="large"
              />
            </View>
          </View>
        </Modal>

        <Modal
          visible={showCheckoutModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCheckoutModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Checkout</Text>
                <TouchableOpacity onPress={() => setShowCheckoutModal(false)}>
                  <X size={24} color="#1A202C" />
                </TouchableOpacity>
              </View>

              <View style={styles.stepper}>
                <View style={[styles.step, currentStep === 'address' && styles.stepActive]}>
                  <Text style={[styles.stepText, currentStep === 'address' && styles.stepTextActive]}>1. Address</Text>
                </View>
                <View style={styles.stepDivider} />
                <View style={[styles.step, currentStep === 'payment' && styles.stepActive]}>
                  <Text style={[styles.stepText, currentStep === 'payment' && styles.stepTextActive]}>2. Payment</Text>
                </View>
              </View>

              {currentStep === 'address' && (
                <>
                  <Text style={styles.modalDescription}>Select a delivery address.</Text>
                  <View style={{ gap: 12 }}>
                    {isLoadingAddresses ? (
                      <Text style={{ color: '#718096' }}>Loading addresses...</Text>
                    ) : addresses.length === 0 ? (
                      <View style={{ gap: 12 }}>
                        <Text style={{ color: '#718096' }}>No addresses yet.</Text>
                        <TouchableOpacity
                          style={styles.groupButton}
                          onPress={() => {
                            setShowCheckoutModal(false);
                            router.push('/customer/addresses');
                          }}
                        >
                          <Text style={styles.groupButtonText}>Add Address</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.groupButtonSecondary} onPress={loadAddresses}>
                          <Text style={styles.groupButtonSecondaryText}>Refresh</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <>
                        {addresses.map((addr) => (
                          <TouchableOpacity
                            key={addr.id}
                            style={[
                              styles.addressCard,
                              selectedAddressId === addr.id && styles.addressCardSelected
                            ]}
                            onPress={() => setSelectedAddressId(addr.id)}
                          >
                            <Text style={styles.addressTitle}>{addr.label}</Text>
                            <Text style={styles.addressText}>{[addr.street, addr.city].filter(Boolean).join(', ')}</Text>
                          </TouchableOpacity>
                        ))}
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                          <TouchableOpacity
                            style={[styles.groupButtonSecondary, { flex: 1 }]}
                            onPress={() => {
                              setShowCheckoutModal(false);
                              router.push('/customer/addresses');
                            }}
                          >
                            <Text style={styles.groupButtonSecondaryText}>Add New</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.groupButtonSecondary, { flex: 1 }]} onPress={loadAddresses}>
                            <Text style={styles.groupButtonSecondaryText}>Refresh</Text>
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          style={[styles.groupButton, !selectedAddressId && { opacity: 0.6 }]}
                          onPress={() => setCurrentStep('payment')}
                          disabled={!selectedAddressId}
                        >
                          <Text style={styles.groupButtonText}>Continue</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </>
              )}

              {currentStep === 'payment' && (
                <>
                  <Text style={styles.modalDescription}>Select a payment method to complete your order.</Text>
                  <View style={{ gap: 12 }}>
                    {(['card','wallet','cash'] as const).map((m) => (
                      <TouchableOpacity
                        key={m}
                        style={[
                          styles.groupButtonSecondary,
                          paymentMethod === m && { borderColor: '#2D3748' }
                        ]}
                        onPress={() => setPaymentMethod(m)}
                      >
                        <Text style={styles.groupButtonSecondaryText}>
                          {m === 'card' ? 'Card' : m === 'wallet' ? 'Foodie Wallet' : 'Cash on Delivery'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                    <TouchableOpacity style={[styles.groupButtonSecondary, { flex: 1 }]} onPress={() => setCurrentStep('address')}>
                      <Text style={styles.groupButtonSecondaryText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.groupButton, { flex: 1 }]}
                      onPress={async () => {
                        try {
                          const deliveryAddress = addresses.find(a => a.id === selectedAddressId);
                          if (!deliveryAddress) {
                            Alert.alert('No address', 'Select a delivery address.');
                            setCurrentStep('address');
                            return;
                          }
                          const order = await apiService.orders.create({
                            customerId: user!.id,
                            customer: {
                              name: user!.name,
                              phone: user!.phone,
                              avatar: user!.avatar,
                            },
                            restaurantId: cart!.restaurantId,
                            restaurant: cart!.restaurant,
                            items: cart!.items,
                            subtotal: cart!.subtotal,
                            deliveryFee: cart!.deliveryFee,
                            tax: cart!.tax,
                            total: cart!.total,
                            type: 'delivery',
                            pickupAddress: cart!.restaurant.address ? {
                              id: `rest_${cart!.restaurant.id}`,
                              label: 'Restaurant',
                              street: cart!.restaurant.address,
                              city: '',
                              state: '',
                              zipCode: '',
                              latitude: cart!.restaurant.latitude,
                              longitude: cart!.restaurant.longitude,
                              instructions: 'Pickup at restaurant',
                            } : undefined,
                            deliveryAddress,
                            gift: isGiftOrder,
                            recipientName: isGiftOrder ? giftRecipient.name : undefined,
                            giftMessage: isGiftOrder ? `Phone: ${giftRecipient.phone} | Address: ${giftRecipient.address}` : undefined,
                            paymentMethod,
                          } as any);
                          addOrder(order);
                          clearCart();
                          setShowCheckoutModal(false);
                          router.push(`/customer/order/${order.id}` as any);
                        } catch (e: any) {
                          Alert.alert('Checkout failed', e?.message || 'Please try again.');
                        }
                      }}
                    >
                      <Text style={styles.groupButtonText}>Pay Now</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  restaurantHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  restaurantInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1A202C',
    marginBottom: 4,
  },
  restaurantTime: {
    fontSize: 13,
    color: '#718096',
  },
  list: {
    padding: 20,
    paddingBottom: 120,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  quantityControls: {
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1A202C',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1A202C',
    marginBottom: 4,
  },
  itemOptions: {
    fontSize: 13,
    color: '#718096',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FF6B35',
  },
  summary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#718096',
  },
  summaryValue: {
    fontSize: 15,
    color: '#2D3748',
    fontWeight: '600' as const,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1A202C',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FF6B35',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerContent: {
    gap: 12,
  },
  comboSuggestion: {
    backgroundColor: '#FFF5F0',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  comboText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FF6B35',
    textAlign: 'center',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconButtonText: {
    fontSize: 20,
  },
  giftToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  giftText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FF6B35',
  },
  modalDescription: {
    fontSize: 15,
    color: '#718096',
    marginBottom: 20,
    lineHeight: 22,
  },
  groupCodeContainer: {
    backgroundColor: '#F7FAFC',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 16,
  },
  groupCodeLabel: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 8,
  },
  groupCode: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#FF6B35',
    marginBottom: 8,
  },
  groupCodeHint: {
    fontSize: 13,
    color: '#A0AEC0',
  },
  groupActions: {
    gap: 12,
    marginTop: 16,
  },
  groupButton: {
    backgroundColor: '#FF6B35',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  groupButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  groupButtonSecondary: {
    backgroundColor: '#F7FAFC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  groupButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FF6B35',
  },
  comboItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  comboItemText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1A202C',
    flex: 1,
  },
  addComboButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addComboButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
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
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  step: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
  },
  stepActive: {
    backgroundColor: '#FFF5F0',
  },
  stepText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '600' as const,
  },
  stepTextActive: {
    color: '#FF6B35',
  },
  stepDivider: {
    width: 24,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  addressCard: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  addressTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#1A202C',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#4A5568',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1A202C',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1A202C',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#2D3748',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A202C',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1A202C',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#718096',
  },
});
