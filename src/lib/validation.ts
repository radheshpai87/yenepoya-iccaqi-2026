/**
 * Server-side input & file validation helpers
 */

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return EMAIL_REGEX.test(email);
}

export function sanitizeText(str: string, maxLength: number = 500): string {
  if (!str) return '';
  return str.trim().slice(0, maxLength);
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ALLOWED_EXTENSIONS = new Set(['pdf', 'doc', 'docx']);

export function validateUploadedFile(file: File | null): { valid: boolean; error?: string } {
  if (!file) return { valid: true }; // File is optional unless required

  // 1. Size Validation (Max 15MB)
  const MAX_SIZE_BYTES = 15 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: 'File size exceeds maximum limit of 15MB' };
  }

  // 2. Extension Validation
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: 'Invalid file format. Only PDF and Word documents are permitted' };
  }

  // 3. MIME Type Validation
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
    return { valid: false, error: 'Invalid document MIME type' };
  }

  return { valid: true };
}
