
// src/app/api/lemonsqueezy-webhook/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
// For a real implementation, you'd use a crypto library for signature verification
// import crypto from 'crypto';

// IMPORTANT: Store your Lemon Squeezy Webhook Signing Secret in an environment variable
const LEMONSQUEEZY_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!LEMONSQUEEZY_WEBHOOK_SECRET) {
    console.error('Lemon Squeezy Webhook Secret is not configured.');
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 });
  }

  try {
    const rawBody = await request.text(); // Get raw body for signature verification
    const signature = request.headers.get('X-Signature');

    // TODO: Implement actual signature verification
    // This is a critical security step. Without it, anyone could call your endpoint.
    // Example (conceptual, requires 'crypto' module and proper setup):
    // const hmac = crypto.createHmac('sha256', LEMONSQUEEZY_WEBHOOK_SECRET);
    // const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    // const receivedSignature = Buffer.from(signature || '', 'utf8');
    // if (!crypto.timingSafeEqual(digest, receivedSignature)) {
    //   console.warn('Invalid webhook signature.');
    //   return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
    // }
    // For this prototype, we'll bypass signature verification.
    // In production, DO NOT bypass this.
    if (!signature) { // Basic check for presence in prototype
        console.warn('Missing X-Signature header. Bypassing verification for prototype.');
    }


    const payload = JSON.parse(rawBody); // Parse after (potential) verification

    // Log the payload for debugging purposes (remove in production)
    // console.log('Received Lemon Squeezy Webhook Payload:', JSON.stringify(payload, null, 2));

    const eventName = payload.meta?.event_name;
    const customData = payload.meta?.custom_data;
    const eventId = customData?.event_id;

    if (eventName === 'order_created') {
      if (!eventId) {
        console.warn('Webhook: order_created event received, but no event_id found in custom_data.');
        return NextResponse.json({ error: 'Missing event_id in custom_data.' }, { status: 400 });
      }

      console.log(`Webhook: Processing order_created for eventId: ${eventId}`);

      try {
        const eventDocRef = doc(db, 'events', eventId as string);
        const eventSnap = await getDoc(eventDocRef);

        if (!eventSnap.exists()) {
          console.warn(`Webhook: Event with ID ${eventId} not found in Firestore.`);
          return NextResponse.json({ error: `Event ${eventId} not found.` }, { status: 404 });
        }
        
        if (eventSnap.data()?.isPremium) {
            console.log(`Webhook: Event ${eventId} is already premium.`);
            return NextResponse.json({ message: `Event ${eventId} already premium.` }, { status: 200 });
        }

        await updateDoc(eventDocRef, {
          isPremium: true,
        });

        console.log(`Webhook: Successfully upgraded event ${eventId} to premium.`);
        return NextResponse.json({ message: 'Webhook processed successfully, event upgraded.' }, { status: 200 });
      
      } catch (dbError) {
        console.error(`Webhook: Firestore error updating event ${eventId}:`, dbError);
        return NextResponse.json({ error: 'Failed to update event in database.' }, { status: 500 });
      }
    } else {
      // You can handle other event types if needed
      // console.log(`Webhook: Received unhandled event_name: ${eventName}`);
      return NextResponse.json({ message: `Event ${eventName} received but not processed.` }, { status: 200 });
    }

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed.', details: error.message }, { status: 400 });
  }
}
