'use server';

import { auth, signIn, signOut } from './auth';
import { supabase } from './supabase';

export async function updateProfile(formData) {
	const session = await auth();
	if (!session) throw new Error('You must be signed in to update your profile');
	// Here we would update the user profile with the formData
	// For example, we would call the updateGuest function from data-service.js
	const nationalID = formData.get('nationalID');
	const [nationality, countryFlag] = formData.get('nationality').split('%');

	if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID)) {
		throw new Error(
			'National ID must be between 6 and 12 alphanumeric characters'
		);
	}
	const updatedData = { nationality, countryFlag, nationalID };
	const { data, error } = await supabase
		.from('guests')
		.update(updatedData)
		.eq('id', session.user.guestId);

	if (error) {
		console.error(error);
		throw new Error('Guest could not be updated');
	}
}

export async function signInAction() {
	await signIn('google', { redirectTo: '/account' });
}
export async function signOutAction() {
	await signOut({ redirectTo: '/' });
}
