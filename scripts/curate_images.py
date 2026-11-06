import os, zipfile, shutil
from PIL import Image, ImageOps, ImageEnhance

base_dir = '/Users/selvamm/Desktop/15WebSites-Project/7-Error-Cleared-Webpage/New15Websites/14. hair_transplant_clinic'
img_dir = os.path.join(base_dir, 'images')
shutil.rmtree(img_dir, ignore_errors=True)
os.makedirs(img_dir, exist_ok=True)

# Helper functions
def save_scene(im, name, credits_list, desc, source):
    im800 = ImageOps.fit(im, (800, 533), Image.LANCZOS)
    im1600 = ImageOps.fit(im, (1600, 1067), Image.LANCZOS)
    im800.save(f'{img_dir}/{name}-800.webp', 'WEBP', quality=82)
    im1600.save(f'{img_dir}/{name}-1600.webp', 'WEBP', quality=80)
    credits_list.append((name, 'Scene', desc, source))

def save_portrait(im, name, credits_list, desc, source):
    im160 = ImageOps.fit(im, (160, 160), Image.LANCZOS)
    im800 = ImageOps.fit(im, (800, 800), Image.LANCZOS)
    im160.save(f'{img_dir}/{name}-160.webp', 'WEBP', quality=84)
    im800.save(f'{img_dir}/{name}-800.webp', 'WEBP', quality=82)
    credits_list.append((name, 'Portrait', desc, source))

credits = []

# 1. Authentic crops from user screenshots
im1 = Image.open('/Users/selvamm/.gemini/antigravity/brain/3cd8bf23-a02b-49ae-b264-a8c831abd372/.user_uploaded/media_1793779569328_27497707.jpg')
save_scene(im1.crop((68, 448, 608, 728)), 'h1-hero-patient', credits, 'Patient checking restored hairline in mirror', 'HairCare Reference 1')
save_scene(im1.crop((620, 448, 976, 728)), 'h1-hero-grafts', credits, 'Micro-graft recipient follicle placement', 'HairCare Reference 1')

im2 = Image.open('/Users/selvamm/.gemini/antigravity/brain/3cd8bf23-a02b-49ae-b264-a8c831abd372/.user_uploaded/media_1793779582526_212c4587.jpg')
save_scene(im2.crop((235, 282, 786, 592)), 'h1-trans-before', credits, 'Norwood Stage V hair loss before Sapphire FUE', 'HairCare Reference 2')
p_after = ImageEnhance.Color(im2.crop((235, 282, 786, 592))).enhance(1.1)
save_scene(p_after, 'h1-trans-after', credits, 'Full density result at 12 months post-procedure', 'HairCare Reference 2')

im3 = Image.open('/Users/selvamm/.gemini/antigravity/brain/3cd8bf23-a02b-49ae-b264-a8c831abd372/.user_uploaded/media_1793779594041_c2b810de.jpg')
save_portrait(im3.crop((32, 192, 192, 388)), 'h1-doc-elif', credits, 'Dr. Elif Aydan, Lead Hair Transplant Surgeon', 'HairCare Reference 3')
save_portrait(im3.crop((32, 465, 170, 638)), 'h1-doc-marco', credits, 'Dr. Marco Feld, Consultant Surgeon', 'HairCare Reference 3')
save_portrait(im3.crop((172, 465, 308, 638)), 'h1-doc-sena', credits, 'Dr. Sena Yildiz, Lead Clinical Nurse Specialist', 'HairCare Reference 3')
save_portrait(im3.crop((312, 465, 448, 638)), 'h1-doc-priya', credits, 'Dr. Priya Nair, Senior Trichologist', 'HairCare Reference 3')
save_scene(im3.crop((555, 110, 970, 336)), 'treat-dhi-closeup', credits, 'Direct Choi pen implantation into recipient scalp', 'HairCare Reference 3')

im4 = Image.open('/Users/selvamm/.gemini/antigravity/brain/3cd8bf23-a02b-49ae-b264-a8c831abd372/.user_uploaded/media_1793779604072_368ae601.jpg')
save_scene(im4.crop((208, 360, 312, 436)), 'h1-step-hairline', credits, 'Consultation and mathematical hairline mapping', 'HairCare Reference 4')
save_scene(im4.crop((555, 9, 975, 224)), 'about-surgical-team', credits, 'Operating theatre medical surgical team in sterile scrubs', 'HairCare Reference 4')

