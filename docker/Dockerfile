# code-runner image: Ubuntu + Python3 + g++
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 g++ ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Optional: non-root user for defense-in-depth
RUN useradd -m runner
USER runner
WORKDIR /sandbox

# Keep the container alive so docker exec calls don’t race a short-lived process
CMD ["tail", "-f", "/dev/null"]
