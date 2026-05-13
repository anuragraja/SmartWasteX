const fs = require('fs');

async function analyzeWasteImage(imagePath, mimeType) {
  const imageData = fs.readFileSync(imagePath).toString('base64');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageData } },
            {
              type: 'text',
              text: 'Analyze this dustbin image and return ONLY a JSON object with these fields: isValidDustbin (boolean), fillLevel ("Empty"|"Low"|"Medium"|"Full"|"Overflow"), priority ("Low"|"Normal"|"High"|"Emergency"), pollutionScore (0-100), confidence (0-100), reason (string). No extra text.',
            },
          ],
        },
      ],
    }),
  });

  const data = await response.json();
  const text = data.content[0].text.trim();
  return JSON.parse(text.replace(/^```json\n?|\n?```$/g, ''));
}

module.exports = { analyzeWasteImage };
