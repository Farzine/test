import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS(request) {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { transcript } = body;

        if (!transcript) {
            return NextResponse.json(
                { error: 'Transcript is required in the request body.' },
                { status: 400, headers: corsHeaders }
            );
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
          Summarize this YouTube video transcript into short, point-wise notes.
          - Highlight key ideas, steps, and important details.
          - Skip filler words.
          - Keep each note concise.
          - Return each idea in natural language, no Markdown styling.
          - The final result should be a brief list of bullet points.
          Transcript: ${transcript}
        `.trim();

        const result = await model.generateContent(prompt);
        const rawGeneratedText = result.response.text();

        console.log('Raw Generated text:', rawGeneratedText);

        if (!rawGeneratedText) {
            return NextResponse.json(
                { error: 'Gemini AI response did not contain valid content.' },
                { status: 500, headers: corsHeaders }
            );
        }

        // Remove Markdown formatting
        let cleanedText = rawGeneratedText.replace(/\*{1,2}/g, '').trim();

        // Split by new lines to get individual bullet points
        let bulletLines = cleanedText.split('\n').map(line => line.trim()).filter(line => line !== '');

        // Number each line
        bulletLines = bulletLines.map((line, idx) => `${idx + 1}. ${line}`);

        const finalText = bulletLines.join('\n');

        console.log('Final processed text:', finalText);

        return NextResponse.json(
            { generatedText: finalText },
            { headers: corsHeaders }
        );

    } catch (error) {
        console.error('Error in POST handler:', error);
        return NextResponse.json(
            { error: 'Internal server error.' },
            { status: 500, headers: corsHeaders }
        );
    }
}







// import { NextResponse } from 'next/server';

// export const corsHeaders = {
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//     "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS(request) {
//     return NextResponse.json({}, { headers: corsHeaders });
// }

// export async function POST(request) {
//     try {
//         // Parse the JSON body of the request
//         const body = await request.json();
//         const { transcript } = body;

//         if (!transcript) {
//             return NextResponse.json(
//                 { error: 'Transcript is required in the request body.' },
//                 { status: 400, headers: corsHeaders }
//             );
//         }

//         // Generate the prompt
//         const prompt = `In detail summarize this YouTube transcript: ${transcript}`;

//         // Make the OpenAI API call
//         const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
//             method: 'POST',
//             body: JSON.stringify({
//                 model: 'gpt-4',
//                 messages: [
//                     {
//                         role: 'system',
//                         content: 'You are a helpful assistant.',
//                     },
//                     {
//                         role: 'user',
//                         content: prompt,
//                     },
//                 ],
//             }),
//             headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//             },
//         });

//         // Handle the OpenAI response
//         if (openaiResponse.ok) {
//             const openaiData = await openaiResponse.json();

//             if (
//                 openaiData.choices &&
//                 openaiData.choices.length > 0 &&
//                 openaiData.choices[0].message &&
//                 openaiData.choices[0].message.content
//             ) {
//                 const generatedText = openaiData.choices[0].message.content;
//                 return NextResponse.json(
//                     { generatedText },
//                     { headers: corsHeaders }
//                 );
//             } else {
//                 return NextResponse.json(
//                     { error: 'OpenAI response did not contain valid content.' },
//                     { status: 500, headers: corsHeaders }
//                 );
//             }
//         } else {
//             const errorText = await openaiResponse.text();
//             console.error('OpenAI API Error:', errorText);
//             return NextResponse.json(
//                 { error: `OpenAI API error: ${errorText}` },
//                 { status: openaiResponse.status, headers: corsHeaders }
//             );
//         }
//     } catch (error) {
//         console.error('Error in POST handler:', error);
//         return NextResponse.json(
//             { error: 'Internal server error.' },
//             { status: 500, headers: corsHeaders }
//         );
//     }
// }





// import { NextResponse } from 'next/server';

// export const corsHeaders = {
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//     "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS(request) {
//     return NextResponse.json({}, { headers: corsHeaders });
// }

// export async function POST(request) {
//     try {
//         // Parse the JSON body of the request
//         const body = await request.json();
//         const { transcript } = body;

//         if (!transcript) {
//             return NextResponse.json(
//                 { error: 'Transcript is required in the request body.' },
//                 { status: 400, headers: corsHeaders }
//             );
//         }

//         // Generate the prompt
//         const prompt = `In detail summarize this YouTube transcript: ${transcript}`;

//         // Make the Groq API call
//         const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {  // Replace with the actual Groq API endpoint
//             method: 'POST',
//             body: JSON.stringify({
//                 model:'llama3-8b-8192',
//                 messages: [
//                     {
//                         role: 'user',
//                         content: prompt,  // Send the prompt as a user message
//                     }
//                 ],
//             }),
//             headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: `Bearer ${process.env.GROQ_API_KEY}`,  // Ensure that you have your Groq API key in the environment
//             },
//         });
//         console.log('Groq API response:', groqResponse);
//         // Handle the Groq response
//         if (groqResponse.ok) {
//             const groqData = await groqResponse.json();

//             if (groqData.result) {  // Adjust based on Groq's actual response format
//                 const generatedText = groqData.result;
//                 return NextResponse.json(
//                     { generatedText },
//                     { headers: corsHeaders }
//                 );
//             } else {
//                 return NextResponse.json(
//                     { error: 'Groq response did not contain valid content.' },
//                     { status: 500, headers: corsHeaders }
//                 );
//             }
//         } else {
//             const errorText = await groqResponse.text();
//             console.error('Groq API Error:', errorText);
//             return NextResponse.json(
//                 { error: `Groq API error: ${errorText}` },
//                 { status: groqResponse.status, headers: corsHeaders }
//             );
//         }
//     } catch (error) {
//         console.error('Error in POST handler:', error);
//         return NextResponse.json(
//             { error: 'Internal server error.' },
//             { status: 500, headers: corsHeaders }
//         );
//     }
// }
