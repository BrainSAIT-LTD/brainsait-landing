// Edge function for internationalization
// HTMLRewriter is provided by the Cloudflare Workers runtime environment
// No import needed as it's available globally

export async function onRequest(context) {
  // Get the original response
  const response = await context.next();
  
  // Get preferred language from request
  const request = context.request;
  const acceptLanguageHeader = request.headers.get('Accept-Language') || '';
  const url = new URL(request.url);
  
  // Check for language query parameter or use header preference
  let lang = url.searchParams.get('lang') || 
             acceptLanguageHeader.split(',')[0].split('-')[0] || 
             context.env.DEFAULT_LANGUAGE || 
             'ar';
  
  // Only process HTML responses
  const contentType = response.headers.get('Content-Type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }
  
  // Clone the response to modify it
  const newResponse = new Response(response.body, response);
  
  // Import translations dynamically
  try {
    // In a real implementation, you'd load translations from KV or other storage
    // For now, we'll use a simplified approach
    const translations = {
      ar: {
        welcome: "مرحباً! كيف يمكنني مساعدتك اليوم؟",
        send: "إرسال",
        placeholder: "اكتب رسالتك هنا...",
        assistant: "براين سايت المساعد"
      },
      en: {
        welcome: "Welcome! How can I help you today?",
        send: "Send",
        placeholder: "Type your message here...",
        assistant: "BrainSAIT Assistant"
      }
    };
    
    // Create HTML Rewriter to replace text content
    return new HTMLRewriter()
      .on('h3:first-of-type', {
        element(element) {
          if (element.getAttribute('data-i18n') === 'assistant') {
            element.setInnerContent(translations[lang].assistant);
          }
        }
      })
      .on('.message.bot .message-content:first-of-type', {
        element(element) {
          if (element.getAttribute('data-i18n') === 'welcome') {
            element.setInnerContent(translations[lang].welcome);
          }
        }
      })
      .on('.send-button', {
        element(element) {
          if (element.getAttribute('data-i18n') === 'send') {
            element.setInnerContent(translations[lang].send);
          }
        }
      })
      .on('input[type="text"]', {
        element(element) {
          if (element.getAttribute('placeholder')) {
            element.setAttribute('placeholder', translations[lang].placeholder);
          }
        }
      })
      .transform(newResponse);
  } catch (error) {
    console.error('Error processing internationalization:', error);
    return response;
  }
}
