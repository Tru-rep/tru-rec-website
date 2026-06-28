import { useState } from 'react';
import { useRecordsList } from '@/hooks/useRecords';
import { useDebounce } from '@/hooks/useDebounce';
import { RecordCard } from '@/components/cards/RecordCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingState, EmptyState, ErrorState } from '@/components/common/StateViews';
import { PAGE_SIZE } from '@/utils/constants';

export default function SearchPage() {
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(term, 350);

  const search = debounced.trim();
  const query = useRecordsList({ page, pageSize: PAGE_SIZE, search });

  const totalPages = query.data ? Math.max(1, Math.ceil(query.data.total / PAGE_SIZE)) : 1;

  function onTermChange(value: string) {
    setTerm(value);
    setPage(1);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-charcoal">البحث في السجلات</h1>
        <p className="text-sm text-slate-500">ابحث بالاسم، اللقب، المهنة أو العنوان</p>
      </div>

      <div className="card-base flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <Input
          type="search"
          value={term}
          onChange={(e) => onTermChange(e.target.value)}
          placeholder="اكتب اسم أو لقب للبحث..."
          autoFocus
          className="flex-1"
        />
        <Button className="w-full shrink-0 sm:w-auto">بحث</Button>
      </div>

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : query.data && query.data.items.length > 0 ? (
        <>
          <p className="text-xs font-medium text-slate-500">{query.data.total} نتيجة</p>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {query.data.items.map((r) => (
              <RecordCard key={r.id} record={r} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                السابق
              </Button>
              <span className="text-sm text-slate-600">
                {page} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                التالي
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title={search ? 'لا توجد نتائج' : 'ابدأ البحث'}
          message={search ? 'جرّب كلمات بحث مختلفة.' : 'اكتب في حقل البحث لعرض السجلات.'}
        />
      )}
    </div>
  );
}
