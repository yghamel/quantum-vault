export const buildRuntimeVariants = ['hmr', 'capacitor'] as const;
export type BuildRuntimeVariant = (typeof buildRuntimeVariants)[number];

export type BuildMetadata = Readonly<{
  commitSha: string;
  appVersion: string;
  libqcDependencySpec: string;
  libqcResolvedVersion: string;
  buildMode: string;
  runtimeVariant: BuildRuntimeVariant;
}>;
