import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, topic, subject, level, additionalInfo } = await req.json();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Generate system prompt based on content type
    const systemPrompts: Record<string, string> = {
      notes: `You are an expert educator creating comprehensive, detailed study notes. Generate extensive content covering:

1. INTRODUCTION & OVERVIEW (2-3 paragraphs)
   - Define the topic clearly
   - Explain its importance and relevance
   - Provide historical context if applicable

2. THEORETICAL FOUNDATIONS (detailed sections)
   - Core concepts and principles
   - Key terminology and definitions
   - Underlying theories and frameworks
   - Scientific basis and reasoning

3. DETAILED EXPLANATIONS (comprehensive coverage)
   - Step-by-step breakdowns
   - How things work and why
   - Relationships between concepts
   - Cause and effect relationships

4. REAL-WORLD APPLICATIONS (multiple examples)
   - Practical applications in daily life
   - Industry and professional applications
   - Case studies and examples
   - Problem-solving scenarios

5. EXAMPLES & ILLUSTRATIONS (at least 3-5)
   - Simple to complex examples
   - Visual descriptions
   - Analogies and comparisons
   - Practice scenarios

6. KEY TAKEAWAYS & SUMMARY
   - Essential points to remember
   - Common misconceptions to avoid
   - Tips for understanding and retention

Create content suitable for ${level} level students. Make it comprehensive, detailed, and well-structured with clear headings. Aim for at least 1500-2000 words of rich educational content.`,

      quiz: `You are an expert educator creating educational quizzes. Generate a quiz with 5-7 multiple choice questions 
             for ${level} level students. Each question should have 4 options with one correct answer and an explanation.
             Return ONLY valid JSON in this exact format: 
             {"questions": [{"question": "text", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "text"}]}`,

      mindmap: `You are an expert at creating educational mind maps. Create a mind map structure for ${level} level students
               with a central topic and 4-6 main branches, each with 3-5 sub-items.
               Return ONLY valid JSON in this exact format:
               {"central": "main topic", "branches": [{"title": "branch name", "items": ["item1", "item2"]}]}`,

      handout: `You are an expert educator creating comprehensive handouts. Generate detailed content covering:

1. TOPIC OVERVIEW (introduction)
   - Clear definition and context
   - Why this topic matters

2. KEY CONCEPTS & THEORY (detailed explanations)
   - Core principles and concepts
   - Important terminology
   - Theoretical framework

3. PRACTICAL APPLICATIONS (real-world examples)
   - How it applies in practice
   - Industry applications
   - Real-life scenarios
   - Case studies

4. STEP-BY-STEP PROCESSES (if applicable)
   - Procedures and methods
   - Best practices
   - Common techniques

5. EXAMPLES & ILLUSTRATIONS (multiple examples)
   - Detailed examples
   - Problem-solving demonstrations
   - Visual descriptions

6. KEY POINTS SUMMARY
   - Essential takeaways
   - Important facts to remember

Create comprehensive content for ${level} level students. Include both theory and practical applications. Aim for 1200-1500 words with clear structure and headings.`,
    };

    const userPrompt = `
Topic: ${topic}
${subject ? `Subject: ${subject}` : ""}
${additionalInfo ? `Additional Requirements: ${additionalInfo}` : ""}

Create ${contentType} for this topic at ${level} level.
    `.trim();

    console.log("Generating content with AI...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompts[contentType] },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error("AI generation failed");
    }

    const aiData = await aiResponse.json();
    const generatedText = aiData.choices[0].message.content;

    console.log("AI response received");

    // Parse content based on type
    let parsedContent;
    if (contentType === "quiz" || contentType === "mindmap") {
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                         generatedText.match(/```\n([\s\S]*?)\n```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : generatedText;
        parsedContent = JSON.parse(jsonStr.trim());
      } catch (e) {
        console.error("Failed to parse JSON:", e, generatedText);
        // Fallback structure
        parsedContent = contentType === "quiz" 
          ? { questions: [{ question: generatedText, options: [], correctAnswer: 0, explanation: "" }] }
          : { central: topic, branches: [{ title: "Content", items: [generatedText] }] };
      }
    } else {
      parsedContent = { text: generatedText };
    }

    // Save to database
    const { data: savedContent, error: saveError } = await supabase
      .from("generated_content")
      .insert({
        user_id: user.id,
        content_type: contentType,
        title: topic,
        subject: subject || null,
        topic: topic,
        level: level,
        content: parsedContent,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Save error:", saveError);
      throw new Error("Failed to save content");
    }

    console.log("Content saved successfully");

    return new Response(
      JSON.stringify({
        success: true,
        content: parsedContent,
        contentId: savedContent.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});