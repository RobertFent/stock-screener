import { withApiAuthAndTryCatch } from '@/lib/auth/middleware';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const POST = withApiAuthAndTryCatch<
	[Request],
	{ success: boolean } | { error: string }
>(async (user, req) => {
	const { name, email, message } = await req.json();

	await resend.emails.send({
		from: 'noreply@stock-screener.app',
		to: 'support@stock-screener.app',
		replyTo: email,
		subject: `Contact form: ${name}`,
		text: `From: ${name}; userId: ${user.id}; email: ${email}\n\n${message}`
	});

	return NextResponse.json({ success: true }, { status: 200 });
});
