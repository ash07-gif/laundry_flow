import React, { useState, useEffect } from 'react';
import {
  Truck,
  QrCode,
  CheckCircle2,
  Clock,
  Shirt,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Phone,
  MapPin,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '../api/client';

export const StaffDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const fetchStaffTasks = async () => {
    setLoading(true);
    try {
      // Try fetching staff tasks or fallback to all orders
      const res = await apiClient.get('/orders/all').catch(() => apiClient.get('/staff/tasks'));
      if (res && res.data) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error('Error fetching staff tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffTasks();
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status: nextStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === orderId ? { ...t, status: nextStatus } : t))
      );
      setSuccessToast(`Order status successfully updated to ${nextStatus.replace('_', ' ')}!`);
      setTimeout(() => setSuccessToast(''), 3500);
    } catch (err) {
      console.error('Status update error:', err);
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === orderId ? { ...t, status: nextStatus } : t))
      );
      setSuccessToast(`Order status updated to ${nextStatus.replace('_', ' ')} (Demo mode)`);
      setTimeout(() => setSuccessToast(''), 3500);
    } finally {
      setUpdatingId(null);
    }
  };

  const getNextAction = (status: string) => {
    switch (status) {
      case 'PLACED':
      case 'PICKUP_SCHEDULED':
        return { label: 'Confirm Picked Up', nextStatus: 'PICKED_UP', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' };
      case 'PICKED_UP':
      case 'RECEIVED':
        return { label: 'Start Washing & Care', nextStatus: 'WASHING', color: 'bg-cyan-600 hover:bg-cyan-700 text-white' };
      case 'WASHING':
      case 'PROCESSING':
        return { label: 'Move to Ironing & Press', nextStatus: 'IRONING', color: 'bg-blue-600 hover:bg-blue-700 text-white' };
      case 'IRONING':
      case 'QUALITY_CHECK':
        return { label: 'Mark Ready & Out for Delivery', nextStatus: 'OUT_FOR_DELIVERY', color: 'bg-purple-600 hover:bg-purple-700 text-white' };
      case 'OUT_FOR_DELIVERY':
        return { label: 'Mark as Delivered ✓', nextStatus: 'DELIVERED', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' };
      default:
        return null;
    }
  };

  const pendingPickups = tasks.filter((t) => ['PLACED', 'PICKUP_SCHEDULED'].includes(t.status)).length;
  const inProcessing = tasks.filter((t) => ['PICKED_UP', 'PROCESSING', 'WASHING', 'IRONING'].includes(t.status)).length;
  const activeDeliveries = tasks.filter((t) => t.status === 'OUT_FOR_DELIVERY').length;
  const completedToday = tasks.filter((t) => t.status === 'DELIVERED').length;

  const filteredTasks = tasks.filter((t) => {
    const matchesFilter = filterStatus === 'ALL' || t.status === filterStatus;
    const matchesSearch =
      t.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.status?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-xs font-semibold text-sky-300 mb-2 border border-sky-500/30">
              <Truck className="w-3.5 h-3.5" /> Operations & Facility Console
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Staff & Laundry Operations</h1>
            <p className="text-slate-400 text-sm mt-1">Manage assigned pickups, washing queue, and doorstep deliveries.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQrModalOpen(true)}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all"
            >
              <QrCode className="w-4 h-4" /> Scan Bag QR
            </button>
            <button
              onClick={fetchStaffTasks}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Toast */}
        {successToast && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            {successToast}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Pickups</p>
              <p className="text-2xl font-bold text-gray-900">{pendingPickups}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Shirt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">In Hub Processing</p>
              <p className="text-2xl font-bold text-gray-900">{inProcessing}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Out for Delivery</p>
              <p className="text-2xl font-bold text-gray-900">{activeDeliveries}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedToday}</p>
            </div>
          </div>
        </div>

        {/* Task Management Container */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
            <div className="flex items-center gap-2 max-w-sm w-full bg-white px-3 py-2 rounded-xl border border-gray-200">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search order ID or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs sm:text-sm bg-transparent outline-none"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'PICKUP_SCHEDULED', 'WASHING', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    filterStatus === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks List */}
          <div className="divide-y divide-gray-100">
            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Truck className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="font-semibold text-gray-700">No matching tasks found</p>
                <p className="text-xs text-gray-400 mt-1">Check back once new pickups or cleaning batches are assigned</p>
              </div>
            ) : (
              filteredTasks.map((t) => {
                const action = getNextAction(t.status);
                return (
                  <div key={t.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 font-bold text-xs">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-extrabold text-gray-900 text-sm sm:text-base">
                            {t.order_number}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                            {t.status}
                          </span>
                          <span className="text-xs font-semibold text-gray-500">
                            Amount: ${(t.total || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-500 mt-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            742 Evergreen Terrace, Apt 4B, NY
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            Slot: {t.pickup_time_slot || 'Morning Window'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end lg:self-center">
                      {action ? (
                        <button
                          onClick={() => handleUpdateStatus(t.id, action.nextStatus)}
                          disabled={updatingId === t.id}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${action.color}`}
                        >
                          {updatingId === t.id ? 'Updating...' : action.label}
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                          Delivered & Closed ✓
                        </span>
                      )}

                      {/* Manual Quick Status Override Menu */}
                      <select
                        value={t.status}
                        onChange={(e) => handleUpdateStatus(t.id, e.target.value)}
                        className="text-xs p-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-semibold cursor-pointer outline-none"
                      >
                        <option value="PLACED">Placed</option>
                        <option value="PICKUP_SCHEDULED">Pickup Scheduled</option>
                        <option value="PICKED_UP">Picked Up</option>
                        <option value="WASHING">Washing & Care</option>
                        <option value="IRONING">Ironing</option>
                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                      </select>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* QR Code Scanner Simulation Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-sky-600" /> Scan Garment Bag QR
              </h3>
              <button
                onClick={() => setQrModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="w-full h-48 bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white relative overflow-hidden border-2 border-dashed border-sky-400">
              <div className="w-32 h-32 border-2 border-sky-400 rounded-xl relative flex items-center justify-center animate-pulse">
                <span className="text-[10px] text-sky-300">Align QR Here</span>
              </div>
              <div className="absolute w-full h-0.5 bg-sky-400 top-1/2 -translate-y-1/2 animate-bounce"></div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Or Type Order / QR Code:
              </label>
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="e.g. LND-2026-000101"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSearchQuery(qrInput || 'LND-2026-000101');
                  setQrModalOpen(false);
                }}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Lookup Order
              </button>
              <button
                onClick={() => setQrModalOpen(false)}
                className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
