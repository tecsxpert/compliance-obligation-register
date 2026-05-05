# Compliance Obligation Register (AI Service)

## Overview
This project is a Retrieval-Augmented Generation (RAG) based AI system that answers compliance-related questions using stored documents.

---

## Features
- RAG-based question answering
- ChromaDB for document retrieval
- Groq LLM (llama3-8b)
- Response caching (TTL, hit/miss tracking)
- Health monitoring endpoint
- Meta response (confidence, tokens, latency, cache flag)
- Async report generation using background processing

---

## API Endpoints

### POST /query
- Input: question  
- Output: answer + sources + meta  

### GET /health
- Model info  
- Avg response time  
- Cache stats  
- Uptime  

### POST /generate-report
- Returns `job_id` immediately  
- Starts background processing  

### GET /report-status/<job_id>
- Returns job status and result  

---

## Evaluation (Day 10/11)
Tested with 10 different queries.

Initial accuracy was low due to limited data.

After adding definition-based context, system performance improved significantly.

Final average score: **5/5**

---

## Async Processing (Day 11)
Implemented asynchronous report generation:

- Non-blocking API response
- Background thread execution
- Job tracking using `job_id`
- Status endpoint to fetch results

---

## Tech Stack
- Python (Flask)
- ChromaDB
- Groq API
- Redis (for caching logic)

---

## Key Learnings
- Data quality improves retrieval accuracy
- Definition-based context improves answers
- Caching reduces response time
- Async APIs improve system performance

## Performance Benchmark (Day 12)

Tested with 50 requests per endpoint.

/query:
- p50: ~4 ms
- p95: ~2526 ms
- p99: ~2616 ms

Observation:
- Low p50 due to caching and quick responses
- Higher p95/p99 due to LLM processing time

Optimization:
- Caching reduces repeated query latency significantly

## Final Prompt QA (Day 14)

Tested system with multiple prompts against demo data.

Results:
- Correct answers returned for known queries
- Relevant sources retrieved
- No “Not found in context” for valid questions
- System behaves consistently

System is demo-ready.

## Day 15 — Packaging

- Created requirements.txt with dependencies
- Added .env.example for environment variables
- Added Dockerfile for containerization

Note: Dockerfile included but Docker not executed locally.

## Day 16 — Final Verification

### Performance
- Measured API latency using benchmark script
- Observed metrics:
  - p50: ~4 ms
  - p95: ~2500 ms
  - p99: ~2600 ms
- Performance is within acceptable limits

### Cache Verification
- Repeated queries return cached responses
- First request: cached = false
- Second request: cached = true
- Confirms caching is working correctly

### Fallback Verification
- Fallback mechanism implemented for LLM failures
- `is_fallback` flag added in response meta
- System returns safe response if model fails

### Conclusion
All endpoints are functioning correctly.
System is stable, reliable, and demo-ready.
