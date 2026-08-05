const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: process.env.AI_BASE_URL,
});

async function extractRecallInformation(pdfText) {

  const prompt = `
You are an expert automotive vehicle recall analyst.

First, determine whether the document represents an automotive recall communication or corrective action.

Manufacturers may use many different titles instead of the word "Recall".

Examples include:

- Vehicle Recall Notice
- Customer Safety Communication
- Product Safety Bulletin
- Safety Campaign
- Service Campaign
- Field Service Action
- Product Improvement Campaign
- Customer Satisfaction Program
- Technical Campaign

Treat the document as a valid recall communication if it:

• identifies affected vehicle models or production years

• describes a defect, issue or software anomaly

• explains the potential customer risk or impact

• recommends inspection, repair, replacement or software update

• provides manufacturer or dealer contact information

• offers a corrective action free of charge

The document DOES NOT need to explicitly contain the word "Recall".

Only return

{
  "isRecall": false
}

when the document is clearly unrelated to automotive recalls or corrective actions, such as:

- invoices
- resumes
- research papers
- user manuals
- advertisements
- brochures
- unrelated PDFs

If the document IS an automotive vehicle recall notice:

Analyse the document carefully.

Extract all recall information accurately.

If the recall notice explicitly specifies the severity, use that value exactly.

If the severity is NOT explicitly mentioned, infer the severity using your professional understanding of automotive vehicle safety.

When inferring severity, consider:

• Potential risk to human life
• Risk of injury
• Vehicle fire or battery thermal runaway
• Brake failure
• Steering failure
• Airbag failure
• Fuel leakage
• Loss of propulsion
• Reduced driver visibility
• Electrical failures
• Driver distraction
• Whether the issue only affects convenience features

Return ONLY one of:

High
Medium
Low

Also provide a brief explanation (1-2 sentences) describing why the severity was chosen.

Return ONLY valid JSON in exactly this form:

{
  "isRecall": true,
  "manufacturer":"",
  "brand":"",
  "model":"",
  "model_year":"",
  "recall_number":"",
  "recall_date":"",
  "severity":"",
  "severity_reason":"",
  "vin_range":"",
  "issue":"",
  "risk":"",
  "remedy":"",
  "repair_time":"",
  "customer_support":""
}

Document:

${pdfText}
`;

  let response;

  try {
    console.log("Calling AI...");

    response = await client.chat.completions.create({
      model: process.env.AI_MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You extract vehicle recall information."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    console.log("AI responded.");
    console.log(response);
    console.log(response.choices[0].message.content);

  } catch (error) {
    console.error("AI call failed in extractRecallInformation:");
    console.error("status:", error.status);
    console.error("message:", error.message);
    console.error("response:", error.response);
    console.error("stack:", error.stack);
    throw error;
  }

  const rawContent = response.choices[0].message.content;

  try {
    return JSON.parse(rawContent);
  } catch (parseError) {
    console.error("Failed to parse JSON in extractRecallInformation:");
    console.error("Raw text was:", rawContent);
    console.error("Parse error:", parseError);
    throw parseError;
  }
}

async function matchAffectedCustomers(recall, customers) {

  const prompt = `
You are an expert vehicle recall notification system.

Recall:

${JSON.stringify(recall, null, 2)}

Customer Database:

${JSON.stringify(customers, null, 2)}

Tasks:

1. Identify every affected customer.
2. Match intelligently using:
   - vehicle model
   - VIN range
   - manufacturer
3. Decide notification method using:

High
→ Voice Call + SMS

Medium
→ SMS + Email

Low
→ Email

Return ONLY JSON.

{
  "affectedCustomers":[
    {
      "customer_name":"",
      "vehicle_model":"",
      "vin":"",
      "email":"",
      "phone":"",
      "notification":""
    }
  ]
}
`;

  let response;

  try {
    console.log("Calling AI...");

    response = await client.chat.completions.create({
      model: process.env.AI_MODEL,
      temperature: 0,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content:
            "You identify affected vehicle owners and determine notification methods.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    console.log("AI responded.");
    console.log(response);
    console.log(response.choices[0].message.content);

  } catch (error) {
    console.error("AI call failed in matchAffectedCustomers:");
    console.error("status:", error.status);
    console.error("message:", error.message);
    console.error("response:", error.response);
    console.error("stack:", error.stack);
    throw error;
  }

  const rawContent = response.choices[0].message.content;

  try {
    return JSON.parse(rawContent);
  } catch (parseError) {
    console.error("Failed to parse JSON in matchAffectedCustomers:");
    console.error("Raw text was:", rawContent);
    console.error("Parse error:", parseError);
    throw parseError;
  }
}

async function generateNotificationContent(recall, customer) {

  const prompt = `
You are an expert automotive manufacturer customer communications writer working for a vehicle safety recall department.

Using the recall details and the customer/vehicle details below, generate three separate pieces of customer-facing communication.

Recall Details:
- Manufacturer: ${recall.manufacturer || ""}
- Brand: ${recall.brand || ""}
- Model: ${recall.model || ""}
- Recall Number: ${recall.recall_number || ""}
- Severity: ${recall.severity || ""}
- Severity Reason: ${recall.severity_reason || ""}
- Issue: ${recall.issue || ""}
- Risk: ${recall.risk || ""}
- Remedy: ${recall.remedy || ""}
- Estimated Repair Time: ${recall.repair_time || ""}
- Customer Support: ${recall.customer_support || ""}

Customer / Vehicle Details:
- Customer Name: ${customer.customer_name || ""}
- Vehicle Model: ${customer.vehicle_model || ""}
- VIN: ${customer.vin || ""}

Generate the following three outputs:

1. EMAIL
A professional manufacturer communication. It must include:
- A greeting addressed to the customer by name
- The reason for contacting the customer
- A simple, clear explanation of the issue
- The risk explained in a way appropriate to the severity level (be more direct and urgent for High severity, measured for Medium, reassuring but clear for Low)
- The action the customer should take
- The estimated repair time
- A reminder that the repair is free of charge
- The customer support contact information
- A professional closing
It must not sound robotic or like a copy-pasted template. Write it as a real, warm, professional piece of communication. Length should be approximately 180-250 words.

2. SMS
Maximum 160 characters if possible. Professional tone. Must mention the recall, the vehicle, urgency appropriate to the severity, and the support number/contact.

3. VOICE CALL SCRIPT
Natural spoken English, written the way a dealership representative would actually talk on the phone. Short sentences. No bullet points, no headers. Should run approximately 45-60 seconds when read aloud.

Formatting rules:
- No markdown of any kind (no asterisks, no bullet points, no headers) in any of the three outputs.
- No JSON, brackets, or code inside the text values themselves.
- Do not invent facts that are not present or reasonably implied by the recall/customer details above.

Return ONLY valid JSON in exactly this form, with no additional commentary:

{
  "email_subject":"",
  "email_body":"",
  "sms":"",
  "voice_call":""
}
`;

  let response;

  try {
    console.log("Calling AI...");

    response = await client.chat.completions.create({
      model: process.env.AI_MODEL,
      temperature: 0.6,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content:
            "You write natural, professional, non-robotic customer safety recall communications for an automotive manufacturer.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    console.log("AI responded.");
    console.log(response);
    console.log(response.choices[0].message.content);

  } catch (error) {
    console.error("AI call failed in generateNotificationContent:");
    console.error("status:", error.status);
    console.error("message:", error.message);
    console.error("response:", error.response);
    console.error("stack:", error.stack);
    throw error;
  }

  const rawContent = response.choices[0].message.content;

  try {
    return JSON.parse(rawContent);
  } catch (parseError) {
    console.error("Failed to parse JSON in generateNotificationContent:");
    console.error("Raw text was:", rawContent);
    console.error("Parse error:", parseError);
    throw parseError;
  }
}

module.exports = {
  extractRecallInformation,
  matchAffectedCustomers,
  generateNotificationContent,
};