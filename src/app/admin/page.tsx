import { Suspense } from 'react';
import { AdminApp } from '@/components/admin/shell';
import { AdminSkeleton, LoadProblem } from '@/components/admin/skeleton';
import { requireAdmin } from '@/lib/auth/session';
import { getDraftDocument, type DraftDocument } from '@/lib/content/store';
import { storageMode } from '@/lib/storage';

export const instant = false;

export default function AdminPage() {
  return (
    <div className="admin">
      <Suspense fallback={<AdminSkeleton />}>
        <AdminLoader />
      </Suspense>
    </div>
  );
}

async function AdminLoader() {
  await requireAdmin();

  let draftDocument: DraftDocument;
  try {
    draftDocument = await getDraftDocument();
  } catch (error) {
    console.error('Could not read the draft:', error);
    return <LoadProblem />;
  }

  return <AdminApp initial={draftDocument} storage={storageMode()} />;
}
