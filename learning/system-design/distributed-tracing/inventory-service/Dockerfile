FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Bootstrap to install all necessary instrumentation packages based on current environment
RUN opentelemetry-bootstrap -a install

COPY . .

# Run with OpenTelemetry instrumentation
CMD ["opentelemetry-instrument", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
