// Chat API endpoint for handling interactions with LLM
export async function onRequestPost(context) {
  try {
    // Get request body
    const request = context.request;
    const body = await request.json();
    const { message, sessionId, language = 'ar' } = body;
    
    // Get headers for CORS
    const headers = {
      'Access-Control-Allow-Origin': context.env.SITE_URL || '*',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };
    
    // Store session and message in KV if available
    if (context.env.CHAT_SESSIONS) {
      let session = await context.env.CHAT_SESSIONS.get(sessionId);
      session = session ? JSON.parse(session) : { messages: [] };
      session.messages.push({ role: 'user', content: message });
      await context.env.CHAT_SESSIONS.put(sessionId, JSON.stringify(session));
    }
    
    // Process message and determine intent
    const domainIntents = {
      healthcare: ['health', 'medical', 'doctor', 'clinic', 'mdlinc', 'healthplace'],
      automation: ['automate', 'workflow', 'zapier', 'power automate', 'jira', 'github actions'],
      education: ['learn', 'course', 'academy', 'education', 'training', 'workshop'],
      'content-creation': ['blog', 'social media', 'youtube', 'podcast', 'ebook'],
      'ai-tech': ['ai', 'artificial intelligence', 'ml', 'machine learning', 'python', 'brainai'],
      finance: ['finance', 'payment', 'stripe', 'paypal', 'fintech'],
      iot: ['iot', 'hardware', 'raspberry pi', 'arduino', 'smartcity']
    };
    
    // Simple intent detection (in real implementation, use a more sophisticated approach)
    let detectedDomain = null;
    const messageLower = message.toLowerCase();
    
    for (const [domain, keywords] of Object.entries(domainIntents)) {
      if (keywords.some(keyword => messageLower.includes(keyword))) {
        detectedDomain = domain;
        break;
      }
    }
    
    // Generate response based on intent
    let response;
    if (detectedDomain) {
      response = {
        text: `I'd be happy to tell you about our ${detectedDomain.replace('-', ' ')} solutions. Would you like specific information about any of our products in this area?`,
        domain: detectedDomain,
        recommendedLinks: [`/${detectedDomain}`],
        hasIntent: true
      };
    } else {
      response = {
        text: "Welcome to BrainSAIT! I'm your AI assistant. I can help you learn about our healthcare solutions, automation services, educational offerings, content creation, AI technologies, finance services, or IoT projects. What would you like to know more about?",
        domain: null,
        recommendedLinks: ['/'],
        hasIntent: false
      };
    }
    
    // Return response
    return new Response(JSON.stringify(response), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': context.env.SITE_URL || '*'
      }
    });
  }
}

// Handle OPTIONS requests for CORS
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}
