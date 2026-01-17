
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DataBundleForm } from './components/DataBundleForm';
import { Marketplace } from './components/Marketplace';
import { QRCodeScanner } from './components/QRCodeScanner';
import { WalletView } from './components/WalletView';
import { NavItem, User, CartItem, Product, Notification, Transaction, SavingsGoal, ScheduledTransfer, SavingsGroup } from './types';
import { Settings, CloudUpload, Bell, Smartphone, LogIn, Trash2, ArrowRight, X, CreditCard, Download, Share2, ShieldCheck, CheckCircle, FileText, Loader2, AlertTriangle, Wallet, Tag, Lock, KeyRound, MessageSquareCode, Minus, Plus, ShoppingCart, Hash, Radio, ArrowLeftRight, User as UserIcon, ArrowDownLeft, Users, Store, ArrowUpRight, Banknote, ScanLine, Keyboard } from 'lucide-react';

// --- SIMULATED SERVER-SIDE CONFIGURATION ---
const CINETPAY_SERVER_CONFIG = {
    SITE_ID: "554433",
    KEYS: {
        DATA: "CNP_DATA_API_KEY_998877_SECURE",
        TRANSFER: "CNP_TRANSFER_API_KEY_112233_SECURE",
        MERCHANT: "CNP_MERCHANT_API_KEY_445566_SECURE",
        DEFAULT: "CNP_GENERAL_API_KEY_000000"
    }
};

