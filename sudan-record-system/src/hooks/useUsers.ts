import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import type { UserRole } from '@/types';

export const userKeys = {
  all: ['users'] as const,
  list: () => ['users', 'list'] as const,
};

export function useUsersList() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: () => userService.list(),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      userService.updateRole(userId, role),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => userService.remove(userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
