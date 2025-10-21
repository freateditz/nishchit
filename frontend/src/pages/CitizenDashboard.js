import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { Shield, LogOut, Package, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { getEntitlementByCitizen, getComplaintsByCitizen, mockEntitlements } from '../data/mockData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [entitlement, setEntitlement] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const userEntitlement = getEntitlementByCitizen(user.id);
      setEntitlement(userEntitlement);
      setComplaints(getComplaintsByCitizen(user.id));
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSubmitComplaint = (e) => {
    e.preventDefault();
    
    if (!complaintSubject || !complaintDescription) {
      toast.error('Please fill all fields');
      return;
    }

    const newComplaint = {
      id: 'comp_' + Date.now(),
      citizen_id: user.id,
      subject: complaintSubject,
      description: complaintDescription,
      status: 'open',
      created_at: new Date().toISOString()
    };
    
    setComplaints([newComplaint, ...complaints]);
    toast.success('Complaint submitted successfully');
    setComplaintSubject('');
    setComplaintDescription('');
    setDialogOpen(false);
  };

  if (!entitlement) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No entitlement found for your account.</p>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  const allEntitlements = mockEntitlements.filter(e => e.citizen_id === user.id);
  const deliveredCount = allEntitlements.filter(e => e.status === 'delivered').length;
  const totalCount = allEntitlements.length || 1;
  const deliveryPercentage = (deliveredCount / totalCount) * 100;

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
              <span className="text-gray-700" data-testid="user-name">Welcome, {user?.name}</span>
              <Button onClick={handleLogout} variant="outline" size="sm" data-testid="logout-btn">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8" data-testid="dashboard-heading">Citizen Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" data-testid="card-ration-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ration Card Number</p>
                <p className="text-2xl font-bold text-gray-900">{entitlement.ration_card_number}</p>
              </div>
              <Package className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" data-testid="card-status">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Status</p>
                <p className={`text-2xl font-bold ${entitlement.status === 'delivered' ? 'text-green-600' : 'text-red-600'}`}>
                  {entitlement.status === 'delivered' ? 'Delivered' : 'Pending'}
                </p>
              </div>
              {entitlement.status === 'delivered' ? (
                <CheckCircle className="w-10 h-10 text-green-600" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600" />
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" data-testid="card-region">
            <div>
              <p className="text-sm text-gray-600 mb-1">Region</p>
              <p className="text-2xl font-bold text-gray-900">{user?.region}</p>
            </div>
          </div>
        </div>

        {/* Entitlement Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8" data-testid="entitlement-section">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Entitlement</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {entitlement.items && Object.entries(entitlement.items).map(([item, qty]) => (
              <div key={item} className="p-4 bg-blue-50 rounded-lg border border-blue-200" data-testid={`item-${item}`}>
                <p className="text-sm text-gray-600 capitalize">{item}</p>
                <p className="text-2xl font-bold text-blue-900">{qty} kg</p>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8" data-testid="progress-section">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery History</h2>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall Progress</span>
              <span>{deliveredCount} / {totalCount} months</span>
            </div>
            <Progress value={deliveryPercentage} className="h-3" data-testid="delivery-progress" />
          </div>
          <p className="text-sm text-gray-500">
            {deliveryPercentage.toFixed(0)}% of your entitlements have been delivered
          </p>
        </div>

        {/* Status History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8" data-testid="history-section">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Status History</h2>
          <div className="space-y-3">
            {allEntitlements.map((ent, index) => (
              <div key={ent.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" data-testid={`history-item-${index}`}>
                <div className="flex items-center space-x-3">
                  {ent.status === 'delivered' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      Month {ent.month}, {ent.year}
                    </p>
                    <p className="text-sm text-gray-600">{ent.ration_card_number}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  ent.status === 'delivered' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {ent.status === 'delivered' ? 'Delivered' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Complaints Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" data-testid="complaints-section">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Complaints</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700" data-testid="new-complaint-btn">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  New Complaint
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit New Complaint</DialogTitle>
                  <DialogDescription>
                    Describe your issue and we'll look into it.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitComplaint} className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={complaintSubject}
                      onChange={(e) => setComplaintSubject(e.target.value)}
                      placeholder="Brief description"
                      data-testid="complaint-subject-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={complaintDescription}
                      onChange={(e) => setComplaintDescription(e.target.value)}
                      placeholder="Detailed description of the issue"
                      rows={4}
                      data-testid="complaint-description-input"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" data-testid="submit-complaint-btn">
                    Submit Complaint
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {complaints.length === 0 ? (
            <p className="text-gray-500 text-center py-8" data-testid="no-complaints-msg">No complaints submitted yet</p>
          ) : (
            <div className="space-y-3">
              {complaints.map((complaint, index) => (
                <div key={complaint.id} className="p-4 border border-gray-200 rounded-lg" data-testid={`complaint-item-${index}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{complaint.subject}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      complaint.status === 'resolved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {complaint.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{complaint.description}</p>
                  <p className="text-xs text-gray-400">
                    Submitted: {new Date(complaint.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;