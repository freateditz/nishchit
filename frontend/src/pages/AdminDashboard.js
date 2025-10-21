import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Shield, LogOut, Users, Package, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { getAnalytics, getRegionStats, mockComplaints, mockUsers, getMonthlyTrend } from '../data/mockData';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [regionStats, setRegionStats] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);

  useEffect(() => {
    setAnalytics(getAnalytics());
    setRegionStats(getRegionStats());
    setMonthlyTrend(getMonthlyTrend());
    
    const complaintsWithCitizen = mockComplaints.map(complaint => {
      const citizen = mockUsers.find(u => u.id === complaint.citizen_id);
      return {
        ...complaint,
        citizen_info: citizen ? { name: citizen.name, phone: citizen.phone, email: citizen.email } : null
      };
    });
    setComplaints(complaintsWithCitizen);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleResolveComplaint = (complaintId) => {
    const updatedComplaints = complaints.map(c => 
      c.id === complaintId ? { ...c, status: 'resolved' } : c
    );
    setComplaints(updatedComplaints);
    toast.success('Complaint resolved successfully');
  };

  if (!analytics) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  const maxMonthlyValue = Math.max(...monthlyTrend.map(m => m.delivered + m.pending));

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Nishchit</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700" data-testid="admin-name">Welcome, {user?.name}</span>
              <Button onClick={handleLogout} variant="outline" size="sm" data-testid="logout-btn">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8" data-testid="dashboard-heading">Admin Dashboard</h1>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" data-testid="card-citizens">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Citizens</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalCitizens}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" data-testid="card-dealers">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Dealers</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalDealers}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" data-testid="card-delivery-rate">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Delivery Rate</p>
            <p className="text-3xl font-bold text-green-600">{analytics.deliveryPercentage}%</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" data-testid="card-complaints">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Open Complaints</p>
            <p className="text-3xl font-bold text-red-600">{analytics.openComplaints}</p>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8" data-testid="monthly-trend-section">
          <div className="flex items-center mb-6">
            <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Monthly Delivery Trend</h2>
          </div>
          <div className="flex items-end justify-between h-64 gap-4">
            {monthlyTrend.map((month, index) => {
              const deliveredHeight = (month.delivered / maxMonthlyValue) * 100;
              const pendingHeight = (month.pending / maxMonthlyValue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center justify-end h-48 gap-1">
                    <div 
                      className="w-full bg-green-500 rounded-t transition-all duration-500"
                      style={{ height: `${deliveredHeight}%` }}
                      title={`Delivered: ${month.delivered}`}
                    ></div>
                    <div 
                      className="w-full bg-red-400 rounded-t transition-all duration-500"
                      style={{ height: `${pendingHeight}%` }}
                      title={`Pending: ${month.pending}`}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 font-medium">{month.month}</p>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Delivered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-400 rounded"></div>
              <span className="text-sm text-gray-600">Pending</span>
            </div>
          </div>
        </div>

        {/* Region-wise Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8" data-testid="region-stats-section">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Region-wise Performance</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Region</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Delivered</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Pending</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {regionStats.map((region, index) => (
                  <tr key={index} className="border-b border-gray-100" data-testid={`region-row-${index}`}>
                    <td className="py-3 px-4 font-medium text-gray-900">{region.region}</td>
                    <td className="py-3 px-4 text-gray-900">{region.total}</td>
                    <td className="py-3 px-4">
                      <span className="text-green-600 font-medium">{region.delivered}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-red-600 font-medium">{region.pending}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                          <div 
                            className="h-2 bg-green-500 rounded-full" 
                            style={{ width: `${region.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{region.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Complaints Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" data-testid="complaints-section">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Complaints Management</h2>
          
          {complaints.length === 0 ? (
            <p className="text-gray-500 text-center py-8" data-testid="no-complaints-msg">No complaints to display</p>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint, index) => (
                <div key={complaint.id} className="p-4 border border-gray-200 rounded-lg" data-testid={`complaint-card-${index}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{complaint.subject}</h3>
                      <p className="text-sm text-gray-600 mt-1">{complaint.description}</p>
                      {complaint.citizen_info && (
                        <div className="mt-2 text-sm text-gray-500">
                          <p>Submitted by: {complaint.citizen_info.name}</p>
                          <p>Contact: {complaint.citizen_info.phone}</p>
                          <p>Date: {new Date(complaint.created_at).toLocaleDateString('en-IN')}</p>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {complaint.status === 'open' ? (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleResolveComplaint(complaint.id)}
                          data-testid={`resolve-complaint-btn-${index}`}
                        >
                          Resolve
                        </Button>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Resolved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;