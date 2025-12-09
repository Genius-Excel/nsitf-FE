import BranchLayout from '@/parts/branch/BranchLayout';
import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <BranchLayout>{children}</BranchLayout>;
}
