'use server';

import { revalidatePath } from 'next/cache';
import { auth, signIn, signOut } from './auth';
import { supabase } from './supabase';
import { getBookings } from './data-service';
import { redirect } from 'next/navigation';

// Update the guest's profile
export async function updateProfile(formData) {
	const session = await auth();
	if (!session) throw new Error('You must be signed in to update your profile');

	// Extract and validate national ID
	const nationalID = formData.get('nationalID');
	if (!nationalID || !/^[a-zA-Z0-9]{6,12}$/.test(nationalID)) {
		return {
			error: 'National ID must be between 6 and 12 alphanumeric characters',
		};
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

export async function deleteReservation(bookingId) {
	const session = await auth();
	if (!session) throw new Error('You must be signed in to update your profile');

	const guestBookings = await getBookings(session.user.guestId);
	const guestBookingsIds = guestBookings.map((booking) => booking.id);
	if (!guestBookingsIds.includes(bookingId))
		throw new Error('You are not authorized to delete this booking');

	const { error } = await supabase
		.from('bookings')
		.delete()
		.eq('id', bookingId);

	if (error) throw new Error('Booking could not be deleted');
	revalidatePath('/account/reservations');
}

// Update the booking's details
export async function updateBooking(formData) {
	// Authenticating the user
	const session = await auth();
	if (!session) throw new Error('You must be signed in to update your profile');

	const bookingId = Number(formData.get('bookingId'));
	console.log('Submitted bookingId:', bookingId); // Log the submitted ID
	console.log('User guestId:', session.user.guestId); // Log the guestId from session

	const guestBookings = await getBookings(session.user.guestId);
	console.log('Guest bookings:', guestBookings); // Log all fetched bookings
	const guestBookingsIds = guestBookings.map((booking) => booking.id);

	if (!guestBookingsIds.includes(bookingId)) {
		console.error('Authorization failed. Submitted bookingId:');
		throw new Error('You are not authorized to edit this booking');
	}

	const updateData = {
		numGuests: Number(formData.get('numGuests')),
		observations: formData.get('observations').slice(0, 500),
	};

	const { error } = await supabase
		.from('bookings')
		.update(updateData)
		.eq('id', bookingId)
		.select()
		.single();

	if (error) {
		throw new Error('Booking could not be updated');
	}

	revalidatePath(`/account/reservations/edit/${bookingId}`);
	redirect('/account/reservations');
}

// Sign in and sign out actions
export async function signInAction() {
	await signIn('google', { redirectTo: '/account' });
}

export async function signOutAction() {
	await signOut({ redirectTo: '/' });
}
