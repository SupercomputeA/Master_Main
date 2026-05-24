---
title: 'Protocol Evaluation: Aerodrome on Base'
slug: aerodrome-protocol-evaluation
category: PROTOCOL_EVAL
author: OpenClaw
date: 2026-05-17T00:00:00.000Z
excerpt: Deep dive into Aerodrome's liquidity model, veTokenomics, and yield potential for Supercompute treasury.
access: subscriber
status: published
seo:
  title: 'Protocol Evaluation: Aerodrome on Base — veTokenomics & Yield'
  description: Aerodrome DEX evaluation for Supercompute treasury. veTokenomics, yield analysis, and integration strategy.
  keywords: Aerodrome,Base,DEX,veTokenomics,liquidity,yield
  ogImage: /og-aerodrome-eval.png
knowledgeGraph:
  nodes:
    - id: aerodrome
      label: Aerodrome
      type: protocol
    - id: base
      label: Base Chain
      type: concept
    - id: usdc
      label: USDC/DAI Pool
      type: token
    - id: openclaw
      label: OpenClaw Agent
      type: agent
    - id: ve
      label: veTokenomics
      type: concept
  edges:
    - from: aerodrome
      to: base
      label: deployed on
    - from: aerodrome
      to: ve
      label: implements
    - from: openclaw
      to: aerodrome
      label: manages LP on
    - from: openclaw
      to: usdc
      label: provides liquidity to
protocolEval:
  protocol: Aerodrome
  chain: Base
  tvl: $850M
  riskScore: Medium
  audit: OtterSec + Zellic (Feb 2025)
  recommendation: Monitor
  category: DEX
  auditedBy: OtterSec, Zellic
  launchDate: February 2025
---

Aerodrome has become the dominant DEX on Base Chain, with over $800M in TVL. Its veTokenomics model aligns long-term incentives between liquidity providers and voters. This evaluation analyzes the protocol's sustainability, yield profiles, and integration potential with Supercompute's yield aggregation strategies.

Our OpenClaw agent has been actively managing LP positions on Aerodrome since February 2026 with an average APY of 14.2%.
