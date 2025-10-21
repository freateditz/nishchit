import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { API } from '../App';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Shield, LogOut, Package, CheckCircle, Clock, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

const DealerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntitlement, setSelectedEntitlement] = useState(null);
  const [proofImage, setProofImage] = useState('');
  const [remarks, setRemarks] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [beneficiariesRes, statsRes] = await Promise.all([
        axios.get(`${API}/dealer/assigned-beneficiaries`),
        axios.get(`${API}/dealer/stats`)
      ]);
      
      setBeneficiaries(beneficiariesRes.data.beneficiaries);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMarkDelivery = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(`${API}/dealer/mark-delivery`, {
        entitlement_id: selectedEntitlement.id,
        proof: proofImage || null,
        remarks: remarks || null
      });
      
      toast.success('Delivery marked successfully');
      setProofImage('');
      setRemarks('');
      setDialogOpen(false);
      setSelectedEntitlement(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to mark delivery');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Nishchit</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700" data-testid="dealer-name">Welcome, {user?.name}</span>
              <Button onClick={handleLogout} variant="outline" size="sm" data-testid="logout-btn">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8" data-testid="dashboard-heading">Dealer Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" data-testid="card-total">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Assigned</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.total_assigned || 0}</p>
              </div>
              <Users className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" data-testid="card-delivered">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Delivered</p>
                <p className="text-3xl font-bold text-green-600">{stats?.delivered || 0}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" data-testid="card-pending">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-red-600">{stats?.pending || 0}</p>
              </div>
              <Clock className="w-10 h-10 text-red-600" />
            </div>
          </div>
        </div>

        {/* Beneficiaries List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" data-testid="beneficiaries-section">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Assigned Beneficiaries</h2>
          
          {beneficiaries.length === 0 ? (
            <p className="text-gray-500 text-center py-8" data-testid="no-beneficiaries-msg">No beneficiaries assigned</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ration Card</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Phone</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {beneficiaries.map((beneficiary, index) => (
                    <tr key={beneficiary.id} className="border-b border-gray-100" data-testid={`beneficiary-row-${index}`}>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{beneficiary.citizen_info?.name}</p>
                        <p className="text-sm text-gray-500">{beneficiary.citizen_info?.region}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{beneficiary.ration_card_number}</td>
                      <td className="py-3 px-4 text-gray-900">{beneficiary.citizen_info?.phone}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          beneficiary.status === 'delivered' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {beneficiary.status === 'delivered' ? 'Delivered' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {beneficiary.status === 'pending' ? (
                          <Dialog open={dialogOpen && selectedEntitlement?.id === beneficiary.id} onOpenChange={(open) => {
                            setDialogOpen(open);
                            if (!open) setSelectedEntitlement(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => setSelectedEntitlement(beneficiary)}
                                data-testid={`mark-delivery-btn-${index}`}
                              >
                                Mark Delivered
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Mark as Delivered</DialogTitle>
                                <DialogDescription>
                                  Confirm delivery for {beneficiary.citizen_info?.name}
                                </DialogDescription>
                              </DialogHeader>
                              <form onSubmit={handleMarkDelivery} className="space-y-4">
                                <div>
                                  <Label htmlFor="proof">Upload Proof (Optional)</Label>
                                  <Input
                                    id="proof"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    data-testid="proof-upload-input"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="remarks">Remarks (Optional)</Label>
                                  <Textarea
                                    id="remarks"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Any additional notes"
                                    rows={3}
                                    data-testid="remarks-input"
                                  />
                                </div>
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" data-testid="confirm-delivery-btn">
                                  Confirm Delivery
                                </Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm">Completed</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealerDashboard;