import React, { useState, useMemo } from 'react';
import { X, LogOut, MoreHorizontal, ChevronDown, Share2, CreditCard, RefreshCw, Globe, ChevronUp, Zap, Gift, Smartphone, CheckCircle, Wifi, Moon, Sun, Calendar, Star, Wallet, Send, Users } from 'lucide-react';
import { NetworkProvider, DataBundle, User } from '../types';

const NETWORKS: NetworkProvider[] = [
  { id: 'mtn', name: 'MTN', color: 'bg-[#FFCC00]', apiKeyStatus: 'connected' },
  { id: 'orange', name: 'Orange', color: 'bg-[#FF7900]', apiKeyStatus: 'connected' }
];

// Generate 100 Mock Bundles
const generateBundles = (): DataBundle[] => {
    return Array.from({ length: 50 }, (_, i) => {
        const network = i % 2 === 0 ? 'mtn' : 'orange';
        const typeIdx = i % 4;
        const types: DataBundle['duration'][] = ['Daily', 'Weekly', 'Monthly', 'Night'];
        const duration = types[typeIdx];
        const size = (i + 1) * 100;
        const isGb = size >= 1000;
        
        return {
            id: `b-${i}`,
            name: isGb ? `${(size/1000).toFixed(1)}GB ${duration}` : `${size}MB ${duration}`,
            price: isGb ? (size/1000) * 500 : (size/100) * 50,
            dataAmount: isGb ? `${(size/1000).toFixed(1)}GB` : `${size}MB`,
            duration: duration,
            network: network
        };
    });
};

const ALL_BUNDLES = generateBundles();

interface Props {
    user: User;
    onPurchase: (amount: number, description: string, recipient: string) => void; 
}

