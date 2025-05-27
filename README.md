# 💸 FinGPT – AI-Powered Financial Assistant (FinOracle Evolution)

FinGPT (aka FinOracle) is an advanced AI-powered financial assistant built to provide personalized insights and real-time financial data via a conversational interface. Combining ReactJS, Node.js, OpenAI APIs, and data analysis tools, this platform helps users make smarter financial decisions.

FinOracle is powered by a domain-specific LLM fine-tuned for the finance industry using techniques like **Supervised Fine-Tuning (SFT)** and **Reinforcement Learning with Human Feedback (RLHF)** on top of GPT-2, enabling accurate and actionable insight delivery.

---

## 🚀 Features

- 🤖 **Conversational AI** – Built with OpenAI APIs to provide real-time, context-aware financial insights.
- 📊 **Intelligent Recommendations** – Learns user behavior patterns using Pandas and NumPy for smarter suggestions.
- ⚡ **Real-Time Updates** – Axios and WebSockets for instant data fetch and push notifications.
- 📈 **Custom LLM (FinOracle)** – Fine-tuned GPT-2 model tailored for financial conversations and data extraction.
- 🔐 **Secure & Scalable Backend** – Node.js with ExpressJS ensures robust and maintainable API services.
- 🌐 **Modern UI** – Built with ReactJS, providing a seamless user experience across devices.

---

## 🧠 About FinOracle

**FinOracle** is a domain-specific language model trained for financial applications. It uses:
- 📚 **Supervised Fine-Tuning (SFT)** – On curated financial dialogues and datasets.
- 👨‍🏫 **Reinforcement Learning with Human Feedback (RLHF)** – To improve response quality and relevance.

This hybrid training pipeline enables FinOracle to:
- Understand financial terminology and trends.
- Extract and analyze structured/unstructured financial data.
- Deliver personalized insights in a user-friendly conversational format.

---

## 🧰 Tech Stack

**Frontend:**
- ReactJS
- Axios
- Tailwind CSS
- WebSockets

**Backend:**
- Node.js
- ExpressJS
- OpenAI API
- Python (Pandas, NumPy for data analysis)

**LLM & ML:**
- GPT-2 (Fine-tuned)

---

## 🔧 Getting Started

### Prerequisites

- Node.js v18+
- Python 3.8+
- OpenAI API Key
- (Optional) GPU for model training/fine-tuning

### Clone the Repository

```bash
git clone https://github.com/joeljohn159/FinGPT.git
cd FinGPT

cd backend
npm install
# Add environment variables in .env file
# OPENAI_API_KEY=your_openai_key
npm run dev


cd ../frontend
npm install
npm start
```
