export const mockUsers = [
  {id: 'citizen1', email: 'rajesh@example.com', password: 'password123', aadhaar: '123456789012', name: 'Rajesh Kumar', phone: '9876543210', role: 'citizen', region: 'North Delhi'},
  {id: 'citizen2', email: 'priya@example.com', password: 'password123', aadhaar: '234567890123', name: 'Priya Singh', phone: '9876543211', role: 'citizen', region: 'South Delhi'},
  {id: 'citizen3', email: 'amit@example.com', password: 'password123', aadhaar: '345678901234', name: 'Amit Sharma', phone: '9876543212', role: 'citizen', region: 'East Delhi'},
  {id: 'citizen4', email: 'sunita@example.com', password: 'password123', aadhaar: '456789012345', name: 'Sunita Devi', phone: '9876543213', role: 'citizen', region: 'West Delhi'},
  {id: 'citizen5', email: 'ramesh@example.com', password: 'password123', aadhaar: '567890123456', name: 'Ramesh Yadav', phone: '9876543214', role: 'citizen', region: 'Central Delhi'},
  {id: 'dealer1', email: 'dealer1@example.com', password: 'dealer123', aadhaar: '678901234567', name: 'Manoj Verma', phone: '9876543215', role: 'dealer', region: 'North Delhi'},
  {id: 'dealer2', email: 'dealer2@example.com', password: 'dealer123', aadhaar: '789012345678', name: 'Sanjay Gupta', phone: '9876543216', role: 'dealer', region: 'South Delhi'},
  {id: 'admin1', email: 'admin@example.com', password: 'admin123', aadhaar: '890123456789', name: 'Admin User', phone: '9876543217', role: 'admin', region: 'All Delhi'},
];

export const mockEntitlements = [
  {id: 'ent1', citizen_id: 'citizen1', ration_card_number: 'RC001234', items: {rice: 5.0, wheat: 10.0, sugar: 2.0, kerosene: 3.0}, month: new Date().getMonth() + 1, year: new Date().getFullYear(), status: 'delivered'},
  {id: 'ent2', citizen_id: 'citizen2', ration_card_number: 'RC002345', items: {rice: 5.0, wheat: 10.0, sugar: 2.0, kerosene: 3.0}, month: new Date().getMonth() + 1, year: new Date().getFullYear(), status: 'pending'},
  {id: 'ent3', citizen_id: 'citizen3', ration_card_number: 'RC003456', items: {rice: 5.0, wheat: 10.0, sugar: 2.0, kerosene: 3.0}, month: new Date().getMonth() + 1, year: new Date().getFullYear(), status: 'delivered'},
  {id: 'ent4', citizen_id: 'citizen4', ration_card_number: 'RC004567', items: {rice: 5.0, wheat: 10.0, sugar: 2.0, kerosene: 3.0}, month: new Date().getMonth() + 1, year: new Date().getFullYear(), status: 'pending'},
  {id: 'ent5', citizen_id: 'citizen5', ration_card_number: 'RC005678', items: {rice: 5.0, wheat: 10.0, sugar: 2.0, kerosene: 3.0}, month: new Date().getMonth() + 1, year: new Date().getFullYear(), status: 'delivered'},
];

export const mockDeliveries = [
  {id: 'del1', entitlement_id: 'ent1', dealer_id: 'dealer1', citizen_id: 'citizen1', delivery_date: new Date().toISOString(), status: 'delivered', remarks: 'Delivered successfully'},
  {id: 'del2', entitlement_id: 'ent3', dealer_id: 'dealer1', citizen_id: 'citizen3', delivery_date: new Date().toISOString(), status: 'delivered', remarks: 'Delivered successfully'},
  {id: 'del3', entitlement_id: 'ent5', dealer_id: 'dealer2', citizen_id: 'citizen5', delivery_date: new Date().toISOString(), status: 'delivered', remarks: 'Delivered successfully'},
];

export const mockComplaints = [
  {id: 'comp1', citizen_id: 'citizen2', subject: 'Ration not received', description: 'I have not received my ration for this month yet.', status: 'open', created_at: new Date().toISOString()},
  {id: 'comp2', citizen_id: 'citizen4', subject: 'Quantity mismatch', description: 'Received less quantity than entitled.', status: 'open', created_at: new Date().toISOString()},
];

// Helper functions
export const getUserByEmail = (email, password) => {
  return mockUsers.find(u => u.email === email && u.password === password);
};

export const getEntitlementByCitizen = (citizenId) => {
  return mockEntitlements.find(e => e.citizen_id === citizenId);
};

export const getComplaintsByCitizen = (citizenId) => {
  return mockComplaints.filter(c => c.citizen_id === citizenId);
};

export const getBeneficiariesByRegion = (region) => {
  const citizens = mockUsers.filter(u => u.role === 'citizen' && u.region === region);
  return citizens.map(citizen => {
    const entitlement = getEntitlementByCitizen(citizen.id);
    const delivery = mockDeliveries.find(d => d.entitlement_id === entitlement?.id);
    return {
      ...entitlement,
      citizen_info: citizen,
      delivery_info: delivery
    };
  });
};

export const getAnalytics = () => {
  const totalCitizens = mockUsers.filter(u => u.role === 'citizen').length;
  const totalDealers = mockUsers.filter(u => u.role === 'dealer').length;
  const totalEntitlements = mockEntitlements.length;
  const delivered = mockEntitlements.filter(e => e.status === 'delivered').length;
  const pending = totalEntitlements - delivered;
  const openComplaints = mockComplaints.filter(c => c.status === 'open').length;
  const resolvedComplaints = mockComplaints.filter(c => c.status === 'resolved').length;
  
  return {
    totalCitizens,
    totalDealers,
    totalEntitlements,
    delivered,
    pending,
    openComplaints,
    resolvedComplaints,
    deliveryPercentage: totalEntitlements > 0 ? Math.round((delivered / totalEntitlements) * 100) : 0
  };
};

export const getRegionStats = () => {
  const regions = ['North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi'];
  
  return regions.map(region => {
    const citizens = mockUsers.filter(u => u.role === 'citizen' && u.region === region);
    const citizenIds = citizens.map(c => c.id);
    const entitlements = mockEntitlements.filter(e => citizenIds.includes(e.citizen_id));
    const delivered = entitlements.filter(e => e.status === 'delivered').length;
    const total = entitlements.length;
    
    return {
      region,
      total,
      delivered,
      pending: total - delivered,
      percentage: total > 0 ? Math.round((delivered / total) * 100) : 0
    };
  });
};

export const getMonthlyTrend = () => {
  // Mock monthly data for last 6 months
  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  return months.map((month, index) => ({
    month,
    delivered: Math.floor(Math.random() * 100) + 50,
    pending: Math.floor(Math.random() * 30) + 10
  }));
};