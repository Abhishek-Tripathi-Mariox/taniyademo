export const ROLES = ['Admin', 'Management', 'Sales', 'China Operations', 'India Operations']

// Which modules each department can see (SOW §6: department-specific access)
export const ROLE_ACCESS = {
  Admin: ['dashboard', 'analytics', 'clients', 'inquiries', 'shipments', 'warehouse', 'delivery', 'reports', 'admin'],
  Management: ['dashboard', 'analytics', 'clients', 'inquiries', 'shipments', 'warehouse', 'delivery', 'reports'],
  Sales: ['dashboard', 'analytics', 'clients', 'inquiries', 'shipments', 'reports'],
  'China Operations': ['dashboard', 'shipments', 'warehouse', 'reports'],
  'India Operations': ['dashboard', 'shipments', 'delivery', 'reports'],
}

export const SHIPMENT_STATUSES = [
  'Booked',
  'Received at China Warehouse',
  'Dispatched from China',
  'In Transit',
  'Arrived in India',
  'Awaiting Client Instructions',
  'Out for Delivery',
  'Delivered',
  'Closed',
]

const BASE_USERS = [
  { id: 'U1', name: 'Aarav Mehta', email: 'admin@shipflow.in', role: 'Admin', active: true, lastLogin: '2026-11-03 09:12' },
  { id: 'U2', name: 'Priya Sharma', email: 'priya@shipflow.in', role: 'Management', active: true, lastLogin: '2026-11-03 08:47' },
  { id: 'U3', name: 'Rohit Verma', email: 'rohit@shipflow.in', role: 'Sales', active: true, lastLogin: '2026-11-02 18:20' },
  { id: 'U4', name: 'Li Wei', email: 'liwei@shipflow.cn', role: 'China Operations', active: true, lastLogin: '2026-11-03 06:05' },
  { id: 'U5', name: 'Chen Yu', email: 'chenyu@shipflow.cn', role: 'China Operations', active: false, lastLogin: '2026-10-21 11:40' },
  { id: 'U6', name: 'Karan Joshi', email: 'karan@shipflow.in', role: 'India Operations', active: true, lastLogin: '2026-11-03 10:02' },
]

const BASE_CLIENTS = [
  { id: 'C001', company: 'Sunrise Electronics Pvt Ltd', contact: 'Vikram Rao', phone: '+91 98200 11223', email: 'vikram@sunrise.in', city: 'Mumbai', address: 'Plot 14, MIDC Andheri East, Mumbai 400093', mark: 'SRE-MUM', active: true, since: '2024-03-12' },
  { id: 'C002', company: 'Delhi Textiles Co.', contact: 'Neha Kapoor', phone: '+91 99100 44556', email: 'neha@delhitex.com', city: 'New Delhi', address: '22 Chandni Chowk, Delhi 110006', mark: 'DTC-DEL', active: true, since: '2024-07-02' },
  { id: 'C003', company: 'Bharat Auto Parts', contact: 'Suresh Iyer', phone: '+91 97400 22331', email: 'suresh@bharatauto.in', city: 'Chennai', address: '7 Ambattur Industrial Estate, Chennai 600058', mark: 'BAP-CHN', active: true, since: '2023-11-19' },
  { id: 'C004', company: 'GreenLeaf Home Decor', contact: 'Ananya Das', phone: '+91 90070 88990', email: 'ananya@greenleaf.co', city: 'Kolkata', address: '9 Park Street, Kolkata 700016', mark: 'GLH-KOL', active: true, since: '2025-01-08' },
  { id: 'C005', company: 'Pune Toys & Gifts', contact: 'Rahul Kulkarni', phone: '+91 98220 77661', email: 'rahul@punetoys.in', city: 'Pune', address: '31 FC Road, Pune 411004', mark: 'PTG-PUN', active: false, since: '2024-05-27' },
  { id: 'C006', company: 'Gujarat Solar Systems', contact: 'Hetal Patel', phone: '+91 99250 33442', email: 'hetal@gujsolar.in', city: 'Ahmedabad', address: 'SG Highway, Ahmedabad 380054', mark: 'GSS-AMD', active: true, since: '2025-06-14' },
]

