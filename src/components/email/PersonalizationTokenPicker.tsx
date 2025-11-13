import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wand2, Copy, Check, Code } from "lucide-react";
import { useState } from "react";
import { PERSONALIZATION_TOKENS, CONDITIONAL_EXAMPLES } from "@/lib/emailPersonalization";
import { toast } from "sonner";

interface PersonalizationTokenPickerProps {
  onInsert: (text: string) => void;
}

export const PersonalizationTokenPicker = ({ onInsert }: PersonalizationTokenPickerProps) => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    toast.success("Token copied to clipboard!");
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleInsert = (text: string) => {
    onInsert(text);
    toast.success("Inserted into template!");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Wand2 className="h-4 w-4" />
          Personalization
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <Tabs defaultValue="tokens" className="w-full">
          <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
            <TabsTrigger value="tokens" className="gap-2">
              <Wand2 className="h-4 w-4" />
              Tokens
            </TabsTrigger>
            <TabsTrigger value="conditionals" className="gap-2">
              <Code className="h-4 w-4" />
              Conditional Blocks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tokens" className="p-4 m-0">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {Object.entries(PERSONALIZATION_TOKENS).map(([category, tokens]) => (
                  <div key={category}>
                    <h4 className="font-semibold text-sm mb-3 text-foreground">{category}</h4>
                    <div className="space-y-2">
                      {tokens.map(({ token, description }) => (
                        <div
                          key={token}
                          className="flex items-start justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                        >
                          <div className="flex-1 min-w-0">
                            <code className="text-xs font-mono text-primary break-all">
                              {token}
                            </code>
                            <p className="text-xs text-muted-foreground mt-1">{description}</p>
                          </div>
                          <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleCopy(token)}
                            >
                              {copiedToken === token ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => handleInsert(token)}
                            >
                              Insert
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="conditionals" className="p-4 m-0">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">Conditional Syntax</h4>
                  <p className="text-xs text-muted-foreground">
                    Show/hide content based on user attributes:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                    <li><code>{'{{#if condition}}'}...{'{{/if}}'}</code> - Show if true</li>
                    <li><code>{'{{#unless condition}}'}...{'{{/unless}}'}</code> - Show if false</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supported operators: ==, !=, {'>'}, {'<'}, {'>='},  {'<='}, includes, not includes
                  </p>
                </div>

                {CONDITIONAL_EXAMPLES.map((example) => (
                  <div
                    key={example.title}
                    className="flex flex-col gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <h5 className="font-medium text-sm text-foreground">{example.title}</h5>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleCopy(example.code)}
                        >
                          {copiedToken === example.code ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleInsert(example.code)}
                        >
                          Insert
                        </Button>
                      </div>
                    </div>
                    <pre className="text-xs font-mono bg-muted p-2 rounded overflow-x-auto">
                      {example.code}
                    </pre>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
