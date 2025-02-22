'use server';

import { revalidatePath } from 'next/cache';
import { auth, signIn, signOut } from './auth';
import { supabase } from './supabase';

export async function updateProfile(formData) {
	const session = await auth();
	if (!session) throw new Error('You must be signed in to update your profile');

	// Extract and validate national ID
	const nationalID = formData.get('nationalID');
	if (!nationalID || !/^[a-zA-Z0-9]{6,12}$/.test(nationalID)) {
		return { error: 'National ID must be between 6 and 12 alphanumeric characters' };
	}

	// Extract and validate nationality & countryFlag
	const nationalityString = formData.get('nationality');
	if (!nationalityString || !nationalityString.includes('%')) {
		return { error: 'Invalid nationality format' };
	}
	const [nationality, countryFlag] = nationalityString.split('%');

	// Update database
	const updatedData = { nationality, countryFlag, nationalID };
	const { error } = await supabase
		.from('guests')
		.update(updatedData)
		.eq('id', session.user.guestId);

	if (error) {
		console.error(error);
		return { error: 'Guest could not be updated' };
	}

	// Revalidate cache
	revalidatePath('/account/profile');
	
	return { success: true, message: 'Profile updated successfully' };
}

export async function signInAction() {
	await signIn('google', { redirectTo: '/account' });
}

export async function signOutAction() {
	await signOut({ redirectTo: '/' });
}
