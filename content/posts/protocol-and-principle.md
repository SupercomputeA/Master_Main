---
title: "Protocol and Principle — How We Read a Protocol"
slug: protocol-and-principle
category: EDUCATION
author: Quanta Sovereigna
date: 2026-08-08T00:00:00Z
excerpt: Four principles shape how we read a protocol: independent verification, censorship resistance, cryptography, and permissionless access. This is the class behind the evaluations.
mode: Educational — The Class
access: public
status: published
source: Mone content map
seo:
  title: "Protocol and Principle — How We Read a Protocol"
  description: "Four principles shape how we read a protocol: independent verification, censorship resistance, cryptography, and permissionless access. The class behind every short evaluation we publish."
  keywords:
    - "protocol evaluation"
    - "independent verification"
    - "censorship resistance"
    - "cryptography"
    - "permissionless"
    - "self-custody"
    - "block explorer"
    - "Web3"
  ogImage: "/og-protocol-and-principle.png"
knowledgeGraph:
  nodes:
    - { id: "verification", label: "Independent Verification", type: "concept" }
    - { id: "censorship-resistance", label: "Censorship Resistance", type: "concept" }
    - { id: "cryptography", label: "Cryptography", type: "concept" }
    - { id: "permissionless", label: "Permissionless Access", type: "concept" }
    - { id: "explorer", label: "Block Explorer", type: "concept" }
    - { id: "keys", label: "Signing Keys", type: "concept" }
    - { id: "treasury", label: "Treasury", type: "concept" }
    - { id: "protocol-eval", label: "Protocol Evaluations", type: "concept" }
    - { id: "self-custody", label: "Self-Custody", type: "concept" }
    - { id: "multisig", label: "Multisig / Upgrade Pattern", type: "concept" }
  edges:
    - { from: "verification", to: "explorer", label: "anchored to" }
    - { from: "verification", to: "treasury", label: "checks balances on" }
    - { from: "censorship-resistance", to: "multisig", label: "weakened by" }
    - { from: "cryptography", to: "keys", label: "is the holding" }
    - { from: "keys", to: "self-custody", label: "lost without" }
    - { from: "permissionless", to: "verification", label: "gives the door to" }
    - { from: "permissionless", to: "censorship-resistance", label: "gives the door to" }
    - { from: "permissionless", to: "cryptography", label: "gives the door to" }
    - { from: "protocol-eval", to: "verification", label: "read through" }
    - { from: "protocol-eval", to: "censorship-resistance", label: "read through" }
    - { from: "protocol-eval", to: "cryptography", label: "read through" }
    - { from: "protocol-eval", to: "permissionless", label: "read through" }
---

# Protocol and Principle — How We Read a Protocol

When a treasury is being asked to put real resources behind a protocol, the question is never only "is the number big enough." It is "what is this system actually asking us to trust, and can we verify the answer?"

Our short protocol evaluations — the Aave V3 on Base note, the Aerodrome on Base note, and the ones that will follow — answer the first question with numbers. TVL, audit history, risk score, recommendation. Those numbers are real. They are also the surface.

Underneath them are four principles. They are what the numbers are trying to measure. They are what the reader is being asked to believe. They are also what anyone can check for themselves.

This is the class behind the evaluations.

## Context first — what kind of trust

Most financial systems ask for trust by atmosphere. A bank, a fund manager, an exchange — you trust them because of the brand, the building, the regulator, the relationship. When you ask for proof, you are told to take it on faith, or to wait for a quarterly statement, or to call support.

A protocol is a different kind of object. It is software that anyone can read. Its state lives on a chain that anyone can inspect. Its rules execute whether or not anyone approves. That changes what "trust" can mean. Trust becomes something closer to evidence: a path from a claim to a place where a person can look for themselves.

Four principles follow from that change. They are not slogans. They are the operating discipline behind every short evaluation we publish.

## The four principles

### 1. Independent verification — see for yourself

The first principle is the simplest, and the most often skipped.

A claim about a protocol should resolve to something the reader can look at directly. Not a summary. Not a screenshot. An address, a transaction hash, a contract. Something that, when pasted into a block explorer, shows what is actually there.

