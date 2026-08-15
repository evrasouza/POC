# AEM Smoke Test Automation Roadmap

This roadmap defines the recommended evolution of the Playwright POC for BRP public websites built with Adobe Experience Manager (AEM).

The strategy is to start with stable and reusable structural validations, then progressively introduce PDP components, business flows, and stateful or third-party integrations.

> **Current focus:** 🟡 Phase 1 — Reusable Link Validator

---

## 📊 Current Baseline

### Implemented / Existing Coverage

- ✅ **Homepage Smoke** — validates that the configured brand and locale homepage loads successfully.
- 🟡 **Global Header** — structural validation plus navigation through a single internal link.
- ✅ **Global Footer** — structural validation plus internal destination validation.
- ✅ **Product Navigation** — validates navigation from the homepage to configured product listing destinations.
- ✅ **Find a Dealer** — validates dealer search behavior and result availability.
- ✅ **Navigation Discovery** — supports discovery and inspection of navigation links rendered by AEM.

### 🛠️ Supporting Infrastructure

- ✅ **Cookie Consent handling** — reusable handling for Axeptio consent dialogs.
- ✅ **Promotional / Lead Generation modal handling** — reusable handling for shared promotional overlays.
- ✅ **Multi-brand / Multi-locale execution** — tests can run against multiple BRP brands and locales through configuration-driven execution.

> 🟡 **Partial coverage:** The Global Header currently validates the shared header structure and one internal navigation path, but does not yet validate the complete main navigation.

---

## 🧭 Phase 1 — Navigation Foundation

**Goal:** establish reusable navigation validation that can be shared across brands, locales, and AEM components.

- [x] ✅ **Footer Navigation** — validate footer visibility, discover navigable internal links, and verify destinations.
- [ ] 🟡 **Reusable Link Validator** — extract shared internal and external link validation logic for reuse across navigation components. **← NEXT**
- [ ] ⚪ **Full Main Navigation Validation** — evolve the current header coverage from a single internal link to complete menu validation.
- [ ] ⚪ **Discover Brand Navigation** — validate that Discover Brand entries navigate to valid brand pages.

### ✅ Completed — Footer Navigation

Footer smoke coverage was introduced for the shared AEM footer.

Current coverage validates that:

- The global footer is rendered and visible.
- The footer contains navigable links.
- Internal navigable links are discovered dynamically from the content rendered by AEM.
- Non-navigation links such as anchors, `javascript:`, `mailto:`, and `tel:` can be excluded from internal navigation discovery.
- The selected internal destination belongs to the expected brand hostname.
- The destination can be loaded successfully.
- The destination returns a successful HTTP response.

For destination validation, the footer test resolves the selected internal link through its `href` and validates the resulting page response instead of depending exclusively on a physical click.

This is intentional. Sea-Doo and Ski-Doo can trigger global Cookie Consent and Lead Generation overlays asynchronously while scrolling to the footer. These overlays may intercept pointer events even when the footer and its link are valid.

Overlay behavior is handled independently by reusable framework components so that an unrelated global popup does not produce a false Footer Navigation failure.

### 🛠️ Supporting Infrastructure — Global Overlay Handling

The Footer Navigation implementation exposed asynchronous global overlays that can block Playwright interactions, particularly on Sea-Doo and Ski-Doo.

The framework now includes reusable handling for these conditions.

#### Axeptio Cookie Consent

`CookieBannerComponent` handles the Axeptio cookie consent dialog.

The implementation:

- Detects the active Axeptio consent dialog.
- Uses semantic role-based selectors.
- Accepts cookies when the dialog is displayed.
- Waits for the active dialog to become hidden before continuing.
- Keeps cookie handling outside individual feature tests.

#### Promotional / Lead Generation Modal

`PromotionalModalComponent` handles the shared newsletter / lead-generation modal.

The implementation:

- Detects the shared `#root_newsletter-popup` container.
- Closes the modal when it becomes visible.
- Waits until the modal is hidden before continuing.
- Keeps promotional modal handling outside individual feature tests.

#### Page Interaction Stability

`HomePage.prepareForInteraction()` centralizes known global overlay handling before functional interactions.

