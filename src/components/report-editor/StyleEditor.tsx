import { useState, RefObject } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Paintbrush } from "lucide-react";

interface StyleEditorProps {
  iframeRef: RefObject<HTMLIFrameElement>;
  open: boolean;
  onClose: () => void;
}

const FONT_OPTIONS = [
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Playfair Display', serif", label: "Playfair Display" },
  { value: "'Roboto', sans-serif", label: "Roboto" },
  { value: "'Open Sans', sans-serif", label: "Open Sans" },
  { value: "'Lato', sans-serif", label: "Lato" },
  { value: "'Montserrat', sans-serif", label: "Montserrat" },
  { value: "monospace", label: "Monospace" },
];

const StyleEditor = ({ iframeRef, open, onClose }: StyleEditorProps) => {
  const [fontFamily, setFontFamily] = useState("Inter, sans-serif");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [accentColor, setAccentColor] = useState("#3b82f6");

  const applyStyle = (property: string, value: string) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;

    switch (property) {
      case "fontFamily":
        doc.body.style.fontFamily = value;
        setFontFamily(value);
        break;
      case "bgColor":
        doc.body.style.backgroundColor = value;
        setBgColor(value);
        break;
      case "accentColor":
        setAccentColor(value);
        // Apply accent color to headings, links, and highlighted elements
        const style = doc.getElementById("editor-accent-style") || doc.createElement("style");
        style.id = "editor-accent-style";
        style.textContent = `
          h1, h2, h3 { color: ${value} !important; }
          a { color: ${value} !important; }
          .accent, .highlight { background-color: ${value}22 !important; border-color: ${value} !important; }
        `;
        if (!doc.getElementById("editor-accent-style")) {
          doc.head.appendChild(style);
        }
        break;
    }
  };

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent side="right" className="w-[340px] sm:max-w-[340px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5 text-accent" />
            Style Editor
          </SheetTitle>
          <SheetDescription>Customize the report's visual appearance</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Font Family */}
          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select value={fontFamily} onValueChange={(v) => applyStyle("fontFamily", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map(f => (
                  <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Background Color */}
          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => applyStyle("bgColor", e.target.value)}
                className="h-10 w-10 cursor-pointer rounded border border-border p-0"
              />
              <span className="text-sm text-muted-foreground">{bgColor}</span>
            </div>
          </div>

          {/* Accent Color */}
          <div className="space-y-2">
            <Label>Accent Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => applyStyle("accentColor", e.target.value)}
                className="h-10 w-10 cursor-pointer rounded border border-border p-0"
              />
              <span className="text-sm text-muted-foreground">{accentColor}</span>
            </div>
            <p className="text-xs text-muted-foreground">Applied to headings, links, and accented elements</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StyleEditor;
