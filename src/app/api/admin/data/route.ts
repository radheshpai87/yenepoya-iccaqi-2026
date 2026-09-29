import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/adminAuth';

// In-memory initial data (will sync with Supabase when credentials are populated)
let initialRegistrations = [
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

let initialSubmissions = [
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

// Verify authorization for all data access
async function isAuthorized() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  return verifySessionToken(sessionCookie?.value);
}

export async function GET() {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  return NextResponse.json({
    registrations: initialRegistrations,
    submissions: initialSubmissions,
  });
}

export async function PATCH(request: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, id, paymentStatus, reviewStatus } = body;

    if (type === 'registration') {
      initialRegistrations = initialRegistrations.map((reg) =>
        reg.id === id ? { ...reg, paymentStatus: paymentStatus || reg.paymentStatus } : reg
      );
    } else if (type === 'submission') {
      initialSubmissions = initialSubmissions.map((sub) =>
        sub.id === id ? { ...sub, reviewStatus: reviewStatus || sub.reviewStatus } : sub
      );
    }

    return NextResponse.json({
      success: true,
      registrations: initialRegistrations,
      submissions: initialSubmissions,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
  }
}
