import { z } from "zod";

export const ActionSchema = z.object({
  type: z.enum(["redirect", "modify_header", "mock_response", "python_script"]),
  config: z.record(z.string(), z.any()),
  delay: z.number().nullable().default(0),
});

export const RuleFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Rule name is required"),
  match_type: z.enum(["exact", "contains", "regex"]),
  pattern: z.string().min(1, "Match pattern is required"),
  is_active: z.boolean().default(true),
  delay: z.number().nullable().default(0),
  actions: z.array(ActionSchema).min(1, "At least one action is required"),
});

// Action-specific validation helpers
export const validateActionConfig = (type: string, config: any) => {
  if (type === "redirect") {
    return !!config.to;
  }
  if (type === "python_script") {
    return !!config.code;
  }
  if (type === "mock_response") {
    return !!config.status;
  }
  return true;
};

export type RuleFormValues = z.infer<typeof RuleFormSchema>;
