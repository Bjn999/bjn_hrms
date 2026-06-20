'use client';
import GenericSettingsPage from '@/components/GenericSettingsPage';
export default function NationalitiesPage() {
  return <GenericSettingsPage titleKey="nationalities" nameKey="nationality_name" addKey="add_nationality" editKey="edit_nationality" apiEndpoint="nationalities" />;
}
