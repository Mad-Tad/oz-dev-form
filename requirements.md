<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# i need to make a form with all the above, give me a fields.md that contains all the necessary columns required as well as the ones that can be derived / are optional. mention the reasoning when required in that file

```markdown
# Project Intake Form Fields

This document outlines the fields needed for your real estate project intake form, categorized into **Required (Necessary)**, **Derivable (Computed or Autofill)**, and **Optional (Nice to Have/Additional Details)**. For each field, notes and reasoning are included where useful to guide implementation and simplify developer data entry.

---

## 1. Required Fields (Developer Must Provide)

These fields are the **minimum essential inputs** that cannot be logically derived or reliably sourced externally. The aim is to keep these as few as possible, balancing completeness and friction.

| Field Name               | Reason / Notes                                           |
|--------------------------|----------------------------------------------------------|
| project_name             | Unique identifier; key for record and branding           |
| tagline                  | Short project marketing phrase                           |
| executive_summary        | Project overview; essential for all OMs/PPMs            |
| property_type            | Needed for filtering, analysis (e.g. Multifamily, Office)|
| status                   | Project pipeline stage (e.g. Planned, Under Construction)|
| address                  | Street address                                          |
| city                     |                                                          |
| state                    |                                                          |
| zip_code                 |                                                          |
| total_units              | Primary for all per-unit and absorption calcs            |
| unit_mix                 | Needed for bedroom counts and mix breakdowns             |
| total_sf_gross           | Required for FAR, cost/SF, etc.                          |
| site_acres               | For site planning, FAR derivation                        |
| stories                  | For description, code, marketability                     |
| parking_spaces           | Regulatory and market appeal                             |
| building_description     | Architecture/narrative required for OMs/PPMs             |
| construction_type        | Structural type; affects cost, speed, comps              |
| total_cost               | Central for underwriting                                 |
| minimum_investment       | Core investor gate                                      |
| preferred_return         | Typical investor benchmark                               |
| projected_irr_5yr        | Industry standard return metric                          |
| hold_period_years        | Almost always required for underwriting                  |
| management_fee_annual    | Direct investor-facing economics                         |
| sponsor_promote          | Key investor/sponsor alignment                           |
| groundbreaking_date      | Start of construction                                   |
| construction_start       |                                                          |
| construction_completion  |                                                          |
| occupancy_start          |                                                          |
| stabilization_date       | When project is fully leased/operational                 |
| fund_name                | Clarity for multi-asset raises                           |
| fund_manager             | Disclosure, regulatory compliance                        |
| sponsor_name             | Central for trust and diligence                          |
| developer_name           | Sometimes distinct from sponsor                          |
| contractor_name          | If known, signals execution strength                     |
| fund_type                | Single-asset vs. multi-asset                             |

**Reasoning:** Only these must be submitted by the developer. All are minimally necessary to produce an investable OM/PPM and to allow all derivations below. Where data would be repeated (e.g., city, state, ZIP), each field is distinct as in the schema. Some (like unit mix) reduce the need for repeated data collection on bedrooms, etc.

---

## 2. Derivable (Auto-Calculated or Autofilled Fields)

These fields should be **auto-populated by the platform** using developer input, lookups, or computations. Do NOT require manual entry on the form; instead, display as read-only or in summaries.

| Field Name                  | Derivation / Source                                                       | Reasoning                                                      |
|-----------------------------|--------------------------------------------------------------------------|----------------------------------------------------------------|
| project_slug                | Slugified from project_name                                              | For URLs; reduces duplicate entry                              |
| latitude, longitude         | API geocoded from address/city/state/zip_code                             | Prevents data entry errors, leverages automation               |
| opportunity_zone_tract      | From public census mapping using lat/long                                 | Removes complexity for developer                               |
| oz_qualified                | Boolean from OZone tract check                                            | Legal classification; don't trust self-reported                |
| dev_dash_url                | System-generated after project creation                                   | Immutable permalink                                            |
| per-unit metrics            | Cost/unit: total_cost/total_units, SF/unit: total_sf_gross/total_units    | Ensures internal consistency                                   |
| parking_ratio               | parking_spaces / total_units                                              | For marketing and comp, always computable                      |
| FAR (floor area ratio)      | total_sf_gross / (site_acres * 43,560)                                    | Standard planning metric                                       |
| tax_benefits                | From OZ eligibility and hold period (logic-driven explainer)              | Relieves user from legalese                                    |
| population, median_income...| API lookup from government/commercial data using address                  | Fewer errors, more up-to-date numbers                          |
| transit_access              | Autoload via WalkScore/Google/transit APIs                                | Standardizes across projects                                   |
| equity_multiple_5yr         | Can be calculated if IRR and cash flows are known                         | Avoids confusion, supports single source of truth              |
| timeline durations          | System-calculated from inputted milestone dates                           | For Gantt charts, intervals                                    |
| image_urls                  | Taken from form upload or generated gallery                               | Standardizes media management                                  |

**Reasoning:** Everything here either **depends on other fields** or is best sourced from public data or straightforward calculations, so developers don't enter it manually. This method reduces data entry errors, speed up onboarding, and produces higher quality OMs.

---

## 3. Optional Fields

These fields are **nice to have, but not strictly required** in every project (can be left blank or entered if the developer wishes to provide greater detail/marketing value or if available).

| Field Name                  | Reason / Notes                                           |
|-----------------------------|----------------------------------------------------------|
| executive_summary (long)    | A more detailed narrative than main summary              |
| total_bedrooms              | Provide if mix isn't supplied, else derivable            |
| total_sf_net                | Provide if available, else estimate or derive            |
| total_sf_retail/office      | Required only for mixed-use or as-relevant               |
| building renderings/photos  | Marketing value, optional for initial onboarding         |
| cash_flow_year_1/10         | If modeled, helpful for IRR/return comps                 |
| projected_irr_3yr/10yr      | If calculated, expands picture for investors             |
| equity_multiple_3yr/10yr    | Needed for 3/10 year hold scenarios, if modeled          |
| preferred_return variations | If more than one tier/interest structure used            |
| amenities                   | Showcase for marketing                                   |
| unit_features               | Marketing/preference info for residents/investors        |
| special_features            | For highlighting eco, smart-home, or unique attributes   |
| major_employers             | Regional context; enhances market narrative              |
| population_growth_5yr       | In context with current population                       |
| job_growth_5yr              | Region’s employment dynamism                             |
| rent_growth_annual          | Market trend; strong supporting detail                   |
| housing_shortage            | If available, strengthens thesis                         |
| occupancy_rate              | Market data; helpful for rent contour analysis           |

**Reasoning:** These serve to **supplement and enhance** the investor's understanding without burdening the developer in a first-pass entry. Where detailed pro forma or comps are available, they can be attached or input for best-in-class OMs but are not required for a "complete" record.

---

## Implementation Notes

- **Group related fields** (address block, timeline milestones, participant names) in the UI to streamline the intake process.
- **Instructions next to each field** (e.g., “If Total Bedrooms not provided, it will be calculated from the Unit Mix”), can further reduce confusion.
- **Show derivable fields in real time** as computed summaries when possible, to build user confidence and reduce repetitive checks.
- **All market/demographic data fields should be autofilled (with option to override/annotate)** for transparency, but not require developer input.

---

*You may customize these categories to your specific product flow or audience. For an Excel, Airtable, or JSON schema export, or a grouped UI-ready summary, just ask!*
```