This is the move that turns trust from a relationship into evidence. A protocol evaluation that says "treasury holds X of asset Y on chain Z" is only honest if the reader can paste the wallet address into a block explorer and see X of Y sitting at that address right now. If the claim is true, the explorer confirms it. If the claim is false, the explorer also confirms that, and the evaluation is wrong.

The block explorer is the ground. When the principles are being followed, every important number in an evaluation is anchored to one.

### 2. Censorship resistance — the protocol answers to the math, not the office

The second principle asks a harder question: who can stop this system, and how?

A well-built protocol has no admin key that can quietly undo it, freeze user funds, or blocklist addresses because someone with leverage asked nicely. The rules live in code that anyone can read. The network enforces them collectively. The system does what its code says it will do, even when that is inconvenient for whoever currently has the most power.

This is not automatic. Every protocol has seams where censorship can enter: an upgrade pattern controlled by a multisig, an oracle that can be pressured, a front-end that can refuse service, an emergency shutdown that pauses everything. The principle asks us to read the seams, name them, and decide whether they are acceptable.

Censorship resistance is not a political slogan. It is an engineering property that protects the user from the moment someone powerful decides the user should stop.

### 3. Cryptography — the math does the holding

The third principle is about who controls the keys.

In a cryptographic system, the only thing that can move an asset is a valid signature from the key that owns it. There is no hotline to a support team that can reverse a transaction, restore an account, or freeze a wallet. The signing key is the whole relationship. Lose it and the assets are gone. Hold it and the assets are yours in a way no institution can revoke.

That has consequences for how a protocol is evaluated. A protocol that is mathematically censorship-resistant at the smart-contract layer becomes ordinary the moment a custodian sits between the user and the contract. The cryptography is still there. It is no longer doing the holding.

Self-custody is not a lifestyle choice. It is the security model. The moment someone else holds the keys, the third principle has been quietly given away.

### 4. Permissionless — the door is the door

The fourth principle asks the simplest question of all: can anyone participate?

A permissionless system lets a person interact without asking. No KYC gate. No whitelist. No application. The protocol does not care who you are; it cares that you can produce a valid signature and pay the gas.

This principle is often half-present. Some protocols are permissionless at the smart-contract layer and permissioned at the front-end — anyone can call the contract directly, but the website only serves wallets that have been cleared. The principle asks whether the underlying system is genuinely open, even if some interfaces are not.

Permissionless is what gives the other three principles somewhere to live. Verification, resistance, and cryptography are courtesy if they are gated by someone else's permission. They become property only when the door is open.

## Reading any protocol evaluation — the practice

These four principles double as a reading lens. When you open a protocol evaluation — ours or anyone else's — the numbers tell you what to look at. The four principles tell you what to look *for*.

Before you trust the TVL, ask whether the address is verifiable on a block explorer. Before you trust the risk score, ask where the upgrade keys sit and who can move them. Before you trust the audit, ask whether the cryptography the audit covers is the cryptography that actually holds the user's assets. Before you trust the integration, ask whether a person with nothing but a wallet can use it directly.

If the answer to all four is yes, the protocol is doing what it claims. If any answer is no, the gap is the next question to ask.

The short evaluations we publish follow the same discipline. The numbers are anchors — TVL, audit history, recommendation. The narrative walks through where each principle holds and where the seams are. A reader who knows the four lenses can read any of them and know what to check, what to take on faith, and what to come back to later.

## The implication

The four principles describe what we are trying to build as well as what we are trying to read.

A treasury you can verify on a block explorer. Operations that answer to math rather than to whoever has the loudest voice in the room. Keys the community holds rather than keys that can be quietly taken. Doors that do not require permission to enter.

That is not a coincidence. The principles we use to read a protocol are the principles we are using to build one. When the same discipline shows up in both places, the evaluations and the operations are not separate conversations. They are the same conversation, told from different sides of the table.

## The invitation

The next time you see a protocol evaluation — ours or otherwise — pause before the numbers.

Ask the four questions. See whether the system is actually asking you to verify, or asking you to believe. Notice where the seams are. Notice who holds the keys.

That is the work beneath the work. The numbers will move. The principles do not.