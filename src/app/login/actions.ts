'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in a real app you should validate the passed formData using zod
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Hackathon backdoor to avoid Supabase Rate Limits:
  if (data.email === 'admin@admin.com') {
    const cookieStore = await cookies()
    cookieStore.set('hackathon-bypass', 'true', { path: '/' })
    return { success: true }
  }

  // Bypass Supabase if using dummy credentials
  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('dummy-project')) {
    return { success: true }
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Hackathon backdoor to avoid Supabase Rate Limits:
  if (data.email === 'admin@admin.com') {
    const cookieStore = await cookies()
    cookieStore.set('hackathon-bypass', 'true', { path: '/' })
    return { success: true }
  }

  // Bypass Supabase if using dummy credentials
  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('dummy-project')) {
    return { success: true }
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
