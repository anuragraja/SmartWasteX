const fs = require('fs');

async function analyzeWasteImage(imagePath, mimeType, imageUrl = null) {
  try {
    // If we have an Anthropic key, we can use Claude
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'mock') {
      console.log('No valid ANTHROPIC_API_KEY found, returning fallback AI response');
      return getFallbackResponse();
    }

    const imageData = fs.readFileSync(imagePath).toString('base64');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageData } },
              {
                type: 'text',
                text: 'Analyze this garbage/waste image and return ONLY a JSON object exactly matching this structure (no markdown, no extra text): {"wasteLevel": "High", "priority": "Emergency", "overflow": true, "pollutionScore": 92, "recyclable": true, "estimatedSeverity": "Critical"}. Rules: wasteLevel can be Low, Normal, High, Critical. priority can be Low, Normal, High, Emergency. overflow boolean. pollutionScore 0-100. recyclable boolean. estimatedSeverity string. If you cannot analyze, return a fallback JSON.',
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Anthropic API Error:', await response.text());
      return getFallbackResponse();
    }

    const data = await response.json();
    const text = data.content[0].text.trim();
    return JSON.parse(text.replace(/^```json\n?|\n?```$/g, ''));
  } catch (error) {
    console.error('AI Analysis failed:', error.message);
    return getFallbackResponse();
  }
}

function getFallbackResponse() {
  return {
    wasteLevel: "Normal",
    priority: "Normal",
    overflow: false,
    pollutionScore: 50,
    recyclable: false,
    estimatedSeverity: "Normal"
  };
}

module.exports = { analyzeWasteImage };
