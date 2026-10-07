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
  authorCategory?: string;
  publicationCategory?: string;
  track: string;
  paperTitle: string;
  abstract: string;
  fileUrl: string;
  reviewStatus: string;
  createdAt: string;
}

// Clean live data store for incoming registrations and submissions
const localRegistrations: RegistrationRecord[] = [];

const localSubmissions: SubmissionRecord[] = [];

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

export function deleteLocalRegistration(id: string) {
  const index = localRegistrations.findIndex((r) => r.id === id);
  if (index !== -1) {
    localRegistrations.splice(index, 1);
  }
}

export function deleteLocalSubmission(id: string) {
  const index = localSubmissions.findIndex((s) => s.id === id);
  if (index !== -1) {
    localSubmissions.splice(index, 1);
  }
}