export const PARTNERS = ['Yiwu Freight Co.', 'Shenzhen Express Line', 'Guangzhou Ocean Cargo', 'Ningbo AirLink']

const BASE_INQUIRIES = [
  {
    id: 'INQ-1042', clientId: 'C001', date: '2026-10-29', goods: 'LED panels & drivers', origin: 'Shenzhen', destination: 'Mumbai',
    weight: 1250, volume: 6.4, mode: 'Sea', docs: ['CI_SRE_1042.pdf', 'PL_SRE_1042.xlsx'],
    rates: [{ partner: 'Shenzhen Express Line', rate: 182000 }, { partner: 'Guangzhou Ocean Cargo', rate: 168500 }, { partner: 'Yiwu Freight Co.', rate: 175000 }],
    sellingPrice: 198000, status: 'Quoted',
    quotes: [{ version: 1, amount: 205000, validity: '2026-11-10', status: 'Superseded' }, { version: 2, amount: 198000, validity: '2026-11-15', status: 'Sent' }],
  },
  {
    id: 'INQ-1041', clientId: 'C002', date: '2026-10-27', goods: 'Polyester fabric rolls', origin: 'Yiwu', destination: 'New Delhi',
    weight: 3400, volume: 14.2, mode: 'Sea', docs: ['CI_DTC_1041.pdf'],
    rates: [{ partner: 'Yiwu Freight Co.', rate: 312000 }, { partner: 'Ningbo AirLink', rate: 335000 }],
    sellingPrice: 349000, status: 'Accepted',
    quotes: [{ version: 1, amount: 349000, validity: '2026-11-05', status: 'Accepted' }],
  },
  {
    id: 'INQ-1040', clientId: 'C006', date: '2026-10-25', goods: 'Solar inverters (48 units)', origin: 'Ningbo', destination: 'Ahmedabad',
    weight: 860, volume: 3.1, mode: 'Air', docs: ['CI_GSS_1040.pdf', 'PL_GSS_1040.pdf'],
    rates: [{ partner: 'Ningbo AirLink', rate: 264000 }, { partner: 'Shenzhen Express Line', rate: 281000 }],
    sellingPrice: 295000, status: 'Pending',
    quotes: [],
  },
  {
    id: 'INQ-1039', clientId: 'C004', date: '2026-10-20', goods: 'Ceramic vases & planters', origin: 'Guangzhou', destination: 'Kolkata',
    weight: 2100, volume: 9.8, mode: 'Sea', docs: ['PL_GLH_1039.xlsx'],
    rates: [{ partner: 'Guangzhou Ocean Cargo', rate: 142000 }],
    sellingPrice: 161000, status: 'Rejected',
    quotes: [{ version: 1, amount: 161000, validity: '2026-10-30', status: 'Rejected' }],
  },
  {
    id: 'INQ-1038', clientId: 'C003', date: '2026-10-18', goods: 'Brake assemblies', origin: 'Shenzhen', destination: 'Chennai',
    weight: 1800, volume: 5.2, mode: 'Sea', docs: ['CI_BAP_1038.pdf', 'PL_BAP_1038.pdf'],
    rates: [{ partner: 'Shenzhen Express Line', rate: 152000 }, { partner: 'Guangzhou Ocean Cargo', rate: 149000 }],
    sellingPrice: 171000, status: 'Accepted',
    quotes: [{ version: 1, amount: 171000, validity: '2026-10-28', status: 'Accepted' }],
  },
]

const h = (status, at, by, note = '') => ({ status, at, by, note })

