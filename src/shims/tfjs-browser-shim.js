/**
 * Browser shim for TensorFlow packages.
 *
 * tinyaleph's optional TF integration is Node-first (tfjs-node) and not meant
 * to run in this Vite/React browser demo. We intentionally throw so the library
 * falls back / disables TF features via its internal try/catch.
 */

throw new Error("TensorFlow is disabled in the browser demo build");
