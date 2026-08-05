Live Demo:

https://recall-ai-liart.vercel.app/

Admin Access Key: 123

RecallAI

Agentic AI Vehicle Recall Communication & Customer Segmentation Platform

RecallAI is an AI-powered vehicle recall management platform designed to automate the entire recall communication workflow. The system analyzes manufacturer recall bulletins, identifies affected vehicle owners through VIN-based matching, and generates personalized notifications using Email, SMS, and Voice Calls.

The objective of this project is to reduce the manual effort involved in recall management while improving the speed, accuracy, and personalization of customer communication.

---

Project Overview

Traditional recall management involves manually reviewing recall bulletins, identifying affected customers, and notifying them through predefined communication templates. This process is time-consuming and difficult to scale.

RecallAI addresses these challenges by combining document intelligence, customer segmentation, and AI-generated communication into a single workflow. The platform extracts structured information from unstructured recall bulletins, performs VIN-based customer matching, and automatically generates personalized notifications based on the recall details.

---

Key Features

• AI-powered recall document analysis

• Automatic extraction of recall information

• Recall severity classification with reasoning

• VIN-based customer identification

• Personalized Email generation

• AI-generated SMS notifications

• AI-generated Voice Call scripts

• Recall history and notification tracking

• Analytics dashboard

---

System Workflow

Manufacturer uploads a recall bulletin in PDF format

↓

PDF.js extracts the text from the document

↓

The extracted text is analyzed using a Large Language Model through OpenRouter

↓

The AI verifies whether the document is a vehicle recall and extracts structured recall information

↓

The backend parses the AI-generated JSON response

↓

Recall information is stored in the SQLite database

↓

Customer VINs are compared against the affected VIN range

↓

Affected customers are identified

↓

Personalized Email, SMS, and Voice notifications are generated and delivered

↓

The dashboard updates recall history, analytics, and notification logs

---

Technology Stack

Frontend

• React
• Vite
• Tailwind CSS

Backend

• Node.js
• Express.js

Artificial Intelligence

• NVIDIA Nemotron (via OpenRouter)

Database

• SQLite

Document Processing

• PDF.js

Communication Services

• Brevo SMTP
• Twilio Messaging API
• Twilio Voice API

---

Database Structure

The application maintains three primary tables.

Recalls

Stores manufacturer details, vehicle information, recall number, severity, VIN range, issue description, remedy, repair time, and customer support information.

Customers

Stores customer name, vehicle model, VIN, email address, and phone number.

Matches

Stores affected customer records, notification type, notification status, match timestamp, and notification timestamp.

---

Agentic AI Design

RecallAI transforms a Large Language Model into a specialized Vehicle Recall Communication Agent.

The AI is instructed to:

• Validate whether the uploaded document is a genuine vehicle recall

• Extract structured recall information

• Determine recall severity

• Explain the severity classification

• Generate personalized Email content

• Generate SMS notifications

• Generate Voice Call scripts

• Return structured JSON output

Business logic such as VIN matching, database operations, analytics, and notification delivery is handled entirely by the backend.

---

Installation

Clone the repository

```bash
git clone https://github.com/ZUEZY/RecallAI.git
```

Backend

```bash
cd backend
npm install
npm start
```

Frontend

```bash
cd frontend
npm install
npm run dev
```

---

Environment Variables

Create a `.env` file inside the backend directory and configure the following variables.

```env
OPENROUTER_API_KEY=

BREVO_SMTP_HOST=
BREVO_SMTP_USER=
BREVO_SMTP_PASS=
EMAIL_FROM=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

---

Future Enhancements

• OCR support for scanned recall documents

• PostgreSQL deployment

• NVIDIA NIM integration

• WhatsApp notifications

• Dealer management portal

• Real-time manufacturer recall APIs

• Predictive recall analytics

---

References

Fick et al., *SmarTxT: A Natural Language Processing Approach for Efficient Vehicle Defect Investigation*, Transportation Research Record, 2022.

Pavan et al., *Extracting FMEA Information from Publicly Available Datasets Using Large Language Models*, Proceedings of the Design Society, 2025.

National Highway Traffic Safety Administration (NHTSA), *Improving Vehicle Safety Recall Completion Rates*, 2026.

---

Developed by

Hariharan

M.Tech Computer Science

Dayananda Sagar University