const BASE_SHIPMENTS = [
  {
    id: 'SHP-26-0187', clientId: 'C002', inquiryId: 'INQ-1041', mode: 'Sea', packages: 42, grossWeight: 3420, volume: 14.5,
    created: '2026-10-28', eta: '2026-11-24', team: 'China Operations', status: 'Received at China Warehouse',
    warehouse: { receivedOn: '2026-10-31', packages: 42, actualWeight: 3438, actualVolume: 14.6, condition: 'Good', discrepancy: '', staff: 'Li Wei', photos: 6 },
    dispatch: null, delivery: null,
    history: [h('Booked', '2026-10-28 11:20', 'Rohit Verma', 'Created from INQ-1041'), h('Received at China Warehouse', '2026-10-31 15:42', 'Li Wei', '42 cartons received')],
  },
  {
    id: 'SHP-26-0186', clientId: 'C003', inquiryId: 'INQ-1038', mode: 'Sea', packages: 30, grossWeight: 1810, volume: 5.3,
    created: '2026-10-19', eta: '2026-11-12', team: 'India Operations', status: 'Awaiting Client Instructions',
    warehouse: { receivedOn: '2026-10-21', packages: 30, actualWeight: 1822, actualVolume: 5.3, condition: 'Good', discrepancy: '', staff: 'Li Wei', photos: 4 },
    dispatch: { note: 'DN-0931', partner: 'Shenzhen Express Line', date: '2026-10-23', packages: 30, handover: 'Handed to Zhang (SEL dock 3)', tracking: 'SEL-88213490', proof: true },
    delivery: null,
    history: [h('Booked', '2026-10-19 10:02', 'Rohit Verma'), h('Received at China Warehouse', '2026-10-21 12:10', 'Li Wei'), h('Dispatched from China', '2026-10-23 17:30', 'Li Wei', 'DN-0931'), h('In Transit', '2026-10-24 08:00', 'System'), h('Arrived in India', '2026-11-01 09:45', 'Karan Joshi', 'Chennai port'), h('Awaiting Client Instructions', '2026-11-01 10:00', 'Karan Joshi')],
  },
  {
    id: 'SHP-26-0185', clientId: 'C001', inquiryId: 'INQ-1031', mode: 'Air', packages: 12, grossWeight: 410, volume: 1.8,
    created: '2026-10-14', eta: '2026-10-25', team: 'India Operations', status: 'Out for Delivery',
    warehouse: { receivedOn: '2026-10-16', packages: 12, actualWeight: 412, actualVolume: 1.8, condition: 'Minor damage', discrepancy: '1 carton corner crushed', staff: 'Chen Yu', photos: 8 },
    dispatch: { note: 'DN-0927', partner: 'Ningbo AirLink', date: '2026-10-17', packages: 12, handover: 'Airport cargo terminal T2', tracking: 'NAL-55120034', proof: true },
    delivery: { method: 'Courier', destination: 'Sunrise Electronics, Andheri East', charges: 3200, tracking: 'BLUEDART-77812', status: 'In Transit', instructions: 'Deliver before 6 PM, call Vikram', proof: false },
    history: [h('Booked', '2026-10-14 09:30', 'Rohit Verma'), h('Received at China Warehouse', '2026-10-16 14:00', 'Chen Yu'), h('Dispatched from China', '2026-10-17 18:20', 'Chen Yu'), h('In Transit', '2026-10-18 02:00', 'System'), h('Arrived in India', '2026-10-24 07:15', 'Karan Joshi'), h('Awaiting Client Instructions', '2026-10-24 08:00', 'Karan Joshi'), h('Out for Delivery', '2026-11-02 10:30', 'Karan Joshi', 'BlueDart AWB 77812')],
  },
  {
    id: 'SHP-26-0184', clientId: 'C004', inquiryId: 'INQ-1029', mode: 'Sea', packages: 64, grossWeight: 2950, volume: 12.1,
    created: '2026-10-05', eta: '2026-11-08', team: 'India Operations', status: 'In Transit',
    warehouse: { receivedOn: '2026-10-08', packages: 64, actualWeight: 2961, actualVolume: 12.2, condition: 'Good', discrepancy: '', staff: 'Li Wei', photos: 5 },
    dispatch: { note: 'DN-0919', partner: 'Guangzhou Ocean Cargo', date: '2026-10-11', packages: 64, handover: 'Nansha port, berth 7', tracking: 'GOC-CN44721', proof: true },
    delivery: null,
    history: [h('Booked', '2026-10-05 13:00', 'Rohit Verma'), h('Received at China Warehouse', '2026-10-08 11:30', 'Li Wei'), h('Dispatched from China', '2026-10-11 16:00', 'Li Wei'), h('In Transit', '2026-10-12 06:00', 'System')],
  },
  {
    id: 'SHP-26-0183', clientId: 'C006', inquiryId: 'INQ-1027', mode: 'Air', packages: 20, grossWeight: 640, volume: 2.4,
    created: '2026-09-29', eta: '2026-10-10', team: 'India Operations', status: 'Delivered',
    warehouse: { receivedOn: '2026-10-01', packages: 20, actualWeight: 640, actualVolume: 2.4, condition: 'Good', discrepancy: '', staff: 'Li Wei', photos: 3 },
    dispatch: { note: 'DN-0911', partner: 'Ningbo AirLink', date: '2026-10-02', packages: 20, handover: 'Ningbo airport cargo', tracking: 'NAL-55109921', proof: true },
    delivery: { method: 'Transport', destination: 'GSS Warehouse, SG Highway', charges: 8500, tracking: 'LR-GJ-44120', status: 'Completed', instructions: 'Unload at dock B', proof: true },
    history: [h('Booked', '2026-09-29 10:00', 'Rohit Verma'), h('Received at China Warehouse', '2026-10-01 09:00', 'Li Wei'), h('Dispatched from China', '2026-10-02 19:00', 'Li Wei'), h('In Transit', '2026-10-03 01:00', 'System'), h('Arrived in India', '2026-10-08 12:00', 'Karan Joshi'), h('Out for Delivery', '2026-10-09 09:00', 'Karan Joshi'), h('Delivered', '2026-10-10 15:20', 'Karan Joshi', 'POD uploaded')],
  },
  {
    id: 'SHP-26-0182', clientId: 'C002', inquiryId: 'INQ-1024', mode: 'Sea', packages: 55, grossWeight: 4100, volume: 17.3,
    created: '2026-09-15', eta: '2026-10-20', team: 'Management', status: 'Closed',
    warehouse: { receivedOn: '2026-09-18', packages: 55, actualWeight: 4115, actualVolume: 17.3, condition: 'Good', discrepancy: '', staff: 'Chen Yu', photos: 7 },
    dispatch: { note: 'DN-0902', partner: 'Yiwu Freight Co.', date: '2026-09-21', packages: 55, handover: 'Ningbo port', tracking: 'YFC-20931', proof: true },
    delivery: { method: 'Client Pickup', destination: 'ICD Tughlakabad', charges: 0, tracking: '—', status: 'Completed', instructions: 'Client will collect', proof: true },
    history: [h('Booked', '2026-09-15 11:00', 'Rohit Verma'), h('Received at China Warehouse', '2026-09-18 10:00', 'Chen Yu'), h('Dispatched from China', '2026-09-21 15:00', 'Chen Yu'), h('In Transit', '2026-09-22 05:00', 'System'), h('Arrived in India', '2026-10-15 08:00', 'Karan Joshi'), h('Delivered', '2026-10-18 13:00', 'Karan Joshi'), h('Closed', '2026-10-20 17:00', 'Priya Sharma')],
  },
  {
    id: 'SHP-26-0181', clientId: 'C001', inquiryId: 'INQ-1022', mode: 'Sea', packages: 18, grossWeight: 960, volume: 4.0,
    created: '2026-10-30', eta: '2026-12-01', team: 'China Operations', status: 'Booked',
    warehouse: null, dispatch: null, delivery: null,
    history: [h('Booked', '2026-10-30 16:40', 'Rohit Verma', 'Awaiting goods at warehouse')],
  },
  {
    id: 'SHP-26-0180', clientId: 'C003', inquiryId: 'INQ-1020', mode: 'Sea', packages: 26, grossWeight: 1500, volume: 4.8,
    created: '2026-10-02', eta: '2026-11-04', team: 'India Operations', status: 'Arrived in India',
    warehouse: { receivedOn: '2026-10-05', packages: 26, actualWeight: 1490, actualVolume: 4.8, condition: 'Good', discrepancy: '', staff: 'Li Wei', photos: 4 },
    dispatch: { note: 'DN-0915', partner: 'Shenzhen Express Line', date: '2026-10-07', packages: 26, handover: 'Yantian port', tracking: 'SEL-88199012', proof: true },
    delivery: null,
    history: [h('Booked', '2026-10-02 09:10', 'Rohit Verma'), h('Received at China Warehouse', '2026-10-05 13:20', 'Li Wei'), h('Dispatched from China', '2026-10-07 18:00', 'Li Wei'), h('In Transit', '2026-10-08 04:00', 'System'), h('Arrived in India', '2026-11-02 11:00', 'Karan Joshi', 'Chennai port')],
  },
]

