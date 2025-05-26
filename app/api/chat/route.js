// Define types for the request and response
export async function POST(req) {
  try {
    // Extract the messages from the request body
    const { messages } = await req.json();
    console.log(messages);
    // Call the OpenRouter API
    const response = await fetch(`${process.env.OPENROUTER_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': req.headers.get('origin') || 'http://localhost:3001',
        'X-Title': 'BrandFlow AI Assistant'
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat:free", // Specify DeepSeek model
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });
    
    // Parse the response
    const data = await response.json();
    
    // Handle API errors
    if (!response.ok) {
      console.error('OpenRouter API error:', data);
      return Response.json(
        { error: data.error?.message || 'Failed to get AI response' },
        { status: response.status }
      );
    }
    
    // Return the successful response
    return Response.json(data);
  } catch (error) {
    // Handle any unexpected errors
    console.error('Unexpected error in chat API route:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 