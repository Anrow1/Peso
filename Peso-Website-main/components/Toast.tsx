'use client';

import { useAuth } from '@/lib/useAuth';

export default function Toast() {
  const { toast } = useAuth();
  if (!toast) return null;
  return (
    <div className="toast">
      <span className="dot" />
      {toast}
    </div>
  );
}