const BASE_AUDIT = [
  { at: '2026-11-03 10:02', user: 'Karan Joshi', action: 'Updated delivery tracking', ref: 'SHP-26-0185', field: 'tracking', from: '—', to: 'BLUEDART-77812' },
  { at: '2026-11-03 09:40', user: 'Rohit Verma', action: 'Generated quotation v2', ref: 'INQ-1042', field: 'amount', from: '₹2,05,000', to: '₹1,98,000' },
  { at: '2026-11-02 11:00', user: 'Karan Joshi', action: 'Status changed', ref: 'SHP-26-0180', field: 'status', from: 'In Transit', to: 'Arrived in India' },
  { at: '2026-10-31 15:42', user: 'Li Wei', action: 'Warehouse receiving recorded', ref: 'SHP-26-0187', field: 'actualWeight', from: '—', to: '3,438 kg' },
  { at: '2026-10-30 16:40', user: 'Rohit Verma', action: 'Shipment created', ref: 'SHP-26-0181', field: '—', from: '—', to: 'Booked' },
  { at: '2026-10-29 12:15', user: 'Aarav Mehta', action: 'User deactivated', ref: 'U5', field: 'active', from: 'true', to: 'false' },
]

// ---------------------------------------------------------------------------
// Generated history: ~12 months of deterministic demo data for listings & analytics
// ---------------------------------------------------------------------------

