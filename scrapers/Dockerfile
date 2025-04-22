FROM python:3.11-slim

RUN apt-get update && apt-get install -y cron

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir -r requirements.txt || true

COPY crontab /etc/cron.d/scraper-cron
RUN chmod 0644 /etc/cron.d/scraper-cron
RUN crontab /etc/cron.d/scraper-cron

RUN touch /var/log/cron.log

CMD cron && tail -f /var/log/cron.log5

