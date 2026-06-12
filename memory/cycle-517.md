# Cycle 517 — 2026-06-12

## F-229: Deep UX Evolution — Content & Mobile

### What was done

#### UX Improvements
- **MandalaNarrative**: areas accordion now **open by default** — users immediately see the 6 life areas with deep narrative content without having to tap to expand. User's core complaint: "teu número é 11, tá, mas e daí?" — the accordion hiding the depth was part of the problem.
- **synthesisParagraph**: now leads with the Akasha Type (e.g. "Você é O Canal — o que recebe, traduz e transmite sem segurar para si.") then integrates all 4 pillars into one flowing narrative. Previously was a listing: "Kabala: X. Astrologia: Y. Tantra: Z."

#### Content Fixes
- Fix English/Chinese contamination in element narratives:
  - ar/vitalidade: `静` → `quietude`
  - ar/conexoes: `friend zone` → `zona de amigo`
  - água/ori: `others` → `outros`
  - água/missao: `container` → `receptáculo`
  - água/desafios: `feel` → `sentem`
  - conexoes synthesis: `Relationships` → `vínculos`
- Fix Odu Ofun: `consulted`, `参考`, `outros`, `excuse` → all Portuguese
- Fix Odu Irete: remove English interlopers + duplicate `desafiosSombras`
- Fix structural: duplicate closing brace in `ODU_AREA_NARRATIVES` after Ofun block

#### Architecture
- `buildAkashaSynthesis`: derive `oneProfile` BEFORE calling `genSynthesisParagraph` so type context is available
- `generateSynthesisParagraph`: accepts `typeName` param, leads with type essence, uses Lua position for emotional need context, expands Odu descriptions with elemental + orixa regency info
- `buildPracticalAdvice`: switch-case was using generic fallback for all non-vitalidade areas — now all areas have specific advice
- Capacitor Android: add `subprojects` override in root `build.gradle` to force Java 17 compatibility (was failing with "invalid source release: 21" since @capacitor/android@8.4.0 uses Java 21 but only JDK 17 available)
- `capacitor.build.gradle`: downgrade from Java 21 to Java 17

### Verification
- Typecheck: clean
- Build: successful (18s compile + 638ms generate)
- APK: `android/app/build/outputs/apk/debug/app-debug.apk` (4.1MB) — rebuilt with Java 17

### Key Files Changed
- `src/components/akasha/MandalaNarrative.tsx` — areasOpen default true
- `src/lib/application/akasha/narrative-generator.ts` — synthesis + contamination fixes
- `src/lib/application/akasha/synthesis-engine.ts` — derive oneProfile before synthesis
- `android/build.gradle` — subprojects Java 17 override
- `android/app/capacitor.build.gradle` — Java 21 → 17

### Next
- Deploy to Vercel (build was already pushed)
- Verify mandala page shows deep narrative on first load
- Check if dashboard area cards show `integratedNarrative` or generic fallback
- Improve `buildTransformationPrompt` to use real pillar data (currently just returns defaultPrompt)
- Consider deeper integration: make SYNTHESIS templates less "A Cabala diz... A Astrologia acrescent..." listing and more single-voice narrative