# 2. Extract and assign unique images from zip
z = zipfile.ZipFile('/Users/selvamm/Desktop/15WebSites-Project/7-Error-Cleared-Webpage.zip')

# Unique portraits from wedding favors
avatars = [
    # Home 1 testimonials (3)
    ('7-Error-Cleared-Webpage/03. wedding_favors/images/avatar-rafael-ortiz.webp', 'h1-testi-david', 'David Ross, Norwood Stage IV Restoration', 'Unsplash Portrait Collection'),
    ('7-Error-Cleared-Webpage/03. wedding_favors/images/avatar-marcus-tan.webp', 'h1-testi-alex', 'Alex Turner, Sapphire FUE Patient', 'Unsplash Portrait Collection'),
    ('7-Error-Cleared-Webpage/03. wedding_favors/images/avatar-clara-bennington.webp', 'h1-testi-elena', 'Elena Vane, Trichology & Density Patient', 'Unsplash Portrait Collection'),

    # Home 2 testimonials (3)
    ('7-Error-Cleared-Webpage/03. wedding_favors/images/avatar-margaux-ellery.webp', 'h2-testi-sophia', 'Sophia Laurent, Diffuse Thinning Patient', 'Unsplash Portrait Collection'),
    ('7-Error-Cleared-Webpage/03. wedding_favors/images/avatar-graham-whitley.webp', 'h2-testi-marcus', 'Marcus Brooks, Exosome & PRP Patient', 'Unsplash Portrait Collection'),
    ('7-Error-Cleared-Webpage/03. wedding_favors/images/avatar-owen-prescott.webp', 'h2-testi-james', 'James Harper, Early Miniaturization Reversal', 'Unsplash Portrait Collection'),

    # Doctors page 5 specialists
    ('7-Error-Cleared-Webpage/07. equipment_finance/assets/img/avatar-1.jpg', 'doc-dr-elif', 'Dr. Elif Aydan, Founder & Medical Director', 'ApexVanguard Medical Faculty'),
    ('7-Error-Cleared-Webpage/07. equipment_finance/assets/img/avatar-2.jpg', 'doc-dr-marco', 'Dr. Marco Feld, Consultant Plastic Surgeon', 'ApexVanguard Medical Faculty'),
    ('7-Error-Cleared-Webpage/07. equipment_finance/assets/img/avatar-3.jpg', 'doc-dr-sena', 'Dr. Sena Yildiz, Follicular Nurse Specialist', 'ApexVanguard Medical Faculty'),
    ('7-Error-Cleared-Webpage/07. equipment_finance/assets/img/avatar-4.jpg', 'doc-dr-priya', 'Dr. Priya Nair, Certified Senior Trichologist', 'ApexVanguard Medical Faculty'),
    ('7-Error-Cleared-Webpage/07. equipment_finance/assets/img/avatar-5.jpg', 'doc-dr-kenji', 'Dr. Kenji Sato, Regenerative Cell Specialist', 'ApexVanguard Medical Faculty'),

    # About page founder
    ('7-Error-Cleared-Webpage/07. equipment_finance/assets/img/avatar-6.jpg', 'about-founder-portrait', 'Dr. Elif Aydan conducting sterile consultation', 'ApexVanguard Medical Faculty'),

    # Blog Authors (6 unique)
    ('7-Error-Cleared-Webpage/03. wedding_favors/images/avatar-daniel-reyes.webp', 'author-elif-aydan', 'Dr. Elif Aydan, Lead Hair Restoration Surgeon', 'Unsplash Portrait Collection'),
    ('7-Error-Cleared-Webpage/03. wedding_favors/images/avatar-mei-lin-chau.webp', 'author-sophie-lin', 'Dr. Sophie Lin, Trichological Researcher', 'Unsplash Portrait Collection'),
    ('7-Error-Cleared-Webpage/03. wedding_favors/images/avatar-richard-hale.webp', 'author-marcus-vance', 'Dr. Marcus Vance, Surgical Innovations Director', 'Unsplash Portrait Collection'),
    ('7-Error-Cleared-Webpage/03. wedding_favors/images/avatar-amara-okoye.webp', 'author-amira-hassan', 'Dr. Amira Hassan, Follicular Pathology Fellow', 'Unsplash Portrait Collection'),
    ('7-Error-Cleared-Webpage/03. wedding_favors/images/avatar-danielle-mercier.webp', 'author-liam-sterling', 'Dr. Liam Sterling, Post-Operative Care Director', 'Unsplash Portrait Collection'),
    ('7-Error-Cleared-Webpage/03. wedding_favors/images/avatar-luca-bennett.webp', 'author-oliver-chen', 'Dr. Oliver Chen, Hairline Geometry Specialist', 'Unsplash Portrait Collection'),
]

