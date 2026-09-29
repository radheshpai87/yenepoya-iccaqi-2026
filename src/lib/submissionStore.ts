export interface RegistrationRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  category: string;
  currency: string;
  amount: string;
  mode: string;
  paperId?: string;
  paperTitle?: string;
  paymentStatus: string;
  createdAt: string;
}

export interface SubmissionRecord {
  id: string;
  submissionId: string;
  authorName: string;
  email: string;
  phone: string;
  institution: string;
  track: string;
  paperTitle: string;
  abstract: string;
  fileUrl: string;
  reviewStatus: string;
  createdAt: string;
}

// Global in-memory data store for live updates across API routes
const localRegistrations: RegistrationRecord[] = [
  {
    id: 'REG-2026-001',
    name: 'Dr. Ramesh Kumar',
    email: 'ramesh.k@nitk.edu.in',
    phone: '+91 98450 12345',
    institution: 'NITK Surathkal',
    category: 'Research scholars / Academicians',
    currency: 'INR',
    amount: '₹750',
    mode: 'In-Person (Mangaluru Campus)',
    paperId: 'ICCAQI-2026-4821',
    paymentStatus: 'Verified',
    createdAt: '2026-09-28T10:14:00Z',
  },
  {
    id: 'REG-2026-002',
    name: 'Ananya Sharma',
    email: 'ananya.s@yenepoya.edu.in',
    phone: '+91 99001 88234',
    institution: 'Yenepoya Institute of Technology',
    category: 'Students (UG / PG)',
    currency: 'INR',
    amount: '₹500',
    mode: 'In-Person (Mangaluru Campus)',
    paperId: 'ICCAQI-2026-9012',
    paymentStatus: 'Pending',
    createdAt: '2026-09-29T14:30:00Z',
  },
  {
    id: 'REG-2026-003',
    name: 'Prof. Michael Chang',
    email: 'mchang@stanford.edu',
    phone: '+1 650 492 1092',
    institution: 'Stanford University',
    category: 'Industry Delegates',
    currency: 'USD',
    amount: '$20.00',
    mode: 'Virtual (Online Video Session)',
    paperId: 'ICCAQI-2026-7734',
    paymentStatus: 'Verified',
    createdAt: '2026-09-29T18:45:00Z',
  },
  {
    id: 'REG-2026-004',
    name: 'Priya Nair',
    email: 'priya.nair@cusat.ac.in',
    phone: '+91 94471 55210',
    institution: 'Cochin University of Science and Technology',
    category: 'Participants only',
    currency: 'INR',
    amount: '₹300',
    mode: 'Virtual (Online Video Session)',
    paperId: '',
    paymentStatus: 'Pending',
    createdAt: '2026-09-29T21:10:00Z',
  },
];

const localSubmissions: SubmissionRecord[] = [
  {
    id: 'SUB-001',
    submissionId: 'ICCAQI-2026-4821',
    authorName: 'Dr. Ramesh Kumar',
    email: 'ramesh.k@nitk.edu.in',
    phone: '+91 98450 12345',
    institution: 'NITK Surathkal',
    track: 'Artificial Intelligence and Machine Learning',
    paperTitle: 'Optimized Transformers for High-Throughput Edge AI Hardware',
    abstract: 'This paper presents a hardware-aware quantization algorithm designed for low-power edge AI microcontrollers...',
    fileUrl: '/sample-manuscript.pdf',
    reviewStatus: 'Accepted',
    createdAt: '2026-09-25T11:20:00Z',
  },
  {
    id: 'SUB-002',
    submissionId: 'ICCAQI-2026-9012',
    authorName: 'Ananya Sharma',
    email: 'ananya.s@yenepoya.edu.in',
    phone: '+91 99001 88234',
    institution: 'Yenepoya Institute of Technology',
    track: 'Quantum Computing and Quantum Intelligence',
    paperTitle: 'Quantum Error Mitigation Strategies in NISQ-Era Computing',
    abstract: 'We explore zero-noise extrapolation techniques to enhance quantum circuit fidelity on NISQ hardware...',
    fileUrl: '/sample-manuscript.pdf',
    reviewStatus: 'Under Review',
    createdAt: '2026-09-27T16:05:00Z',
  },
  {
    id: 'SUB-003',
    submissionId: 'ICCAQI-2026-7734',
    authorName: 'Prof. Michael Chang',
    email: 'mchang@stanford.edu',
    phone: '+1 650 492 1092',
    institution: 'Stanford University',
    track: 'Cyber-Physical Systems and IoT',
    paperTitle: 'Zero-Trust Architecture for Decentralized Smart City IoT Networks',
    abstract: 'A distributed ledger approach to securing sensor data across heterogeneous smart grid nodes...',
    fileUrl: '/sample-manuscript.pdf',
    reviewStatus: 'Under Review',
    createdAt: '2026-09-29T08:50:00Z',
  },
];

export function addLocalRegistration(reg: RegistrationRecord) {
  localRegistrations.unshift(reg);
}

export function addLocalSubmission(sub: SubmissionRecord) {
  localSubmissions.unshift(sub);
}

export function getLocalRegistrations(): RegistrationRecord[] {
  return localRegistrations;
}

export function getLocalSubmissions(): SubmissionRecord[] {
  return localSubmissions;
}

export function updateLocalRegistrationStatus(id: string, status: string) {
  const reg = localRegistrations.find((r) => r.id === id);
  if (reg) {
    reg.paymentStatus = status;
  }
}

export function updateLocalSubmissionStatus(id: string, status: string) {
  const sub = localSubmissions.find((s) => s.id === id);
  if (sub) {
    sub.reviewStatus = status;
  }
}
