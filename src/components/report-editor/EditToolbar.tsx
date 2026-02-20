import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Type, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditToolbarProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  visible: boolean;
}

const EditToolbar = ({ iframeRef, visible }: EditToolbarProps) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [show, setShow] = useState(false);
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState("16");
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) {
      setShow(false);
      return;
    }

    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;

    const handleSelection = () => {
      const sel = doc.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        setShow(false);
        return;
      }

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const iframeRect = iframeRef.current!.getBoundingClientRect();

      setPosition({
        top: iframeRect.top + rect.top - 48,
        left: iframeRect.left + rect.left + rect.width / 2,
      });
      setShow(true);
    };

    doc.addEventListener("selectionchange", handleSelection);
    return () => doc.removeEventListener("selectionchange", handleSelection);
  }, [iframeRef, visible]);

  const execCommand = (command: string, value?: string) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.execCommand(command, false, value);
  };

  if (!show || !visible) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-[9999] flex items-center gap-1 rounded-lg border border-border bg-card p-1.5 shadow-lg"
      style={{ top: `${position.top}px`, left: `${position.left}px`, transform: "translateX(-50%)" }}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => execCommand("bold")}
        title="Bold"
      >
        <Bold className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => execCommand("italic")}
        title="Italic"
      >
        <Italic className="h-3.5 w-3.5" />
      </Button>
      <div className="mx-1 h-5 w-px bg-border" />
      <div className="flex items-center gap-1">
        <Type className="h-3.5 w-3.5 text-muted-foreground" />
        <Input
          type="number"
          value={fontSize}
          onChange={(e) => {
            setFontSize(e.target.value);
            execCommand("fontSize", "7");
            // fontSize command only supports 1-7, so we use a workaround
            const doc = iframeRef.current?.contentDocument;
            if (doc) {
              const fontElements = doc.querySelectorAll('font[size="7"]');
              fontElements.forEach(el => {
                (el as HTMLElement).removeAttribute("size");
                (el as HTMLElement).style.fontSize = `${e.target.value}px`;
              });
            }
          }}
          className="h-7 w-14 text-xs"
          min="8"
          max="72"
        />
      </div>
      <div className="mx-1 h-5 w-px bg-border" />
      <div className="flex items-center gap-1">
        <Palette className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="color"
          value={textColor}
          onChange={(e) => {
            setTextColor(e.target.value);
            execCommand("foreColor", e.target.value);
          }}
          className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
          title="Text color"
        />
      </div>
    </div>
  );
};

export default EditToolbar;