export const TODAY = '2026-11-03'

let seed = 20261103
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
const pick = (arr) => arr[Math.floor(rnd() * arr.length)]
const int = (a, b) => Math.floor(a + rnd() * (b - a + 1))
const addDays = (d, n) => {
  const x = new Date(`${d.slice(0, 10)}T00:00:00Z`)
  x.setUTCDate(x.getUTCDate() + n)
  return x.toISOString().slice(0, 10)
}
export const daysBetween = (a, b) => Math.round((new Date(b.slice(0, 10)) - new Date(a.slice(0, 10))) / 864e5)

const EXTRA_CLIENTS = [
  ['Hyderabad Pharma Packaging', 'Srinivas Reddy', 'Hyderabad', 'HPP-HYD'],
  ['Jaipur Handicraft Exports', 'Meera Rathore', 'Jaipur', 'JHE-JAI'],
  ['Kochi Marine Supplies', 'Thomas George', 'Kochi', 'KMS-KOC'],
  ['Lucknow Lighting House', 'Amit Srivastava', 'Lucknow', 'LLH-LKO'],
  ['Bengaluru Robotics Labs', 'Divya Nair', 'Bengaluru', 'BRL-BLR'],
  ['Surat Diamond Tools', 'Jignesh Shah', 'Surat', 'SDT-SUR'],
  ['Indore Kitchenware Co.', 'Pooja Jain', 'Indore', 'IKC-IDR'],
  ['Chandigarh Sports Gear', 'Harpreet Singh', 'Chandigarh', 'CSG-CHD'],
  ['Nagpur Agro Equipment', 'Sanjay Deshmukh', 'Nagpur', 'NAE-NAG'],
  ['Goa Hospitality Linen', 'Rhea Fernandes', 'Panaji', 'GHL-GOA'],
  ['Mumbai Mobile Accessories', 'Faisal Shaikh', 'Mumbai', 'MMA-MUM'],
  ['Coimbatore Pump Works', 'Karthik Subramaniam', 'Coimbatore', 'CPW-CBE'],
]

