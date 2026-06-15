import { redirect } from 'next/navigation';

// Alias: /list-your-company/founding → /founding (canonical landing page).
export default function FoundingAlias() {
  redirect('/founding');
}
