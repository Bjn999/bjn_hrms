'use client';
import GenericSettingsPage from '@/components/GenericSettingsPage';
export default function BloodGroupsPage() {
  return <GenericSettingsPage titleKey="blood_groups" nameKey="blood_group_name" addKey="add_blood_group" editKey="edit_blood_group" apiEndpoint="blood-groups" />;
}
