import { Link } from 'react-router-dom';
import { Avatar } from '@/components/common/Avatar';
import { formatDate } from '@/utils/format';
import { paths } from '@/routes/paths';
import type { RecordSummary } from '@/types';

export function RecordCard({ record }: { record: RecordSummary }) {
  return (
    <Link
      to={paths.recordDetails(record.id)}
      className="card-base flex items-center gap-3 p-4 transition hover:border-brand-200 hover:shadow-card-lg"
    >
      <Avatar src={record.photo_url} name={record.full_name} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-charcoal">{record.full_name}</p>
        {record.nickname && (
          <p className="truncate text-xs text-slate-500">اللقب: {record.nickname}</p>
        )}
        {record.report_number && (
          <p className="truncate text-xs text-slate-500" dir="ltr">
            رقم البلاغ: {record.report_number}
          </p>
        )}
        <p className="truncate text-xs text-slate-400">
          {record.profession || 'بدون مهنة'} · {formatDate(record.created_at)}
        </p>
      </div>
      <span className="text-brand-300">‹</span>
    </Link>
  );
}
