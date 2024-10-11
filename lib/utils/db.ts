// Thanks to https://github.com/drizzle-team/drizzle-orm/discussions/1914#discussioncomment-9600199
export function enum2pg<T extends Record<string, any>>(
  arg_enum: T
): [T[keyof T], ...T[keyof T][]] {
  return Object.values(arg_enum).map((v: any) => `${v}`) as any;
}
