// Run with: npx tsx scripts/update-modules.ts

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://craxdxdldvoknszloeps.supabase.co'
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

async function updateModule(id: string, content: { blocks: unknown[] }) {
  const res = await fetch(`${SB_URL}/rest/v1/academy_training_modules?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SB_KEY,
      'Authorization': `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ content }),
  })
  if (!res.ok) {
    console.error(`Failed to update ${id}: ${res.status} ${await res.text()}`)
  } else {
    console.log(`Updated ${id}`)
  }
}

async function main() {
  // 1. Presence (welcome path)
  await updateModule('1cb85d00-e2a7-41d0-9ef4-eefa7cc43a22', {
    blocks: [
      { type: 'heading', data: { text: 'Presence', level: 2 } },
      { type: 'text', data: { html: '<p>Presence is the foundation of everything we do at Still & Social. It means being fully here — in body, mind, and attention — for every guest, every interaction, every moment.</p><p>When you are present, guests feel it. They feel seen, heard, and valued. When you are distracted, they feel that too.</p>' } },
      { type: 'highlight', data: {
        text: 'At Still & Social, {presence} means giving each guest your {undivided attention}. It is the practice of {intentional hospitality} — making every interaction purposeful and meaningful.',
        definitions: {
          'presence': 'Being fully in the moment with each guest — not thinking about the next table or your phone.',
          'undivided attention': 'Making the person in front of you feel like the only person in the room.',
          'intentional hospitality': 'Every interaction is purposeful and designed to make guests feel valued, not just served.',
        },
      }},
      { type: 'divider', data: {} },
      { type: 'scenario', data: {
        situation: 'You are taking an order at Table 4. A guest at Table 7 catches your eye and waves. The guest at Table 4 is mid-sentence describing their dietary requirements.',
        options: [
          { text: 'Quickly acknowledge Table 7 with a nod and finish with Table 4', correct: true, feedback: 'A brief, warm acknowledgement shows Table 7 they have been seen, while your full attention stays on Table 4. This is presence in action.' },
          { text: 'Excuse yourself from Table 4 to check on Table 7', correct: false, feedback: 'Leaving mid-conversation makes Table 4 feel unimportant. Their dietary needs are critical and deserve your full attention.' },
          { text: 'Ignore Table 7 and continue with Table 4', correct: false, feedback: 'While staying with Table 4 is right, completely ignoring Table 7 makes them feel invisible. A brief nod costs nothing.' },
        ],
      }},
      { type: 'divider', data: {} },
      { type: 'comparison', data: {
        before: { label: 'Distracted service', text: 'Looking at your phone between tables. Thinking about when your shift ends. Having side conversations with other staff while guests are seated nearby. Rushing through greetings to get to the next task.' },
        after: { label: 'Present service', text: "Making eye contact when a guest speaks. Noticing when a water glass is low before being asked. Remembering a returning guest's name or preference. Taking a breath before approaching each new table." },
      }},
      { type: 'tip', data: {
        title: 'The one-breath reset',
        text: 'Before approaching any table, take one slow breath. This micro-pause clears the noise of service and brings you back to the present moment. It takes one second and transforms the quality of your interaction.',
      }},
    ],
  })

  // 2. Step 1: Welcome (sequence of service)
  await updateModule('285d76fb-5c61-4df2-aae8-41f8f3bee384', {
    blocks: [
      { type: 'heading', data: { text: 'Step 1: Welcome', level: 2 } },
      { type: 'text', data: { html: '<p>The welcome sets the tone for the entire dining experience. A guest decides within the first 30 seconds whether they feel comfortable, valued, and excited to be here. Your greeting is the most important moment of their visit.</p>' } },
      { type: 'timeline', data: {
        items: [
          { time: '0 sec', title: 'Guest arrives', description: 'Notice them immediately. Make eye contact and smile before they reach the host stand.' },
          { time: '10 sec', title: 'Warm greeting', description: 'Welcome them by name if they have a booking. Use a warm, unhurried tone.' },
          { time: '20 sec', title: 'Confirm booking', description: 'Check their reservation, note any special requests or occasions.' },
          { time: '30 sec', title: 'Guide to table', description: 'Walk at their pace. Offer to take coats or bags. Introduce the space.' },
          { time: '45 sec', title: 'Seat and settle', description: 'Pull out chairs. Place menus gently. Let them know their waiter will be with them shortly.' },
        ],
      }},
      { type: 'divider', data: {} },
      { type: 'flipcards', data: {
        items: [
          { front: 'Booking guest', back: '"Welcome to Still & Social, you must be [Name]. We have a lovely table ready for you — right this way."' },
          { front: 'Walk-in guest', back: '"Welcome to Still & Social. Let me check what we have available for you this evening. How many will be dining?"' },
          { front: 'Returning guest', back: '"Welcome back! Lovely to see you again. Your usual table is ready — or would you like to try something different tonight?"' },
          { front: 'Special occasion', back: '"Happy [occasion]! We are so glad you have chosen to celebrate with us. We have everything prepared for you."' },
        ],
      }},
      { type: 'divider', data: {} },
      { type: 'scenario', data: {
        situation: 'A couple arrives 20 minutes early for their booking. The restaurant is busy and their table is not yet ready. They look a little uncertain standing at the entrance.',
        options: [
          { text: 'Ask them to wait outside and come back in 20 minutes', correct: false, feedback: 'This feels dismissive and unwelcoming. They are your guests from the moment they walk in.' },
          { text: 'Welcome them warmly, offer them a drink at the bar while their table is prepared', correct: true, feedback: 'This turns a potential frustration into a positive experience. They feel welcomed immediately and the bar adds to their evening.' },
          { text: 'Rush to clear their table so they can sit immediately', correct: false, feedback: 'While well-intentioned, rushing creates stress for the team and the previous guests. A smooth transition is better for everyone.' },
        ],
      }},
      { type: 'tip', data: {
        title: 'Remember',
        text: 'The welcome is not a script — it is a feeling. Read the energy of each guest. Some want warmth and conversation, others want efficiency and space. Presence means adapting to what they need.',
      }},
    ],
  })

  // 3. Wine Knowledge (bartender training)
  await updateModule('f18f40e2-7df7-4ae2-a906-6a343ec29672', {
    blocks: [
      { type: 'heading', data: { text: 'Wine Knowledge', level: 2 } },
      { type: 'text', data: { html: '<p>Understanding wine is essential for creating exceptional guest experiences at Still & Social. You do not need to be a sommelier — you need to be confident enough to guide guests toward something they will love.</p><p>This module covers the core wines on our list and how to pair them with our menu.</p>' } },
      { type: 'matching', data: {
        instruction: 'Match each wine to its ideal food pairing from our menu',
        pairs: [
          { left: 'Pinot Noir', right: 'Duck breast' },
          { left: 'Sauvignon Blanc', right: 'Crispy barramundi' },
          { left: 'Shiraz', right: 'Wagyu beef' },
          { left: 'Riesling', right: 'Thai green curry' },
          { left: 'Chardonnay', right: 'Roast chicken' },
          { left: 'Ros\u00e9', right: 'Prawn linguine' },
        ],
      }},
      { type: 'divider', data: {} },
      { type: 'flipcards', data: {
        items: [
          { front: 'Pinot Noir', back: 'Light-to-medium bodied red. Silky tannins, cherry and earth notes. Versatile with food — works with duck, salmon, mushrooms. Serve slightly cool (16\u00b0C).' },
          { front: 'Sauvignon Blanc', back: 'Crisp, refreshing white. Citrus and herbaceous notes. Pairs beautifully with seafood, salads, and lighter dishes. Serve well chilled.' },
          { front: 'Shiraz', back: 'Full-bodied red. Dark fruit, pepper, spice. Our go-to recommendation for red meat dishes. Serve at room temperature.' },
          { front: 'Riesling', back: 'Can be dry or sweet. Floral, citrus, stone fruit. Incredible with spicy dishes — the sweetness balances heat. Serve cold.' },
          { front: 'Chardonnay', back: 'Medium-to-full bodied white. Can be oaky and buttery or crisp and mineral. Pairs with richer dishes — chicken, cream sauces. Serve lightly chilled.' },
          { front: 'Ros\u00e9', back: 'Light and refreshing. Strawberry, watermelon notes. Perfect aperitif or with lighter pasta dishes and seafood. Serve well chilled.' },
        ],
      }},
      { type: 'divider', data: {} },
      { type: 'tip', data: {
        title: 'Confidence over expertise',
        text: 'Guests do not expect you to be a wine expert. They want you to be confident, honest, and helpful. If you do not know the answer, say "Great question — let me check with our bar team" rather than guessing.',
      }},
    ],
  })

  console.log('All modules updated.')
}

main().catch(console.error)
