/**
 * Validation schemas shared by the web frontend, the API and the future mobile
 * app (spec 3). One definition, imported by both sides, so a rule cannot be
 * tightened in the form and left loose at the endpoint.
 */
export * from './common.js';
export * from './booking.js';
export * from './application.js';