export const CLIENTS = [
  ...BASE_CLIENTS,
  ...EXTRA_CLIENTS.map(([company, contact, city, mark], i) => ({
    id: `C${String(BASE_CLIENTS.length + i + 1).padStart(3, '0')}`,
    company, contact, city, mark,
    phone: `+91 9${int(100000000, 999999999)}`,
    email: `${contact.split(' ')[0].toLowerCase()}@${company.split(' ')[0].toLowerCase()}.in`,
    address: `${int(1, 120)}, Industrial Area, ${city}`,
    active: i !== 7,
    since: addDays('2024-01-10', i * 41),
  })),
]

// Demo passwords, one per department
const ROLE_PASSWORDS = {
  Admin: 'Admin@2026',
  Management: 'Mgmt@2026',
  Sales: 'Sales@2026',
  'China Operations': 'China@2026',
  'India Operations': 'India@2026',
}

export const USERS = [
  ...BASE_USERS,
  { id: 'U7', name: 'Sneha Pillai', email: 'sneha@shipflow.in', role: 'Sales', active: true, lastLogin: '2026-11-03 09:55' },
  { id: 'U8', name: 'Wang Fang', email: 'wangfang@shipflow.cn', role: 'China Operations', active: true, lastLogin: '2026-11-03 07:30' },
  { id: 'U9', name: 'Deepak Nair', email: 'deepak@shipflow.in', role: 'India Operations', active: true, lastLogin: '2026-11-02 19:10' },
  { id: 'U10', name: 'Ishita Bose', email: 'ishita@shipflow.in', role: 'Sales', active: true, lastLogin: '2026-11-01 16:45' },
  { id: 'U11', name: 'Zhao Lei', email: 'zhaolei@shipflow.cn', role: 'China Operations', active: true, lastLogin: '2026-11-03 05:50' },
  { id: 'U12', name: 'Manish Gupta', email: 'manish@shipflow.in', role: 'Management', active: true, lastLogin: '2026-10-30 12:00' },
  { id: 'U13', name: 'Farah Khan', email: 'farah@shipflow.in', role: 'India Operations', active: false, lastLogin: '2026-09-14 10:20' },
].map((u) => ({ ...u, password: ROLE_PASSWORDS[u.role] }))

const ORIGINS = ['Shenzhen', 'Guangzhou', 'Yiwu', 'Ningbo', 'Shanghai']
const GOODS = ['LED fixtures', 'Garments', 'Auto spares', 'Solar panels', 'Furniture fittings', 'Mobile accessories', 'Kitchen appliances', 'Toys', 'Industrial pumps', 'Packaging film', 'Hand tools', 'Ceramic tiles', 'Sports goods', 'Bearings']
const AIR_PARTNERS = ['Ningbo AirLink', 'Shenzhen Express Line']
const SEA_PARTNERS = ['Yiwu Freight Co.', 'Guangzhou Ocean Cargo', 'Shenzhen Express Line']
const DELIVERY_METHODS = ['Courier', 'Courier', 'Transport', 'Transport', 'Transport', 'Local Delivery', 'Client Pickup']
const CHINA_STAFF = ['Li Wei', 'Chen Yu', 'Wang Fang', 'Zhao Lei']
const INDIA_STAFF = ['Karan Joshi', 'Deepak Nair']
const SALES_STAFF = ['Rohit Verma', 'Sneha Pillai', 'Ishita Bose']

