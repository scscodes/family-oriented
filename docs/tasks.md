# Tasks

## Recently Completed
- ✅ Removed unused components AttemptHistoryFooter and Toast
- ✅ Verified component type safety and refactored prop types  
- ✅ Confirmed docs are up to date after component cleanup
- ✅ Created comprehensive feature documentation for all games

---

## Supabase Integration

### A. Supabase Project & Database
1. **Create Supabase Project**
   - Outcome: Supabase project exists with credentials available.
2. **Configure Auth Providers**
   - Outcome: Email/password and (optionally) Google login enabled.
3. **Design Comprehensive Database Schema with Multi-Tier Support**
   - Outcome: Complete schema supporting Personal (5 avatars), Professional (30-50 avatars), and Enterprise (100+ avatars) subscription levels with full commercial data requirements.
   - **Core Tables:**
     - `subscription_plans` (id, name, avatar_limit, features_json, price_monthly, price_yearly, trial_days)
     - `organizations` (id, name, subscription_plan_id, billing_address, tax_id, contact_info, created_at, trial_ends_at, status)
     - `organization_members` (org_id, user_id, role, permissions, invited_at, joined_at)
     - `users` (id, email, first_name, last_name, phone, timezone, locale, org_id?, account_type, created_at, last_login)
     - `avatars` (id, user_id, org_id?, name, encrypted_pii, theme_settings, game_preferences, created_at, last_active)
     - `avatar_themes` (id, name, tier_required, premium_flag, price, active)
     - `game_results` (id, avatar_id, org_id?, game_type, score_data, duration, difficulty, timestamp, session_id)
   - **Billing & Commerce Tables:**
     - `billing_addresses` (id, org_id, user_id?, address_line1, address_line2, city, state, postal_code, country, tax_region)
     - `subscriptions` (id, org_id, plan_id, status, current_period_start, current_period_end, trial_end, stripe_subscription_id)
     - `invoices` (id, subscription_id, stripe_invoice_id, amount, tax_amount, currency, status, due_date, paid_at)
     - `payment_methods` (id, org_id, stripe_payment_method_id, type, last_four, expiry, is_default)
     - `usage_tracking` (id, org_id, month_year, avatar_count, premium_themes_used, api_calls, storage_used)
   - **Audit & Compliance Tables:**
     - `audit_logs` (id, user_id, org_id?, action, resource_type, resource_id, ip_address, user_agent, timestamp)
     - `data_retention_policies` (id, org_id, data_type, retention_months, auto_delete)
     - `consent_records` (id, avatar_id, consent_type, granted_by_user_id, granted_at, withdrawn_at)
4. **Enable Comprehensive Row Level Security (RLS)**
   - Outcome: Multi-layered security with user data protection, organization-level access controls, subscription-based feature gating, and audit trail compliance.
   - **Security Policies:**
     - Users can only access their own data and organization data based on role
     - Subscription tier determines feature access and data depth
     - Audit logs are write-only for users, read-only for admins
     - PII encryption keys are managed server-side only
     - Billing data restricted to organization owners and billing admins
5. **Write Comprehensive SQL Migrations with Triggers**
   - Outcome: Schema with automated triggers for user profile creation, organization management, subscription handling, usage tracking, audit logging, and GDPR compliance.
   - **Automated Triggers:**
     - Auto-create organization on Enterprise signup
     - Track usage metrics on avatar creation/game completion
     - Log all data access for audit compliance
     - Auto-archive data based on retention policies
     - Update subscription status based on payment events

### B. Local Integration
6. **Install Supabase Client**
   - Outcome: `@supabase/supabase-js` added to dependencies.
7. **Create Supabase Client Utility with Security Layers**
   - Outcome: Utility for initializing Supabase client (client/server) with role-based access control and subscription-aware queries.
8. **Add Environment Variables**
   - Outcome: `.env.local` with Supabase URL, anon key, service role key (server-only), and encryption keys (gitignored).
9. **Implement Comprehensive Auth Flows**
   - Outcome: Registration with location/billing collection, login, logout, session management, and subscription tier detection with trial handling.
10. **Protect Routes/Pages with Subscription Awareness**
    - Outcome: Middleware/hooks restrict access with role-based permissions, subscription-based feature access, and trial status checking.
11. **User Settings Management with Billing Integration**
    - Outcome: UI and API for updating user/organization settings, billing addresses, payment methods, and subscription-tier feature controls.
12. **Game Results Tracking with Usage Metrics**
    - Outcome: Functions to record game results with organization context, subscription-based analytics depth, and automated usage tracking for billing.

### C. Testing
13. **Write Comprehensive Unit/Integration Tests**
    - Outcome: Tests for auth, billing, settings, usage tracking, and results logic across all subscription tiers and edge cases.
14. **Set Up Local Supabase for E2E with Test Data**
    - Outcome: Local Supabase instance with seed data for all subscription tiers, billing scenarios, and compliance testing.

### D. Deployment & CI/CD
15. **Store All Secrets in GitHub**
    - Outcome: Supabase URLs/keys, Stripe keys, encryption keys, and webhook secrets added as GitHub Actions secrets.
16. **Update GitHub Actions Workflow with Environment Handling**
    - Outcome: Workflow injects all environment variables, handles database migrations, and supports staging/production environments.
17. **Automate Database Migrations with Rollback**
    - Outcome: Migrations run automatically in CI/CD with rollback capabilities and data validation checks.
18. **Configure Production Auth Redirects and Webhooks**
    - Outcome: Supabase Auth redirect URLs and Stripe webhook endpoints configured for deployed domains.
19. **Test Deployed Systems End-to-End**
    - Outcome: Registration, billing, subscription management, and all features work in production across all tiers.

