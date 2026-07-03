import type { NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { handleApiError } from '@/lib/errors';
import { successResponse } from '@/utils/api-response';
import { createDocumentSchema, updateDocumentSchema } from '@/validators/document.validator';
import { documentService } from '@/services/document.service';

type RouteParams = { params: Promise<{ id: string }> };

export async function list() {
  try {
    const user = await requireSession();
    const documents = await documentService.listDocumentsForUser(user.id);
    return successResponse(documents);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function create(req: NextRequest) {
  try {
    const user = await requireSession();
    const body = await req.json().catch(() => ({}));
    const input = createDocumentSchema.parse(body);
    const document = await documentService.createDocument(user.id, input);
    return successResponse(document, 'Document created', 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function get(_req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireSession();
    const { id } = await params;
    const document = await documentService.getDocument(id, user.id);
    return successResponse(document);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function update(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireSession();
    const { id } = await params;
    const body = await req.json();
    const input = updateDocumentSchema.parse(body);
    const document = await documentService.updateDocument(id, user.id, input);
    return successResponse(document, 'Document updated');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function remove(_req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireSession();
    const { id } = await params;
    await documentService.deleteDocument(id, user.id);
    return successResponse(null, 'Document deleted');
  } catch (error) {
    return handleApiError(error);
  }
}
