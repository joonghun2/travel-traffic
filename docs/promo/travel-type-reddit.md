# Travel Stats Test — Reddit comment drafts

Comment-only plan: answer existing questions; don't start promo posts. Post these yourself, edited to fit each thread.

**Link:** `https://www.checkeastpoint.com/en/play/travel-type?utm_source=reddit&utm_medium=social&utm_campaign=travel-type`
(Change the end to `utm_campaign=travel-type-<subreddit>` to see each subreddit separately in GA.)

## Rules for every comment

1. **Answer the question first, without a link.** The link goes at the end, in one line.
2. **Disclose it's yours:** "I made this", "my side project".
3. **At most 2–3 a day**, never the same text twice. Rewrite each one for the thread.
4. **Mix in link-free helpful comments** for the first one or two weeks to build the account's history.
5. **Where it fits:** r/koreatravel, r/seoul (check the weekly thread rules), r/solotravel (only when Korea comes up), r/travel (only for Korea questions). Skip r/korea.

---

## A. "First solo trip to Korea, where should I go besides Seoul?"

> If you like quiet and wandering, Jeju's east side is great solo: Jongdal-ri (where Olle Trail 1 ends) and low oreum like Abu Oreum are calm even when the famous spots are packed. If you'd rather have energy and food, Busan's Yeongdo (Huinnyeoul village, the coastal path) is easy by bus and very walkable.
>
> If you're not sure which kind of traveller you are, I made a short quiz that scores six travel "stats" and suggests local places that match (free, no sign-up, my side project): <link>

## B. "Seoul itinerary check: is this too packed?"

> It's ambitious. Palaces and N Seoul Tower take longer than people expect, and the queues at midday are the real time sink. Put Gyeongbokgung right at opening and save the tower for a weekday evening.
>
> Half joking, but if you score high on "planning" and low on "crowd tolerance" you'll hate this schedule by day two. I made a quick quiz for exactly that (my project): <link>

## C. "Travelling with a friend who wants totally different things"

> Classic. What usually works: mornings together on the shared must-sees, afternoons split, then meet for dinner. Pick one neighbourhood per day so splitting up is easy.
>
> If you want to settle it with data 😄, I made a quiz where you both take it and it overlays your two stat charts and gives a "travel match" score (free, my side project): <link>

## D. "Hidden gems in Seoul that aren't on every TikTok?"

> Seochon is still underrated: Suseongdong Valley under Inwangsan feels like you've left the city. Buam-dong's Baeksasil Valley is another quiet one, and Mullae's metal-workshop alleys are fun if you like the industrial look.
>
> I keep a list like this sorted by travel style, plus live crowd levels for the busy places (my project): <link>

## E. "Jeju or Busan for a 3-day trip?"

> Depends on what recharges you. Jeju is nature and slow days, and you really want a car or taxi. Busan is city plus beach with an easy subway, and good food late at night.
>
> I made a quiz that weighs exactly this (how social, how active, how much crowds bother you) and points you to Seoul, Jeju or Busan spots (free, my side project): <link>

---

## Japanese / Chinese communities (X or Threads, not Reddit)

- **JA:** ソウル・済州・釜山の旅の「能力値」を6つのグラフで診断するテストを作りました（個人開発・無料・登録不要）。結果に合わせて本物のローカルスポットと空いている時間をおすすめします。友達と相性比べもできます → https://www.checkeastpoint.com/ja/play/travel-type?utm_source=x&utm_medium=social&utm_campaign=travel-type
- **ZH (Threads / Xiaohongshu-style caption):** 做了一个旅行能力值测试：6项能力值雷达图＋首尔／济州／釜山在地推荐＋和朋友比契合度（个人开发，免费）→ https://www.checkeastpoint.com/zh-cn/play/travel-type?utm_source=threads&utm_medium=social&utm_campaign=travel-type

## Viral hooks already built in

- Every result has a share link that shows *your* radar to friends, and a "send a match test" link that overlays both charts.
- Feed (1080×1350) and story (1080×1920) cards with your stats and a QR code (`utm_source=card`).
- 8 type pages (`/play/travel-type/result/...`) are in the sitemap, so they can rank for searches like "travel personality test Korea".

## How to measure

GA4 → Reports → Engagement → Events: `travel_type_start`, `travel_type_complete` (with `result` and `compare`), `travel_type_card`, `share`. Compare `travel_type_complete / travel_type_start` (completion rate) and `compare=true` (friend-match share loop).
