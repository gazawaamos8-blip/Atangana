
import React, { useState } from 'react';
import { User, Transaction, SavingsGoal, ScheduledTransfer, SavingsGroup } from '../types';
import { Wallet, Plus, ArrowRight, TrendingUp, Calendar, Users, ShieldCheck, CheckCircle, X, Loader2, CreditCard, RefreshCw, Trash2, Edit2, AlertTriangle, Bell, Smartphone, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface WalletViewProps {
    user: User;
    transactions: Transaction[];
    onClose: () => void;
    onRecharge: (amount: number, number: string) => void;
    onWithdraw: (amount: number, number: string) => void;
    validatePin: (pin: string) => boolean;
    
    // Persistent Data Props
    savings: SavingsGoal[];
    setSavings: React.Dispatch<React.SetStateAction<SavingsGoal[]>>;
    distributions: ScheduledTransfer[];
    setDistributions: React.Dispatch<React.SetStateAction<ScheduledTransfer[]>>;
    groups: SavingsGroup[];
    setGroups: React.Dispatch<React.SetStateAction<SavingsGroup[]>>;
}

export const WalletView: React.FC<WalletViewProps> = ({ 
    user, transactions, onClose, onRecharge, onWithdraw, validatePin,
    savings, setSavings, distributions, setDistributions, groups, setGroups
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'savings' | 'distribution' | 'groups'>('overview');
    
    // --- STATE FOR FEATURES ---
    const [showRecharge, setShowRecharge] = useState(false);
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [rechargeMode, setRechargeMode] = useState<'self' | 'other'>('self');
    const [rechargeOtherNum, setRechargeOtherNum] = useState('');

    const [showWithdraw, setShowWithdraw] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawMode, setWithdrawMode] = useState<'self' | 'other'>('self');
    const [withdrawOtherNum, setWithdrawOtherNum] = useState('');

    const [showNewSavings, setShowNewSavings] = useState(false);
    const [newSaving, setNewSaving] = useState({ title: '', amount: '5000', frequency: 'Monthly' });

    const [showNewDist, setShowNewDist] = useState(false);
    const [newDist, setNewDist] = useState({ name: '', number: '', amount: '', day: '1' });

    const [showNewGroup, setShowNewGroup] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: '', amount: '10000' });

    // PIN Verification Modal State
    const [pinPrompt, setPinPrompt] = useState<{ isOpen: boolean, callback: () => void } | null>(null);
    const [enteredPin, setEnteredPin] = useState('');

    // --- ACTIONS ---

    const handlePinVerify = () => {
        if (validatePin(enteredPin)) {
            pinPrompt?.callback();
            setPinPrompt(null);
            setEnteredPin('');
        } else {
            alert("Incorrect PIN");
        }
    };

    const triggerSecureAction = (callback: () => void) => {
        setPinPrompt({ isOpen: true, callback });
    };

    // 1. RECHARGE
    const processRecharge = () => {
        const amt = Number(rechargeAmount);
        const number = rechargeMode === 'self' ? (user.mobile || '') : rechargeOtherNum;

        if (amt > 0 && number.length >= 9) {
            triggerSecureAction(() => {
                onRecharge(amt, number);
                setShowRecharge(false);
                setRechargeAmount('');
                setRechargeOtherNum('');
            });
        }
    };

    // 2. WITHDRAW
    const processWithdraw = () => {
        const amt = Number(withdrawAmount);
        const number = withdrawMode === 'self' ? (user.mobile || '') : withdrawOtherNum;

        if (amt > 0 && number.length >= 9) {
            triggerSecureAction(() => {
                onWithdraw(amt, number);
                setShowWithdraw(false);
                setWithdrawAmount('');
                setWithdrawOtherNum('');
            });
        }
    };

    // 3. SAVINGS
    const createSavings = () => {
        triggerSecureAction(() => {
            const goal: SavingsGoal = {
                id: Date.now().toString(),
                title: newSaving.title || 'My Savings',
                targetAmount: Number(newSaving.amount) * 12, // Annual target mock
                currentAmount: 0,
                frequency: newSaving.frequency as any,
                autoDeduct: true,
                nextDeductDate: new Date(Date.now() + 86400000 * 30)
            };
            setSavings([...savings, goal]);
            setShowNewSavings(false);
        });
    };

    // 4. DISTRIBUTION
    const createDistribution = () => {
        if (!newDist.number || !newDist.amount) return;
        triggerSecureAction(() => {
            const dist: ScheduledTransfer = {
                id: Date.now().toString(),
                beneficiaryName: newDist.name || 'Beneficiary',
                beneficiaryNumber: newDist.number,
                amount: Number(newDist.amount),
                dayOfMonth: Number(newDist.day),
                status: 'active',
                lastStatus: 'pending'
            };
            setDistributions([...distributions, dist]);
            setShowNewDist(false);
        });
    };

    // 5. GROUPS
    const createGroup = () => {
        triggerSecureAction(() => {
            const grp: SavingsGroup = {
                id: Date.now().toString(),
                name: newGroup.name || 'New Tontine',
                contributionAmount: Number(newGroup.amount),
                frequency: 'Monthly',
                members: [
                    { id: 'me', name: 'Me', mobile: user.mobile || '', status: 'paid' },
                    { id: '2', name: 'Jean', mobile: '699000001', status: 'pending' },
                    { id: '3', name: 'Marie', mobile: '677000002', status: 'pending' }
                ],
                nextPayoutDate: new Date(Date.now() + 86400000 * 15),
                totalPool: Number(newGroup.amount) * 3,
                logo: `https://api.dicebear.com/7.x/initials/svg?seed=${newGroup.name}&backgroundColor=FF4522`
            };
            setGroups([...groups, grp]);
            setShowNewGroup(false);
        });
    };

    return (
        <div className="absolute inset-0 bg-gray-50 z-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* HEADER */}
            <div className="bg-[#1a1a1a] text-white pt-6 pb-8 px-6 rounded-b-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><ArrowRight className="w-5 h-5 rotate-180" /></button>
                    <h2 className="font-bold text-lg tracking-widest uppercase">My Wallet</h2>
                    <button className="p-2 bg-white/10 rounded-full hover:bg-white/20"><Bell className="w-5 h-5" /></button>
                </div>

                <div className="text-center relative z-10 mb-6">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Total Balance</p>
                    <h1 className="text-4xl font-black tracking-tighter">{user.balance.toLocaleString()} <span className="text-lg text-[#FF4522]">FCFA</span></h1>
                </div>

                <div className="grid grid-cols-4 gap-4 relative z-10">
                    <button onClick={() => setActiveTab('overview')} className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${activeTab==='overview' ? 'bg-[#FF4522] text-white shadow-lg shadow-orange-900/50' : 'bg-white/5 text-gray-400'}`}>
                        <Wallet className="w-5 h-5" />
                        <span className="text-[9px] font-bold uppercase">Overview</span>
                    </button>
                    <button onClick={() => setActiveTab('savings')} className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${activeTab==='savings' ? 'bg-[#FF4522] text-white shadow-lg shadow-orange-900/50' : 'bg-white/5 text-gray-400'}`}>
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-[9px] font-bold uppercase">Savings</span>
                    </button>
                    <button onClick={() => setActiveTab('distribution')} className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${activeTab==='distribution' ? 'bg-[#FF4522] text-white shadow-lg shadow-orange-900/50' : 'bg-white/5 text-gray-400'}`}>
                        <RefreshCw className="w-5 h-5" />
                        <span className="text-[9px] font-bold uppercase">Auto-Dist</span>
                    </button>
                    <button onClick={() => setActiveTab('groups')} className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${activeTab==='groups' ? 'bg-[#FF4522] text-white shadow-lg shadow-orange-900/50' : 'bg-white/5 text-gray-400'}`}>
                        <Users className="w-5 h-5" />
                        <span className="text-[9px] font-bold uppercase">Groups</span>
                    </button>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-6 pb-24">
                
                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setShowRecharge(true)} className="w-full bg-black text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 shadow-lg active:scale-95 transition">
                                <ArrowDownLeft className="w-6 h-6 text-green-400" /> 
                                <span>Recharge</span>
                            </button>
                            <button onClick={() => setShowWithdraw(true)} className="w-full bg-white text-black border border-gray-100 py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition">
                                <ArrowUpRight className="w-6 h-6 text-[#FF4522]" /> 
                                <span>Withdraw</span>
                            </button>
                        </div>
                        
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
                            <div className="space-y-3">
                                {transactions.slice(0, 5).map(t => (
                                    <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.amount < 0 ? 'bg-orange-50 text-[#FF4522]' : 'bg-green-50 text-green-600'}`}>
                                                {t.amount < 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900">{t.description}</p>
                                                <p className="text-[10px] text-gray-400">{t.date.toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className={`font-black text-sm ${t.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                            {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. SAVINGS TAB */}
                {activeTab === 'savings' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                             <TrendingUp className="absolute right-4 bottom-4 w-32 h-32 text-white/10" />
                             <h3 className="font-bold text-lg mb-1">Auto-Savings</h3>
                             <p className="text-blue-100 text-xs mb-4">Save automatically every month.</p>
                             <button onClick={() => setShowNewSavings(true)} className="bg-white text-blue-600 px-4 py-2 rounded-full text-xs font-black shadow-lg">CREATE GOAL</button>
                        </div>

                        <div className="grid gap-4">
                            {savings.length === 0 ? <div className="text-center text-gray-400 text-sm py-10">No active savings yet.</div> :
                             savings.map(s => (
                                 <div key={s.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                     <div className="flex justify-between items-center mb-3">
                                         <h4 className="font-black text-gray-900">{s.title}</h4>
                                         <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Active</span>
                                     </div>
                                     <div className="w-full bg-gray-100 h-2 rounded-full mb-2 overflow-hidden">
                                         <div className="bg-blue-600 h-full w-[20%]"></div>
                                     </div>
                                     <div className="flex justify-between text-xs text-gray-500 font-bold">
                                         <span>{(s.targetAmount / 12).toLocaleString()} / {s.frequency}</span>
                                         <span>Target: {s.targetAmount.toLocaleString()}</span>
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>
                )}

                {/* 3. DISTRIBUTION TAB */}
                {activeTab === 'distribution' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-xl text-gray-900">Auto-Dist</h3>
                            <button onClick={() => setShowNewDist(true)} className="bg-black text-white p-2 rounded-full"><Plus className="w-5 h-5" /></button>
                        </div>

                        <div className="space-y-3">
                            {distributions.length === 0 ? <div className="text-center text-gray-400 text-sm py-10">No scheduled transfers.</div> :
                             distributions.map(d => (
                                 <div key={d.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                        <div className="bg-purple-100 text-purple-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                            {d.dayOfMonth}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">{d.beneficiaryName}</p>
                                            <p className="text-xs text-gray-400">{d.beneficiaryNumber} • {d.amount.toLocaleString()} FCFA</p>
                                        </div>
                                     </div>
                                     <div className="flex gap-2">
                                         <button onClick={() => setDistributions(distributions.filter(x => x.id !== d.id))} className="p-2 text-red-400 bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>
                )}

                 {/* 4. GROUPS TAB */}
                 {activeTab === 'groups' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="bg-[#FF4522] text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                             <Users className="absolute right-4 bottom-4 w-32 h-32 text-white/10" />
                             <h3 className="font-bold text-lg mb-1">Online Tontine</h3>
                             <p className="text-orange-100 text-xs mb-4">Safe & Automated Group Savings.</p>
                             <button onClick={() => setShowNewGroup(true)} className="bg-white text-[#FF4522] px-4 py-2 rounded-full text-xs font-black shadow-lg">START GROUP</button>
                        </div>

                        <div className="space-y-4">
                            {groups.map(g => (
                                <div key={g.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img src={g.logo} alt="Group" className="w-12 h-12 rounded-xl bg-gray-100" />
                                        <div>
                                            <h4 className="font-black text-gray-900">{g.name}</h4>
                                            <p className="text-xs text-gray-500">{g.contributionAmount.toLocaleString()} FCFA / {g.frequency}</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl mb-3">
                                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                                            <span>Next Payout</span>
                                            <span className="text-[#FF4522]">{g.nextPayoutDate.toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex -space-x-2">
                                            {g.members.map(m => (
                                                <div key={m.id} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white ${m.status === 'paid' ? 'bg-green-500' : 'bg-gray-300'}`}>
                                                    {m.name[0]}
                                                </div>
                                            ))}
                                            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] text-gray-500 font-bold">
                                                +{g.members.length}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                                        <AlertTriangle className="w-3 h-3 text-orange-400" /> Auto-alert 3 days before due date.
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* --- MODALS --- */}

            {/* Recharge Modal */}
            {showRecharge && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-[60]">
                    <div className="bg-white w-full rounded-t-3xl p-6 animate-in slide-in-from-bottom">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black text-xl">Deposit Money</h3>
                            <button onClick={() => setShowRecharge(false)} className="bg-gray-100 p-2 rounded-full"><X className="w-4 h-4" /></button>
                        </div>
                        
                        <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                            <button onClick={() => setRechargeMode('self')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${rechargeMode==='self' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>My Number</button>
                            <button onClick={() => setRechargeMode('other')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${rechargeMode==='other' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>Other</button>
                        </div>
                        
                        {rechargeMode === 'other' && (
                             <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-2 mb-4 border border-gray-200">
                                <Smartphone className="text-gray-400 w-5 h-5" />
                                <input 
                                    type="tel" 
                                    placeholder="6XX XX XX XX"
                                    className="bg-transparent font-bold w-full outline-none" 
                                    value={rechargeOtherNum}
                                    onChange={e => setRechargeOtherNum(e.target.value)}
                                />
                            </div>
                        )}
                        
                        <div className="bg-green-50 p-4 rounded-xl flex items-center gap-2 mb-4 border border-green-100">
                            <span className="text-green-600 font-bold">FCFA</span>
                            <input 
                                type="number" 
                                placeholder="Amount"
                                className="bg-transparent text-2xl font-black w-full outline-none text-green-900" 
                                autoFocus 
                                value={rechargeAmount}
                                onChange={e => setRechargeAmount(e.target.value)}
                            />
                        </div>

                        <button onClick={processRecharge} className="w-full bg-black text-white py-4 rounded-xl font-bold">Proceed to Pay</button>
                    </div>
                </div>
            )}
            
            {/* Withdraw Modal */}
             {showWithdraw && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-[60]">
                    <div className="bg-white w-full rounded-t-3xl p-6 animate-in slide-in-from-bottom">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black text-xl">Withdraw Money</h3>
                            <button onClick={() => setShowWithdraw(false)} className="bg-gray-100 p-2 rounded-full"><X className="w-4 h-4" /></button>
                        </div>
                        
                        <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                            <button onClick={() => setWithdrawMode('self')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${withdrawMode==='self' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>My Number</button>
                            <button onClick={() => setWithdrawMode('other')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${withdrawMode==='other' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>Other</button>
                        </div>
                        
                        {withdrawMode === 'other' && (
                             <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-2 mb-4 border border-gray-200">
                                <Smartphone className="text-gray-400 w-5 h-5" />
                                <input 
                                    type="tel" 
                                    placeholder="6XX XX XX XX"
                                    className="bg-transparent font-bold w-full outline-none" 
                                    value={withdrawOtherNum}
                                    onChange={e => setWithdrawOtherNum(e.target.value)}
                                />
                            </div>
                        )}
                        
                        <div className="bg-orange-50 p-4 rounded-xl flex items-center gap-2 mb-4 border border-orange-100">
                            <span className="text-orange-600 font-bold">FCFA</span>
                            <input 
                                type="number" 
                                placeholder="Amount"
                                className="bg-transparent text-2xl font-black w-full outline-none text-orange-900" 
                                autoFocus 
                                value={withdrawAmount}
                                onChange={e => setWithdrawAmount(e.target.value)}
                            />
                        </div>

                        <button onClick={processWithdraw} className="w-full bg-black text-white py-4 rounded-xl font-bold">Confirm Withdrawal</button>
                    </div>
                </div>
            )}

            {/* New Savings Modal */}
            {showNewSavings && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-[60]">
                    <div className="bg-white w-full rounded-t-3xl p-6 animate-in slide-in-from-bottom space-y-4">
                        <h3 className="font-black text-xl">Create Auto-Save</h3>
                        <input className="w-full p-4 bg-gray-50 rounded-xl font-bold" placeholder="Goal Name (e.g. New Phone)" value={newSaving.title} onChange={e => setNewSaving({...newSaving, title: e.target.value})} />
                        <div>
                            <label className="text-xs font-bold text-gray-400">Monthly Deduction</label>
                            <input type="range" min="5000" max="500000" step="5000" value={newSaving.amount} onChange={e => setNewSaving({...newSaving, amount: e.target.value})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2" />
                            <div className="text-center font-black text-2xl text-[#FF4522] mt-2">{Number(newSaving.amount).toLocaleString()} FCFA</div>
                        </div>
                        <button onClick={createSavings} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold">Start Saving</button>
                        <button onClick={() => setShowNewSavings(false)} className="w-full text-gray-400 py-2 font-bold text-sm">Cancel</button>
                    </div>
                </div>
            )}

            {/* New Distribution Modal */}
            {showNewDist && (
                 <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-[60]">
                 <div className="bg-white w-full rounded-t-3xl p-6 animate-in slide-in-from-bottom space-y-4">
                     <h3 className="font-black text-xl">Add Beneficiary</h3>
                     <input className="w-full p-4 bg-gray-50 rounded-xl font-bold" placeholder="Name" value={newDist.name} onChange={e => setNewDist({...newDist, name: e.target.value})} />
                     <input className="w-full p-4 bg-gray-50 rounded-xl font-bold" placeholder="Number (6XXXXXXXX)" value={newDist.number} onChange={e => setNewDist({...newDist, number: e.target.value})} />
                     <input className="w-full p-4 bg-gray-50 rounded-xl font-bold" type="number" placeholder="Amount" value={newDist.amount} onChange={e => setNewDist({...newDist, amount: e.target.value})} />
                     <div>
                        <label className="text-xs font-bold text-gray-400">Day of Month to Send</label>
                        <input className="w-full p-4 bg-gray-50 rounded-xl font-bold" type="number" min="1" max="31" value={newDist.day} onChange={e => setNewDist({...newDist, day: e.target.value})} />
                     </div>
                     <button onClick={createDistribution} className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold">Schedule Transfer</button>
                     <button onClick={() => setShowNewDist(false)} className="w-full text-gray-400 py-2 font-bold text-sm">Cancel</button>
                 </div>
             </div>
            )}

             {/* New Group Modal */}
             {showNewGroup && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-[60]">
                    <div className="bg-white w-full rounded-t-3xl p-6 animate-in slide-in-from-bottom space-y-4">
                        <h3 className="font-black text-xl">Start Savings Group</h3>
                        <input className="w-full p-4 bg-gray-50 rounded-xl font-bold" placeholder="Group Name" value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value})} />
                        <input className="w-full p-4 bg-gray-50 rounded-xl font-bold" type="number" placeholder="Contribution per person" value={newGroup.amount} onChange={e => setNewGroup({...newGroup, amount: e.target.value})} />
                        <div className="p-4 bg-orange-50 text-[#FF4522] rounded-xl text-xs font-bold flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5" /> Funds are locked until payout date.
                        </div>
                        <button onClick={createGroup} className="w-full bg-[#FF4522] text-white py-4 rounded-xl font-bold">Create Group</button>
                        <button onClick={() => setShowNewGroup(false)} className="w-full text-gray-400 py-2 font-bold text-sm">Cancel</button>
                    </div>
                </div>
            )}

            {/* PIN CHECK MODAL */}
            {pinPrompt && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[70]">
                    <div className="bg-white p-6 rounded-3xl w-64 text-center animate-in zoom-in-95">
                        <h4 className="font-bold text-gray-900 mb-4">Enter Security PIN</h4>
                        <input 
                            type="password" 
                            className="w-full text-center text-3xl font-black tracking-[1em] border-b-2 border-gray-200 outline-none focus:border-[#FF4522] mb-6" 
                            maxLength={4}
                            autoFocus
                            value={enteredPin}
                            onChange={e => setEnteredPin(e.target.value)}
                        />
                        <button onClick={handlePinVerify} className="w-full bg-black text-white py-3 rounded-xl font-bold">Confirm</button>
                        <button onClick={() => setPinPrompt(null)} className="mt-2 text-xs font-bold text-gray-400">Cancel</button>
                    </div>
                </div>
            )}

        </div>
    );
};
