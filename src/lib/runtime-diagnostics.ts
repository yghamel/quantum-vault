import type { BuildMetadata } from './build-metadata';
import { Capacitor } from '@capacitor/core';

export type RuntimeDiagnostics = Readonly<{
  appVersion: string;
  buildMetadata: BuildMetadata;
}>;

const unknownRuntimeValue = 'unknown';

export const getRuntimeDiagnostics = (): RuntimeDiagnostics => ({
  appVersion: Capacitor.getPlatform()
    ? (__BUILD_METADATA__.appVersion ?? unknownRuntimeValue)
    : unknownRuntimeValue,
  buildMetadata: __BUILD_METADATA__
});

const copyFields: ReadonlyArray<{
  label: string;
  getValue: (diagnostics: RuntimeDiagnostics) => string;
}> = [
  {
    label: 'appVersion',
    getValue: diagnostics => diagnostics.appVersion
  },
  {
    label: 'platform',
    getValue: () => Capacitor.getPlatform()
  },
  {
    label: 'buildMode',
    getValue: diagnostics => diagnostics.buildMetadata.buildMode
  },
  {
    label: 'runtimeVariant',
    getValue: diagnostics => diagnostics.buildMetadata.runtimeVariant
  },
  {
    label: 'commitSha',
    getValue: diagnostics => diagnostics.buildMetadata.commitSha
  },
  {
    label: 'packageVersion',
    getValue: diagnostics => diagnostics.buildMetadata.appVersion
  },
  {
    label: 'libqcDependencySpec',
    getValue: diagnostics => diagnostics.buildMetadata.libqcDependencySpec
  },
  {
    label: 'libqcResolvedVersion',
    getValue: diagnostics => diagnostics.buildMetadata.libqcResolvedVersion
  }
];

type FormatRuntimeDiagnosticsForCopyInput = {
  diagnostics: RuntimeDiagnostics;
  generatedAt: string;
};

export const formatRuntimeDiagnosticsForCopy = ({
  diagnostics,
  generatedAt
}: FormatRuntimeDiagnosticsForCopyInput): string =>
  [
    'Quantum Vault diagnostics',
    `generatedAt: ${generatedAt}`,
    ...copyFields.map(field => `${field.label}: ${field.getValue(diagnostics)}`)
  ].join('\n');
