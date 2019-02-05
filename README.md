# Wildboar Email Stack Environment Variables Authenticator

This module responds to authentication requests in the Wildboar Email Stack. It
obtains credentials from the environment variable `CREDENTIALS`. `CREDENTIALS`
is a comma-delimited list of base64-encoded username-space-password tuples.

This is just meant to be for testing purposes. For a production email stack,
use LDAP, SAML, a database, or some other serious authenticator.