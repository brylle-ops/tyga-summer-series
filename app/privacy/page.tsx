import type { Metadata } from "next";
import { Screen, TopNav } from "@/components/ui";

export const metadata: Metadata = { title: "Privacy · TYGA Summer Series" };

// Plain-English privacy policy for the Summer Series app. Update CONTACT before launch.
const CONTACT = "The Yard Gym Albury front desk, or message us through the gym's usual channels";
const UPDATED = "12 November 2026";

export default function Privacy() {
  return (
    <Screen>
      <TopNav title="Privacy" back="/" />
      <div className="eyebrow">TYGA 2026 Summer Series</div>
      <div className="h1">How we use your information</div>
      <p className="xs mute">Last updated {UPDATED}</p>

      <div className="card sm privacy">
        <h2>Who we are</h2>
        <p>The Summer Series app is run by The Yard Gym Albury (&quot;The Yard&quot;, &quot;we&quot;). We handle your personal information in line with the Australian Privacy Principles.</p>

        <h2>What we collect</h2>
        <ul>
          <li><b>Your details:</b> email, first and last name, and (for Yard members) the mobile number on your membership.</li>
          <li><b>Your Summer Series choices:</b> your goal, singlet fit, colour and size, and when you accepted the terms.</li>
          <li><b>Your payment record:</b> whether you&apos;ve paid for a singlet, the amount, the date and Square&apos;s payment reference. <b>We never see or store your card details</b> — payment is handled entirely by Square.</li>
          <li><b>Sign-in records:</b> when you sign in, and sign-in attempts, to keep accounts secure.</li>
          <li><b>Member list:</b> if your email is on the gym&apos;s member list (from our booking system), we use it only to fill in your name and mobile number. Anyone can use the app.</li>
          <li><b>During the series:</b> the sessions and workouts you log, points, missions, perks and Holiday Mode dates you set.</li>
        </ul>

        <h2>Why we use it</h2>
        <ul>
          <li>To sign you in and, if you order one, take payment for your singlet.</li>
          <li>To order and hand out your singlet.</li>
          <li>To run the series: points, levels, missions, perks, prize draws and the leaderboard.</li>
          <li>For staff to check in with members who might need a hand staying on track.</li>
        </ul>
        <p>We don&apos;t sell your information or use it for advertising, and we don&apos;t send marketing from this app.</p>

        <h2>Who can see it</h2>
        <ul>
          <li><b>You</b> can see your own details. Other members can&apos;t.</li>
          <li><b>The leaderboard</b> shows only your first name and last initial, and your points.</li>
          <li><b>Yard staff</b> running the series can see registrations, payments, singlet orders and your mobile number (to contact you about the series).</li>
          <li><b>Service providers</b> who run the app for us: Supabase (database and sign-in), Vercel (hosting), Square (payments) and our email provider (sign-in emails). Some of them may store data outside Australia. They only process it to provide their service.</li>
          <li>Our singlet supplier receives size totals only, never names.</li>
        </ul>

        <h2>How long we keep it</h2>
        <p>We keep your Summer Series information until the series ends (26 January 2027) and then for up to 6 months to finish prizes, perks and any refunds, after which we delete it. Payment records are also kept in Square as required for tax and accounting.</p>

        <h2>Your choices</h2>
        <ul>
          <li>You can ask to see, correct or delete your information at any time. Deleting it removes you from the series and the leaderboard.</li>
          <li>To ask, or if you have a privacy concern, contact {CONTACT}. We&apos;ll respond within 30 days.</li>
          <li>If you&apos;re not happy with our response, you can contact the Office of the Australian Information Commissioner (oaic.gov.au).</li>
        </ul>

        <h2>Keeping it safe</h2>
        <p>Sign-in uses one-time email codes (no passwords to steal), your connection is encrypted, and database rules stop anyone seeing another member&apos;s details.</p>
      </div>
    </Screen>
  );
}
