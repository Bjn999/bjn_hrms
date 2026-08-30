'use client';
import GenericSettingsPage from '@/components/GenericSettingsPage';
export default function ReligionsPage() {
  return <GenericSettingsPage titleKey="religions" nameKey="religion_name" addKey="add_religion" editKey="edit_religion" apiEndpoint="religions" />;
}
