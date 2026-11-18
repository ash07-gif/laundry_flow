import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Calendar,
  Layers,
  Flame,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { apiClient } from '../api/client';

interface CustomerDashboardProps {
  currentUser: any;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ currentUser }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersRes, servicesRes] = await Promise.allSettled([
        apiClient.get('/orders/'),
        apiClient.get('/services/')
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value.data) {
        setOrders(ordersRes.value.data);
        if (ordersRes.value.data.length > 0) {
          setSelectedOrder(ordersRes.value.data[0]);
        }
      }
      if (servicesRes.status === 'fulfilled' && servicesRes.value.data) {
        setServices(servicesRes.value.data);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  const activeOrders = orders.filter(
    (o) => !['DELIVERED', 'CANCELLED'].includes(o.status)
  );
  const completedOrders = orders.filter((o) => o.status === 'DELIVERED');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLACED':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-full">Order Placed</span>;
      case 'PICKUP_SCHEDULED':
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded-full">Pickup Scheduled</span>;
      case 'PICKED_UP':
        return <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-full">Picked Up</span>;
      case 'PROCESSING':
      case 'WASHING':
      case 'DRYING':
      case 'IRONING':
        return <span className="px-2.5 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200 text-xs font-semibold rounded-full">Cleaning & In Process</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold rounded-full">Out for Delivery 🚚</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full">Delivered ✓</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">{status}</span>;
    }
  };

  const statusProgressSteps = [
    { key: 'PLACED', label: 'Placed' },
    { key: 'PICKED_UP', label: 'Picked Up' },
    { key: 'PROCESSING', label: 'Washing & Care' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' }
  ];

  const getStepProgressIndex = (status: string) => {
    if (['PLACED', 'CONFIRMED', 'PICKUP_SCHEDULED'].includes(status)) return 0;
    if (['PICKED_UP', 'RECEIVED'].includes(status)) return 1;
    if (['PROCESSING', 'WASHING', 'DRYING', 'IRONING', 'QUALITY_CHECK', 'READY_FOR_DELIVERY'].includes(status)) return 2;
    if (status === 'OUT_FOR_DELIVERY') return 3;
    if (status === 'DELIVERED') return 4;
    return 0;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 text-white pt-10 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-sky-100 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Premium Eco-Friendly Laundry Care
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {currentUser?.name || 'Guest'}!
            </h1>
            <p className="text-sky-100 mt-1 max-w-xl text-sm sm:text-base">
              Schedule pickups, track fresh laundry in real-time, and manage your wardrobe care seamlessly.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm transition-all border border-white/20"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/order/new"
              className="bg-white hover:bg-sky-50 text-sky-800 font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4 text-sky-600" /> Book New Laundry
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Orders</p>
              <p className="text-2xl font-bold text-gray-900">{activeOrders.length}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedOrders.length}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Next Delivery</p>
              <p className="text-sm font-bold text-gray-900">
                {activeOrders.length > 0 ? 'Today • Afternoon' : 'No pending'}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rewards Points</p>
              <p className="text-2xl font-bold text-gray-900">280 pts</p>
            </div>
          </div>
        </div>

        {/* Live Order Tracker (if active orders exist) */}
        {selectedOrder && (
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-900">
                    Live Order Tracker • {selectedOrder.order_number}
                  </h2>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Placed on {new Date(selectedOrder.created_at || Date.now()).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">Order Amount</span>
                <p className="text-xl font-extrabold text-gray-900">${(selectedOrder.total || 0).toFixed(2)}</p>
              </div>
            </div>

            {/* Stepper timeline */}
            <div className="py-8">
              <div className="relative">
                {/* Connecting bar */}
                <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-0"></div>
                <div
                  className="absolute top-5 left-0 h-1 bg-sky-500 transition-all duration-500 -z-0"
                  style={{
                    width: `${(getStepProgressIndex(selectedOrder.status) / (statusProgressSteps.length - 1)) * 100}%`
                  }}
                ></div>

                <div className="flex justify-between relative z-10">
                  {statusProgressSteps.map((step, idx) => {
                    const currentIndex = getStepProgressIndex(selectedOrder.status);
                    const isDone = idx < currentIndex;
                    const isCurrent = idx === currentIndex;
                    return (
                      <div key={step.key} className="flex flex-col items-center text-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            isDone
                              ? 'bg-sky-500 text-white ring-4 ring-sky-50'
                              : isCurrent
                              ? 'bg-white border-2 border-sky-600 text-sky-600 ring-4 ring-sky-100 animate-pulse'
                              : 'bg-white border-2 border-gray-200 text-gray-400'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>
                        <span
                          className={`text-xs font-semibold mt-2.5 max-w-[80px] sm:max-w-none ${
                            isCurrent
                              ? 'text-sky-700'
                              : isDone
                              ? 'text-gray-900'
                              : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-sky-50/60 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-sky-900 font-medium">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span>Pickup Slot: <strong>{selectedOrder.pickup_time_slot || '09:00 AM - 11:00 AM'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sky-900 font-medium">
                <Truck className="w-4 h-4 text-sky-600" />
                <span>Delivery Slot: <strong>{selectedOrder.delivery_time_slot || '02:00 PM - 04:00 PM'}</strong></span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders List */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xs border border-gray-200/80 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-900">Your Order History</h3>
                <p className="text-xs text-gray-500">Track and view previous laundry requests</p>
              </div>
              <Link
                to="/order/new"
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
              >
                + New Order
              </Link>
            </div>

            <div className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="font-semibold text-gray-700">No orders found yet</p>
                  <p className="text-xs text-gray-400 mt-1">Create your first laundry pickup request in under 60 seconds</p>
                  <Link
                    to="/order/new"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700 transition-colors"
                  >
                    Place First Order <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors ${
                      selectedOrder?.id === ord.id ? 'bg-sky-50/40' : 'hover:bg-gray-50/80'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">{ord.order_number}</span>
                          {getStatusBadge(ord.status)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Delivery: {new Date(ord.delivery_date).toLocaleDateString()} • {ord.delivery_time_slot || 'Standard'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block">Total</span>
                        <span className="text-sm font-bold text-gray-900">${(ord.total || 0).toFixed(2)}</span>
                      </div>
                      <button className="text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Available Services Side Catalog */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 p-6">
              <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600" /> Laundry Services Catalog
              </h3>
              <p className="text-xs text-gray-500 mb-4">Current rates & professional treatments</p>

              <div className="space-y-3">
                {services.map((svc) => (
                  <div key={svc.id} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-sky-200 transition-colors">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-sm text-gray-900">{svc.name}</span>
                      <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md">
                        ${svc.base_price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{svc.description}</p>
                  </div>
                ))}
              </div>

              <Link
                to="/order/new"
                className="mt-5 w-full block text-center bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-xs"
              >
                Schedule with These Services
              </Link>
            </div>

            {/* Why LaundryFlow Banner */}
            <div className="bg-gradient-to-br from-indigo-900 to-sky-900 text-white p-6 rounded-2xl shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6 text-sky-300" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">100% Quality & Care Guaranteed</h4>
              <p className="text-xs text-sky-200 leading-relaxed">
                Every garment is inspected, sanitized, and neatly pressed before timely doorstep return.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
