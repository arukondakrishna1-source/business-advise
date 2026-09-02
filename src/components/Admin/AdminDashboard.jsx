import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { apiFetch } from '../../utils/api';
import { Shield, Plus, Edit, Trash2, CheckCircle2, User, Landmark, Wrench, RefreshCw, X } from 'lucide-react';

export const AdminDashboard = () => {
  const { token, setShowAdmin, t } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('schemes'); // 'schemes' | 'products' | 'users'
  const [schemes, setSchemes] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Scheme Form State
  const [showAddSchemeModal, setShowAddSchemeModal] = useState(false);
  const [newScheme, setNewScheme] = useState({
    code: '',
    name_en: '',
    name_te: '',
    name_hi: '',
    department: '',
    min_cost: 0,
    max_cost: 140000,
    max_loan_pct: 90,
    max_loan_amount: 125000,
    interest_rate: 6.5,
    tenure_years: 3,
    moratorium_months: 3,
    margin_pct: 10,
    eligibility: '',
    benefits: '',
    documents: ['Aadhaar Card', 'Project Report'],
    official_link: 'https://msme.gov.in',
    rules: ''
  });

  // New Product Form State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    category_code: 'dairy',
    name: '',
    brand: '',
    model: '',
    price: 10000,
    specs: '',
    capacity: '',
    warranty: '1 Year Warranty',
    supplier_name: '',
    supplier_status: 'Verified Company',
    official_link: 'https://'
  });

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dataS, dataP, dataU] = await Promise.all([
        apiFetch('/api/schemes'),
        apiFetch('/api/products'),
        apiFetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (dataS.schemes) setSchemes(dataS.schemes);
      if (dataP.products) setProducts(dataP.products);
      if (dataU.users) setUsers(dataU.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateScheme = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/schemes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newScheme)
      });
      if (res.ok) {
        setShowAddSchemeModal(false);
        fetchData();
      }
    } catch (err) {
      alert("Error adding scheme");
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        setShowAddProductModal(false);
        fetchData();
      }
    } catch (err) {
      alert("Error adding product");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Admin Header Bar */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-amber-500/40">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black">{t.adminPanel}</h2>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                SYSTEM MANAGER
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Update government scheme interest rates, limits, products & supplier verifications.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAdmin(false)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-colors"
        >
          Exit Admin View
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('schemes')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'schemes' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Government Schemes ({schemes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Products & Machinery ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Registered Users ({users.length})</span>
        </button>
      </div>

      {/* Tab 1: Schemes Admin */}
      {activeTab === 'schemes' && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-slate-900 text-base">Manage Government Schemes Data</h3>
            <button
              onClick={() => setShowAddSchemeModal(true)}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Scheme</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                  <th className="p-3">Scheme Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Max Loan</th>
                  <th className="p-3">Interest Rate</th>
                  <th className="p-3">Moratorium</th>
                  <th className="p-3">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {schemes.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{s.name_en}</td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{s.department}</td>
                    <td className="p-3 font-bold text-emerald-700">₹{(s.max_loan_amount/100000).toFixed(2)}L</td>
                    <td className="p-3 font-bold text-blue-700">{s.interest_rate}% p.a.</td>
                    <td className="p-3">{s.moratorium_months} Months</td>
                    <td className="p-3 text-slate-500 text-[11px]">{s.last_updated || '2026-08-15'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Products Admin */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-slate-900 text-base">Manage Machinery & Verified Suppliers</h3>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product / Machinery</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Brand & Model</th>
                  <th className="p-3">Price (₹)</th>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{p.name}</td>
                    <td className="p-3 text-slate-600">{p.brand} ({p.model})</td>
                    <td className="p-3 font-bold text-emerald-700">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-slate-800">{p.supplier_name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                        p.supplier_status === 'Verified Company' ? 'bg-emerald-100 text-emerald-800' :
                        p.supplier_status === 'Verified Supplier' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {p.supplier_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Users Admin */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-4">
          <h3 className="font-black text-slate-900 text-base">Registered System Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Mobile Number</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3 text-slate-600">{u.email}</td>
                    <td className="p-3 text-slate-600">{u.mobile}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                        u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add Scheme */}
      {showAddSchemeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-sm">Add New Government Scheme</h3>
              <button onClick={() => setShowAddSchemeModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateScheme} className="space-y-3 text-xs">
              <input type="text" placeholder="Scheme Code (e.g. SCHEME_NEW)" required value={newScheme.code} onChange={e => setNewScheme({...newScheme, code: e.target.value})} className="w-full p-2.5 border rounded-xl" />
              <input type="text" placeholder="Scheme Name (EN)" required value={newScheme.name_en} onChange={e => setNewScheme({...newScheme, name_en: e.target.value})} className="w-full p-2.5 border rounded-xl" />
              <input type="text" placeholder="Department" required value={newScheme.department} onChange={e => setNewScheme({...newScheme, department: e.target.value})} className="w-full p-2.5 border rounded-xl" />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Max Loan (₹)" required value={newScheme.max_loan_amount} onChange={e => setNewScheme({...newScheme, max_loan_amount: Number(e.target.value)})} className="p-2.5 border rounded-xl" />
                <input type="number" step="0.1" placeholder="Interest Rate %" required value={newScheme.interest_rate} onChange={e => setNewScheme({...newScheme, interest_rate: Number(e.target.value)})} className="p-2.5 border rounded-xl" />
              </div>
              <textarea placeholder="Scheme Rules & Description" required value={newScheme.rules} onChange={e => setNewScheme({...newScheme, rules: e.target.value})} className="w-full p-2.5 border rounded-xl" />
              <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl">Save Scheme</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Product */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-sm">Add Product / Machinery</h3>
              <button onClick={() => setShowAddProductModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <input type="text" placeholder="Product Name" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-2.5 border rounded-xl" />
              <input type="text" placeholder="Brand Name" required value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} className="w-full p-2.5 border rounded-xl" />
              <input type="text" placeholder="Model Number" required value={newProduct.model} onChange={e => setNewProduct({...newProduct, model: e.target.value})} className="w-full p-2.5 border rounded-xl" />
              <input type="number" placeholder="Price (₹)" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} className="w-full p-2.5 border rounded-xl" />
              <input type="text" placeholder="Supplier Company Name" required value={newProduct.supplier_name} onChange={e => setNewProduct({...newProduct, supplier_name: e.target.value})} className="w-full p-2.5 border rounded-xl" />
              <select value={newProduct.supplier_status} onChange={e => setNewProduct({...newProduct, supplier_status: e.target.value})} className="w-full p-2.5 border rounded-xl">
                <option value="Verified Company">Verified Company</option>
                <option value="Verified Supplier">Verified Supplier</option>
                <option value="Verification Pending">Verification Pending</option>
              </select>
              <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl">Save Product</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
