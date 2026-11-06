# Common Client Feedback: lessons from round 1

Read this alongside `CLIENT_RULES.md` and `SITE_BRIEF.md`. It collects the issues the client raised on **several** of the first 15 websites, so the new batch can avoid them from the start. One-off preferences and requests that go against good practice are left out on purpose. Use your judgement in how you apply these; they describe what the reviewer looks for, not exact implementations.

---

## 1. Blog: the most-reported area

- Every blog card ("Read article" / "Read more") should open **its own article** with real content: title, cover, author and body. Several sites sent every card to the same page or post.
- If pagination is shown, it must work. Pages 2 and 3 should hold different posts, and Prev/Next should only appear when they do something. With only one page of posts, don't show pagination.
- Topic or category chips should filter the posts or link to matching articles, not do nothing.
- Give each article its own cover image and its own author (name and photo). Repeated pictures and avatars were flagged on many sites.
- Keep the grid complete (e.g. 6 cards in a 3-column grid), with no stretched or half-empty last row.

## 2. Card alignment: the most frequent complaint overall

- Across a row of cards, titles, descriptions, prices and buttons should sit on the **same horizontal lines**, even when one title wraps to two lines. CSS Grid `subgrid`, equal-height cards and a reserved title height all handle this well.
- Testimonial author names should line up across cards.
- Intro text should sit directly under its section heading, with a consistent structure from section to section.
- Re-check card rows at 1024px and 768px. Four squeezed columns at 1024px usually read better as two.

## 3. Hero and images

- Hero background images should be **clearly visible in both light and dark themes**. Several sites used overlays that were too heavy. Use a lighter overlay, keep the text readable, and choose sharp photos.
- Images should be relevant to the business and the text beside them.
- Images should fill their containers without cropping faces or heads.
- Inner-page heroes should look consistent in size across the site.

## 4. Dashboard sites (where SITE_BRIEF says Dashboard: Yes)

- The reviewer marked the dashboard as "missing" when it couldn't be reached from the navbar. Put a **Dashboard** link and a **Login** button in the navbar on every page.
- The dashboard page shouldn't carry the full marketing navbar. Keep a simple app header instead.
- Login and sign-up images should display fully and look the same on both pages.
- Buttons on the dashboard (downloads, actions) should give visible feedback instead of doing nothing.

## 5. Navigation

- Keep a sensible order: **Home, About, [site-specific pages], Blog, Contact**, the same on desktop, the mobile menu and the footer.
- At tablet widths (768px and 1024px), show the theme toggle, RTL toggle and CTA in the navbar **or** in the hamburger menu, not both. Keep them neatly aligned.
- Make every link and CTA go somewhere meaningful. Two buttons next to each other shouldn't lead to the same page.
- Only the main navbar should be sticky. Secondary strips (service tabs, filter bars) shouldn't stick or look glued to the hero.

## 6. Footer

- Show an icon next to the address, phone and email.
- Add **Privacy Policy** and **Terms of Service** links, with simple pages behind them. This was raised on several sites.
- Keep the footer compact and balanced, without large empty areas. Contact details on the left and social icons on the right worked well.
- Footer link labels should match the main navigation.

## 7. Centering and layout

- Center FAQ sections: the heading above a single, centred list of questions.
- Present milestones and timelines as a centred, vertical timeline.
- Avoid excessive empty space between sections, and leave enough breathing room between images and their text.

## 8. Forms

- For email fields, normalize input to lowercase automatically. The reviewer flagged "Test@GMAIL.com" being accepted. **Don't reject** uppercase addresses, because emails are case-insensitive.
- Keep form labels modest in size so they don't overpower the inputs. Add placeholder text to fields.

## 9. RTL and contrast

- In RTL mode, punctuation in English sentences should stay at the **end** of the sentence. Use `dir="auto"` or `unicode-bidi: plaintext` on text blocks.
- Check text contrast in both themes on every page, including the footer and any decorative text.

## 10. Content depth

- Inner pages (About, Portfolio/Transformations, Services) were called thin on some sites. Give each a few meaningful sections with relevant images.

---

### Quick self-check before hand-off
- Does every blog card open its own article, and does pagination work (or is it hidden)?
- Do card rows line up at 1440, 1024, 768 and 360px?
- Are hero images clear in both themes?
- On dashboard sites, are Dashboard and Login in the navbar?
- Does the footer have contact icons and Privacy/Terms links?
- Are there no repeated images or authors?
- Are FAQs and timelines centred?
- Does RTL punctuation look right?
