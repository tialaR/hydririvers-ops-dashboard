# ADR 0061 — Auth presentation feature ownership

Login, registration and OTP presentation belong to `features/auth`. Legacy shipper shell/button/session concerns remain temporary composition adapters in the app route layer. Canonical auth screens must not import `shipper-mobile-flow`. Visual behavior and business rules are preserved.
