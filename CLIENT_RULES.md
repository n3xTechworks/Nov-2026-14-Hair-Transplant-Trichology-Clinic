# CLIENT RULES (do not modify the client text below)

NOTE: Where the checklist says "Dashboard: No", the per-site brief (SITE_BRIEF.md) overrides it. If SITE_BRIEF.md says Dashboard: Yes, the Authentication Pages section (#8) applies and the "Login/Sign Up is not required" line does not.

---

## General Brief

Develop the complete frontend using only HTML, CSS (can use tailwind but optional), and JavaScript. Each website must include all required pages, such as Home 1, Home 2, About, Contact, Blog, and any additional pages specified by the client. If a dashboard is required, create a login page with sign-up, Google, and Apple sign-in options. Ensure that logos and brand names redirect to the home page, CTAs are properly aligned, fonts are consistent, images are used inside containers instead of icons, and all forms have proper validation. Do the unit testing once complete, hand over the project.

If a dashboard is required, create only the dashboard UI design without backend integration or real data. This is a frontend only project, and no database or backend connectivity is required.

## General Website Checklist

### 1. Global / Branding

- Login/Sign Up is not required, as the project has no dashboard (Dashboard: No).
- Add a favicon.
- The logo looks clearer and more professional, and keep it the same size on every page.
- Use consistent, standard designed RTL and contrast (theme) toggle icons.
- Use the same primary CTA color and style across the whole website.
- Do not repeat the same images across different pages.

### 2. Header / Navigation

- Place the primary CTA button in the navbar.
- Group Home 1 and Home 2 under a "Home" dropdown.
- Keep the Theme toggle, RTL toggle, and CTA button the same height and corner radius.
- Make sure every nav link and CTA redirects to the correct page.

### 3. Hero Section

- Center-align the hero content.
- Use a relevant background image.
- Use a maximum of two CTAs, and only where needed.
- Give Home 1 and Home 2 different content.

### 4. Layout and Content

- Use consistent grid layouts across all sections.
- Align section headings and container text properly.
- Use profile images, or suitable profile icons, consistently on all testimonial cards.
- Check and fix text and background contrast issues on every page, in both light and dark themes.

### 5. Forms and Validation

- Name: reject single-character input and numbers.
- Email: reject invalid formats (for example, a missing "@" or domain).
- Phone: accept digits only and reject alphabets.

### 6. Contact Page

- Add an FAQ section.
- Add an embedded map.

### 7. Footer

- Add social media icons.
- Align the logo, quick links, and column headings along the same top line.

### 8. Authentication Pages (if applicable)

- Remove the header and footer from these pages.
- Add social login icons, and center-align them with the heading.

### 9. Responsive and Performance Testing

- Test and fix layouts at 360px, 768px, and 1024px.
- Make sure page scrolling is smooth with no lag. Optimize images, animations, and scripts as needed.
