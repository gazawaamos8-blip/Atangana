
import React, { useState, useEffect, useRef } from 'react';
import { Scan, X, Flashlight, Image, Loader2, CheckCircle, CreditCard, Building2, Keyboard, QrCode, Store, Banknote, Copy, Check, Lock, AlertTriangle } from 'lucide-react';
// @ts-ignore
import jsQR from 'jsqr';
// @ts-ignore
import QRCode from 'qrcode';
import { User } from '../types';

interface Props {
    onScanSuccess: (data: string, type: 'merchant' | 'generic') => void;
    user: User;
    startManualInput?: boolean;
    checkoutMode?: boolean;
    onCancelCheckout?: () => void;
}

type MerchantNetwork = 'OM' | 'MOMO' | 'GENERIC';

export const QRCodeScanner: React.FC<Props> = ({ onScanSuccess, user, startManualInput, checkoutMode, onCancelCheckout }) => {
  const [scanning, setScanning] = useState(true);
  const [flash, setFlash] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  // Manual Input State
  const [showManualInput, setShowManualInput] = useState(startManualInput || false);
  const [merchantId, setMerchantId] = useState("");
  const [manualNetwork, setManualNetwork] = useState<MerchantNetwork>('GENERIC');
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // My Code Generator State
  const [showMyQr, setShowMyQr] = useState(false);
  const [myQrUrl, setMyQrUrl] = useState<string>("");
  const [genType, setGenType] = useState<'personal' | 'merchant'>('personal');
  const [merchantNetwork, setMerchantNetwork] = useState<MerchantNetwork>('OM');
  const [merchantCodeInput, setMerchantCodeInput] = useState(""); // Default empty for merchant to force entry
  const [copied, setCopied] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Trigger Manual Input if prop changes
  useEffect(() => {
      if (startManualInput) {
          setShowManualInput(true);
          setScanning(false);
      }
  }, [startManualInput]);

  // Generate QR Effect
  useEffect(() => {
      let data = "";
      
      if (genType === 'personal') {
          // Use Simple format for P2P so it's easily recognized as a phone number
          data = user.mobile || "";
      } else {
          // Format: MERCHANT:NETWORK:ID (Only if 6 digits present)
          if(merchantCodeInput.length > 0) {
              data = `MERCHANT:${merchantNetwork}:${merchantCodeInput}`;
          }
      }

      if (data) {
          QRCode.toDataURL(data, { margin: 2, width: 256, color: { dark: '#000000', light: '#ffffff' } })
            .then((url: string) => setMyQrUrl(url))
            .catch((err: any) => console.error("QR Gen Error", err));
      } else {
          setMyQrUrl("");
      }
  }, [user.mobile, genType, merchantNetwork, merchantCodeInput]);

  // Start Camera & Scanning
  useEffect(() => {
    let animationId: number;

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // iOS requires playsinline
                videoRef.current.setAttribute("playsinline", "true"); 
                videoRef.current.play();
                requestAnimationFrame(tick);
            }
        } catch (err) {
            console.error("Camera access denied or not available", err);
            // Fallback for demo or desktop without webcam
        }
    };

    const tick = () => {
        if (!videoRef.current || !canvasRef.current || !scanning || showManualInput || showMyQr || result) return;

        if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const ctx = canvas.getContext("2d");
            
            if (ctx) {
                canvas.height = video.videoHeight;
                canvas.width = video.videoWidth;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });

                if (code) {
                   setResult(code.data);
                   setScanning(false);
                }
            }
        }
        animationId = requestAnimationFrame(tick);
    };

    if (scanning && !showManualInput && !showMyQr) {
        startCamera();
    } else {
        // Stop camera if not scanning
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }

    return () => {
        if (animationId) cancelAnimationFrame(animationId);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };
  }, [scanning, showManualInput, showMyQr, result]);

  // Handle Torch
  useEffect(() => {
      if (streamRef.current) {
          const track = streamRef.current.getVideoTracks()[0];
          // Check capability (experimental)
          const capabilities = track.getCapabilities ? track.getCapabilities() : {};
          // @ts-ignore
          if (capabilities.torch || 'torch' in capabilities) {
               track.applyConstraints({
                  advanced: [{ torch: flash } as any] 
               }).catch(e => console.log("Torch not supported", e));
          }
      }
  }, [flash]);


  const handleResultAction = () => {
      if(result) {
          const type = result.startsWith("MERCHANT") ? 'merchant' : 'generic';
          onScanSuccess(result, type);
          setResult(null);
          setScanning(true);
      }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMsg("");
      
      // Simulate Validation
      setVerifying(true);
      setTimeout(() => {
        setVerifying(false);
        // STRICT VALIDATION MOCK: 
        // Fail if code starts with '00' or '99' or length < 5
        if(merchantId.length < 5 || merchantId.startsWith('00') || merchantId.startsWith('99')) {
             setErrorMsg("Échec, veuillez réessayer plus tard");
             return;
        }

        if(merchantId.length > 3) {
            // Construct merchant format if network specific
            let data = merchantId;
            if (manualNetwork !== 'GENERIC') {
                data = `MERCHANT:${manualNetwork}:${merchantId}`;
            } else {
                // Backward compatibility or generic
                data = `MERCHANT:${merchantId}`; 
            }
            
            onScanSuccess(data, 'merchant');
            setMerchantId("");
            setShowManualInput(false);
            setScanning(true);
        }
      }, 1500);
  };

  const handleCopy = (text: string) => {
      if(!text) return;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleMerchantInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Allow only numbers, max 6 digits
      const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
      setMerchantCodeInput(val);
  };

  return (
    <div className="h-full w-full bg-black relative flex flex-col items-center justify-center text-white overflow-hidden">
      
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Video Feed */}
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
      
      {/* Checkout Mode Indicator */}
      {checkoutMode && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-orange-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
              <Lock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wide">Payment Mode</span>
          </div>
      )}

      {/* Scanning Overlay */}
      {scanning && !showManualInput && !showMyQr && !result && (
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center z-10">
            {/* Scan Frame */}
             <div className="relative w-72 h-72">
                 <div className="absolute inset-0 border-2 border-white/30 rounded-[2rem]"></div>
                 {/* Corners */}
                 <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-[#FF4522] rounded-tl-2xl"></div>
                 <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-[#FF4522] rounded-tr-2xl"></div>
                 <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-[#FF4522] rounded-bl-2xl"></div>
                 <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-[#FF4522] rounded-br-2xl"></div>
                 {/* Laser */}
                 <div className="absolute inset-x-0 h-0.5 bg-red-500/80 shadow-[0_0_10px_rgba(255,0,0,0.8)] animate-[scan_2s_infinite_linear] top-1/2"></div>
             </div>
             <p className="mt-8 text-white/90 font-bold text-sm bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
                 Align QR code within frame
             </p>
        </div>
      )}

      {/* Manual Input Overlay */}
      {showManualInput && (
          <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
              <div className="bg-white w-full max-w-sm rounded-3xl p-6 text-gray-900 shadow-2xl relative">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-xl flex items-center gap-2"><CreditCard className="w-5 h-5 text-[#FF4522]" /> Pay Merchant</h3>
                      <button onClick={() => { setShowManualInput(false); setScanning(true); setErrorMsg(""); }} className="bg-gray-100 p-2 rounded-full"><X className="w-5 h-5" /></button>
                  </div>
                  
                  {/* Network Selector */}
                  <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
                      {(['GENERIC', 'OM', 'MOMO'] as MerchantNetwork[]).map(net => (
                          <button 
                            key={net}
                            type="button"
                            onClick={() => setManualNetwork(net)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${manualNetwork === net ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
                          >
                              {net === 'GENERIC' ? 'Any' : net}
                          </button>
                      ))}
                  </div>

                  <form onSubmit={handleManualSubmit} className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-gray-400 uppercase">
                              {manualNetwork === 'OM' ? 'Orange Money Code' : manualNetwork === 'MOMO' ? 'MoMo Pay Code' : 'Merchant ID'}
                          </label>
                          <div className={`flex items-center gap-3 p-4 rounded-xl mt-1 border-2 transition-colors ${manualNetwork === 'OM' ? 'bg-orange-50 border-orange-200' : manualNetwork === 'MOMO' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-100 border-transparent'}`}>
                              <Building2 className={`w-5 h-5 ${manualNetwork === 'OM' ? 'text-orange-500' : manualNetwork === 'MOMO' ? 'text-yellow-600' : 'text-gray-400'}`} />
                              <input 
                                value={merchantId}
                                onChange={e => { setMerchantId(e.target.value); setErrorMsg(""); }}
                                placeholder="Enter Code"
                                className="bg-transparent font-bold text-lg outline-none w-full"
                                autoFocus
                              />
                          </div>
                          {errorMsg && (
                              <div className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1 animate-in slide-in-from-top-1 bg-red-50 p-2 rounded-lg border border-red-100">
                                  <AlertTriangle className="w-4 h-4" /> {errorMsg}
                              </div>
                          )}
                      </div>
                      <button type="submit" disabled={verifying} className="w-full bg-[#FF4522] text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2">
                          {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Pay'}
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* Result Overlay */}
      {result && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in zoom-in-95">
              <div className="bg-white text-gray-900 rounded-3xl p-6 w-full max-w-sm text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="font-bold text-xl mb-1">Code Detected</h3>
                  <p className="text-gray-500 text-sm mb-6 truncate font-mono bg-gray-100 p-2 rounded-lg">{result}</p>
                  <button 
                    onClick={handleResultAction}
                    className="w-full bg-black text-white py-3 rounded-xl font-bold shadow-lg"
                  >
                      Proceed to Payment
                  </button>
                  <button 
                    onClick={() => {setResult(null); setScanning(true);}}
                    className="mt-4 text-gray-400 text-xs font-bold uppercase hover:text-gray-600"
                  >
                      Scan Again
                  </button>
              </div>
          </div>
      )}

      {/* My QR Code Overlay & Generator */}
      {showMyQr && (
           <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in zoom-in-95">
                <div className="bg-white w-full max-w-xs rounded-[2rem] p-6 flex flex-col items-center relative shadow-2xl">
                     <button onClick={() => { setShowMyQr(false); setScanning(true); }} className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full hover:bg-gray-200 z-10">
                         <X className="w-5 h-5 text-gray-600" />
                     </button>
                     
                     {/* Generator Toggle */}
                     <div className="flex bg-gray-100 p-1 rounded-xl w-full mb-6 mt-2">
                        <button onClick={() => setGenType('personal')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all ${genType==='personal' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>
                            <QrCode className="w-3 h-3"/> Profile
                        </button>
                        <button onClick={() => setGenType('merchant')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all ${genType==='merchant' ? 'bg-[#FF4522] shadow-sm text-white' : 'text-gray-400'}`}>
                            <Store className="w-3 h-3"/> Merchant
                        </button>
                     </div>

                     {genType === 'merchant' && (
                         <div className="w-full mb-4 space-y-2 animate-in fade-in">
                             {/* VISIBLE MERCHANT SWITCHER */}
                             <div className="flex gap-2 mb-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
                                 {(['OM', 'MOMO', 'GENERIC'] as MerchantNetwork[]).map(net => (
                                     <button 
                                        key={net}
                                        onClick={() => {
                                            setMerchantNetwork(net);
                                            // Auto-generate random code if ANY is selected
                                            if (net === 'GENERIC') {
                                                const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
                                                setMerchantCodeInput(randomCode);
                                            } else {
                                                // Clear input for specific networks to encourage accuracy
                                                setMerchantCodeInput("");
                                            }
                                        }}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-black border-b-2 transition-all ${merchantNetwork === net ? (net==='OM'?'bg-orange-500 text-white border-orange-700': net==='MOMO'?'bg-yellow-400 text-black border-yellow-600' : 'bg-gray-800 text-white border-black') : 'bg-white text-gray-400 border-transparent hover:bg-gray-100'}`}
                                     >
                                         {net === 'GENERIC' ? 'ANY' : net}
                                     </button>
                                 ))}
                             </div>
                             
                             <div className="relative">
                                <input 
                                    value={merchantCodeInput} 
                                    onChange={handleMerchantInput}
                                    className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl px-3 py-3 text-center font-black text-2xl tracking-widest outline-none focus:border-[#FF4522] focus:bg-white transition-all placeholder:text-gray-200 text-gray-800"
                                    placeholder="000000"
                                    maxLength={6}
                                    type="tel"
                                    inputMode="numeric"
                                />
                                <div className="text-[9px] text-center text-gray-400 font-bold mt-1 uppercase">Enter 6-Digit Merchant ID</div>
                             </div>
                         </div>
                     )}

                     {/* QR CARD DISPLAY */}
                     <div className="flex flex-col items-center bg-gray-50 p-4 rounded-3xl w-full border border-gray-100">
                        {/* Text Above QR */}
                        <div className={`text-xs font-black uppercase tracking-widest mb-2 px-3 py-1 rounded-full ${
                            genType === 'personal' ? 'bg-gray-200 text-gray-500' : 
                            merchantNetwork === 'OM' ? 'bg-orange-100 text-orange-600' : 
                            merchantNetwork === 'MOMO' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-800 text-white'
                        }`}>
                            {genType === 'personal' ? 'Personal Profile' : 
                             merchantNetwork === 'GENERIC' ? 'Merchant Code' : 
                             `${merchantNetwork} Merchant`}
                        </div>

                        <div className="p-2 border-4 border-white bg-white rounded-2xl shadow-sm mb-3">
                           {myQrUrl ? <img src={myQrUrl} className="w-40 h-40 mix-blend-multiply" /> : <div className="w-40 h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs font-bold p-4 text-center">{genType==='merchant' && merchantCodeInput.length < 6 ? 'Enter 6 digits' : <Loader2 className="animate-spin"/>}</div>}
                        </div>
                        
                        {/* Number Below QR with Copy Button */}
                        <div className="flex items-center gap-2 mt-1 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-gray-100">
                            <p className="font-black text-xl text-gray-900 tracking-wider">
                                {genType === 'personal' ? user.mobile : (merchantCodeInput || '------')}
                            </p>
                            <button 
                                onClick={() => handleCopy(genType === 'personal' ? (user.mobile || '') : merchantCodeInput)}
                                className={`p-1.5 rounded-full transition-colors ${copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-900'}`}
                            >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                        </div>
                     </div>
                </div>
           </div>
      )}

      {/* UI Controls - Top */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-30">
          <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10 flex items-center gap-2">
                {checkoutMode && <Lock className="w-3 h-3 text-orange-400" />}
                LIVE SCAN
          </div>
          <button 
                onClick={() => setFlash(!flash)}
                className={`p-3 rounded-full backdrop-blur-md transition-colors shadow-lg ${flash ? 'bg-yellow-400 text-black' : 'bg-black/30 text-white border border-white/20'}`}
            >
                <Flashlight className={`w-6 h-6 ${flash ? 'fill-current' : ''}`} />
          </button>
      </div>

      {/* UI Controls - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-8 z-30 flex justify-center gap-8 items-end pb-12 bg-gradient-to-t from-black/80 to-transparent">
            {checkoutMode && onCancelCheckout ? (
                <button 
                    onClick={onCancelCheckout}
                    className="flex flex-col items-center gap-2 text-red-400 hover:text-red-300 transition group"
                >
                    <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center border border-red-500/50 backdrop-blur-md">
                        <X className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold">Cancel Pay</span>
                </button>
            ) : (
                <button 
                    onClick={() => { setShowManualInput(true); setScanning(false); }}
                    className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition group"
                >
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20 group-hover:bg-white/20 backdrop-blur-md">
                        <Keyboard className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold">Enter ID</span>
                </button>
            )}

             <button 
                onClick={() => { setShowMyQr(true); setScanning(false); }}
                className="flex flex-col items-center gap-2 group relative -top-4"
            >
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl shadow-white/20 group-active:scale-95 transition-transform">
                    <QrCode className="w-10 h-10 text-black" />
                </div>
                <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md">My Code</span>
            </button>
            
            <button className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition group">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20 group-hover:bg-white/20 backdrop-blur-md">
                    <Image className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">Gallery</span>
            </button>
      </div>
    </div>
  );
};
