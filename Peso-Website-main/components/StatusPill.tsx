import { EffectiveStatus } from '@/lib/types';

export default function StatusPill({ status }: { status: EffectiveStatus | string }) {
  return <span className={`status-pill status-${status}`}>{status}</span>;
}
