/** Server Action の共通戻り値型 */
export type ActionResult = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};
