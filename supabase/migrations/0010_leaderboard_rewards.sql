-- TYGA Summer Series: leaderboard rewards with photos.
-- The drink bottle moves from Week 1 (top 10) to Week 5 (top 30). Week 1 becomes a leather key ring for the top 20.
-- Run once in Supabase → SQL Editor. Safe to run twice.
update rewards set
  week = 5,
  title = 'Top 30 win a Yard Gym drink bottle',
  description = 'The top 30 members on the Week 5 leaderboard each receive an exclusive Yard Gym drink bottle.',
  eligibility = 'Top 30 by verified Week 5 points at the weekly cutoff. Staff confirm the winners.',
  how_to = 'Climb the Week 5 leaderboard. Winners are notified in the app and collect at The Yard.',
  winners_count = 30,
  image_url = 'https://tyga-summer-series.vercel.app/img/rewards/drink-bottle.webp'
where kind = 'leaderboard' and title ilike '%drink bottle%';

insert into rewards (week, kind, title, partner, description, eligibility, how_to, expires_on, winners_count, published, image_url)
select 1, 'leaderboard', 'Top 20 win a leather Yard Gym key ring', 'The Yard Gym',
  'The top 20 members on the Week 1 leaderboard each receive a leather Yard Gym key ring.',
  'Top 20 by verified Week 1 points at the weekly cutoff. Staff confirm the winners.',
  'Climb the Week 1 leaderboard. Winners are notified in the app and collect at The Yard.',
  '2027-01-26', 20, true,
  'https://tyga-summer-series.vercel.app/img/rewards/leather-key-ring.webp'
where not exists (select 1 from rewards where week = 1 and title ilike '%leather%key ring%');

select week, title, winners_count, published from rewards order by week, id;
