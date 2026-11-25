update rewards
set image_url = replace(image_url, '.webp', '-v2.webp')
where image_url in (
  'https://tyga-summer-series.vercel.app/img/rewards/drink-bottle.webp',
  'https://tyga-summer-series.vercel.app/img/rewards/leather-key-ring.webp'
);