### E. Documentation & Accessibility
20. **Document Complete Supabase Integration**
    - Outcome: Comprehensive documentation of schema, security, billing integration, and compliance procedures in `docs/`.
21. **Accessibility Review**
    - Outcome: All auth, billing, and settings UIs meet WCAG and ARIA standards with screen reader testing.

---

## User Context

### A. Avatar-Centric User Experience
1. **Design Avatar-Centric Settings Schema with Location Support**
   - Outcome: Database schema supports per-avatar preferences with timezone, locale, and region-specific content delivery based on billing location.
2. **Implement Per-Avatar Theme Selection with Commerce**
   - Outcome: Each avatar can select themes (basic for Personal, premium for Professional+, custom for Enterprise) with purchase tracking and billing integration.
3. **Avatar-Based Game Settings with Localization**
   - Outcome: Each avatar can customize game parameters with region-appropriate content, currency formatting, and educational standards compliance.
4. **Per-Avatar Accessibility with Compliance**
   - Outcome: Accessibility options that meet regional accessibility standards (ADA, AODA, EN 301 549) based on organization location.

### B. Avatar & Profile Management
5. **Design Flexible Avatar/Profile Schema with PII Protection**
   - Outcome: Avatar schema with encrypted PII storage, COPPA-compliant age verification, and regional privacy law compliance (GDPR, CCPA, PIPEDA).
6. **Implement Subscription-Aware Avatar Management with Billing**
   - Outcome: Avatar creation with subscription limit enforcement, upgrade prompts, and usage tracking for billing purposes.
7. **Associate Game Results with Geographic Context**
   - Outcome: Game results linked to avatars with timezone handling, regional content compliance, and location-based analytics.
8. **Security & Privacy with Regional Compliance**
   - Outcome: Data protection meeting FERPA (US education), PIPEDA (Canada), GDPR (EU), and other regional requirements based on organization location.

### C. Subscription-Tiered Analytics with Geographic Insights
9. **Design Tiered Results Analysis with Location Intelligence**
   - Outcome: Analytics schema supporting regional performance comparisons, curriculum alignment by location, and timezone-aware reporting.
10. **Implement Location-Aware Analytics UI**
    - Outcome: Analytics dashboards with regional benchmarking, local educational standard alignment, and timezone-appropriate scheduling.
11. **Tiered Recommendations with Regional Content**
    - Outcome: AI-driven suggestions incorporating regional educational standards, cultural considerations, and local curriculum requirements.

### D. Commercial & Subscription Features
12. **Organization & Sponsor Management with Geographic Support**
    - Outcome: Organization creation with complete address validation, tax jurisdiction detection, and regional billing compliance.
13. **Comprehensive Subscription & Billing Management**
    - Outcome: Stripe integration with tax calculation (TaxJar/Avalara), multi-currency support, regional pricing, and compliance with local tax laws.
14. **Group/Cohort Management with Regional Features (Professional+)**
    - Outcome: Group management with timezone coordination, regional content filtering, and local educational standard tracking.
15. **Administrative Dashboard with Global Insights (Enterprise)**
    - Outcome: Multi-region organization management, consolidated billing across locations, and global usage analytics with local compliance reporting.
16. **Data Export with Compliance Controls (Professional+)**
    - Outcome: Data export with regional privacy controls, automated PII redaction, and compliance with local data protection laws.

### E. Premium Theme & Customization System
17. **Basic Theme System with Regional Variants**
    - Outcome: Theme system supporting cultural variations, regional color preferences, and local accessibility standards.
18. **Premium Theme Features with Commerce Integration (Professional+)**
    - Outcome: Premium theme marketplace with regional pricing, cultural themes, and subscription-based access control.
19. **Custom Branding with White-label Compliance (Enterprise)**
    - Outcome: Full customization with regional branding guidelines, accessibility compliance verification, and multi-language support.

### F. Billing & Tax Compliance
20. **Implement Tax Calculation and Compliance**
    - Outcome: Automated tax calculation based on billing address, VAT/GST handling for international customers, and tax exemption processing for educational institutions.
21. **Multi-Currency and Regional Pricing**
    - Outcome: Currency conversion, regional pricing strategies, purchasing power parity adjustments, and local payment method support.
22. **Invoice Generation and Financial Reporting**
    - Outcome: Automated invoice generation with regional formatting, financial reporting for tax compliance, and revenue recognition tracking.

### G. Data Governance & Compliance
23. **Implement Comprehensive Audit Logging**
    - Outcome: Complete audit trail for data access, modification, and deletion with IP tracking, geographic location, and retention policies.
24. **Data Retention and Right to Deletion**
    - Outcome: Automated data retention policies, GDPR-compliant data deletion, and user-initiated data export functionality.
25. **Consent Management and Age Verification**
    - Outcome: Robust consent tracking for minors, parental consent workflows, and age verification compliance across jurisdictions.

### H. Future-Proofing & Scalability
26. **Plan for Advanced Enterprise Features**
    - Outcome: Roadmap for SSO integration (SAML, OIDC), API access with rate limiting, advanced analytics, and custom integrations.
27. **Multi-Region Data Residency**
    - Outcome: Plan for data residency requirements, regional data centers, and cross-border data transfer compliance.
28. **Advanced Security and Compliance**
    - Outcome: SOC 2 Type II compliance preparation, penetration testing procedures, and enterprise security certifications.

### I. Documentation & Accessibility
29. **Document All Systems with Regional Variations**
    - Outcome: Comprehensive documentation covering all features, regional compliance requirements, and multi-jurisdiction considerations.
30. **Global Accessibility Review and Testing**
    - Outcome: Accessibility testing across different regions, cultural considerations, and compliance with international accessibility standards.
