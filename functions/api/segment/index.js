// Segmentation API endpoint for processing user profile data
export async function onRequestPost(context) {
  try {
    // Get request body
    const request = context.request;
    const body = await request.json();
    
    // Get user data
    const { user_id, attributes } = body;
    
    // Set CORS headers
    const headers = {
      'Access-Control-Allow-Origin': context.env.SITE_URL || '*',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };
    
    // Use responses.json schema to process user segmentation
    // This is a simplified version of what would be a call to an AI model
    const userSegmentation = processUserSegmentation(attributes);
    
    // Store segment data in Supabase if credentials are available
    if (context.env.SUPABASE_URL && context.env.SUPABASE_SERVICE_KEY) {
      await saveToSupabase(context.env, user_id, attributes);
    }
    
    // Store session data in KV if available
    if (context.env.CHAT_SESSIONS) {
      let session = await context.env.CHAT_SESSIONS.get(user_id);
      session = session ? JSON.parse(session) : { messages: [], segmentation: {} };
      
      // Update session with segmentation data
      session.segmentation = userSegmentation;
      await context.env.CHAT_SESSIONS.put(user_id, JSON.stringify(session));
    }
    
    // Return segmentation results
    return new Response(JSON.stringify(userSegmentation), { headers });
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

// Process user segmentation based on attributes
function processUserSegmentation(attributes) {
  // This function emulates the segmentation logic defined in responses.json
  // In a production environment, this would likely call an AI model
  
  const { user_type, project_interest, intent, language } = attributes;
  
  // Map interests to services
  const serviceMap = {
    'healthcare': {
      service: 'BrainRCM',
      agent: 'HealthTeam',
      priority: 'high',
      domain: '/domains/healthcare'
    },
    'ai-tech': {
      service: 'BrainAI',
      agent: 'AITeam',
      priority: 'high',
      domain: '/domains/ai-tech'
    },
    'education': {
      service: 'BrainAcademy',
      agent: 'EduTeam',
      priority: 'medium',
      domain: '/domains/education'
    },
    'finance': {
      service: 'FinancePlace',
      agent: 'FinanceTeam',
      priority: 'medium',
      domain: '/domains/finance'
    },
    'iot': {
      service: 'SmartCityPlace',
      agent: 'IoTTeam',
      priority: 'medium',
      domain: '/domains/iot'
    },
    'automation': {
      service: 'WorkflowAutomation',
      agent: 'AutomationTeam',
      priority: 'medium',
      domain: '/domains/automation'
    },
    'content-creation': {
      service: 'ContentHub',
      agent: 'ContentTeam',
      priority: 'medium',
      domain: '/domains/content-creation'
    }
  };
  
  // Map intent to recommended actions
  const intentMap = {
    'learn': {
      action: 'documentation',
      channel: 'knowledge-base'
    },
    'invest': {
      action: 'sales',
      channel: 'sales-team'
    },
    'collaborate': {
      action: 'partnership',
      channel: 'business-development'
    },
    'demo': {
      action: 'demonstration',
      channel: 'product-team'
    },
    'support': {
      action: 'support',
      channel: 'support-team'
    },
    'join': {
      action: 'recruitment',
      channel: 'hr-team'
    }
  };
  
  // Get service and intent data
  const service = serviceMap[project_interest] || serviceMap['ai-tech']; // Default to AI-tech
  const intentData = intentMap[intent] || intentMap['learn']; // Default to learn
  
  // Build response based on schema
  return {
    userProfile: {
      attributes: attributes
    },
    segment: `${user_type}-${project_interest}`,
    recommendedService: service.service,
    assignedChannel: intentData.channel,
    assignedAgent: service.agent,
    priority: service.priority,
    recommendedDomain: service.domain,
    recommendedAction: intentData.action
  };
}

// Save user segmentation data to Supabase
async function saveToSupabase(env, user_id, attributes) {
  try {
    const { language, user_type, project_interest, intent, location = null, age = null, interests = [] } = attributes;
    
    // Validate required fields
    if (!language || !user_type || !project_interest || !intent) {
      throw new Error('Missing required fields for segmentation');
    }
    
    // Create Supabase client
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_KEY;
    
    // Prepare the request
    const response = await fetch(`${supabaseUrl}/rest/v1/user_segments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id,
        language,
        user_type,
        project_interest,
        intent,
        interests: Array.isArray(interests) ? interests : [interests],
        location,
        age: age ? parseInt(age) : null,
        source_channel: attributes.source_channel || 'web'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save to Supabase: ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Supabase error:', error);
    // Don't throw - we want the function to continue even if Supabase fails
    return false;
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
