# MinIO stopped publishing official container images before the final open-source security release.
# Build the immutable, upstream-tagged source as recommended by the upstream release notes.
FROM golang:1.24.8-alpine AS build

ARG MINIO_VERSION=RELEASE.2025-10-15T17-29-55Z

RUN apk add --no-cache git
RUN CGO_ENABLED=0 GO111MODULE=on go install "github.com/minio/minio@${MINIO_VERSION}"

FROM alpine:3.22

RUN apk add --no-cache ca-certificates curl tzdata \
    && mkdir -p /data

COPY --from=build /go/bin/minio /usr/local/bin/minio

EXPOSE 9000 9001
VOLUME ["/data"]
ENTRYPOINT ["minio"]
