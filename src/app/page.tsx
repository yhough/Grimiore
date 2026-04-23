import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import HomePageClient from './_home'

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) redirect('/signup')
  return <HomePageClient />
}
