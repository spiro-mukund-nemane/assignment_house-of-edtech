import type { NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { handleApiError } from '@/lib/errors';
import { successResponse } from '@/utils/api-response';
import { addCollaboratorSchema, updateCollaboratorRoleSchema } from '@/validators/document.validator';
import { collaboratorService } from '@/services/collaborator.service';

type RouteParams = { params: Promise<{ id: string }> };
type CollaboratorRouteParams = { params: Promise<{ id: string; collaboratorId: string }> };

export async function add(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireSession();
    const { id } = await params;
    const body = await req.json();
    const input = addCollaboratorSchema.parse(body);
    const collaborator = await collaboratorService.addCollaborator(id, user.id, input);
    return successResponse(collaborator, 'Collaborator added', 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateRole(req: NextRequest, { params }: CollaboratorRouteParams) {
  try {
    const user = await requireSession();
    const { id, collaboratorId } = await params;
    const body = await req.json();
    const input = updateCollaboratorRoleSchema.parse(body);
    await collaboratorService.updateCollaboratorRole(id, collaboratorId, user.id, input);
    return successResponse(null, 'Collaborator role updated');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function remove(_req: NextRequest, { params }: CollaboratorRouteParams) {
  try {
    const user = await requireSession();
    const { id, collaboratorId } = await params;
    await collaboratorService.removeCollaborator(id, collaboratorId, user.id);
    return successResponse(null, 'Collaborator removed');
  } catch (error) {
    return handleApiError(error);
  }
}
