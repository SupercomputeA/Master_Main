---
title: "Protocol Short #8 — PoolTogether (Community Savings)"
slug: protocol-short-pooltogether
category: TECHNOLOGY
author: Quanta Sovereigna
date: 2026-08-09T00:00:00.000Z
excerpt: A short on what PoolTogether does, how a prize-linked savings pool turns yield into a communal prize instead of a private return, and why a community with a shared pool has something a bank cannot offer — savings without extraction.
access: public
status: published
seo:
  title: "Protocol Short #8 — PoolTogether (Community Savings)"
  description: "PoolTogether turns yield into a communal prize: prize-linked savings rail for community funds, civic without a custodian, principal preserved by contract."
  keywords: PoolTogether,prize-linked savings,DeFi,Base,community savings,yield,verifiable randomness,SolarPunk
  ogImage: /og-pooltogether-short.png
knowledgeGraph:
  nodes:
    - id: pooltogether
      label: PoolTogether
      type: protocol
      description: Prize-linked savings protocol. Depositors pool assets, yield is rolled into a periodic prize, principal stays whole and withdrawable.
    - id: base
      label: Base Chain
      type: concept
    - id: usdc
      label: USDC
      type: token
    - id: pooltogether-yield
      label: Yield Source (Lending Markets)
      type: concept
      description: The strategy layer (typically lending markets) that generates the yield distributed as the prize.
    - id: vrf
      label: Verifiable Random Function
      type: concept
      description: Chain-native randomness used to draw the winner so the result is auditable after the fact and not trusted to a custodian.
    - id: splits
      label: 0x Splits
      type: protocol
    - id: ens
      label: ENS
      type: concept
    - id: eas
      label: EAS Attestation
      type: concept
    - id: community-fund
      label: Community Fund
      type: concept
      description: Pooled member savings + subsidy rails for a community. Holds principal in a PoolTogether pool so the yield becomes a community prize.
    - id: savings-rail
      label: Prize-Linked Savings Rail
      type: concept
      description: The civic savings instrument: principal preserved by contract, yield shared as a public draw, no extraction at the custodian layer.
    - id: bank-spread
      label: Bank Spread
      type: concept
      description: The slice of yield the bank keeps in lieu of paying interest back to the depositor. PoolTogether's design choice is to return that slice to the pool as a prize.
  edges:
    - from: pooltogether
      to: base
      label: deployed on
    - from: pooltogether
      to: usdc
      label: supports
    - from: pooltogether
      to: pooltogether-yield
      label: routes deposits into
    - from: pooltogether
      to: vrf
      label: selects winner via
    - from: pooltogether
      to: savings-rail
      label: instantiates
    - from: community-fund
      to: pooltogether
      label: holds savings in
    - from: community-fund
      to: savings-rail
      label: uses
    - from: bank-spread
      to: savings-rail
      label: reframed as
    - from: pooltogether
      to: splits
      label: can route prize via
    - from: pooltogether
      to: ens
      label: paired with
    - from: pooltogether
      to: eas
      label: paired with
---

# Protocol Short #8 — PoolTogether (Community Savings)

The hardest part of saving is not discipline. It is the part where your money goes in and nothing comes back to remind you it is still there.

Most savings products are built around that silence. The number on the screen grows slowly. The bank keeps the spread. The depositor waits. The interest is so small, and so disconnected from anything visible, that the practice of saving starts to feel like a kind of penance the person is paying for being prudent. Save, and be invisible. Save harder, and remain invisible longer.

PoolTogether is what the practice looks like when it stops being a penance.

## The concept

PoolTogether is a prize-linked savings protocol. Depositors put assets into a shared pool. The pool is deployed into a yield source — typically a lending market or a set of low-risk strategies — and the yield it generates is not paid out as private interest. The yield is collected and rolled into a prize. At the end of each prize period, one or more depositors are selected at random and awarded the accumulated yield. The principal is never at risk. It is returned to the depositor, in full, at any time.

That is the mechanism. The architecture is small enough to fit on a napkin and large enough to change what a community can do with its savings.

Two things follow from it. First, every depositor keeps the same savings they would have kept in a regular yield product — the principal is whole, the compound interest is forgone only for the chance to win. Second, the pool as a whole captures yield that would otherwise be fragmented across thousands of small accounts and quietly skimmed by intermediaries. The yield stays in the pool until a winner is drawn. The prize is a community event. The savings are still savings.

