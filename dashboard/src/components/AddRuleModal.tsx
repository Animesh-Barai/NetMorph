import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RuleFormSchema, type RuleFormValues } from "@/lib/schemas";
import CodeEditor from "./ui/CodeEditor";
import { Trash2, PlusCircle, ShieldCheck } from "lucide-react";
import { useToast } from "./ui/ToastContainer";

interface AddRuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: any;
  prefillPattern?: string;
}

const AddRuleModal: React.FC<AddRuleModalProps> = ({ 
  open, 
  onOpenChange, 
  onSuccess, 
  editData,
  prefillPattern 
}) => {
  const { addToast } = useToast();

  const form = useForm<RuleFormValues>({
    resolver: zodResolver(RuleFormSchema) as any,
    defaultValues: {
      name: "",
      match_type: "contains",
      pattern: "",
      is_active: true,
      delay: 0,
      actions: [{ type: "redirect", config: { to: "" }, delay: 0 }],
    },
  });

  // Sync editData / prefillPattern to form
  React.useEffect(() => {
    if (editData && open) {
      const transformedEditData = {
        ...editData,
        actions: editData.actions.map((action: any) => {
          if (action.type === "modify_header") {
            const backendActions = action.config?.actions || [];
            const firstAction = backendActions[0] || {};
            return {
              ...action,
              config: {
                target: action.config?.target || "request",
                op: firstAction.op || "set",
                key: firstAction.key || "",
                value: firstAction.value || ""
              }
            };
          }
          return action;
        })
      };
      form.reset(transformedEditData);
    } else if (prefillPattern && open && !editData) {
      form.reset({
        name: `Rule for ${prefillPattern.split("/").pop() || "Endpoint"}`,
        match_type: "contains",
        pattern: prefillPattern,
        is_active: true,
        delay: 0,
        actions: [{ type: "redirect", config: { to: "" }, delay: 0 }],
      });
    } else if (!editData && open) {
      form.reset({
        name: "",
        match_type: "exact",
        pattern: "",
        is_active: true,
        delay: 0,
        actions: [{ type: "redirect", config: { to: "" }, delay: 0 }],
      });
    }
  }, [editData, prefillPattern, open, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "actions",
  });

  const onSubmit = async (values: RuleFormValues) => {
    try {
      const transformedValues = {
        ...values,
        actions: values.actions.map(action => {
          if (action.type === "modify_header") {
            const { target, op, key, value } = action.config;
            return {
              ...action,
              config: {
                target: target || "request",
                actions: [
                  {
                    op: op || "set",
                    key: key || "",
                    value: value || ""
                  }
                ]
              }
            };
          }
          return action;
        })
      };

      const response = await fetch("http://localhost:8000/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transformedValues),
      });

      if (response.ok) {
        addToast(
          editData ? "Rule Updated" : "Rule Deployed",
          `Rule "${values.name}" successfully deployed to proxy engine`,
          "success"
        );
        onOpenChange(false);
        form.reset();
        onSuccess();
      } else {
        addToast("Failed to Deploy Rule", "Server returned validation error", "error");
      }
    } catch (error) {
      console.error("Failed to save rule:", error);
      addToast("Network Error", "Failed to connect to backend proxy engine", "error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-low border border-surface-high/60 shadow-2xl glass-panel animate-in fade-in zoom-in-95 duration-200">
        <DialogHeader className="border-b border-surface-high/40 pb-4">
          <DialogTitle className="font-display text-xl font-bold tracking-tight uppercase flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            {editData ? "Update Interceptor Rule" : "Configure Interceptor Rule"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="name"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-label-sm text-muted-foreground">Rule Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Redirect Auth API" className="bg-surface-base border-surface-high/50 font-mono text-xs" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="match_type"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-label-sm text-muted-foreground">Match Strategy</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-surface-base border-surface-high/50 text-xs font-mono">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-surface-high border-surface-base text-xs font-mono">
                        <SelectItem value="exact">EXACT URL</SelectItem>
                        <SelectItem value="contains">CONTAINS</SelectItem>
                        <SelectItem value="regex">REGEX PATTERN</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control as any}
              name="pattern"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel className="text-label-sm text-muted-foreground">Pattern / Target URL</FormLabel>
                  <FormControl>
                    <Input {...field} className="font-mono text-xs tracking-wider bg-surface-base border-surface-high/50 text-primary" placeholder="https://api.example.com/*" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions Section */}
            <div className="space-y-4 pt-4 border-t border-surface-high/40">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase font-mono tracking-widest text-primary font-bold">Signal Actions</h3>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => append({ type: "redirect", config: { to: "" }, delay: 0 })}
                  className="h-8 text-xs font-mono text-primary hover:bg-primary/10"
                >
                  <PlusCircle className="mr-1.5 h-4 w-4" /> Add Action
                </Button>
              </div>

              {fields.map((field: any, index: number) => {
                const actionType = form.watch(`actions.${index}.type`);
                
                return (
                  <div key={field.id} className="p-4 bg-surface-base/60 rounded-md space-y-4 group relative border-l-2 border-primary/40 hover:border-primary transition-all border border-surface-high/30 shadow-md">
                    <div className="flex items-center gap-4">
                      <FormField
                        control={form.control as any}
                        name={`actions.${index}.type` as any}
                        render={({ field }: { field: any }) => (
                          <FormItem className="flex-1">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-10 text-xs font-mono font-bold text-primary bg-surface-lowest border-surface-high/40">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-surface-high border-surface-base text-xs font-mono">
                                <SelectItem value="redirect">REDIRECT URL</SelectItem>
                                <SelectItem value="modify_header">HEADER MOD</SelectItem>
                                <SelectItem value="mock_response">STATIC MOCK</SelectItem>
                                <SelectItem value="python_script">PYTHON SCRIPT</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => remove(index)}
                        className="h-9 w-9 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Conditional Action Config */}
                    {actionType === "redirect" && (
                      <FormField
                        control={form.control as any}
                        name={`actions.${index}.config.to` as any}
                        render={({ field }: { field: any }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} value={field.value || ""} className="font-mono text-xs tracking-wider bg-surface-lowest border-surface-high/40 text-foreground" placeholder="Redirect Target (URL)" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {actionType === "python_script" && (
                      <FormField
                        control={form.control as any}
                        name={`actions.${index}.config.code` as any}
                        render={({ field }: { field: any }) => (
                          <FormItem>
                            <FormControl>
                              <CodeEditor 
                                height="180px"
                                value={field.value || "# NetMorph Script Hook\n\nlog(flow.request.url)\n"}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {actionType === "mock_response" && (
                      <div className="grid grid-cols-4 gap-2">
                        <FormField
                          control={form.control as any}
                          name={`actions.${index}.config.status` as any}
                          render={({ field }: { field: any }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  value={field.value || 200}
                                  placeholder="Status (200)"
                                  className="font-mono text-xs bg-surface-lowest border-surface-high/40"
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control as any}
                          name={`actions.${index}.config.body` as any}
                          render={({ field }: { field: any }) => (
                            <FormItem className="col-span-3">
                              <FormControl>
                                <Input {...field} value={field.value || ""} className="font-mono text-xs bg-surface-lowest border-surface-high/40 text-primary" placeholder='Mock Body (e.g. {"status": "ok"})' />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {actionType === "modify_header" && (
                      <div className="grid grid-cols-4 gap-2">
                        <FormField
                          control={form.control as any}
                          name={`actions.${index}.config.target` as any}
                          render={({ field }: { field: any }) => (
                            <FormItem>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value || "request"}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-9 text-xs font-mono bg-surface-lowest border-surface-high/40">
                                    <SelectValue placeholder="Target" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-surface-high border-surface-base text-xs font-mono">
                                  <SelectItem value="request">REQUEST</SelectItem>
                                  <SelectItem value="response">RESPONSE</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control as any}
                          name={`actions.${index}.config.op` as any}
                          render={({ field }: { field: any }) => (
                            <FormItem>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value || "set"}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-9 text-xs font-mono bg-surface-lowest border-surface-high/40">
                                    <SelectValue placeholder="Operation" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-surface-high border-surface-base text-xs font-mono">
                                  <SelectItem value="set">SET / ADD</SelectItem>
                                  <SelectItem value="remove">REMOVE</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control as any}
                          name={`actions.${index}.config.key` as any}
                          render={({ field }: { field: any }) => (
                            <FormItem className={form.watch(`actions.${index}.config.op`) === "remove" ? "col-span-2" : "col-span-1"}>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  value={field.value || ""}
                                  placeholder="Header Name" 
                                  className="font-mono text-xs bg-surface-lowest border-surface-high/40"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        {form.watch(`actions.${index}.config.op`) !== "remove" && (
                          <FormField
                            control={form.control as any}
                            name={`actions.${index}.config.value` as any}
                            render={({ field }: { field: any }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    value={field.value || ""}
                                    placeholder="Value" 
                                    className="font-mono text-xs bg-surface-lowest border-surface-high/40"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <DialogFooter className="pt-6 border-t border-surface-high/40 flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-xs font-mono">
                Cancel
              </Button>
              <Button type="submit" className="text-xs font-mono font-bold tracking-wider bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                DEPLOY COMMAND
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRuleModal;
