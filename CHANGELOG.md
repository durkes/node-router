# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-08-29

### Added
- Async route handlers. A handler that returns a promise now has its rejection
  forwarded to `next()`, so `async` handlers report errors to the error chain
  instead of raising an unhandled rejection.
- `Buffer` payload support in `res.send()`. Buffers are passed through to the
  response untouched rather than being treated as a plain object and stringified.
- Default `Content-Type` headers so browsers do not MIME-sniff the body:
  `text/plain; charset=utf-8` for strings and `application/octet-stream` for
  buffers. A content type already set by the handler always wins.
- `examples/demo3.js`, showing what happens when `next()` is called after the
  response has ended, and a middleware guard that contains it.

### Changed
- Route traversal advances skipped layers with a loop instead of a recursive
  `next()` call, so a deep route stack no longer grows the call stack once per
  layer.
- The default receiver responds through `res.send()` instead of writing the
  status and body directly, so fallback 404 and error responses carry the same
  headers as any other response.
- Object payloads are serialized before any header is set, so a `JSON.stringify`
  failure (circular reference, `BigInt`, throwing getter) is no longer sent with
  a JSON content type.

### Fixed
- Errors thrown synchronously by a handler are now passed to `next()` directly
  rather than falling through the non-matching-arity path.
- Native errors originating from another realm (for example a `vm` context) are
  recognized by `res.send()` via `util.types.isNativeError()`, in addition to
  `instanceof Error`.

## [1.0.2] - 2025-09-12

### Fixed
- Replaced the deprecated `util.isError()` with an `instanceof Error` check.

### Changed
- Demo prints its example routes as clickable console links.

## [1.0.0] - 2022-10-07

### Changed
- Modernized the source to `const`/`let`.
- Added an ESLint configuration and standardized the packaging files.

[1.1.0]: https://github.com/durkes/node-router/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/durkes/node-router/compare/v1.0.0...v1.0.2
[1.0.0]: https://github.com/durkes/node-router/releases/tag/v1.0.0
