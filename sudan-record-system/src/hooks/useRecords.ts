import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recordService, type ListParams } from '@/services/recordService';
import { storageService } from '@/services/storageService';
import type { RecordInput } from '@/types';

/** Centralized query keys so invalidation stays consistent. */
export const recordKeys = {
  all: ['records'] as const,
  list: (params: ListParams) => ['records', 'list', params] as const,
  recent: () => ['records', 'recent'] as const,
  count: () => ['records', 'count'] as const,
  detail: (id: string) => ['records', 'detail', id] as const,
};

export function useRecordsList(params: ListParams) {
  return useQuery({
    queryKey: recordKeys.list(params),
    queryFn: () => recordService.list(params),
  });
}

export function useRecentRecords(limit = 5) {
  return useQuery({
    queryKey: recordKeys.recent(),
    queryFn: () => recordService.recent(limit),
  });
}

export function useRecordsCount() {
  return useQuery({
    queryKey: recordKeys.count(),
    queryFn: () => recordService.count(),
  });
}

export function useRecord(id: string | undefined) {
  return useQuery({
    queryKey: recordKeys.detail(id ?? ''),
    queryFn: () => recordService.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ input, createdBy }: { input: RecordInput; createdBy: string }) =>
      recordService.create(input, createdBy),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: recordKeys.all });
    },
  });
}

export function useUpdateRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<RecordInput> }) =>
      recordService.update(id, input),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: recordKeys.all });
      qc.setQueryData(recordKeys.detail(data.id), data);
    },
  });
}

export function useDeleteRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, photoUrl }: { id: string; photoUrl: string | null }) => {
      await recordService.remove(id);
      if (photoUrl) await storageService.deletePhoto(photoUrl);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: recordKeys.all });
    },
  });
}
