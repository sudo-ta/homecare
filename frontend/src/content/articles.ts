import type { Article } from '@shared/types/index.js';

/**
 * Articles.
 *
 * Unlike the professional profiles and reviews, these are not claims about real
 * people, so they are not demo-gated. They are genuine, useful writing for the
 * reader spec 2 describes: someone arranging care at short notice after a
 * discharge, who needs a practical answer tonight.
 *
 * Spec 6.6 sets the floor at six real articles, because an index of
 * placeholders is worse than no blog.
 *
 * Body format is markdown-lite: ## headings, - list items, blank-line
 * separated paragraphs. Rendered by ArticleBody.
 */
export const articles: Article[] = [
  {
    id: 'art-1',
    slug: 'what-to-ask-before-hospital-discharge',
    title: 'What to ask the hospital before you take someone home',
    excerpt:
      'Discharge happens fast and usually at the worst possible moment. These are the questions worth asking while the doctor is still in front of you.',
    category: 'After hospital',
    author: 'Dr Priya Nair',
    authorRole: 'Clinical director',
    publishedAt: '2026-08-28',
    readingMinutes: 6,
    coverImage: null,
    isPublished: true,
    body: `Discharge is usually announced with a few hours' notice, on a busy ward, to whichever family member happens to be standing there. By the time you are home with a bag of medicines, the doctor who knows the case is unreachable.

Ask these before you leave the building.

## About the medicines

- Which of these is new, and which was he already taking?
- Is anything he took before now stopped? Ask them to say it out loud, not just leave it off the list.
- What is each one for, in one sentence?
- Which can be crushed if he cannot swallow tablets?
- What do we do if a dose is missed?

The single most common problem in the first week at home is a medicine list that nobody reconciled. The hospital list and the list on the kitchen shelf are different, and the family is giving both.

## About the wound, line or tube

- Who changes this dressing, how often, and with what?
- What does it look like when it is healing normally?
- What does it look like when it is not, and who do we call?
- Is there anything that must not get wet?

Ask them to show you once. Watching it done is worth more than a written instruction.

## About movement

- How much should he be walking by the end of this week? By the end of next?
- Is there anything he must not do - lift, bend, climb stairs, drive?
- Does he need a walker or a raised toilet seat, and where do we get one today?

## About what would make you worried

This is the most useful question on the list, and almost nobody asks it.

Phrase it exactly like this: "What would make you want to see him back here?" A good doctor will give you three or four specific things - a temperature above a number, a wound that starts smelling, a calf that swells, confusion that was not there yesterday. Write them down. That list is what turns a vague night-time worry into a decision.

## Get it in writing

Ask for the discharge summary before you leave, not posted later. If you are arranging nursing at home, whoever comes will work from that document. Without it they are guessing, and they should not have to.`,
  },

  {
    id: 'art-2',
    slug: 'making-a-bathroom-safe-after-a-fall',
    title: 'Making a bathroom safe for someone who has had a fall',
    excerpt:
      'Most falls at home happen in the bathroom, and most of the fixes cost under two thousand rupees.',
    category: 'Safety at home',
    author: 'Dr Anjali Mehta',
    authorRole: 'Physiotherapist',
    publishedAt: '2026-08-14',
    readingMinutes: 5,
    coverImage: null,
    isPublished: true,
    body: `A fall is rarely the beginning of a decline. It is usually the middle of one. By the time someone falls, they have been avoiding things for months - not bathing when alone, holding furniture on the way across a room, stopping halfway up stairs.

The bathroom is where it usually happens: wet tile, a high threshold, nothing to hold, and a person who does not want to ask for help with the one thing they most want to do privately.

## The four cheapest fixes

**A grab rail beside the toilet and one in the shower.** Screwed into the wall, not suction-cupped. Suction rails come off under load, which is precisely when they are being used. A fitted rail costs a few hundred rupees and a fitter an hour.

**A plastic stool in the shower.** Standing on one leg to wash the other is the single riskiest thing most older people do each day. Sitting removes it.

**A rubber mat inside and a non-slip mat outside.** The step out, onto a smooth wet floor, is where people go down.

**A light that is already on.** A night-time trip to the bathroom in the dark, half asleep, is the classic fall. A plug-in sensor light in the corridor costs very little.

## The threshold

Many Indian bathrooms have a raised lip at the door to keep water in. It is also exactly the height that catches a foot that is no longer being lifted fully. A small ramp on the dry side, or having the lip ground down, removes the problem permanently.

## What to change about the routine

- Move bathing to a time when someone else is in the house.
- Keep everything needed at waist height. Reaching up while wet is how people lose balance.
- Replace a lungi or long nightdress with something that cannot be stepped on.
- If the door locks, fit one that can be opened from outside. A person on the floor behind a locked door is a much worse problem than a person on the floor.

## When to get an assessment

If there has already been one fall, the chance of another inside a year is high. A physiotherapist who comes to the house will watch the actual route from bed to bathroom and see things a list cannot cover - the rug that slides, the chair that is too low to rise from, the shoes with no back.

That is the part a clinic cannot do, because the clinic does not have your corridor in it.`,
  },

  {
    id: 'art-3',
    slug: 'home-care-or-hospital-how-families-decide',
    title: 'Home care or hospital: how families actually decide',
    excerpt:
      'There is a real line between what can be managed at home and what cannot. Here is roughly where it sits.',
    category: 'Choosing care',
    author: 'Dr Priya Nair',
    authorRole: 'Clinical director',
    publishedAt: '2026-07-30',
    readingMinutes: 7,
    coverImage: null,
    isPublished: true,
    body: `Families usually ask this question in the wrong order. They start with cost, then availability, then whether home care is "enough". The order that produces a good decision is the opposite.

## Start with what the patient actually needs

Some things genuinely need a hospital, and no amount of home nursing substitutes:

- Anything needing continuous monitoring with alarms
- Oxygen above what a home concentrator delivers
- Intravenous drugs that need a doctor present
- A condition still changing hour to hour
- Anything where the answer to "what if this goes wrong at 3am" is "we would need a theatre"

Most other things can be done at home, and many are done better there.

## What home is genuinely better at

**Sleep.** Nobody sleeps properly on a ward. Recovery needs sleep.

**Infection.** Hospitals concentrate the organisms you least want. For someone with a healing wound and a weakened immune system, home is safer.

**Eating.** People eat their own food. After surgery, appetite is the thing that comes back last and matters most.

**Confusion.** Older patients get disoriented in unfamiliar rooms, and it often does not fully reverse. Familiar surroundings prevent a problem that is very hard to undo.

**Dignity.** This is not a soft consideration. People who are bathed in their own bathroom by one consistent person recover differently from people bathed by a rotating ward staff behind a curtain.

## The honest constraints of home care

**One person at a time.** A nurse at home is one nurse. If something needs three people in ninety seconds, home is the wrong place.

**Equipment has limits.** A rented hospital bed and a concentrator cover a great deal. They do not cover everything.

**It asks something of the family.** Even with a full-time attendant, someone in the house makes decisions, answers the phone, and notices when things change. That load is real and worth naming before it is carried.

## A practical test

Ask the treating doctor one question: "If we take him home with a trained nurse on a twelve-hour shift, what specifically worries you?"

If the answer is a list of monitoring tasks, home care can usually cover it. If the answer is "he might need to be back in theatre", it cannot, and you have your answer.

## The middle option people forget

It is not a binary. A patient can go home with daily nursing visits rather than a full shift, or a full shift for the first ten days stepping down to visits. Most recoveries are managed this way, and it is usually both better and cheaper than either extreme.`,
  },

  {
    id: 'art-4',
    slug: 'what-police-verification-actually-checks',
    title: 'What a police verification actually checks, and what it does not',
    excerpt:
      'Every home care provider says their staff are verified. It is worth knowing what that word covers.',
    category: 'Choosing care',
    author: 'Meera Joshi',
    authorRole: 'Head of verification',
    publishedAt: '2026-07-11',
    readingMinutes: 4,
    coverImage: null,
    isPublished: true,
    body: `You are deciding whether to let a stranger into your house, for twelve hours a day, with a parent who cannot get out of bed. "Verified" is doing a lot of work in that sentence, so it is fair to ask what it means.

## What a police verification is

A police verification is a check against records held at the station covering a stated address. It returns whether there is a criminal case registered or pending against that person at that address.

It is genuinely useful. It is also narrower than most people assume.

## What it does not cover

**Other addresses.** A verification against a current address in Ahmedabad says nothing about a district someone left four years ago. This is the biggest gap, and the reason a verification alone is not enough.

**Anything not reported.** Most workplace misconduct never becomes a police case.

**Competence.** It is not a check on whether someone can actually manage a catheter.

## What should sit alongside it

- **Identity**, matched to a government photo ID, so the verification and the person are the same person.
- **Qualification**, checked with the issuing institution rather than read off a photocopy.
- **Council registration**, checked against the state nursing or medical council register and checked for expiry. An expired registration is common and easy to miss.
- **Previous employers**, actually telephoned. Two of them. This finds more than any document check.

## What to ask a provider

Ask these four, and pay attention to how specific the answers are:

1. Which of these checks do you do, and which do you skip?
2. Can I see the verification for the person you are sending, before they arrive?
3. What do you do when a check is still pending?
4. Has anyone been removed from your network in the last year, and what for?

A provider who has never removed anyone either has not been running long or is not checking.

## On pending verifications

Sometimes a genuinely good professional has a verification still in process. The right answer is not to hide it. The right answer is to tell the family before assigning, and let them decide. Anyone who does not mention it is making that decision for you.`,
  },

  {
    id: 'art-5',
    slug: 'eating-and-swallowing-after-a-stroke',
    title: 'Eating and swallowing after a stroke: what changes at home',
    excerpt:
      'Swallowing difficulty is common after a stroke and is the reason many patients end up back in hospital. Most of the management happens at the kitchen table.',
    category: 'Recovery',
    author: 'Dr Anjali Mehta',
    authorRole: 'Physiotherapist',
    publishedAt: '2026-06-20',
    readingMinutes: 6,
    coverImage: null,
    isPublished: true,
    body: `After a stroke, a large proportion of patients have some difficulty swallowing. It often improves over weeks. In the meantime it is the single most likely reason for a readmission, because food or liquid going into the lungs causes a pneumonia that can be serious quickly.

The good news is that almost all of the management is practical and happens at home.

## The signs that swallowing is not safe

- Coughing or throat-clearing during or just after eating or drinking
- A wet, gurgling voice after a swallow
- Food staying in the mouth, or pocketing in one cheek
- Taking much longer over a meal than before
- A temperature that rises in the evening with no obvious cause

That last one matters. A low fever a day or two after a difficult meal is worth a phone call, not a wait-and-see.

## Positioning, which does most of the work

Sit fully upright, at ninety degrees, feet supported. Not propped at forty-five degrees in bed. Chin slightly down towards the chest when swallowing, never tipped back.

Stay sitting up for thirty minutes after the meal ends. Lying down straight after eating is how food comes back up and goes the wrong way.

## Texture

A speech and language therapist assesses and sets the right texture. Until then, err thicker rather than thinner: thin liquids like water and tea are the hardest to control and the most likely to go into the airway. Paradoxically, water is more dangerous than dal.

- Soft, moist, uniform textures are easiest
- Avoid mixed textures such as cereal in milk or soup with pieces in it
- Avoid dry crumbly things such as biscuits and plain rice
- Thickening powder makes liquids safer, and is widely available

## Pace

- Small spoonfuls. Half a teaspoon at a time is not too cautious.
- One mouthful at a time, fully swallowed before the next
- No talking while eating
- Stop if the person is tired. Fatigue makes swallowing worse, so the last third of a meal is the riskiest part.

## Mouth care

Brush teeth and clean the mouth twice a day, properly, even if the person is being fed through a tube. Most aspiration pneumonia comes from mouth bacteria going down with saliva, not from the food itself. Good mouth care is one of the most effective things a family can do and one of the most commonly skipped.

## When to call

Call the same day for a temperature, new breathlessness, or coughing that has clearly got worse. Do not wait for the next scheduled visit.`,
  },

  {
    id: 'art-6',
    slug: 'first-weeks-at-home-after-a-caesarean',
    title: 'The first weeks at home after a caesarean',
    excerpt:
      'A caesarean is major abdominal surgery followed immediately by caring for a newborn. Here is what the recovery actually asks for.',
    category: 'Mother and baby',
    author: 'Sunita Rathod',
    authorRole: 'Maternal and newborn care specialist',
    publishedAt: '2026-05-16',
    readingMinutes: 5,
    coverImage: null,
    isPublished: true,
    body: `A caesarean is abdominal surgery. If anyone else had the same operation they would be told to rest for six weeks and lift nothing. A new mother is instead handed a baby and expected to get up every two hours through the night.

Both things are true at once, and planning for that is the whole job.

## The wound

- Keep it clean and dry. Pat, do not rub.
- Loose clothing above the waistband. Anything sitting on the scar will rub.
- Look at it once a day, in good light, or have someone look.

Call the same day for increasing redness spreading outwards, swelling that is firm and hot, any discharge, a temperature above 38, or pain that is getting worse rather than better after the fourth or fifth day. Pain that increases after it had started improving is the one that matters most.

## Lifting

Nothing heavier than the baby, for six weeks. This is the instruction most often broken and it is the one that causes wound problems.

Getting out of bed: roll onto your side, drop your feet over the edge, and push up sideways with your arms. Never sit straight up from flat. Hold a pillow against the scar when coughing, sneezing or laughing.

## Feeding position

The standard cradle hold puts the baby directly on the scar. Two alternatives avoid it:

- **Rugby hold**: baby tucked along your side, under your arm
- **Side-lying**: both of you on your sides, which also lets you rest

Feeding is going to take eight hours a day in the first weeks. Getting the position right on day two saves a great deal.

## What actually needs to be arranged

The realistic list, in order of how much difference it makes:

1. **Someone who takes the baby for one four-hour block so the mother sleeps.** Fragmented sleep is what breaks people. One consolidated block changes the week.
2. **Food that arrives without the mother cooking it.**
3. **Someone to lift and carry.** Not the mother, for six weeks.
4. **A second pair of hands at the 3am feed**, at least for the first fortnight.

## The part nobody schedules

Mood after a caesarean, particularly an unplanned one, is often harder than after a vaginal birth. Feeling flat, frightened, or detached from the baby is common and is not a failure. If it is still there after two weeks, or there are thoughts of harm, that is a same-day call to a doctor, not something to wait out.`,
  },
];

export const publishedArticles = (): Article[] =>
  articles
    .filter((a) => a.isPublished)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export const articleBySlug = (slug: string): Article | undefined =>
  articles.find((a) => a.slug === slug && a.isPublished);

export const articleCategories = (): string[] =>
  [...new Set(publishedArticles().map((a) => a.category))].sort();