const genInquiries = []
const genShipments = []
let inqSeq = 880
let seq25 = 388
let seq26 = 101

// Walk day by day so IDs stay chronological
for (let d = '2025-11-04'; d <= '2026-10-12'; d = addDays(d, int(2, 5))) {
  const client = pick(CLIENTS.filter((c) => c.active))
  const mode = rnd() < 0.3 ? 'Air' : 'Sea'
  const weight = mode === 'Air' ? int(120, 900) : int(600, 5200)
  const volume = +(weight / (mode === 'Air' ? int(220, 300) : int(240, 320))).toFixed(1)
  const origin = pick(ORIGINS)
  const goods = pick(GOODS)
  const partners = [...new Set([pick(mode === 'Air' ? AIR_PARTNERS : SEA_PARTNERS), pick(mode === 'Air' ? AIR_PARTNERS : SEA_PARTNERS), pick(PARTNERS)])]
  const rates = partners.map((p) => ({ partner: p, rate: Math.round(mode === 'Air' ? weight * int(250, 340) : volume * int(8800, 12800) + 9000) }))
  const best = rates.reduce((a, b) => (a.rate <= b.rate ? a : b))
  const sellingPrice = Math.round((best.rate * (1.08 + rnd() * 0.14)) / 500) * 500
  const outcome = rnd()
  const status = d > '2026-10-20' ? 'Quoted' : outcome < 0.62 ? 'Converted' : outcome < 0.85 ? 'Rejected' : 'Expired'
  const inq = {
    id: `INQ-${String(inqSeq++).padStart(4, '0')}`, clientId: client.id, date: d, goods, origin, destination: client.city,
    weight, volume, mode, docs: [`CI_${client.mark}_${inqSeq}.pdf`, `PL_${client.mark}_${inqSeq}.xlsx`], rates, sellingPrice,
    status, owner: pick(SALES_STAFF),
    quotes: [{ version: 1, amount: sellingPrice, validity: addDays(d, 10), status: status === 'Converted' ? 'Accepted' : status === 'Expired' ? 'Expired' : status === 'Rejected' ? 'Rejected' : 'Sent' }],
  }
  genInquiries.push(inq)
  if (status !== 'Converted') continue

  // Build the lifecycle and keep only milestones that have already happened
  const created = addDays(d, int(1, 4))
  const transit = mode === 'Air' ? int(5, 11) : int(21, 38)
  const plannedTransit = mode === 'Air' ? 9 : 30
  const received = addDays(created, int(1, 5))
  const dispatched = addDays(received, int(1, 3))
  const arrived = addDays(dispatched, transit)
  const awaiting = rnd() < 0.5 ? arrived : null
  const out = addDays(arrived, int(1, 4))
  const delivered = addDays(out, int(1, 3))
  const closed = addDays(delivered, int(1, 6))
  const china = pick(CHINA_STAFF)
  const india = pick(INDIA_STAFF)
  const timeline = [
    ['Booked', created, inq.owner],
    ['Received at China Warehouse', received, china],
    ['Dispatched from China', dispatched, china],
    ['In Transit', addDays(dispatched, 1), 'System'],
    ['Arrived in India', arrived, india],
    ...(awaiting ? [['Awaiting Client Instructions', awaiting, india]] : []),
    ['Out for Delivery', out, india],
    ['Delivered', delivered, india],
    ['Closed', closed, 'Priya Sharma'],
  ].filter(([, at]) => at <= TODAY)
  const statusNow = timeline.at(-1)[0]
  const idx = SHIPMENT_STATUSES.indexOf(statusNow)
  const packages = Math.max(2, Math.round(weight / int(35, 90)))
  const damaged = rnd() < 0.09
  const method = pick(DELIVERY_METHODS)
  const dn = `DN-${String(600 + genShipments.length * 3).padStart(4, '0')}`
  const year = created.slice(0, 4)
  genShipments.push({
    id: year === '2025' ? `SHP-25-${String(seq25++).padStart(4, '0')}` : `SHP-26-${String(seq26++).padStart(4, '0')}`,
    clientId: client.id, inquiryId: inq.id, mode, packages, grossWeight: weight, volume, created,
    eta: addDays(dispatched, plannedTransit + 4), team: idx >= 4 ? 'India Operations' : 'China Operations', status: statusNow,
    origin, destination: client.city, partner: best.partner, revenue: sellingPrice, cost: best.rate,
    warehouse: idx >= 1 ? { receivedOn: received, packages, actualWeight: weight + int(-10, 25), actualVolume: volume, condition: damaged ? 'Minor damage' : 'Good', discrepancy: damaged ? 'Carton damage noted' : '', staff: china, photos: int(2, 7) } : null,
    dispatch: idx >= 2 ? { note: dn, partner: best.partner, date: dispatched, packages, handover: `${origin} terminal`, tracking: `${best.partner.slice(0, 3).toUpperCase()}-${int(10000000, 99999999)}`, proof: true } : null,
    delivery: idx >= 6 ? { method, destination: `${client.company}, ${client.city}`, charges: method === 'Client Pickup' ? 0 : int(15, 120) * 100, tracking: method === 'Client Pickup' ? '—' : `LR-${int(10000, 99999)}`, status: idx >= 7 ? 'Completed' : 'In Transit', instructions: 'As per client email', proof: idx >= 7 } : null,
    history: timeline.map(([st, at, by]) => ({ status: st, at: `${at} ${String(int(8, 19)).padStart(2, '0')}:${String(int(0, 59)).padStart(2, '0')}`, by, note: '' })),
  })
}

