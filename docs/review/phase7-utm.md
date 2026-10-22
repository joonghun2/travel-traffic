# Phase 7 — UTM rules

Every link that leaves the site through a share button, widget, card or poster carries UTM tags, built by `withUtm()` in `src/lib/utm.ts`. In GA4, see them under **Reports → Acquisition → Traffic acquisition** (session source / medium / campaign).

| Where | utm_source | utm_medium | utm_campaign | utm_content |
|---|---|---|---|---|
| Share sheet (spot page) | kakao, x, line, whatsapp, facebook, wechat, copy, native | share | spot-share | – |
| Share sheet (food test result) | same as above | share | food-test | – |
| Share sheet (other play pages) | same as above | share | play-share | – |
| Share sheet (theme hub) | same as above | share | theme-share | – |
| Daily TOP5 card QR | card | image | daily-top5 | `{city}-{feed\|story}` |
| Food test story card QR | card | image | food-test | `{type}-story` |
| Embed widget link | embed | widget | badge | spot slug |
| A4 poster QR | poster | qr | poster | language code |

## Rules for new links

- `utm_source` = the place the link is posted (a channel or a printed/embedded object), lowercase.
- `utm_medium` = one of `share`, `widget`, `qr`, `image`.
- `utm_campaign` = the feature, in kebab-case.
- For Reddit posts, add the tags by hand, e.g. `?utm_source=reddit&utm_medium=social&utm_campaign=r-koreatravel`.
- Never put personal data in UTM values.
