/** fieldErrors の最初のエラーを返すヘルパー */
export function fieldError(
  fieldErrors: Record<string, string[]> | undefined,
  name: string
): string | undefined {
  return fieldErrors?.[name]?.[0];
}

/** formData からbooleanフィールドを取得 */
export function formBool(formData: FormData, name: string): boolean {
  return formData.get(name) === "true";
}

/** formData から空文字をnullに変換して取得 */
export function formNullable(formData: FormData, name: string): string | null {
  const v = formData.get(name) as string | null;
  return v && v.trim() !== "" ? v : null;
}
