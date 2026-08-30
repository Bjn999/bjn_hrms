'use client';
import GenericSettingsPage from '@/components/GenericSettingsPage';
export default function ResignationsPage() {
  return <GenericSettingsPage titleKey="resignations" nameKey="resignation_name" addKey="add_resignation" editKey="edit_resignation" apiEndpoint="resignations" />;
}
