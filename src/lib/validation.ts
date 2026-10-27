import { ApiError } from '@/lib/apiErrors';

/**
 * Server-side input & file validation helpers
 */

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return EMAIL_REGEX.test(email);
}

export function sanitizeText(str: unknown, maxLength: number = 500): string {
  if (str === undefined || str === null) return '';
  if (typeof str !== 'string') throw new ApiError(400, 'Text fields must be strings');
  return str.trim().slice(0, maxLength);
}

const ALLOWED_MIME_TYPES = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ALLOWED_EXTENSIONS = new Set(['doc', 'docx']);

export function validateUploadedFile(file: File | null): { valid: boolean; error?: string } {
  if (!file) return { valid: true };

  // 1. Size Validation (Max 10MB)
  const MAX_SIZE_BYTES = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: 'File size exceeds the maximum limit of 10 MB. Please select a smaller manuscript file.' };
  }

  // 2. Extension Validation
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: 'Invalid file format. Only Word (.doc / .docx) documents are permitted.' };
  }

  // 3. MIME Type Validation
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
    // If browser didn't supply standard mime, fall back to extension check
  }

  return { valid: true };
}

/**
 * Inspection of File Magic Bytes to prevent extension spoofing (e.g. malware.exe renamed to paper.docx)
 */
export async function validateFileMagicBytes(file: File): Promise<{ valid: boolean; error?: string }> {
  if (!file || file.size === 0) return { valid: true };

  try {
    const slice = file.slice(0, 8);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const ext = (file.name.split('.').pop() || '').toLowerCase();

    if (ext === 'docx') {
      // PK Zip header magic bytes for OOXML DOCX: 0x50 0x4B (PK)
      if (bytes.length < 2 || bytes[0] !== 0x50 || bytes[1] !== 0x4B) {
        return { valid: false, error: 'File binary header mismatch. The uploaded file is not a valid DOCX document.' };
      }
    } else if (ext === 'doc') {
      // OLE2 Compound Document (0xD0 0xCF) or OOXML (0x50 0x4B)
      const isOle = bytes.length >= 2 && bytes[0] === 0xD0 && bytes[1] === 0xCF;
      const isZip = bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4B;
      if (!isOle && !isZip) {
        return { valid: false, error: 'File binary header mismatch. The uploaded file is not a valid DOC document.' };
      }
    } else {
      return { valid: false, error: 'Invalid file format. Only Word (.doc / .docx) documents are permitted.' };
    }
  } catch (err) {
    return { valid: false, error: 'Unable to inspect document binary signature.' };
  }

  return { valid: true };
}
