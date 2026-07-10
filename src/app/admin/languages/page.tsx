'use client';

import GenericSettingsPage from '@/components/GenericSettingsPage';

export default function LanguagesPage() {
  return (
    <GenericSettingsPage 
      titleKey="languages" 
      nameKey="language_name" 
      addKey="add_language" 
      editKey="edit_language" 
      apiEndpoint="languages" 
    />
  );
}
