import React, { useState, useMemo } from 'react';
import { Search, MapPin, Plus, Minus, ShoppingCart, Upload, Loader2, X, Image as ImageIcon, Trash2, Share2, Facebook, Mail, Smartphone, Maximize2, Filter, Heart, MessageCircle, Phone, Map } from 'lucide-react';
import { Product, GeoLocation, CartItem } from '../types';

interface MarketplaceProps {
    products: Product[];
    onAddProduct: (p: Product) => void;
    onAddToCart: (p: Product) => void;
    onToggleWishlist: (id: string) => void;
}

const CATEGORIES = ["All", "Phones", "Laptops", "Fashion", "Gaming", "Home"];

export const Marketplace: React.FC<MarketplaceProps> = ({ products, onAddProduct, onAddToCart, onToggleWishlist }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Upload Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    quantity: 1,
    mobile: '',
    category: 'Phones',
    image: null as string | null
  });
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);

  const handleGetLocation = () => {
    setIsLoadingLoc(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: "Yaoundé, Mokolo (Detected)"
        });
        setIsLoadingLoc(false);
      }, () => setIsLoadingLoc(false));
    } else {
      setIsLoadingLoc(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewProduct(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
      if(!newProduct.name || !newProduct.price) return;
      onAddProduct({
          id: Date.now().toString(),
          name: newProduct.name,
          price: Number(newProduct.price),
          quantity: newProduct.quantity,
          sellerMobile: newProduct.mobile || '600000000',
          location: location || {lat:0, lng:0, address: 'Unknown'},
          image: newProduct.image || undefined,
          category: newProduct.category
      });
      setShowUpload(false);
      setNewProduct({name:'', price:'', quantity:1, mobile:'', category:'Phones', image:null});
  };

  const filteredProducts = useMemo(() => {
      let res = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
      if (activeCategory !== "All") res = res.filter(p => p.category === activeCategory);
      
      if (sortBy === 'price_low') res.sort((a,b) => a.price - b.price);
      else if (sortBy === 'price_high') res.sort((a,b) => b.price - a.price);
      else res.sort((a,b) => Number(b.id) - Number(a.id)); 
      
      return res;
  }, [products, searchTerm, activeCategory, sortBy]);

  const toggleWishlist = (id: string) => {
      const next = new Set(wishlist);
      if(next.has(id)) next.delete(id);
      else next.add(id);
      setWishlist(next);
      onToggleWishlist(id); 
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Header & Filters */}
      <div className="bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-sm">
        <div className="px-4 py-3">
            <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
                type="text" 
                placeholder="Search phones, laptops..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-100 rounded-2xl py-3 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF4522] transition-all"
            />
            </div>
            
            <div className="flex justify-between items-center mt-3">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {CATEGORIES.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <button onClick={() => setSortBy(prev => prev === 'newest' ? 'price_low' : 'newest')} className="ml-2 p-2 bg-gray-100 rounded-full text-gray-600">
                    <Filter className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-24">
        {filteredProducts.map(product => (
            <ProductCard 
                key={product.id} 
                product={product} 
                isWishlisted={wishlist.has(product.id)}
                onToggleWishlist={() => toggleWishlist(product.id)}
                onAddToCart={onAddToCart}
                onZoom={(img) => setZoomImage(img)}
            />
        ))}
      </div>

      {/* Floating Upload Button */}
      <button 
        onClick={() => setShowUpload(true)}
        className="absolute bottom-24 right-4 bg-[#FF4522] text-white p-4 rounded-full shadow-2xl shadow-orange-300 hover:scale-110 transition-transform z-40"
      >
          <Plus className="w-6 h-6" />
      </button>

      {/* Image Zoom Modal */}
      {zoomImage && (
          <div className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center p-2 animate-in fade-in" onClick={() => setZoomImage(null)}>
              <button className="absolute top-4 right-4 text-white p-2 bg-white/20 rounded-full backdrop-blur-md">
                  <X className="w-6 h-6" />
              </button>
              <img src={zoomImage} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
          </div>
      )}

      {/* Upload Modal Overlay */}
      {showUpload && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
           <div className="bg-white w-full sm:w-[90%] sm:rounded-2xl rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-20 duration-300 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
                 <h3 className="text-xl font-bold text-gray-900">Sell Item</h3>
                 <button onClick={() => setShowUpload(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              
              <div className="space-y-4">
                 <div className="w-full">
                    <label className="block w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 overflow-hidden relative transition-colors">
                        {newProduct.image ? (
                            <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                                <span className="text-gray-400 text-xs font-bold">Tap to add photo</span>
                            </>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                 </div>

                 <input 
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#FF4522]"
                    placeholder="Item Name"
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                 />
                 
                 <div className="grid grid-cols-2 gap-4">
                     <select 
                        value={newProduct.category}
                        onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                        className="p-4 bg-gray-50 rounded-2xl font-bold text-gray-700 outline-none"
                     >
                         {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                     <input 
                        type="number"
                        className="p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none"
                        placeholder="Price"
                        value={newProduct.price}
                        onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                    />
                 </div>

                 <button 
                    onClick={handlePublish}
                    className="w-full bg-[#FF4522] text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 mt-4"
                 >
                    <Upload className="w-5 h-5" /> Publish Now
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// --- SUB COMPONENTS ---

interface ProductCardProps { 
    product: Product; 
    isWishlisted: boolean; 
    onToggleWishlist: () => void;
    onAddToCart: (p: Product) => void;
    onZoom: (img: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isWishlisted, onToggleWishlist, onAddToCart, onZoom }) => {
    const [buyQty, setBuyQty] = useState(1);

    const handleAddToCart = () => {
        onAddToCart({ ...product, quantity: buyQty }); // Override qty with user selection
    };

    const contactSeller = (type: 'call' | 'msg', mobile: string) => {
        alert(`${type === 'call' ? 'Calling' : 'Messaging'} ${mobile}...`);
    };

    return (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
             {/* Header */}
             <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500">
                         {product.sellerMobile.slice(-2)}
                     </div>
                     <div>
                         <p className="text-[10px] font-bold text-gray-400 uppercase">Seller</p>
                         <p className="text-xs font-bold text-gray-800">{product.sellerMobile}</p>
                     </div>
                 </div>
                 <button onClick={onToggleWishlist} className={`p-2 rounded-full ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-300'}`}>
                     <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                 </button>
             </div>

             {/* Product Image Interface Improvement */}
             {product.image && (
                <div className="w-full h-56 mb-4 rounded-2xl overflow-hidden relative shadow-inner group-hover:shadow-md transition-shadow">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    {/* Gradient Overlay for better text visibility if needed */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-50"></div>
                    
                    <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-gray-800 uppercase shadow-sm">
                        {product.category}
                    </div>
                    
                    <button 
                        onClick={() => onZoom(product.image!)}
                        className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                </div>
             )}

             <div className="mb-4">
                <h3 className="font-black text-gray-900 text-lg leading-tight mb-1">{product.name}</h3>
                <div className="flex justify-between items-center">
                    <div className="text-[#FF4522] font-black text-xl">{product.price.toLocaleString()} <span className="text-xs text-gray-400 font-bold">FCFA</span></div>
                    <div className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">Stock: {product.quantity}</div>
                </div>
             </div>

             {/* Action Buttons & Quantity Selector */}
             <div className="space-y-3">
                 <div className="flex items-center gap-2">
                     {/* Quantity Selector */}
                     <div className="flex items-center bg-gray-100 rounded-xl p-1">
                         <button 
                            onClick={() => setBuyQty(Math.max(1, buyQty - 1))}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-[#FF4522] active:scale-95 transition"
                         >
                             <Minus className="w-3 h-3" />
                         </button>
                         <span className="w-8 text-center font-bold text-sm text-gray-900">{buyQty}</span>
                         <button 
                             onClick={() => setBuyQty(Math.min(product.quantity, buyQty + 1))}
                             className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-[#FF4522] active:scale-95 transition"
                         >
                             <Plus className="w-3 h-3" />
                         </button>
                     </div>

                    <button 
                        onClick={handleAddToCart}
                        className="flex-1 bg-black text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition hover:bg-gray-900"
                    >
                    <ShoppingCart className="w-4 h-4" /> Add
                    </button>
                 </div>

                 <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => contactSeller('call', product.sellerMobile)} className="col-span-1 bg-green-50 text-green-600 py-2 rounded-xl flex items-center justify-center hover:bg-green-100 font-bold text-xs gap-1"><Phone className="w-3 h-3" /> Call</button>
                    <button onClick={() => contactSeller('msg', product.sellerMobile)} className="col-span-1 bg-blue-50 text-blue-600 py-2 rounded-xl flex items-center justify-center hover:bg-blue-100 font-bold text-xs gap-1"><MessageCircle className="w-3 h-3" /> Chat</button>
                 </div>
             </div>
             
             {/* Map Localization Preview */}
             <div className="mt-4 pt-3 border-t border-gray-50">
                 <div className="flex items-center gap-1 text-xs text-gray-500 font-bold mb-2">
                     <MapPin className="w-3 h-3 text-[#FF4522]" /> {product.location.address}
                 </div>
                 <div className="w-full h-16 bg-gray-100 rounded-xl overflow-hidden relative group/map">
                     {/* Placeholder Map Image */}
                     <img 
                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400&auto=format&fit=crop" 
                        alt="Map Location" 
                        className="w-full h-full object-cover opacity-60 grayscale group-hover/map:grayscale-0 transition-all"
                     />
                     <div className="absolute inset-0 flex items-center justify-center">
                         <div className="bg-white p-1.5 rounded-full shadow-md">
                            <div className="w-2 h-2 bg-[#FF4522] rounded-full animate-ping absolute"></div>
                            <div className="w-2 h-2 bg-[#FF4522] rounded-full relative"></div>
                         </div>
                     </div>
                 </div>
             </div>
        </div>
    );
};