// --- MOCK INITIAL DATA ---
const INITIAL_PRODUCTS: Product[] = [
    { id: '1', name: 'iPhone 15 Pro', price: 850000, quantity: 2, sellerMobile: '677123456', location: {lat:0,lng:0, address: 'Douala, Akwa'}, category: 'Phones', image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop", rating: 4.5, reviews: 12},
    { id: '2', name: 'MacBook Air M2', price: 650000, quantity: 5, sellerMobile: '699887766', location: {lat:0,lng:0, address: 'Yaoundé, Mokolo'}, category: 'Laptops', image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=600&auto=format&fit=crop", rating: 5.0, reviews: 8},
    { id: '3', name: 'Sony WH-1000XM5', price: 250000, quantity: 10, sellerMobile: '655443322', location: {lat:0,lng:0, address: 'Buea, Molyko'}, category: 'Gaming', image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=600&auto=format&fit=crop", rating: 4.8, reviews: 25},
    { id: '4', name: 'Nike Air Jordan', price: 45000, quantity: 15, sellerMobile: '677998877', location: {lat:0,lng:0, address: 'Bamenda, Commercial'}, category: 'Fashion', image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=600&auto=format&fit=crop", rating: 4.2, reviews: 5}
];

const BONUS_SLIDES = [
    { id: 1, image: "https://images.unsplash.com/photo-1620912189868-3b1139a06b3d?q=80&w=800&auto=format&fit=crop", title: "Double Data Friday", desc: "Get 2x volume on all bundles today!" },
    { id: 2, image: "https://images.unsplash.com/photo-1516724562728-afc824a36e84?q=80&w=800&auto=format&fit=crop", title: "Night Owl Special", desc: "Surf unlimited from 12AM to 5AM." },
    { id: 3, image: "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?q=80&w=800&auto=format&fit=crop", title: "Student Discount", desc: "20% OFF for all verified students." }
];

const SUGGESTED_AMOUNTS = [100, 500, 1000, 2000, 5000, 10000];

// --- HELPER FOR PERSISTENCE ---
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

export default function App() {
  const [activeNav, setActiveNav] = useState<NavItem>(NavItem.HOME);
  
  // --- PERSISTENT GLOBAL STATE (SIMULATED DB) ---
  const [user, setUser] = useStickyState<User>({ isLoggedIn: false, balance: 50000, language: 'en', securityPin: '0000' }, 'app_user');
  const [cart, setCart] = useStickyState<CartItem[]>([], 'app_cart');
  const [transactions, setTransactions] = useStickyState<Transaction[]>([], 'app_transactions');
  const [notifications, setNotifications] = useStickyState<Notification[]>([], 'app_notifications');
  
  // Financial DB Tables
  const [savings, setSavings] = useStickyState<SavingsGoal[]>([], 'app_savings');
  const [distributions, setDistributions] = useStickyState<ScheduledTransfer[]>([], 'app_distributions');
  const [groups, setGroups] = useStickyState<SavingsGroup[]>([], 'app_groups');

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  
  // UI State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showWalletView, setShowWalletView] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'}|null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Login Flow State
  const [loginStep, setLoginStep] = useState<'phone' | 'pin' | 'otp'>('phone');
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  // Payment Flow State
  const [pendingTransaction, setPendingTransaction] = useState<{amount: number, description: string, recipient?: string, type: Transaction['type'], fee?: number} | null>(null);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [gatewayStep, setGatewayStep] = useState<'method' | 'pin_verify' | 'ussd_sim' | 'success' | 'failed'>('method');
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'OM' | 'MOMO'>('WALLET');
  const [paymentPhone, setPaymentPhone] = useState(user.mobile || "");
  const [gatewayPin, setGatewayPin] = useState("");
  const [receiptData, setReceiptData] = useState<Transaction | null>(null);

  // Checkout Mode State (Cart -> Payment)
  const [checkoutMode, setCheckoutMode] = useState<{
      active: boolean;
      amount: number;
      autoManual: boolean; // Auto open manual input
  }>({ active: false, amount: 0, autoManual: false });
  const [showCheckoutSelection, setShowCheckoutSelection] = useState(false);

  // USSD Simulation State
  const [ussdState, setUssdState] = useState<'dialing' | 'menu' | 'processing' | 'success'>('dialing');
  const [ussdInput, setUssdInput] = useState("");
  const [ussdMessage, setUssdMessage] = useState("");

  // Scan Action Modal State
  const [scanModal, setScanModal] = useState<{
      id: string; // The number or ID scanned
      type: 'merchant' | 'p2p';
      network?: string; // Only for merchant
  } | null>(null);

  const [scanAction, setScanAction] = useState<'deposit' | 'transfer' | 'pay' | 'withdraw'>('transfer');
  const [scanTargetMode, setScanTargetMode] = useState<'scanned' | 'self' | 'other'>('scanned');
  const [scanAmount, setScanAmount] = useState('');
  const [scanOtherNumber, setScanOtherNumber] = useState('');


  // --- EFFECT: SLIDESHOW TIMER ---
  useEffect(() => {
      const timer = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % BONUS_SLIDES.length);
      }, 5000);
      return () => clearInterval(timer);
  }, []);

  // --- EFFECT: AUTO-FILL OTP ---
  useEffect(() => {
      if (loginStep === 'otp' && !loginOtp) {
          setTimeout(() => {
              showToast("SMS: Your code is 882931", "success");
              setTimeout(() => {
                  setLoginOtp("882931");
                  setTimeout(() => completeLogin(), 1000);
              }, 1500);
          }, 2000);
      }
  }, [loginStep]);

  // --- ACTIONS ---
  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
      setToast({msg, type});
      setTimeout(() => setToast(null), 4000);
  };

  const addNotification = (title: string, message: string, type: 'info'|'success'|'warning' = 'info') => {
      setNotifications(prev => [{
          id: Date.now().toString(),
          title, message, type, read: false, date: new Date()
      }, ...prev]);
  };

  const detectNetwork = (phone: string): 'OM' | 'MOMO' | 'UNKNOWN' => {
      if (!phone) return 'UNKNOWN';
      const p = phone.replace(/\s/g, '').replace('+237', '');
      if (p.startsWith('69') || p.startsWith('655') || p.startsWith('656') || p.startsWith('657')) return 'OM';
      if (p.startsWith('67') || p.startsWith('651') || p.startsWith('652') || p.startsWith('653') || p.startsWith('654') || p.startsWith('68')) return 'MOMO';
      return 'UNKNOWN';
  };

  const calculateFee = (amount: number, method: 'WALLET' | 'OM' | 'MOMO'): number => {
      if (method === 'WALLET') return 0;
      // Simple 1.5% fee logic for example
      return Math.ceil(amount * 0.015);
  };

  const updateCartQuantity = (cartId: string, delta: number) => {
      setCart(prev => prev.map(item => {
          if (item.cartId === cartId) {
              const newQty = Math.max(1, item.selectedQty + delta);
              return { ...item, selectedQty: newQty };
          }
          return item;
      }));
  };

  const removeFromCart = (cartId: string) => {
      setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  // --- LOGIN LOGIC ---
  const handlePhoneSubmit = () => {
      if (loginPhone.length >= 9) setLoginStep('pin');
      else showToast("Invalid Phone Number", "error");
  };

  const handlePinSubmit = () => {
      if (loginPin.length === 4) {
          setIsOtpLoading(true);
          setTimeout(() => {
              setIsOtpLoading(false);
              setLoginStep('otp');
          }, 1500);
      } else {
          showToast("PIN must be 4 characters", "error");
      }
  };

  const completeLogin = () => {
      setUser({
          isLoggedIn: true,
          mobile: loginPhone,
          balance: 50000,
          language: 'en',
          securityPin: loginPin // PERSISTED PIN
      });
      showToast(`Welcome back, ${loginPhone}`);
  };

  // --- WALLET ACTIONS ---
  const handleWalletRecharge = (amount: number, sourceNumber: string) => {
      setUser(prev => ({...prev, balance: prev.balance + amount}));
      const newTx: Transaction = {
          id: `RC-${Date.now()}`,
          type: 'deposit',
          amount: amount,
          description: `Recharge from ${sourceNumber}`,
          date: new Date(),
          status: 'success',
          paymentMethod: 'OM' // Simplified
      };
      setTransactions(prev => [newTx, ...prev]);
      showToast(`Recharged ${amount.toLocaleString()} FCFA`);
  };

  const handleWalletWithdraw = (amount: number, destNumber: string) => {
      if(user.balance < amount) {
          showToast("Insufficient Funds", "error");
          return;
      }
      setUser(prev => ({...prev, balance: prev.balance - amount}));
      const newTx: Transaction = {
          id: `WD-${Date.now()}`,
          type: 'transfer',
          amount: -amount,
          description: `Withdrawal to ${destNumber}`,
          date: new Date(),
          status: 'success',
          paymentMethod: 'WALLET'
      };
      setTransactions(prev => [newTx, ...prev]);
      showToast(`Withdrawn ${amount.toLocaleString()} FCFA`);
  };

  // --- CHECKOUT LOGIC ---
  const handleCheckoutStart = (total: number) => {
      setCheckoutMode({ active: true, amount: total, autoManual: false });
      setIsCartOpen(false);
      setShowCheckoutSelection(true);
  };

  const selectCheckoutMethod = (method: 'scan' | 'manual') => {
      setShowCheckoutSelection(false);
      setCheckoutMode(prev => ({ ...prev, autoManual: method === 'manual' }));
      setActiveNav(NavItem.SCAN);
  };

  const cancelCheckoutMode = () => {
      setCheckoutMode({ active: false, amount: 0, autoManual: false });
      showToast("Checkout Cancelled");
  };

  // 1. Initialize Payment
  const initiatePayment = (amount: number, description: string, recipient: string, type: Transaction['type']) => {
      const net = detectNetwork(user.mobile || "");
      const method = net !== 'UNKNOWN' ? net : 'WALLET';
      const fee = calculateFee(amount, method);

      setPendingTransaction({ amount, description, recipient, type, fee });
      setPaymentMethod(method);
      setPaymentPhone(user.mobile || "");
      setShowPaymentGateway(true);
      setGatewayStep('method');
      setGatewayPin("");
  };

  // 2. Validate Payment Method & Ask for PIN/USSD
  const validatePaymentStep = () => {
      if (!pendingTransaction) return;

      if (paymentMethod === 'WALLET') {
          if (user.balance < (pendingTransaction.amount + (pendingTransaction.fee || 0))) {
              showToast("Insufficient Wallet Balance", "error");
              return;
          }
          // GO TO PIN VERIFICATION STEP
          setGatewayStep('pin_verify');
      } else {
          // Launch USSD Simulation
          startUssdSimulation();
      }
  };

  // 3. Verify PIN for Wallet
  const verifyGatewayPin = () => {
      if (gatewayPin === user.securityPin) {
          completeTransaction();
      } else {
          showToast("Incorrect PIN", "error");
          setGatewayPin("");
      }
  };

  // --- USSD SIMULATION LOGIC ---
  const startUssdSimulation = () => {
      setGatewayStep('ussd_sim');
      setUssdState('dialing');
      
      const isOm = paymentMethod === 'OM';
      const code = isOm ? '#150#' : '*126#';
      
      // Phase 1: Dialing
      setTimeout(() => {
          setUssdState('menu');
          const feeMsg = pendingTransaction?.fee ? `(+${pendingTransaction.fee} fee)` : '';
          const msg = isOm 
            ? `Orange Money\nPayment of ${pendingTransaction?.amount} FCFA ${feeMsg} to ${pendingTransaction?.recipient || 'Merchant'}.\nEnter PIN to confirm:` 
            : `Mobile Money\nConfirm payment of ${pendingTransaction?.amount} FCFA ${feeMsg} to ${pendingTransaction?.recipient}.\nEnter PIN:`;
          setUssdMessage(msg);
      }, 2000);
  };

  const handleUssdSubmit = () => {
      if(ussdInput.length >= 4) {
          setUssdState('processing');
          setTimeout(() => {
              setUssdState('success');
              setTimeout(() => {
                  completeTransaction();
              }, 1500);
          }, 2000);
      } else {
          setUssdMessage(prev => prev + "\nInvalid PIN. Try again:");
      }
  };

  // 4. Complete & Generate Receipt
  const completeTransaction = () => {
      if (!pendingTransaction) return;

      const totalDeduction = pendingTransaction.amount + (pendingTransaction.fee || 0);

      // --- SERVER-SIDE API KEY SELECTION SIMULATION ---
      let activeApiKey = CINETPAY_SERVER_CONFIG.KEYS.DEFAULT;
      if (pendingTransaction.type === 'data') activeApiKey = CINETPAY_SERVER_CONFIG.KEYS.DATA;
      if (pendingTransaction.type === 'transfer') activeApiKey = CINETPAY_SERVER_CONFIG.KEYS.TRANSFER;
      if (pendingTransaction.type === 'merchant_pay') activeApiKey = CINETPAY_SERVER_CONFIG.KEYS.MERCHANT;
      console.log(`[DB SERVER] Transaction with Key: ${activeApiKey}`);
      // ------------------------------------------------

      if (paymentMethod === 'WALLET') {
          setUser(prev => ({...prev, balance: prev.balance - totalDeduction}));
      }

      const newTx: Transaction = {
          id: `TX-${Math.floor(Math.random()*1000000)}`,
          type: pendingTransaction.type,
          amount: -pendingTransaction.amount,
          fee: pendingTransaction.fee,
          description: pendingTransaction.description,
          recipient: pendingTransaction.recipient,
          date: new Date(),
          status: 'success',
          paymentMethod: paymentMethod,
          receiptUrl: '#'
      };

      setTransactions(prev => [newTx, ...prev]);
      addNotification("Payment Successful", `Paid ${pendingTransaction.amount} FCFA`, "success");
      
      setGatewayStep('success');
      setReceiptData(newTx);
      
      // Reset checkout mode if active
      if (checkoutMode.active) {
          setCheckoutMode({ active: false, amount: 0, autoManual: false });
          setCart([]); // Clear cart after successful checkout
      }

      setTimeout(() => {
          setShowPaymentGateway(false);
          setUssdInput("");
      }, 1500);
  };

  const handleDownloadReceipt = () => {
      if(!receiptData) return;
      showToast("Receipt Downloaded");
  };

  // Process the final action from the Scan Modal
  const processScanAction = () => {
      if(!scanModal || !scanAmount) return;
      
      const amt = Number(scanAmount);
      if (amt <= 0) {
           showToast("Invalid Amount", "error");
           return;
      }

      // --- SCENARIO 1: MERCHANT ACTION (Payment / Cash-In / Cash-Out) ---
      if (scanModal.type === 'merchant') {
          setScanModal(null); setScanAmount('');
          const label = scanModal.network !== 'GENERIC' ? `${scanModal.network} Agent` : 'Agent';
          
          if (scanAction === 'pay') {
              initiatePayment(amt, `Pay ${label} ${scanModal.id}`, scanModal.id, 'merchant_pay');
          } else if (scanAction === 'withdraw') {
              // Cash Out: User sends money to Agent, Agent gives cash.
              // We use initiatePayment to ensure PIN security
              initiatePayment(amt, `Withdrawal at ${label} ${scanModal.id}`, scanModal.id, 'transfer');
          } else if (scanAction === 'deposit') {
              // Cash In: User gives cash, Agent sends money.
              // In this simulation, we simulate the agent sending immediately.
              handleWalletRecharge(amt, scanModal.id);
          }
          return;
      }

      // --- SCENARIO 2: P2P TRANSFER OR DEPOSIT ---
      let target = scanModal.id;
      if (scanTargetMode === 'self') target = user.mobile || '';
      if (scanTargetMode === 'other') target = scanOtherNumber;

      if (!target || target.length < 9) {
          showToast("Invalid Target Number", "error");
          return;
      }

      setScanModal(null); // Close modal
      setScanAmount('');
      setScanOtherNumber('');

      if (scanAction === 'deposit') {
          // In wallet context, "Deposit" implies recharging that number
          handleWalletRecharge(amt, target);
      } else {
          // "Transfer" means sending money to that number
          initiatePayment(amt, `Transfer to ${target}`, target, 'transfer');
      }
  };

  const handleScanSuccess = (data: string, type: 'merchant' | 'generic') => {
      // Parse extended merchant format: MERCHANT:NETWORK:ID
      if (data.startsWith('MERCHANT:')) {
          const parts = data.split(':');
          let merchantId, network = 'GENERIC';
          
          if (parts.length === 3) {
              network = parts[1];
              merchantId = parts[2];
          } else {
              merchantId = parts[1];
          }

          setScanModal({ id: merchantId, type: 'merchant', network });
          setScanAction('pay'); // Default to pay, but user can change
          setScanTargetMode('scanned'); // Locked for merchants
          
          // Pre-fill amount if in Checkout Mode
          if (checkoutMode.active) {
              setScanAmount(checkoutMode.amount.toString());
          }
          
      } else {
          // Handles P2P (Simple Numbers) or Generic Codes
          const cleanNumber = data.replace(/[^0-9]/g, '');
          if (cleanNumber.length >= 6) {
              setScanModal({ id: cleanNumber, type: 'p2p' });
              setScanAction('transfer'); // Default
              setScanTargetMode('scanned');
          } else {
              showToast(`Scanned: ${data}`);
          }
      }
  };

  // --- VIEWS ---
  const renderContent = () => {
    switch(activeNav) {
        case NavItem.MARKET:
            return <Marketplace products={products} onAddProduct={p => setProducts([p, ...products])} onAddToCart={(p)=>{
                 setCart(prev => [...prev, {...p, cartId: Date.now().toString(), selectedQty: p.quantity || 1}]); // Pass correct qty
                 showToast("Added to Cart");
            }} onToggleWishlist={()=>{}} />;
        case NavItem.SCAN:
            return <QRCodeScanner 
                onScanSuccess={handleScanSuccess} 
                user={user} 
                startManualInput={checkoutMode.autoManual}
                checkoutMode={checkoutMode.active}
                onCancelCheckout={cancelCheckoutMode}
            />;
        case NavItem.PROFILE:
             return (
                 <div className="h-full flex flex-col bg-gray-50 overflow-y-auto pb-24">
                    <div className="bg-white p-6 pb-8 rounded-b-[3rem] shadow-sm mb-4">
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 overflow-hidden border-4 border-white shadow-lg">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900">{user.mobile}</h2>
                            <p className="text-gray-400 font-bold text-sm">Standard Account</p>
                            <button onClick={() => setShowWalletView(true)} className="mt-4 bg-[#FF4522] text-white px-6 py-2 rounded-full font-bold text-sm shadow-md">Open Wallet</button>
                        </div>
                    </div>
                    {/* Recent Transactions List in Profile */}
                    <div className="px-6 space-y-4">
                        <h3 className="font-bold text-gray-900 text-lg">History</h3>
                        {transactions.slice(0, 10).map(t => (
                            <div key={t.id} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                                <div>
                                    <p className="font-bold text-sm">{t.description}</p>
                                    <p className="text-xs text-gray-400">{t.date.toLocaleDateString()}</p>
                                </div>
                                <span className={`font-black ${t.amount > 0 ? 'text-green-500' : 'text-gray-900'}`}>{t.amount} F</span>
                            </div>
                        ))}
                    </div>
                 </div>
             );
        case NavItem.HOME:
        default:
            return (
                <div className="relative h-full flex flex-row overflow-hidden bg-white">
                    {/* LEFT COLUMN: CAROUSEL (40%) */}
                    <div className="w-[40%] h-full relative overflow-hidden bg-black">
                        {BONUS_SLIDES.map((slide, index) => (
                            <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                            </div>
                        ))}
                        <div className="absolute top-8 left-5 z-20">
                            <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-1 bg-black/30 w-fit px-2 py-1 rounded backdrop-blur-md border border-white/10">Welcome Back</p>
                            <h2 className="text-white text-3xl font-black tracking-tighter leading-none drop-shadow-lg">Mokolo<br/><span className="text-[#FF4522]">Online</span></h2>
                        </div>
                        <div className="absolute bottom-10 left-5 right-5 z-20">
                            {BONUS_SLIDES.map((slide, index) => (
                                <div key={slide.id} className={`transition-all duration-700 absolute bottom-0 w-full ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                                    <span className="bg-[#FF4522] text-white text-[9px] font-bold px-2 py-0.5 rounded mb-2 inline-block shadow-md">HOT OFFER</span>
                                    <h3 className="text-white text-xl font-bold leading-tight mb-1">{slide.title}</h3>
                                    <p className="text-white/70 text-xs font-medium line-clamp-2">{slide.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* RIGHT COLUMN: DATA FORM (60%) */}
                    <div className="w-[60%] h-full relative bg-gray-50 flex items-center shadow-[-20px_0_40px_rgba(0,0,0,0.1)] z-10">
                        <div className="w-full h-full relative z-10">
                             <DataBundleForm user={user} onPurchase={(amt, desc, recipient) => initiatePayment(amt, desc, recipient, 'data')} />
                        </div>
                    </div>
                </div>
            );
    }
  };

  // --- LOGIN SCREEN ---
  if (!user.isLoggedIn) {
      return (
          <div className="h-screen w-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
              <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl z-10">
                  <div className="flex flex-col items-center mb-10">
                      <div className="w-20 h-20 bg-[#FF4522] rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-orange-200 rotate-3"><LogIn className="w-10 h-10" /></div>
                      <h1 className="text-3xl font-black text-gray-900 tracking-tighter text-center">Atangana<span className="text-[#FF4522]">App</span></h1>
                  </div>
                  
                  {loginStep === 'phone' && (
                      <div className="space-y-4 animate-in slide-in-from-right">
                          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 focus-within:ring-2 ring-[#FF4522] transition-all">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Mobile Number</label>
                              <div className="flex items-center gap-3"><Smartphone className="text-gray-400 w-5 h-5" /><input type="tel" placeholder="6XX XX XX XX" maxLength={9} value={loginPhone} onChange={(e) => setLoginPhone(e.target.value)} className="w-full bg-transparent font-black text-lg text-gray-900 outline-none placeholder-gray-300" autoFocus /></div>
                          </div>
                          <button onClick={handlePhoneSubmit} className="w-full bg-[#FF4522] text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-[#d63011] transition flex items-center justify-center gap-2">Continue <ArrowRight className="w-5 h-5" /></button>
                      </div>
                  )}

                  {loginStep === 'pin' && (
                      <div className="space-y-4 animate-in slide-in-from-right">
                          <button onClick={() => setLoginStep('phone')} className="flex items-center gap-2 text-xs text-gray-400 font-bold mb-2"><ArrowRight className="w-3 h-3 rotate-180" /> Change Number</button>
                          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 focus-within:ring-2 ring-[#FF4522] transition-all">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Create Security PIN</label>
                              <div className="flex items-center gap-3"><Lock className="text-gray-400 w-5 h-5" /><input type="password" placeholder="****" maxLength={4} value={loginPin} onChange={(e) => setLoginPin(e.target.value)} className="w-full bg-transparent font-black text-lg text-gray-900 outline-none placeholder-gray-300 tracking-widest" autoFocus /></div>
                          </div>
                          <button onClick={handlePinSubmit} disabled={isOtpLoading} className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-70">{isOtpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify PIN <KeyRound className="w-5 h-5" /></>}</button>
                      </div>
                  )}

                  {loginStep === 'otp' && (
                      <div className="space-y-6 animate-in slide-in-from-right text-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse"><MessageSquareCode className="w-8 h-8 text-blue-600" /></div>
                          <div><h3 className="text-xl font-bold text-gray-900">Enter OTP Code</h3><p className="text-gray-500 text-xs mt-1">Sent to {loginPhone}</p></div>
                          <div className="flex justify-center gap-2">{[0,1,2,3,4,5].map(i => (<div key={i} className="w-10 h-12 border-2 border-gray-200 rounded-lg flex items-center justify-center text-xl font-black bg-gray-50">{loginOtp[i] || ""}</div>))}</div>
                          <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400"><Loader2 className="w-3 h-3 animate-spin" /> Auto-filling code...</div>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  // --- APP RENDER ---
  return (
    <div className="flex flex-col h-full w-full bg-gray-50 max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-gray-200">
      <Header user={user} notifications={notifications} cart={cart} onLogout={() => { setUser({...user, isLoggedIn: false}); setLoginStep('phone'); setLoginPin(""); setLoginOtp(""); }} onOpenCart={() => setIsCartOpen(true)} onClearNotifications={() => setNotifications([])} onToggleLanguage={() => setUser({...user, language: user.language === 'en' ? 'fr' : 'en'})} />
      <main className="flex-1 relative overflow-hidden">{renderContent()}</main>
      <BottomNav activeItem={activeNav} onNavigate={setActiveNav} />

      {/* --- CHECKOUT SELECTION MODAL --- */}
      {showCheckoutSelection && (
          <div className="absolute inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end justify-center">
              <div className="bg-white w-full rounded-t-3xl p-6 animate-in slide-in-from-bottom shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-black text-xl text-gray-900">Select Payment Method</h3>
                      <button onClick={() => setShowCheckoutSelection(false)} className="bg-gray-100 p-2 rounded-full"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl mb-6 flex justify-between items-center border border-orange-100">
                      <div>
                          <p className="text-xs font-bold text-orange-500 uppercase tracking-wide">Total to Pay</p>
                          <p className="text-3xl font-black text-gray-900">{checkoutMode.amount.toLocaleString()} <span className="text-sm font-bold">FCFA</span></p>
                      </div>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-orange-500"><Banknote className="w-6 h-6" /></div>
                  </div>
                  <div className="space-y-3">
                      <button onClick={() => selectCheckoutMethod('scan')} className="w-full p-4 bg-black text-white rounded-2xl flex items-center gap-4 font-bold text-left shadow-lg">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><ScanLine className="w-6 h-6" /></div>
                          <div className="flex-1">
                              <p className="text-lg">Pay with QR Code</p>
                              <p className="text-xs text-gray-400">Scan merchant's code</p>
                          </div>
                          <ArrowRight className="w-5 h-5" />
                      </button>
                      <button onClick={() => selectCheckoutMethod('manual')} className="w-full p-4 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl flex items-center gap-4 font-bold text-left hover:bg-gray-50">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"><Keyboard className="w-6 h-6" /></div>
                          <div className="flex-1">
                              <p className="text-lg">Pay with Merchant ID</p>
                              <p className="text-xs text-gray-400">Type code manually</p>
                          </div>
                          <ArrowRight className="w-5 h-5" />
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- SCAN ACTION MODAL --- */}
      {scanModal && (
          <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end justify-center">
              <div className="bg-white w-full rounded-t-3xl p-6 animate-in slide-in-from-bottom shadow-2xl max-h-[90vh] overflow-y-auto">
                  
                  {/* Modal Header */}
                  <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border ${scanModal.type === 'merchant' ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {scanModal.type === 'merchant' ? <Store className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-none">{scanModal.type === 'merchant' ? 'Action Marchand' : 'Action P2P'}</h3>
                            <p className="text-xs text-gray-400">
                                {scanModal.type === 'merchant' ? `${scanModal.network !== 'GENERIC' ? scanModal.network : ''} ID: ${scanModal.id}` : `Scanned: ${scanModal.id}`}
                            </p>
                        </div>
                      </div>
                      <button onClick={() => { setScanModal(null); setScanAmount(''); setScanOtherNumber(''); }} className="bg-gray-100 p-2 rounded-full"><X className="w-5 h-5" /></button>
                  </div>

                  {/* 1. Action Selector for Merchant */}
                  {scanModal.type === 'merchant' && (
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        <button 
                            onClick={() => setScanAction('pay')}
                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${scanAction === 'pay' ? 'border-orange-500 bg-orange-50 text-black' : 'border-gray-100 text-gray-400'} ${checkoutMode.active ? 'col-span-3' : ''}`}
                        >
                            <Store className={`w-6 h-6 ${scanAction==='pay'?'text-orange-500':''}`} />
                            <span className="font-bold text-[10px] uppercase">Payer</span>
                        </button>
                        {/* Only show Withdraw/Deposit if NOT in checkout mode */}
                        {!checkoutMode.active && (
                            <>
                                <button 
                                    onClick={() => setScanAction('withdraw')}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${scanAction === 'withdraw' ? 'border-red-500 bg-red-50 text-black' : 'border-gray-100 text-gray-400'}`}
                                >
                                    <ArrowUpRight className={`w-6 h-6 ${scanAction==='withdraw'?'text-red-500':''}`} />
                                    <span className="font-bold text-[10px] uppercase">Retrait</span>
                                </button>
                                <button 
                                    onClick={() => setScanAction('deposit')}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${scanAction === 'deposit' ? 'border-green-500 bg-green-50 text-black' : 'border-gray-100 text-gray-400'}`}
                                >
                                    <ArrowDownLeft className={`w-6 h-6 ${scanAction==='deposit'?'text-green-500':''}`} />
                                    <span className="font-bold text-[10px] uppercase">Dépôt</span>
                                </button>
                            </>
                        )}
                    </div>
                  )}

                  {/* 1. Action Selector for P2P (Hidden in checkout mode basically, but safe guard) */}
                  {scanModal.type === 'p2p' && !checkoutMode.active && (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button 
                            onClick={() => setScanAction('transfer')}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${scanAction === 'transfer' ? 'border-[#FF4522] bg-orange-50 text-black' : 'border-gray-100 text-gray-400'}`}
                        >
                            <ArrowLeftRight className={`w-6 h-6 ${scanAction==='transfer'?'text-[#FF4522]':''}`} />
                            <span className="font-bold text-xs uppercase">Envoyer (Send)</span>
                        </button>
                        <button 
                            onClick={() => setScanAction('deposit')}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${scanAction === 'deposit' ? 'border-green-500 bg-green-50 text-black' : 'border-gray-100 text-gray-400'}`}
                        >
                            <ArrowDownLeft className={`w-6 h-6 ${scanAction==='deposit'?'text-green-500':''}`} />
                            <span className="font-bold text-xs uppercase">Déposer (Deposit)</span>
                        </button>
                    </div>
                  )}

                  {/* 2. Target Selector (Only for P2P, Locked for Merchant) */}
                  {scanModal.type === 'p2p' && !checkoutMode.active && (
                  <div className="space-y-2 mb-6">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pour qui ? (Beneficiary)</p>
                      <button onClick={() => setScanTargetMode('scanned')} className={`w-full p-3 rounded-xl flex items-center justify-between border ${scanTargetMode === 'scanned' ? 'border-black bg-gray-50' : 'border-gray-100'}`}>
                          <div className="flex items-center gap-3">
                              <div className="bg-gray-200 p-1.5 rounded-lg"><Smartphone className="w-4 h-4" /></div>
                              <span className="text-sm font-bold text-gray-800">{scanModal.id} (Scanned)</span>
                          </div>
                          {scanTargetMode === 'scanned' && <CheckCircle className="w-4 h-4 text-black" />}
                      </button>
                      <button onClick={() => setScanTargetMode('self')} className={`w-full p-3 rounded-xl flex items-center justify-between border ${scanTargetMode === 'self' ? 'border-black bg-gray-50' : 'border-gray-100'}`}>
                          <div className="flex items-center gap-3">
                              <div className="bg-gray-200 p-1.5 rounded-lg"><UserIcon className="w-4 h-4" /></div>
                              <span className="text-sm font-bold text-gray-800">Pour moi ({user.mobile})</span>
                          </div>
                          {scanTargetMode === 'self' && <CheckCircle className="w-4 h-4 text-black" />}
                      </button>
                      <button onClick={() => setScanTargetMode('other')} className={`w-full p-3 rounded-xl flex items-center justify-between border ${scanTargetMode === 'other' ? 'border-black bg-gray-50' : 'border-gray-100'}`}>
                          <div className="flex items-center gap-3">
                              <div className="bg-gray-200 p-1.5 rounded-lg"><Users className="w-4 h-4" /></div>
                              <span className="text-sm font-bold text-gray-800">Autre Numéro</span>
                          </div>
                          {scanTargetMode === 'other' && <CheckCircle className="w-4 h-4 text-black" />}
                      </button>
                      
                      {scanTargetMode === 'other' && (
                          <input 
                            value={scanOtherNumber}
                            onChange={(e) => setScanOtherNumber(e.target.value)}
                            placeholder="Entrer le numéro (6...)"
                            className="w-full bg-gray-100 p-3 rounded-xl font-bold outline-none border-2 focus:border-black animate-in fade-in"
                            type="tel"
                            maxLength={9}
                          />
                      )}
                  </div>
                  )}

                  {/* 3. Amount & Quick Select */}
                  <div className="mb-6">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Montant (FCFA)</p>
                      
                      {/* Amount Input */}
                      <div className={`bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-2 mb-3 ${checkoutMode.active ? 'opacity-75' : ''}`}>
                          <span className="font-bold text-gray-400">FCFA</span>
                          <input 
                            value={scanAmount}
                            onChange={(e) => !checkoutMode.active && setScanAmount(e.target.value)}
                            readOnly={checkoutMode.active}
                            className="bg-transparent w-full text-3xl font-black outline-none text-gray-900 placeholder-gray-300"
                            placeholder="0"
                            type="number"
                            autoFocus={!checkoutMode.active}
                          />
                          {checkoutMode.active && <Lock className="w-5 h-5 text-gray-400" />}
                      </div>

                      {/* Quick Presets (Hide if checkout mode) */}
                      {!checkoutMode.active && (
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {SUGGESTED_AMOUNTS.map(amt => (
                                <button 
                                    key={amt}
                                    onClick={() => setScanAmount(amt.toString())}
                                    className="px-4 py-2 bg-gray-100 hover:bg-black hover:text-white rounded-full text-xs font-bold transition-colors whitespace-nowrap"
                                >
                                    {amt.toLocaleString()}
                                </button>
                            ))}
                        </div>
                      )}
                  </div>

                  <button 
                    onClick={processScanAction}
                    className={`w-full py-4 rounded-xl font-bold text-white shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 ${scanAction === 'deposit' ? 'bg-green-600' : scanAction === 'withdraw' ? 'bg-red-600' : 'bg-[#FF4522]'}`}
                  >
                      {scanAction === 'deposit' ? 'Confirmer le Dépôt (Cash In)' : scanAction === 'withdraw' ? 'Confirmer le Retrait (Cash Out)' : scanModal.type === 'merchant' ? 'Payer le Marchand' : 'Confirmer l\'Envoi'} 
                      <ArrowRight className="w-5 h-5" />
                  </button>
              </div>
          </div>
      )}

      {/* --- CINETPAY GATEWAY --- */}
      {showPaymentGateway && pendingTransaction && (
          <div className="absolute inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end justify-center">
              <div className="bg-white w-full rounded-t-3xl p-6 animate-in slide-in-from-bottom shadow-2xl max-h-[90vh] overflow-y-auto">
                  
                  {/* STEP 1: METHOD SELECTION */}
                  {gatewayStep === 'method' && (
                      <div className="space-y-6">
                          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                              <h3 className="font-black text-xl text-gray-900">Secure Payment</h3>
                              <button onClick={() => setShowPaymentGateway(false)} className="p-2 bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                          </div>
                          <div className="bg-indigo-50 p-4 rounded-xl flex justify-between items-center">
                              <div><p className="text-xs font-bold text-indigo-400 uppercase">Amount to pay</p><p className="text-2xl font-black text-indigo-900">{pendingTransaction.amount} FCFA</p></div>
                              <ShieldCheck className="w-8 h-8 text-indigo-500" />
                          </div>
                          <div className="space-y-3">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Select Source</p>
                              {/* Wallet Option */}
                              <button onClick={() => setPaymentMethod('WALLET')} className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${paymentMethod === 'WALLET' ? 'border-[#FF4522] bg-orange-50' : 'border-gray-100'}`}>
                                  <div className="bg-[#FF4522] text-white p-2 rounded-lg"><Wallet className="w-5 h-5" /></div>
                                  <div className="text-left flex-1"><p className="font-bold text-gray-900">My Wallet</p><p className="text-xs text-gray-500">Balance: {user.balance.toLocaleString()} FCFA</p></div>
                                  {paymentMethod === 'WALLET' && <CheckCircle className="w-5 h-5 text-[#FF4522]" />}
                              </button>
                              
                              {/* Mobile Money Options with dynamic fees */}
                              <button onClick={() => setPaymentMethod('OM')} className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${paymentMethod === 'OM' ? 'border-orange-500 bg-orange-50' : 'border-gray-100'}`}>
                                  <div className="bg-black text-white p-2 rounded-lg font-bold text-xs">OM</div>
                                  <div className="text-left flex-1">
                                      <p className="font-bold text-gray-900">Orange Money</p>
                                      <p className="text-xs text-orange-600">Fee: {calculateFee(pendingTransaction.amount, 'OM')} FCFA</p>
                                  </div>
                                  {paymentMethod === 'OM' && <CheckCircle className="w-5 h-5 text-orange-500" />}
                              </button>
                              
                              <button onClick={() => setPaymentMethod('MOMO')} className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${paymentMethod === 'MOMO' ? 'border-yellow-400 bg-yellow-50' : 'border-gray-100'}`}>
                                  <div className="bg-yellow-400 text-white p-2 rounded-lg font-bold text-xs">MTN</div>
                                  <div className="text-left flex-1">
                                      <p className="font-bold text-gray-900">Mobile Money</p>
                                      <p className="text-xs text-yellow-600">Fee: {calculateFee(pendingTransaction.amount, 'MOMO')} FCFA</p>
                                  </div>
                                  {paymentMethod === 'MOMO' && <CheckCircle className="w-5 h-5 text-yellow-500" />}
                              </button>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center text-xs font-bold text-gray-500">
                             <span>Total with fees:</span>
                             <span>{pendingTransaction.amount + calculateFee(pendingTransaction.amount, paymentMethod)} FCFA</span>
                          </div>

                          <button onClick={validatePaymentStep} className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg shadow-xl">Confirm Payment</button>
                      </div>
                  )}

                  {/* STEP 2: PIN VERIFICATION (FOR WALLET) */}
                  {gatewayStep === 'pin_verify' && (
                      <div className="space-y-6 text-center animate-in slide-in-from-right">
                          <button onClick={() => setGatewayStep('method')} className="absolute top-6 left-6 p-2 bg-gray-100 rounded-full"><ArrowRight className="w-5 h-5 rotate-180" /></button>
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto"><Lock className="w-8 h-8 text-gray-600" /></div>
                          <div>
                              <h3 className="text-xl font-bold text-gray-900">Enter Security PIN</h3>
                              <p className="text-gray-500 text-xs mt-1">Authorize transaction of {pendingTransaction.amount} FCFA</p>
                          </div>
                          <div className="flex justify-center">
                              <input 
                                  type="password" 
                                  maxLength={4} 
                                  className="text-center text-4xl font-black tracking-[0.5em] w-48 border-b-2 border-gray-300 focus:border-black outline-none bg-transparent"
                                  autoFocus
                                  value={gatewayPin}
                                  onChange={(e) => setGatewayPin(e.target.value)}
                              />
                          </div>
                          <button onClick={verifyGatewayPin} className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg shadow-xl">Verify & Pay</button>
                      </div>
                  )}

                  {/* STEP 3: USSD SIMULATION */}
                  {gatewayStep === 'ussd_sim' && (
                      <div className={`flex flex-col h-[500px] w-full rounded-2xl overflow-hidden relative shadow-inner border-8 border-gray-800 ${paymentMethod === 'OM' ? 'bg-[#1a1a1a]' : 'bg-[#1a1a1a]'}`}>
                          {/* Screen Header */}
                          <div className="bg-black text-white px-4 py-1 flex justify-between text-[10px] font-bold">
                              <span>{paymentMethod === 'OM' ? 'Orange' : 'MTN'}</span>
                              <span>4G</span>
                              <span>12:00</span>
                          </div>
                          
                          {/* Screen Body */}
                          <div className={`flex-1 p-6 font-mono text-sm relative ${paymentMethod === 'OM' ? 'bg-orange-600 text-white' : 'bg-yellow-400 text-black'}`}>
                               {ussdState === 'dialing' && (
                                   <div className="flex flex-col items-center justify-center h-full">
                                       <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                       <p>Running USSD code...</p>
                                       <p className="font-bold mt-2">{paymentMethod === 'OM' ? '#150#' : '*126#'}</p>
                                   </div>
                               )}
                               
                               {(ussdState === 'menu' || ussdState === 'processing') && (
                                   <div className="animate-in fade-in">
                                       <p className="whitespace-pre-wrap leading-tight">{ussdMessage}</p>
                                       <div className="mt-4 border-b-2 border-current w-3/4 animate-pulse">
                                           {ussdInput}
                                           <span className="inline-block w-2 h-4 bg-current ml-1 animate-bounce"></span>
                                       </div>
                                       {ussdState === 'processing' && <p className="mt-4 italic text-xs">Processing...</p>}
                                   </div>
                               )}

                               {ussdState === 'success' && (
                                   <div className="flex flex-col items-center justify-center h-full animate-in zoom-in">
                                       <CheckCircle className="w-12 h-12 mb-2" />
                                       <p className="font-bold text-center">Transaction Approved</p>
                                   </div>
                               )}
                          </div>

                          {/* Mock Keypad Actions */}
                          {(ussdState === 'menu') && (
                              <div className="bg-black p-4 grid grid-cols-3 gap-2">
                                  {[1,2,3,4,5,6,7,8,9].map(n => (
                                      <button key={n} onClick={() => setUssdInput(prev => prev + n)} className="text-white bg-gray-800 p-2 rounded font-bold text-lg active:bg-gray-700">{n}</button>
                                  ))}
                                  <button onClick={() => setUssdInput(prev => prev.slice(0, -1))} className="text-red-500 bg-gray-900 p-2 rounded font-bold">DEL</button>
                                  <button onClick={() => setUssdInput(prev => prev + 0)} className="text-white bg-gray-800 p-2 rounded font-bold text-lg">0</button>
                                  <button onClick={handleUssdSubmit} className="text-green-500 bg-gray-900 p-2 rounded font-bold">OK</button>
                              </div>
                          )}
                      </div>
                  )}

                  {/* STEP 4: SUCCESS */}
                  {gatewayStep === 'success' && (
                      <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"><CheckCircle className="w-10 h-10 text-green-500" /></div>
                          <h3 className="text-2xl font-black text-gray-900">Payment Successful!</h3>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* --- RECEIPT MODAL --- */}
      {receiptData && (
          <div className="absolute inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 relative">
                  <div className="bg-[#FF4522] p-6 text-center text-white relative">
                      <h3 className="font-black text-2xl tracking-widest">RECEIPT</h3>
                      <button onClick={() => setReceiptData(null)} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/30"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="p-6 space-y-4 relative">
                      {/* ... Receipt Details ... */}
                      <div className="flex justify-between items-center border-b border-dashed border-gray-200 pb-4">
                          <span className="text-gray-500 text-sm font-bold">Amount Paid</span>
                          <span className="text-xl font-black text-gray-900">{Math.abs(receiptData.amount)} FCFA</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-dashed border-gray-200 pb-4">
                          <span className="text-gray-500 text-sm font-bold">Fee</span>
                          <span className="text-sm font-bold text-gray-900">{receiptData.fee || 0} FCFA</span>
                      </div>
                      <div className="flex justify-between text-xs"><span className="text-gray-400">Description</span><span className="font-bold text-gray-800">{receiptData.description}</span></div>
                      <div className="pt-4 grid grid-cols-2 gap-3">
                          <button onClick={handleDownloadReceipt} className="bg-gray-100 text-gray-800 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200"><Download className="w-4 h-4" /> PDF</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- CART DRAWER --- */}
      {isCartOpen && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
            <div className="w-4/5 h-full bg-white shadow-2xl animate-in slide-in-from-right flex flex-col">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="font-black text-xl">My Cart ({cart.length})</h2>
                    <button onClick={() => setIsCartOpen(false)} className="p-2 bg-gray-200 rounded-full"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                            <ShoppingCart className="w-16 h-16 opacity-20" />
                            <p className="font-bold text-sm">Your cart is empty</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.cartId} className="flex gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm relative group">
                                <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.name}</h4>
                                        <p className="text-[#FF4522] font-black text-xs">{item.price.toLocaleString()} FCFA</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                            <button onClick={() => updateCartQuantity(item.cartId, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-xs font-bold hover:text-[#FF4522]"><Minus className="w-3 h-3" /></button>
                                            <span className="w-8 text-center text-xs font-bold">{item.selectedQty}</span>
                                            <button onClick={() => updateCartQuantity(item.cartId, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-xs font-bold hover:text-[#FF4522]"><Plus className="w-3 h-3" /></button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.cartId)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-5 border-t border-gray-100 bg-gray-50">
                    <div className="flex justify-between mb-4"><span className="font-bold text-gray-500">Total</span><span className="font-black text-xl">{cart.reduce((a,b)=>a+(b.price*b.selectedQty),0).toLocaleString()} FCFA</span></div>
                    <button onClick={() => { const total = cart.reduce((a,b)=>a+(b.price*b.selectedQty),0); handleCheckoutStart(total); }} disabled={cart.length===0} className="w-full bg-black text-white py-4 rounded-xl font-bold disabled:opacity-50">Checkout</button>
                </div>
            </div>
        </div>
      )}

       {/* --- WALLET VIEW (State Lifted) --- */}
      {showWalletView && (
          <WalletView 
            user={user}
            transactions={transactions}
            onClose={() => setShowWalletView(false)}
            onRecharge={handleWalletRecharge}
            onWithdraw={handleWalletWithdraw}
            validatePin={(pin) => pin === user.securityPin}
            // Passing Persistent State
            savings={savings} setSavings={setSavings}
            distributions={distributions} setDistributions={setDistributions}
            groups={groups} setGroups={setGroups}
          />
      )}

      {toast && <div className={`absolute top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-xl z-[80] animate-in fade-in slide-in-from-top-4 font-bold text-sm flex items-center gap-2 whitespace-nowrap ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>{toast.msg}</div>}
    </div>
  );
}
