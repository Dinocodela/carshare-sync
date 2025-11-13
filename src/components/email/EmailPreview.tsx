interface EmailPreviewProps {
  html: string;
}

export const EmailPreview = ({ html }: EmailPreviewProps) => {
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="bg-muted px-3 py-2 border-b">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <span className="text-xs text-muted-foreground">Email Preview</span>
        </div>
      </div>
      <div className="p-4 max-h-[400px] overflow-auto">
        <div
          className="max-w-[600px] mx-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
};