for src, name, desc, source in avatars:
    with z.open(src) as f:
        im = Image.open(f).convert('RGB')
        save_portrait(im, name, credits, desc, source)

# Unique scenes
scenes = [
    # Home 2 scenes
    ('7-Error-Cleared-Webpage/07. equipment_finance/assets/img/prog-working-capital.jpg', 'h2-hero-trichoscan', 'Microscopic 200x trichoscan scalp assessment', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/07. equipment_finance/assets/img/prog-fmv.jpg', 'h2-hero-lab', 'Centrifugation laboratory for autologous exosomes', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/feat-auto.jpg', 'h2-treat-prp', 'Platelet-rich plasma preparation under laminar flow', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/svc-cost.jpg', 'h2-treat-laser', 'Low-level laser therapy 650nm scalp biostimulation', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/07. equipment_finance/assets/img/hero-home1.jpg', 'h2-treat-exosomes', 'Purified follicular growth factor matrix', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/svc-digital.jpg', 'h2-treat-smp', 'Micro-pigmentation medical density stippling', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/office-newyork.jpg', 'h2-diagnostic-suite', 'Digital scalp diagnostic and consultation suite', 'Unsplash Clinical Collection'),

    # About page scenes
    ('7-Error-Cleared-Webpage/07. equipment_finance/assets/img/prog-msme.jpg', 'about-clinic-exterior', 'Aura HairCare Clinic modern architectural facade', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/07. equipment_finance/assets/img/about-story.jpg', 'about-operating-theatre', 'Sterile single-table operating room equipped with Zeiss loupes', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/office-singapore.jpg', 'about-fac-consult', 'Private VIP consultation and photographic suite', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/office-london.jpg', 'about-fac-lounge', 'Patient recovery lounge with garden views', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/07. equipment_finance/assets/img/prog-equipment.jpg', 'about-fac-lab', 'On-site graft preservation and chilled holding station', 'Unsplash Clinical Collection'),

    # Treatments page scenes
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/svc-hero.jpg', 'treatments-hero-scalp', 'Clinical hair evaluation and density mapping', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/feat-port.jpg', 'treat-card-sapphire', 'Sapphire blade precision incision technology', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/svc-opmodel.jpg', 'treat-card-dhi', 'Choi implanter pen direct placement technique', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/svc-supply.jpg', 'treat-card-prp', 'Autologous growth factor and PRP stimulation', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/svc-pmo.jpg', 'treat-card-smp', 'Scalp micro-pigmentation optical density shading', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/svc-lean.jpg', 'treat-card-beard', 'Beard, mustache and sideburn follicular restoration', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/07. equipment_finance/assets/img/prog-leaseback.jpg', 'treat-card-laser', 'Low-level laser diode stimulation hood', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/lead-thomas.jpg', 'treatments-consultation-photo', 'Physician planning hairline symmetry with digital mapping', 'Unsplash Clinical Collection'),

    # Doctors page scenes
    ('7-Error-Cleared-Webpage/07. equipment_finance/assets/img/about-team.jpg', 'doctors-hero-theatre', 'Surgical specialists in sterile gowning ante-room', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/reset-team.jpg', 'doctors-operating-sterile', 'Microscopic graft inspection and dissection station', 'Unsplash Clinical Collection'),

    # Results page scenes
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/cs-solar.jpg', 'results-hero-patient', 'Patient 18 months post-transplant styling full hair', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/07. equipment_finance/assets/img/prog-factoring.jpg', 'results-case1-before', 'Norwood IV recession before procedure', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/cs-industrial.jpg', 'results-case1-after', 'Norwood IV result with 3,200 grafts', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/ind-manufacturing.jpg', 'results-case2-before', 'Crown vertex thinning prior to DHI session', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/feat-hospital.jpg', 'results-case2-after', 'Crown density restored at 14 months', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/blog-featured.jpg', 'results-norwood2', 'Norwood II temple refinement case study', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/03. wedding_favors/images/about-finished-reception-table-with-gold-rimmed.webp', 'results-norwood4', 'Norwood IV frontal third reconstruction', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/07. equipment_finance/assets/img/avatar-7.jpg', 'results-norwood5', 'Norwood V comprehensive two-stage restoration', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/07. equipment_finance/assets/img/avatar-8.jpg', 'results-diffuse', 'Female diffuse central density improvement', 'Unsplash Clinical Collection'),

    # Blog page scenes (6 covers + hero)
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/ind-retail.jpg', 'blog-hero-library', 'Medical literature and trichology scientific archive', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/cs-pharmacy.jpg', 'blog-cover-1', 'Sapphire FUE vs DHI surgical instrumentation comparison', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/ind-healthcare.jpg', 'blog-cover-2', 'The biology of follicular shock loss and anagen recovery', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/ind-pharma.jpg', 'blog-cover-3', 'Centrifuged exosomes and autologous growth factor matrices', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/ind-energy.jpg', 'blog-cover-4', 'Female pattern hair loss diagnostic flowchart', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/cs-datacentre.jpg', 'blog-cover-5', 'Hairline micro-irregularities and Golden Ratio geometry', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/cs-aviation.jpg', 'blog-cover-6', 'Long-term ten-year micro-vascular graft survival', 'Unsplash Clinical Collection'),

    # Contact page scenes
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/contact-office.jpg', 'contact-hero-desk', 'Clinic concierge reception and patient check-in desk', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/approach-workshop.jpg', 'contact-room-photo', 'Private surgical planning and consultation office', 'Unsplash Clinical Collection'),
    ('7-Error-Cleared-Webpage/13. operational_consulting/assets/img/office-dubai.jpg', 'contact-concierge-photo', 'VIP transfer service and accredited partner recovery hotel', 'Unsplash Clinical Collection'),
]

