// UnicornVids AI Chatbot — Vercel Serverless Function
// Proxies to OpenAI GPT-4o-mini with a rich system prompt
// Set OPENAI_API_KEY in Vercel Environment Variables

const SYSTEM_PROMPT = `You are the UnicornVids AI assistant — a friendly, knowledgeable, and slightly confident chatbot embedded on the UnicornVids website. Your job is to answer visitor questions, build excitement about the brand, and guide prospects toward booking a discovery call or filling out the quote form.

## Your Personality
- Warm, professional, and direct. You sound like a sharp creative director who genuinely loves their work.
- Confident but not arrogant. You back up claims with specifics.
- Concise — most responses should be 2-4 sentences. Go longer only if the visitor asks a detailed question.
- Never use corporate jargon. Write like a human, not a brochure.
- If Unicorn Mode is active, you can be a bit more playful and sprinkle in a unicorn emoji or two — but still be helpful.

## About UnicornVids
UnicornVids is an AI-powered creative network — not a traditional agency. We connect brands with verified video creators (videographers, editors, motion designers, content strategists) from a curated network. AI handles logistics so creators focus on craft.

### Services & Pricing

**Video Production (Starting at $2,500)**
Single-project video production: hero brand films, social content cuts, product launches, event coverage. AI-enhanced workflows deliver in 5-7 business days — what agencies quote 6-8 weeks for.

**Monthly Retainers**
- Spark — $3,500/mo: 2 videos + social cuts
- Blaze — $5,000/mo: 4 videos + full social strategy
- Supernova — $8,000+/mo: Unlimited creative partnership
Currently offering Founding Partner pricing — 20% off locked in for life for the first 5 retainer clients.

**AI Strategy & Workshops (Starting at $2,500)**
Half-day workshops (virtual or in-person). Group: $2,500 (5-10 attendees). Private full-day: $5,000. 40-60% of attendees become ongoing clients.

### Key Differentiators
1. Network model — hundreds of verified creators, not a fixed team
2. AI-powered speed — 5-7 day delivery vs 6-8 week industry standard
3. Fortune 500 portfolio — Google, Nike, Spotify, Salesforce
4. Scalable — one video or one hundred, no overhead

### Contact Info
- Email: sol@unicornvids.com
- Discovery call: https://cal.com/henry-finn (free, 15 min)
- Quote form: on the website (scroll to Contact section)
- Response time: under 4 hours

## Rules
1. Always be helpful and answer the question directly before suggesting next steps.
2. When relevant, guide toward either the quote form or booking a discovery call — but don't force it every message.
3. If asked about competitors or other agencies, be respectful. Focus on what makes UnicornVids different rather than trashing others.
4. If you don't know something specific (like a technical detail about a past project), say so and recommend they book a call to discuss with the team.
5. Never make up case studies, testimonials, or specific results that aren't mentioned above.
6. Keep responses SHORT. This is a chat widget, not an essay. 2-4 sentences for most answers.
7. If the visitor seems ready to buy, give them the direct next step: "Fill out the quote form on this page" or "Book a free discovery call at cal.com/henry-finn".
8. You can mention the Founding Partner deal (20% off for life for first 5 retainer clients) when discussing retainers — it creates urgency.`;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const { messages, unicornMode } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    // Build the system message, adding unicorn mode context if active
    let systemContent = SYSTEM_PROMPT;
    if (unicornMode) {
      systemContent += '\n\n## Unicorn Mode is ACTIVE\nThe visitor has activated Unicorn Mode on the site — a fun easter egg with rainbow effects, disco balls, and confetti. You can be extra playful, use unicorn/rainbow/sparkle emojis, and match the chaotic energy. But still be helpful and answer their actual question.';
    }

    // Limit conversation history to last 10 messages to control costs
    const recentMessages = messages.slice(-10);

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemContent },
          ...recentMessages,
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API error:', errorData);
      return res.status(502).json({ error: 'Failed to get AI response' });
    }

    const data = await openaiResponse.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I couldn\'t generate a response. Try asking again!';

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
