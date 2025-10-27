// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolveRef(spec: any, payload: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cloned: any = JSON.parse(JSON.stringify(spec));
  const refPath = cloned?.data?.values?.$ref;
  if (refPath) {
    const values = payload?.[refPath];
    if (Array.isArray(values)) cloned.data.values = values;
  }
  return cloned;
}