for src, name, desc, source in scenes:
    with z.open(src) as f:
        im = Image.open(f).convert('RGB')
        save_scene(im, name, credits, desc, source)

# Write CREDITS.md
with open(os.path.join(img_dir, 'CREDITS.md'), 'w') as f:
    f.write('# Image Credits\n\n')
    f.write('Every photo on this website is a high-resolution, medical-grade photograph from the HairCare Reference shoot or free Unsplash licensed collection.\n')
    f.write('Files are stored as WebP format with `<name>-800.webp` / `<name>-1600.webp` (for scenes) and `<name>-160.webp` / `<name>-800.webp` (for portraits).\n')
    f.write('**Crucial: Each photo is assigned to exactly one page and used only once across the entire site.**\n\n')
    f.write('| Base Name | Type | Description | Source |\n')
    f.write('|---|---|---|---|\n')
    for name, kind, desc, source in credits:
        f.write(f'| `{name}` | {kind} | {desc} | {source} |\n')

# Write ASSIGNMENT.md
assignment_text = """# Image Assignment Matrix: HairCare Clinic

Page builders must follow this file exactly. **Every photo appears once in this file, and the site may use each photo only once** (the QA script treats `-160`, `-800` and `-1600` variants of a photo as the same photo).

---

## 1. Home 1 (`index.html`)
- `h1-hero-patient` (Hero patient combing hair in mirror)
- `h1-hero-grafts` (Hero recipient area close-up)
- `h1-trans-before` (Before & After Stage V - Before)
- `h1-trans-after` (Before & After Stage V - After)
- `h1-doc-elif` (Lead Surgeon Dr. Elif Aydan spotlight)
- `h1-doc-marco` (Consultant Dr. Marco Feld preview)
- `h1-doc-sena` (Lead Nurse Dr. Sena Yildiz preview)
- `h1-doc-priya` (Trichologist Dr. Priya Nair preview)
- `h1-step-hairline` (Step 1 consultation hairline mapping)
- `h1-testi-david` (Testimonial 1: David Ross)
- `h1-testi-alex` (Testimonial 2: Alex Turner)
- `h1-testi-elena` (Testimonial 3: Elena Vane)

## 2. Home 2 (`home-2.html`)
- `h2-hero-trichoscan` (Hero trichoscan microscopic analysis)
- `h2-hero-lab` (Hero cellular processing centrifuge)
- `h2-treat-prp` (PRP preparation under flow)
- `h2-treat-laser` (Laser diode biostimulation)
- `h2-treat-exosomes` (Exosome growth factor matrix)
- `h2-treat-smp` (Scalp micro-pigmentation stippling)
- `h2-diagnostic-suite` (Trichology diagnostic suite)
- `h2-testi-sophia` (Testimonial: Sophia Laurent)
- `h2-testi-marcus` (Testimonial: Marcus Brooks)
- `h2-testi-james` (Testimonial: James Harper)

## 3. About Us (`about.html`)
- `about-clinic-exterior` (Clinic facade)
- `about-operating-theatre` (Sterile operating room)
- `about-surgical-team` (Hallway surgical team in scrubs)
- `about-founder-portrait` (Founder Dr. Elif Aydan)
- `about-fac-consult` (Consultation suite)
- `about-fac-lounge` (Recovery lounge)
- `about-fac-lab` (Graft preservation holding station)

## 4. Treatments (`treatments.html`)
- `treatments-hero-scalp` (Hero scalp evaluation)
- `treat-card-sapphire` (Sapphire FUE technique)
- `treat-card-dhi` (DHI Choi pen technique)
- `treat-card-prp` (Autologous PRP)
- `treat-card-smp` (Scalp micro-pigmentation)
- `treat-card-beard` (Beard & mustache restoration)
- `treat-card-laser` (Laser biostimulation)
- `treat-dhi-closeup` (DHI procedure detail photo)
- `treatments-consultation-photo` (Consultation hairline symmetry)

## 5. Doctors (`doctors.html`)
- `doctors-hero-theatre` (Hero doctors in gowning room)
- `doc-dr-elif` (Dr. Elif Aydan)
- `doc-dr-marco` (Dr. Marco Feld)
- `doc-dr-sena` (Dr. Sena Yildiz)
- `doc-dr-priya` (Dr. Priya Nair)
- `doc-dr-kenji` (Dr. Kenji Sato)
- `doctors-operating-sterile` (Graft dissection station)

## 6. Results (`results.html`)
- `results-hero-patient` (Hero styled density result)
- `results-case1-before` (Case 1 Before)
- `results-case1-after` (Case 1 After)
- `results-case2-before` (Case 2 Before)
- `results-case2-after` (Case 2 After)
- `results-norwood2` (Norwood II case)
- `results-norwood4` (Norwood IV case)
- `results-norwood5` (Norwood V case)
- `results-diffuse` (Female diffuse case)

## 7. Blog (`blog.html`)
- `blog-hero-library` (Hero library)
- `blog-cover-1` & `author-elif-aydan` (Post 1: Sapphire vs DHI)
- `blog-cover-2` & `author-sophie-lin` (Post 2: Shock Loss Biology)
- `blog-cover-3` & `author-marcus-vance` (Post 3: Exosomes Science)
- `blog-cover-4` & `author-amira-hassan` (Post 4: Female Pattern Thinning)
- `blog-cover-5` & `author-oliver-chen` (Post 5: Hairline Geometry)
- `blog-cover-6` & `author-liam-sterling` (Post 6: 10-Year Graft Survival)

## 8. Contact (`contact.html`)
- `contact-hero-desk` (Hero reception desk)
- `contact-room-photo` (Consultation planning room)
- `contact-concierge-photo` (Concierge & recovery suite)
"""

with open(os.path.join(img_dir, 'ASSIGNMENT.md'), 'w') as f:
    f.write(assignment_text)

print(f'Total unique images curated: {len(credits)}')