The method waits for supported blocking overlays to be dismissed and for the page to remain stable before allowing the test flow to continue.

This prevents Header, Product Navigation, Discovery, and future feature tests from implementing their own brand-specific popup logic.

#### Overlay Validation

Cookie Consent and Promotional Modal behavior can be validated independently from feature tests.

This separation is intentional:

```text
Global overlay behavior
        ↓
Reusable overlay components
        ↓
Page interaction preparation
        ↓
Feature-specific validation
```

A feature such as Header or Footer Navigation should fail because the feature is broken, not simply because an unrelated global overlay appeared asynchronously.

### 🏗️ Current Phase 1 Architecture

```text
components/
  cookie-banner.component.ts
  footer.component.ts
  header.component.ts
  promotional-modal.component.ts

pages/
  home.page.ts

tests/
  debug/
    overlays.spec.ts
  navigation/
    footer.spec.ts
    header.spec.ts
```

The next architectural step is to introduce a reusable Link Validator so shared navigation rules do not need to be duplicated between Header, Footer, Discover Brand, Page Level Navigation, and other navigation-oriented smoke tests.

---

## 🛒 Phase 2 — Commerce and Page Navigation

**Goal:** cover deterministic redirects and CTA behavior with limited external state.

- [ ] ⚪ **Accessories, Parts & Clothing → E-commerce** — validate e-commerce redirection, including Can-Am Off-Road / On-Road selection behavior.
- [ ] ⚪ **Page Level Navigation CTAs** — validate CTA destinations from the Page Level Navigation component.
- [ ] ⚪ **Previous Model Year → RAQ** — validate that RAQ from a previous-year PDP reaches the Request a Quote form.

---

## 🧩 Phase 3 — PDP Component Validation

**Goal:** validate interactive AEM components on Product Detail Pages.

- [ ] ⚪ **Carousel / Feature Tab** — validate visibility, controls, and expected slide/tab behavior.
- [ ] ⚪ **Step-by-Step** — validate the Sea-Doo / Pontoons Step-by-Step component and user progression.

---

## 🔄 Phase 4 — Business Flows

**Goal:** introduce higher-value flows that depend on product configuration, model year, offers, or multiple systems.

- [ ] ⚪ **Current Model Year → BYO** — navigate from a model-level BYO CTA and validate the Build Your Own flow.
- [ ] ⚪ **Promotion Page** — select a region and verify that eligible offers are displayed.
- [ ] ⚪ **Offer Details Disclaimer** — open Offer Details and verify that the expected disclaimer is displayed.

---

## 🌐 Phase 5 — Dynamic Integrations and Stateful UI

**Goal:** add explicit smoke coverage for behavior that depends on cookies, previous sessions, regional rules, timing, or third-party integrations.

- [ ] ⚪ **Cookie Consent Smoke Validation** — explicitly validate first-visit consent behavior using controlled browser state.
- [ ] ⚪ **Lead Generation Popup Smoke Validation** — explicitly validate when the lead-generation modal should appear and its expected behavior.
- [ ] ⚪ **Chatbot** — validate chatbot availability and its initial introduction behavior.

> ℹ️ Cookie Consent and Lead Generation **handling infrastructure is already implemented** to support other tests. The Phase 5 items remain open because the original roadmap requires explicit validation of those features themselves, not only the ability to dismiss them.

---

## 🗺️ Original Smoke Checklist Mapping

| # | Smoke Scenario | Roadmap Placement | Status |
|---:|---|---|---|
| 1 | Cookie / Lead Generation popup | Phase 5 | 🟡 Handling implemented; explicit validation pending |
| 2 | Current Year PDP → BYO | Phase 4 | ⚪ Pending |
| 3 | Previous Year PDP → RAQ | Phase 2 | ⚪ Pending |
| 4 | Promotion Page / Offer Details | Phase 4 | ⚪ Pending |
| 5 | Find a Dealer | Implemented | ✅ Done |
| 6 | Carousel / Feature Tab | Phase 3 | ⚪ Pending |
| 7 | Step-by-Step | Phase 3 | ⚪ Pending |
| 8 | Accessories, Parts & Clothing → E-commerce | Phase 2 | ⚪ Pending |
| 9 | Discover Brand | Phase 1 | ⚪ Pending |
| 10 | Main Navigation links | Phase 1 | 🟡 Partial — structure + single internal navigation |
| 11 | Footer links | Phase 1 | ✅ Done |
| 12 | Page Level Navigation CTAs | Phase 2 | ⚪ Pending |
| 13 | Chatbot | Phase 5 | ⚪ Pending |