// Commercial fields for the hand-written records
const BASE_COMMERCIALS = {
  'SHP-26-0187': ['Yiwu', 'New Delhi', 'Yiwu Freight Co.', 349000, 312000],
  'SHP-26-0186': ['Shenzhen', 'Chennai', 'Guangzhou Ocean Cargo', 171000, 149000],
  'SHP-26-0185': ['Ningbo', 'Mumbai', 'Ningbo AirLink', 128000, 109000],
  'SHP-26-0184': ['Guangzhou', 'Kolkata', 'Guangzhou Ocean Cargo', 204000, 176000],
  'SHP-26-0183': ['Ningbo', 'Ahmedabad', 'Ningbo AirLink', 196000, 171000],
  'SHP-26-0182': ['Yiwu', 'New Delhi', 'Yiwu Freight Co.', 412000, 361000],
  'SHP-26-0181': ['Shenzhen', 'Mumbai', 'Shenzhen Express Line', 118000, 101000],
  'SHP-26-0180': ['Shenzhen', 'Chennai', 'Shenzhen Express Line', 158000, 139000],
}

export const SHIPMENTS = [
  ...BASE_SHIPMENTS.map((s) => {
    const [origin, destination, partner, revenue, cost] = BASE_COMMERCIALS[s.id]
    return { ...s, origin, destination, partner, revenue, cost }
  }),
  ...genShipments.reverse(),
].sort((a, b) => b.created.localeCompare(a.created))

export const INQUIRIES = [...BASE_INQUIRIES, ...genInquiries.reverse()]

export const AUDIT = [
  ...BASE_AUDIT,
  ...genShipments
    .flatMap((s) => s.history.slice(1).map((h, i) => ({ at: h.at, user: h.by, action: 'Status changed', ref: s.id, field: 'status', from: s.history[i].status, to: h.status })))
    .filter((a) => a.user !== 'System'),
].sort((a, b) => b.at.localeCompare(a.at))

// Admin-editable lists; the defaults seed the Master data tab
export const DEFAULT_MASTERS = {
  partners: PARTNERS,
  deliveryMethods: ['Courier', 'Transport', 'Local Delivery', 'Client Pickup'],
  origins: ORIGINS,
}
