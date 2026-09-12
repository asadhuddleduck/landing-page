# Recovered landing-page production source

The email migration release starts from the deployed waitlist site, preserving the current pages and deleted checkout/chat routes.

- Deployment source: `dpl_C3iUJPVyW2r9QZRPVmfjX66M9Ljj`.
- Latest redeploy of those files: `dpl_6iZKi8Ue2Ax773pWt6H81V3Se8TV`.
- Reported Git base: `17464341bef2e45d5f7d7e077fb14c2d8ebfab00`, `fix-foreign-stripe-onboarding`, dirty deployment.
- Retrieved 78 compile/deploy files through the authenticated Vercel deployment-file API. The manifest's top `src` directory is the project root.
- Excluded every env file, nested worktree, certificate and generated build artifact. Files absent from the deployed `src` and `public` trees were removed only from this isolated recovery worktree.
- 72 recovered files are byte-identical to the original local working tree as checked on 12 September 2026. The six differences are generated `next-env.d.ts` and later local notification changes in abandoned-cart, reconcile, error-reporting, onboarding and waitlist. Those local changes remain untouched in the original worktree.

The local evidence file `/private/tmp/landing-email-baseline-report.json` records SHA-256 hashes and the compared path lists. The recovery commit contains no new email transport implementation. Apply and review the HatchFlow adapter separately.
