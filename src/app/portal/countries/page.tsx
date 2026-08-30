'use client';
import GenericSettingsPage from '@/components/GenericSettingsPage';
export default function CountriesPage() {
  return <GenericSettingsPage titleKey="countries" nameKey="country_name" addKey="add_country" editKey="edit_country" apiEndpoint="countries" />;
}
