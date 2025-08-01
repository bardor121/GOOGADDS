
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const N8N_CONTACT_WEBHOOK = process.env.N8N_CONTACT_WEBHOOK;
const N8N_COUPON_WEBHOOK = process.env.N8N_COUPON_WEBHOOK;

exports.handler = async function(event, context) {
    // We only accept POST requests for security.
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { action, payload } = JSON.parse(event.body);

        // This switch statement acts as a router for different actions.
        // Your frontend will tell the backend which action to perform.
        switch (action) {
            case 'analyzeProcess':
                return await handleGeminiRequest(payload.prompt);
            
            case 'calculateRoi':
                return await handleGeminiRequest(payload.prompt);

            case 'submitContactForm':
                return await handleN8nWebhook(N8N_CONTACT_WEBHOOK, payload.data);

            case 'submitCouponForm':
                return await handleN8nWebhook(N8N_COUPON_WEBHOOK, payload.data);

            default:
                return { statusCode: 400, body: 'Invalid action' };
        }
    } catch (error) {
        console.error('Error in proxy function:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'An internal error occurred.' }) };
    }
};

// ============================================
// Helper function for Gemini API calls
// ============================================
async function handleGeminiRequest(prompt) {
    if (!GEMINI_API_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Gemini API key is not configured.' }) };
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Gemini API Error:', errorBody);
            throw new Error(`Gemini API responded with status: ${response.status}`);
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Could not process the request.';
        
        return {
            statusCode: 200,
            body: JSON.stringify({ text })
        };
    } catch (error) {
        console.error('Error calling Gemini:', error);
        return { statusCode: 502, body: JSON.stringify({ error: 'Failed to call Gemini API.' }) };
    }
}

// ============================================
// Helper function for n8n Webhook calls
// ============================================
async function handleN8nWebhook(webhookUrl, data) {
    if (!webhookUrl) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Webhook URL is not configured.' }) };
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('n8n Webhook Error:', errorBody);
            throw new Error(`n8n webhook responded with status: ${response.status}`);
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Success' })
        };
    } catch (error) {
        console.error('Error calling n8n webhook:', error);
        return { statusCode: 502, body: JSON.stringify({ error: 'Failed to call n8n webhook.' }) };
    }
}
