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
import { Trash2, PlusCircle } from "lucide-react";

interface AddRuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: any;
}

const AddRuleModal: React.FC<AddRuleModalProps> = ({ open, onOpenChange, onSuccess, editData }) => {
  const form = useForm<RuleFormValues>({
    resolver: zodResolver(RuleFormSchema) as any,
    defaultValues: {
      name: "",
      match_type: "exact",
      pattern: "",
      is_active: true,
      delay: 0,
      actions: [{ type: "redirect", config: { to: "" }, delay: 0 }],
    },
  });

  // Sync editData to form
  React.useEffect(() => {
    if (editData && open) {
      form.reset(editData);
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
  }, [editData, open, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "actions",
  });

  const onSubmit = async (values: RuleFormValues) => {
    try {
      const response = await fetch("http://localhost:8000/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        onOpenChange(false);
        form.reset();
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to save rule:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-surface-lowest border-none shadow-2xl glass ambient-shadow">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold tracking-tight uppercase">
            {editData ? "Update Command Rule" : "Configure Command Rule"}
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
                      <Input {...field} placeholder="e.g. Redirect Auth API" />
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                  <FormLabel className="text-label-sm text-muted-foreground">Pattern / URL Target</FormLabel>
                  <FormControl>
                    <Input {...field} className="font-mono tracking-widest" placeholder="https://api.example.com/*" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions Section */}
            <div className="space-y-4 pt-4 border-t border-surface-high/30">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] uppercase font-mono tracking-widest text-primary font-bold">Signal Actions</h3>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => append({ type: "redirect", config: { to: "" }, delay: 0 })}
                  className="h-8 hover:bg-surface-high text-primary"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Action
                </Button>
              </div>

              {fields.map((field: any, index: number) => {
                const actionType = form.watch(`actions.${index}.type`);
                
                return (
                  <div key={field.id} className="p-4 bg-surface-base/50 rounded-sm space-y-4 group relative border-l-2 border-primary/20 hover:border-primary transition-all">
                    <div className="flex items-center gap-4">
                      <FormField
                        control={form.control as any}
                        name={`actions.${index}.type` as any}
                        render={({ field }: { field: any }) => (
                          <FormItem className="flex-1">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-10 text-xs font-bold text-primary">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="redirect">REDIRECT</SelectItem>
                                <SelectItem value="modify_header">HEADER CHECK</SelectItem>
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
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
                              <Input {...field} value={field.value || ""} className="font-mono tracking-widest" placeholder="Redirection Target (URL)" />
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
                                height="200px"
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
                                  placeholder="Status (e.g. 200)"
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
                                <Input {...field} value={field.value || ""} className="font-mono text-primary" placeholder='Mock Body (e.g. {"status": "ok"})' />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <DialogFooter className="pt-6 border-t border-surface-high/30">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">
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