The randomness is the part that makes it work. Without verifiable randomness, the draw would have to be trusted to a custodian, and a custodian is exactly the kind of silent counterparty the design is trying to remove. PoolTogether uses a verifiable random function — chain-native randomness that anyone can audit after the fact — so the winner is chosen in a way the depositors do not have to take on faith. The protocol does not know who will win. The chain proves who did.

## The real-world anchor

Imagine a town that agrees to put its holiday savings into one big jar. Every household puts some in. The jar earns interest at the credit union. Every month, the household whose name is drawn from the hat takes the interest as a prize. Everyone gets their principal back at the end of the year. No household loses its savings. Every household has a reason to keep contributing. The jar gets bigger. The prizes get bigger. The town starts to feel like it is saving together, because it is.

A bank cannot do this. The bank's interest is a fee it charges the depositor in a form the depositor is trained to call a return. The bank is not in the business of giving the interest back as a prize. The bank is in the business of keeping the spread. PoolTogether is the mechanism that gives the spread back, and the design choice that turns the giving-back into a public event the whole pool witnesses together.

A second anchor matters for the way a community actually uses this. A community fund that wants to put its members' pooled savings into PoolTogether is doing something a savings account cannot do. It is saying, publicly, on chain, that this money is being held in stewardship for these members — that the principal is theirs, that the yield is shared, that no insider is taking a cut, and that the draw will happen whether or not anyone in the community feels like running it this month. The savings pool is a small civic structure. It is the kind of civic structure that scales.

## The implication

For community funds and community subsidies, PoolTogether is the savings rail that aligns with the rest of the SolarPunk thesis. A community that pays its contributors through Splits and holds its members' pooled savings in PoolTogether is building a treasury that is legible, predictable, and free of extraction at every layer. The contributors are paid by contract. The savings are held by contract. The prizes are drawn by contract. The community is doing the work the bank used to do — and the community is doing the work for the community.

There is a quieter implication, and it is the one that matters most for the way people feel about saving. Saving is a behavior the extraction economy has made lonely. The saver is told that prudence is its own reward, and then the saver is asked to accept, in lieu of that reward, a yield so small it can be mistaken for noise. The saver who saves anyway is doing the work without any of the celebration. PoolTogether gives the celebration back. The draw is an event. The prize is a story the winner tells. The pool watches together. The savings are no longer a private penance. They are a communal practice.

This is also where PoolTogether sits next to the rest of the stack. The pool can be denominated in any yield-bearing asset the protocol supports. The prizes can be routed, on win, into a Split that fans the payout out to a group — a study group, a mutual-aid pod, a small business collective — without the winner having to manually forward the funds. The pool can be paired with ENS so members see a name they recognize instead of an address they do not. The pool can be paired with EAS so a draw receipt becomes part of the public record of what a community did in a given month. Each of those integrations is small. Together they form a community savings layer that does not exist anywhere in the legacy system, because the legacy system was never asked to build one.

That is what changes when saving is moved into a contract. The savings stops being a quiet transaction between a person and a bank. It becomes a civic instrument the community can hold, audit, and celebrate. The person saving alone is still saving alone. The person saving inside a PoolTogether pool is saving alongside their neighbors, with a chance — every period — to be the one the community cheers for.

## The practice

If you are designing a community fund, ask where the members' pooled savings are held. If the answer is "a bank account in the treasurer's name," the fund has a single point of failure that includes a person, a platform, and a relationship with an institution that can change its terms. If the answer is "a PoolTogether pool denominated in a yield-bearing asset," the fund has a savings rail whose principal is verifiable on chain, whose yield is auditable in real time, and whose prizes are drawn by verifiable randomness on a schedule the contract sets.

If you are advising a community on subsidy design, look at where the community's collective savings live. The same money that funds the subsidy can earn yield on the principal, and that yield can return to the community as a prize the community draws together. The subsidy becomes more than a payout. It becomes a savings event.

If you are the person putting your own savings in, read the protocol's documentation for the asset you intend to deposit. Confirm the yield source. Confirm the prize period. Confirm the gas costs of depositing and withdrawing on the chain you intend to use. The principal is yours. The prize is a chance. Neither requires you to trust a custodian, and neither requires you to give up stewardship of what you saved.

> Gaps for Mone before publication: confirm the canonical PoolTogether pool the CTA should point to (the chain, the asset, and the prize period the community is currently recommending), confirm the current set of yield sources the v5 vaults integrate with, and confirm whether the community subsidy framing in this short should be paired with a specific 0x Splits integration example for routing the prize on win. The architectural thesis — that prize-linked savings is the civic savings rail for communities that want principal preserved and yield shared — does not depend on those details and stands as written.