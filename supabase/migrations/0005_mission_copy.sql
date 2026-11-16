-- TYGA Summer Series — the seven weekly missions exactly as Amy listed them (15 pts each, unlock Monday, close Sunday).
-- Run after 0004. Safe to run twice.
update missions m set title = v.title, detail = v.detail
from (values
  (1, 'The Standards',        'Complete your weekly commitment of 3 sessions.'),
  (2, 'Wear the Singlet',     'Wear your Summer Series singlet to a class. Take a photo, tag @theyardgym_albury and use #SummerSeries.'),
  (3, 'Run It',               'Complete a run (any distance). Screenshot your Strava and share it to Instagram. Tag @theyardgym_albury #SummerSeries.'),
  (4, 'Hello, 2027!',         'Share a photo of how you''re welcoming the New Year. Tag @theyardgym_albury, use #SummerSeries #MaintainTheStandard.'),
  (5, 'Squad Session',        'Get a photo of 4 or more doing the Summer Series in the gym. Tag @theyardgym_albury and use #SummerSeries.'),
  (6, 'Fuel It',              'Prepare one of the Summer Series recipes. Take a photo or screenshot and upload it in the app.'),
  (7, 'Bring Your Plus One',  'Bring a friend, family member or someone new to a class (any class) for a free session. Tell the team who (app or FOH).')
) as v(week, title, detail)
where m.week = v.week and m.points = 15 and not m.is_secret;

update missions set title = 'Tag us in a workout', detail = 'Take a photo, tag @theyardgym_albury and use #SummerSeries.'
where points = 5 and not is_secret;

update missions set title = 'Bonus mission', detail = 'Announced by the team this week.'
where points = 10 and is_secret;
