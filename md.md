Orbit Launch Plan 

Product launch brief · v2.0

# Orbit launch plan

A 12-week plan to take a collaborative research workspace from private beta to a measured public launch, without trading reliability for noise.

Owner: Product & PlatformWindow: Aug–Oct 2026Confidence: 78%Last updated: 7 Aug 2026

**NEW IN V2**

Added an experiment matrix with hypotheses, guardrails, and stop conditions. Navigation and launch controls now include the experimentation workstream.

**Contents**[Outcomes](#outcomes)[System map](#system)[Roadmap](#roadmap)[Workstreams](#workstreams)[Experiments](#experiments)[Risks](#risks)[Decisions](#decisions)[Readiness](#readiness)

01 · Target outcomes

## Success is behavioral, not ceremonial

Activation**42%**Create and share a workspace in 24h

Week-4 retention**31%**Teams with 3+ active collaborators

Reliability**99.95%**Core document availability

Support load**< 4%**New accounts opening a ticket

◎

**Launch gate**

Public access opens only after all four targets hold for seven consecutive days in the release candidate cohort.

02 · Dependency map

## One critical path, three feedback loops

[Diagram: Research; Jobs + evidence; Product; Core workflows; Release candidate; Instrumented cohort; Public launch; Phased access; Telemetry; Quality + behavior; Operations; Support + incidents; Weekly decision; learning loop]

View equivalent Mermaid source

flowchart LR
  R\[Research  
Jobs + evidence\] --> P\[Product  
Core workflows\]
  P --> RC\[Release candidate  
Instrumented cohort\]
  RC --> L\[Public launch  
Phased access\]
  RC --> T\[Telemetry  
Quality + behavior\]
  L --> O\[Operations  
Support + incidents\]
  T --> D(\[Weekly decision\])
  O --> D
  T -. learning loop .-> P

03 · Roadmap

## Twelve weeks to controlled release

W1

W2

W3

W4

W5

W6

W7

W8

W9

W10

W11

W12

Product

Platform

Go-to-market

Beta cohorts

⚑

**Irreversible decision: week 9**

Pricing and packaging freeze before the final cohort. Changes after this point move to the first post-launch release.

04 · Workstreams

## What each team must make true

PRODUCT

### Collaboration loop

-   First workspace under 5 minutes
-   Comment resolution with clear ownership
-   Export with source fidelity

PLATFORM

### Trust envelope

-   Regional backups rehearsed
-   Rate limits fail gracefully
-   Audit trail covers sharing

GROWTH

### Qualified demand

-   Role-based onboarding
-   Three use-case narratives
-   No paid acquisition pre-fit

| Milestone | Owner | Exit criterion | State |
| --- | --- | --- | --- |
| Workflow freeze | Mina / Product | Five beta teams complete the happy path unassisted | ON TRACK |
| Load rehearsal | Arun / Platform | 3× forecast traffic with p95 under 450 ms | AT RISK |
| Support handbook | Jo / Operations | Top 20 scenarios have owner and response template | IN REVIEW |
| Launch narrative | Lea / Growth | Message comprehension above 80% in tests | ON TRACK |

05 · Experiment matrix

## Learn before scaling the launch

Each experiment has one decision attached to it. Results that do not change a decision are telemetry, not experiments.

| Experiment | Hypothesis | Primary signal | Guardrail | Decision |
| --- | --- | --- | --- | --- |
| **E1 · Guided first workspace** | A contextual starter reduces blank-state abandonment | +8 points activation | No increase in deletion rate | Ship if lift is ≥5 points |
| **E2 · Team invite prompt** | Prompting after first saved insight improves collaboration | Invites per activated team | Invite abuse below 0.5% | Choose immediate or delayed prompt |
| **E3 · Source confidence** | Visible provenance increases downstream sharing | Shared workspaces with citations | Task completion time +10% max | Keep expanded or collapse by default |
| **E4 · Recovery guidance** | Inline recovery resolves common sync failures without support | Self-resolution rate ≥65% | No hidden data-loss reports | Expand cohort or halt release |

◫

**Stop condition**

Any confirmed data-integrity regression ends all concurrent experiments and returns the cohort to the last verified release.

06 · Risk register

## Risks worth changing the plan for

Impact

Low likelihood

Medium

High

High

R4: Vendor outage

R1: Sync integrity

R2: Support saturation

Medium

R6: Export edge cases

R3: Weak activation

R5: Invite abuse

Low

R8: Copy drift

R7: Theme defects

R9: Analytics lag

| ID | Trigger | Mitigation | Owner |
| --- | --- | --- | --- |
| R1 | Any confirmed cross-client divergence | Pause cohort expansion; run integrity repair playbook | Platform |
| R2 | Ticket rate exceeds 6% for 48h | Cap invites; deploy embedded recovery guidance | Operations |
| R3 | Activation below 32% after cohort two | Remove setup steps; rerun five observed sessions | Product |

07 · Decision log

## Choices, with the discarded options visible

| Date | Decision | Why | Revisit when |
| --- | --- | --- | --- |
| 07 Aug | Three staged cohorts | Separates product, reliability, and operations learning | All gates pass early |
| 05 Aug | No freemium tier at launch | Avoids scaling support before retention is understood | Week-8 retention exceeds 28% |
| 01 Aug | Inline onboarding, no tour | Users learn in the context of their first real workspace | Observed failure rate exceeds 20% |

08 · Readiness checklist

## Definition of launch-ready

-   Incident roles assigned and rehearsed
-   Rollback completes in under 15 minutes
-   Analytics events reconcile with source data
-   Privacy and retention copy approved
-   Support coverage spans launch regions
-   Status page and customer comms prepared
-   Accessibility pass has no critical defects
-   Executive go/no-go owner named

Example release command

\# Preview the release manifest before promotion
orbit release inspect --candidate rc.3 --format json

# Promote only after the signed go/no-go record exists
orbit release promote rc.3 --require-decision launch-2026-10

Orbit is fictional. Version 2 of this document is a renderer and immutable-history capability fixture generated for htmlpub testing.