### Status Legend

- ✅ **Done** — implemented coverage.
- 🟡 **Partial / In Progress / Next** — coverage exists but is incomplete, or this is the current implementation focus.
- ⚪ **Pending** — planned but not yet implemented.

---

## 📐 AEM Automation Principles

### Prefer behavior over authored text

Avoid assertions against labels that AEM authors can legitimately change unless the exact label is itself a business requirement.

### Discover links dynamically

Where appropriate, validate what AEM rendered instead of maintaining large static lists of authored content.

### Separate structural and business validation

Navigation health checks should remain separate from complete business-flow assertions.

### Separate global overlays from feature validation

Cookie Consent and Lead Generation overlays are global page concerns.

Feature tests should rely on shared overlay handling instead of duplicating popup-specific logic inside Header, Footer, Product, or other feature specifications.

When the overlay itself is the feature under test, it should be validated independently using controlled browser state.

### Use resilient selectors

Prefer semantic roles, stable component attributes, and reusable Page Object / Component Object abstractions.

### Control state explicitly

Cookies, local storage, geolocation, and session state must be deterministic before stateful features are introduced.

### Keep smoke tests focused

Smoke coverage should answer whether critical behavior works. Exhaustive content validation can live in specialized regression suites.

### Avoid false failures caused by unrelated UI

A valid component should not be reported as broken only because an unrelated asynchronous overlay intercepted an interaction.

When appropriate, validate the component's actual responsibility directly. For example, Footer Navigation can validate a discovered internal `href`, hostname, destination response, and successful page load independently from global overlay timing.

---

## ✅ Definition of Done

A roadmap feature is considered complete when:

- [ ] The test is repeatable and does not depend on uncontrolled previous browser state.
- [ ] Selectors follow the Page Object / Component Object architecture.
- [ ] Brand- and locale-specific values are configuration-driven whenever possible.
- [ ] Failures identify the affected brand, locale, component, or URL with useful context.
- [ ] The feature runs successfully in the existing Playwright structure.
- [ ] The implementation avoids unnecessary hard-coded AEM authored content.
- [ ] Global overlays are handled through shared infrastructure rather than feature-specific workarounds.
- [ ] Regression tests remain green after the feature is introduced.
- [ ] Documentation is updated when new configuration or execution behavior is introduced.

---

## 🚀 Recommended Execution Order

```text
Phase 1 — Navigation Foundation
        ↓
🟡 Reusable Link Validator ← NEXT
        ↓
Full Main Navigation Validation
        ↓
Discover Brand Navigation
        ↓
Phase 2 — Commerce / Page Navigation
        ↓
Phase 3 — PDP Components
        ↓
Phase 4 — Business Flows
        ↓
Phase 5 — Dynamic Integrations
```

---

## 📌 Current Status

```text
Implemented / Existing Coverage
├── ✅ Homepage Smoke
├── 🟡 Global Header
│   └── Structure + single internal navigation
├── ✅ Global Footer
│   └── Structure + internal destination validation
├── ✅ Product Navigation
├── ✅ Find a Dealer
└── ✅ Navigation Discovery

Supporting Infrastructure
├── ✅ Cookie Consent handling
├── ✅ Promotional / Lead Generation modal handling
└── ✅ Multi-brand / Multi-locale execution

Phase 1
├── ✅ Footer Navigation
├── 🟡 Reusable Link Validator        ← NEXT
├── ⚪ Full Main Navigation
└── ⚪ Discover Brand Navigation
```

The roadmap should evolve with the framework. Completed items should be checked off as coverage is merged, and new scenarios should be placed according to their dependencies, stability, and reuse potential rather than simply appended in implementation order.
