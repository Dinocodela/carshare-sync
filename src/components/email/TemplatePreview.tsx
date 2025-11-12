interface TemplatePreviewProps {
  sections: Array<{ type: string; content: Record<string, any> }>;
  variables?: Record<string, string>;
}

export const TemplatePreview = ({ sections, variables = {} }: TemplatePreviewProps) => {
  const replaceVariables = (text: string): string => {
    if (!text) return "";
    let result = text;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
    });
    return result;
  };

  const renderSection = (section: { type: string; content: Record<string, any> }, index: number) => {
    switch (section.type) {
      case "header":
        return (
          <div
            key={index}
            style={{ backgroundColor: section.content.backgroundColor || "#0EA5E9", padding: "20px", textAlign: "center" }}
          >
            <h1 style={{ color: "white", fontSize: "24px", margin: 0 }}>
              {replaceVariables(section.content.logo || "Logo")}
            </h1>
          </div>
        );

      case "hero":
        return (
          <div
            key={index}
            style={{ backgroundColor: section.content.backgroundColor || "#F0F9FF", padding: "40px 20px", textAlign: "center" }}
          >
            <h2 style={{ fontSize: "32px", margin: "0 0 10px 0", color: "#1a1a1a" }}>
              {replaceVariables(section.content.title || "Title")}
            </h2>
            <p style={{ fontSize: "18px", margin: 0, color: "#666" }}>
              {replaceVariables(section.content.subtitle || "Subtitle")}
            </p>
          </div>
        );

      case "text":
        return (
          <div key={index} style={{ padding: "20px" }}>
            <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#333", whiteSpace: "pre-wrap" }}>
              {replaceVariables(section.content.body || "")}
            </p>
          </div>
        );

      case "image":
        return (
          <div key={index} style={{ padding: "20px", textAlign: "center" }}>
            <img
              src={replaceVariables(section.content.url || "")}
              alt={replaceVariables(section.content.alt || "Image")}
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
        );

      case "button":
        return (
          <div key={index} style={{ padding: "20px", textAlign: "center" }}>
            <a
              href={replaceVariables(section.content.url || "#")}
              style={{
                display: "inline-block",
                padding: "12px 24px",
                backgroundColor: section.content.backgroundColor || "#0EA5E9",
                color: "white",
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              {replaceVariables(section.content.text || "Button")}
            </a>
          </div>
        );

      case "divider":
        return (
          <div key={index} style={{ padding: "20px" }}>
            <hr style={{ border: "none", borderTop: "1px solid #e5e5e5", margin: 0 }} />
          </div>
        );

      case "footer":
        return (
          <div key={index} style={{ backgroundColor: "#f5f5f5", padding: "20px", textAlign: "center", fontSize: "14px", color: "#666" }}>
            <p style={{ margin: "0 0 10px 0" }}>{replaceVariables(section.content.text || "")}</p>
            <p style={{ margin: 0, fontSize: "12px" }}>
              <a href="#" style={{ color: "#666", textDecoration: "underline" }}>
                {replaceVariables(section.content.unsubscribeText || "Unsubscribe")}
              </a>
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
        {sections.map((section, index) => renderSection(section, index))}
      </div>
    </div>
  );
};