export const DataBundleForm: React.FC<Props> = ({ user, onPurchase }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mode, setMode] = useState<'self' | 'gift'>('self');
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);
  const [durationFilter, setDurationFilter] = useState<DataBundle['duration']>('Daily');
  const [phoneNumber, setPhoneNumber] = useState(user.mobile || "");
  const [giftNumber, setGiftNumber] = useState("");
  
  // Filtering logic
  const filteredBundles = useMemo(() => {
      return ALL_BUNDLES.filter(b => b.network === selectedNetwork.id && b.duration === durationFilter);
  }, [selectedNetwork, durationFilter]);

  const [selectedBundle, setSelectedBundle] = useState<DataBundle | null>(null);

  React.useEffect(() => {
      if (filteredBundles.length > 0) setSelectedBundle(filteredBundles[0]);
  }, [filteredBundles]);

  const initiatePayment = () => {
    if (!selectedBundle) return;
    const targetNumber = mode === 'self' ? phoneNumber : giftNumber;
    
    if (targetNumber.length < 9) { alert("Invalid Beneficiary Number"); return; }
    
    // Trigger global payment flow via App.tsx prop
    onPurchase(selectedBundle.price, `${selectedBundle.name} Bundle`, targetNumber);
  };

  const BonusView = () => (
    <div className="h-full flex flex-col items-center justify-center p-4 animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 w-full rounded-2xl p-5 text-white shadow-xl mb-4 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setIsCollapsed(false)}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <Gift className="absolute -right-4 -bottom-4 w-24 h-24 text-white/20 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            <div className="flex justify-between items-start mb-2">
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold">LIMITED TIME</span>
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
            <h3 className="font-bold text-2xl mb-0">Flash Promo</h3>
            <p className="text-sm opacity-90 mb-4 font-medium">5GB Data + 1h Calls</p>
            <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">500</span>
                <span className="text-sm mb-1 opacity-80">FCFA</span>
            </div>
        </div>
        
        <div className="w-full grid grid-cols-2 gap-3">
             {[
                 {icon: Zap, color: 'text-yellow-500', label: 'Night Owl', desc: '10GB @ 100F'},
                 {icon: Smartphone, color: 'text-blue-500', label: 'Socials', desc: 'WhatsApp Unl.'},
             ].map((item, idx) => (
                 <button key={idx} onClick={() => setIsCollapsed(false)} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2 hover:bg-gray-50 transition text-left">
                    <item.icon className={`${item.color} w-6 h-6`} />
                    <div>
                        <span className="block text-xs font-bold text-gray-800">{item.label}</span>
                        <span className="block text-[10px] text-gray-400">{item.desc}</span>
                    </div>
                 </button>
             ))}
        </div>
        
        <button 
            onClick={() => setIsCollapsed(false)}
            className="mt-8 flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-[#FF4522] transition-colors bg-white/50 px-4 py-2 rounded-full"
        >
            <ChevronUp className="w-4 h-4" /> Tap to Recharge
        </button>
    </div>
  );

  return (
    <div className={`flex flex-col h-full w-full relative transition-all duration-500 ${isCollapsed ? 'bg-gray-50' : 'bg-transparent'}`}>
      
      {/* Minimized View Header */}
      {isCollapsed && (
          <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
              <span className="font-bold text-gray-800 flex items-center gap-2"><Gift className="w-4 h-4 text-purple-500" /> Daily Bonuses</span>
              <span className="text-xs text-gray-400 font-medium">Updates every 24h</span>
          </div>
      )}

      {!isCollapsed && (
      <>
        {/* Top White Section */}
        <div className="bg-white/95 backdrop-blur-xl px-5 pt-3 pb-4 rounded-b-3xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] z-20 border-b border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <button 
                    onClick={() => setIsCollapsed(true)}
                    className="text-gray-400 hover:text-[#FF4522] bg-gray-50 p-2 rounded-xl transition-colors hover:bg-orange-50"
                >
                    <ChevronDown className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 text-green-600 font-bold text-[10px] mb-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                        <Wifi className="w-3 h-3" />
                        CNP-API: ON
                    </div>
                    <span className="text-gray-900 font-black text-xl tracking-tight">DATA BUNDLE</span>
                </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-3">
                <button 
                    onClick={() => setMode('self')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'self' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
                >
                    <Smartphone className="w-4 h-4" /> My Number
                </button>
                <button 
                    onClick={() => setMode('gift')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'gift' ? 'bg-[#FF4522] shadow-sm text-white' : 'text-gray-400'}`}
                >
                    <Send className="w-4 h-4" /> Gift / Transfer
                </button>
            </div>

            {/* Network Selector */}
            <div className="space-y-3">
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                    {NETWORKS.map((net) => (
                    <button
                        key={net.id}
                        onClick={() => setSelectedNetwork(net)}
                        className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all relative overflow-hidden flex items-center justify-center gap-2 ${
                        selectedNetwork.id === net.id 
                            ? `${net.color} text-white shadow-md` 
                            : 'text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                        {net.name}
                    </button>
                    ))}
                </div>
            </div>

            {/* Duration Tabs */}
            <div className="flex justify-between mt-4 border-b border-gray-100 pb-1">
                {['Daily', 'Weekly', 'Monthly', 'Night'].map((d) => (
                    <button
                        key={d}
                        onClick={() => setDurationFilter(d as any)}
                        className={`text-[10px] font-bold uppercase pb-2 px-2 transition-all relative ${
                            durationFilter === d ? 'text-[#FF4522]' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        {d}
                        {durationFilter === d && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF4522] rounded-t-full"></span>}
                    </button>
                ))}
            </div>
        </div>

        {/* Scrollable Middle Section */}
        <div className="px-5 py-4 flex-grow flex flex-col gap-4 relative z-10 overflow-y-auto no-scrollbar mask-image-gradient">
            <div className="space-y-1.5">
                <label className="flex items-center justify-between text-white text-xs font-bold mb-1 drop-shadow-md">
                    <span>Packages</span>
                    <span className="bg-black/30 px-2 py-0.5 rounded text-[10px] backdrop-blur-sm">{filteredBundles.length}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {filteredBundles.slice(0, 6).map(bundle => (
                        <button 
                            key={bundle.id}
                            onClick={() => setSelectedBundle(bundle)}
                            className={`p-3 rounded-xl border backdrop-blur-md text-left transition-all ${
                                selectedBundle?.id === bundle.id 
                                ? 'bg-white border-white/50 shadow-lg scale-[1.02]' 
                                : 'bg-white/60 border-white/20 hover:bg-white/80'
                            }`}
                        >
                            <span className="block font-black text-gray-900 text-lg">{bundle.dataAmount}</span>
                            <span className="block text-xs font-bold text-[#FF4522]">{bundle.price} FCFA</span>
                        </button>
                    ))}
                </div>
                <div className="relative group mt-2">
                    <select 
                        value={selectedBundle?.id}
                        onChange={(e) => setSelectedBundle(filteredBundles.find(b => b.id === e.target.value) || null)}
                        className="block w-full bg-white/90 backdrop-blur-xl border-0 text-gray-900 font-bold py-3.5 px-4 pr-8 rounded-xl shadow-lg appearance-none focus:ring-2 focus:ring-[#FF4522]"
                    >
                        {filteredBundles.map(b => (
                            <option key={b.id} value={b.id}>{b.name} - {b.price} FCFA</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="block text-white text-xs font-bold mb-1 drop-shadow-md">
                    {mode === 'self' ? 'Your Number' : 'Beneficiary Number'}
                </label>
                <div className="relative group">
                    <input 
                        type="tel" 
                        value={mode === 'self' ? phoneNumber : giftNumber}
                        onChange={(e) => mode === 'self' ? setPhoneNumber(e.target.value) : setGiftNumber(e.target.value)}
                        maxLength={9}
                        className="block w-full bg-white/90 backdrop-blur-xl border-0 rounded-xl py-4 px-4 pl-12 text-gray-900 placeholder-gray-400 font-bold tracking-widest focus:ring-2 focus:ring-[#FF4522] shadow-lg transition-all"
                        placeholder="6XX XX XX XX" 
                        readOnly={mode === 'self'}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        {mode === 'self' ? <Smartphone className="text-gray-500 w-4 h-4" /> : <Users className="text-gray-500 w-4 h-4" />}
                    </div>
                    {((mode === 'self' ? phoneNumber : giftNumber).length === 9) && (
                         <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                             <CheckCircle className="w-5 h-5 fill-green-100" />
                         </div>
                    )}
                </div>
            </div>
        </div>

        {/* Bottom Section */}
        <div className="bg-white px-5 py-5 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-20">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Total Amount</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-gray-900 tracking-tight">{selectedBundle?.price || 0}</span>
                        <span className="text-sm font-bold text-gray-400">FCFA</span>
                    </div>
                </div>
                {selectedBundle && (
                    <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider ${selectedNetwork.color} shadow-md`}>
                        {selectedNetwork.name} {selectedBundle.duration}
                    </div>
                )}
            </div>

            <button 
                onClick={initiatePayment}
                disabled={!selectedBundle || (mode === 'gift' && giftNumber.length < 9)}
                className="w-full bg-[#FF4522] hover:bg-[#d63011] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 flex items-center justify-center gap-3 transition-all active:scale-95"
            >
                <CreditCard className="w-6 h-6" />
                <span>PURCHASE</span>
            </button>
        </div>
      </>
      )}

      {isCollapsed && <BonusView />}
    </div>
  );
};