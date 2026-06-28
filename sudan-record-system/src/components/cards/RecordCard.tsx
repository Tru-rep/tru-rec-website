import { Link } from 'react-router-dom';
import { Avatar } from '@/components/common/Avatar';
import { formatDate } from '@/utils/format';
import { paths } from '@/routes/paths';
import type { RecordSummary } from '@/types';

/** Compact, tappable card used in search results and lists. */
export function RecordCard({ record }: { record: RecordSummary }) {
  return (
    <Link
      to={paths.recordDetails(record.id)}
      className="card-base flex items-center gap-3 p-3 transition hover:border-brand-400 hover:shadow-md"
    >
      <Avatar src={record.photo_url} name={record.full_name} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
          {record.full_name}
        </p>
        {record.nickname && (
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            «{record.nickname}»
          </p>
        )}
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {record.profession || 'بدون مهنة'} · {formatDate(record.created_at)}
        </p>
      </div>
      <span className="text-slate-300 dark:text-slate-600">‹</span>
    </Link>
  );
}
