import { useState, useCallback, RefObject } from "react";

export function useEditMode(iframeRef: RefObject<HTMLIFrameElement>) {
  const [editMode, setEditMode] = useState(false);
  const [editedHtml, setEditedHtml] = useState<string | null>(null);

  const enableEditing = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.body.contentEditable = "true";
    doc.body.style.outline = "none";
    
    // Add visual cues for editable elements
    const style = doc.createElement("style");
    style.id = "edit-mode-styles";
    style.textContent = `
      [contenteditable="true"] *:hover {
        outline: 2px dashed rgba(59, 130, 246, 0.5) !important;
        outline-offset: 2px;
        cursor: text;
      }
      .section-drag-handle {
        position: absolute;
        left: -28px;
        top: 8px;
        width: 20px;
        height: 20px;
        cursor: grab;
        opacity: 0.5;
        z-index: 1000;
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Ccircle cx='9' cy='5' r='1'/%3E%3Ccircle cx='9' cy='12' r='1'/%3E%3Ccircle cx='9' cy='19' r='1'/%3E%3Ccircle cx='15' cy='5' r='1'/%3E%3Ccircle cx='15' cy='12' r='1'/%3E%3Ccircle cx='15' cy='19' r='1'/%3E%3C/svg%3E") no-repeat center;
      }
      .section-drag-handle:hover { opacity: 1; }
      .dragging { opacity: 0.5; }
      .drag-over { border-top: 3px solid #3b82f6 !important; }
      canvas:hover {
        outline: 2px solid rgba(59, 130, 246, 0.8) !important;
        outline-offset: 4px;
        cursor: pointer !important;
      }
    `;
    doc.head.appendChild(style);
    setEditMode(true);
  }, [iframeRef]);

  const disableEditing = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.body.contentEditable = "false";
    const style = doc.getElementById("edit-mode-styles");
    style?.remove();
    
    // Remove drag handles
    doc.querySelectorAll(".section-drag-handle").forEach(el => el.remove());
    
    setEditMode(false);
  }, [iframeRef]);

  const extractHtml = useCallback((): string | null => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return null;

    // Clone to avoid modifying the live doc
    const clone = doc.documentElement.cloneNode(true) as HTMLElement;
    
    // Remove edit-mode artifacts
    clone.querySelector("#edit-mode-styles")?.remove();
    clone.querySelectorAll(".section-drag-handle").forEach(el => el.remove());
    
    // Reset contentEditable
    const body = clone.querySelector("body");
    if (body) {
      body.removeAttribute("contenteditable");
      body.style.removeProperty("outline");
    }

    // Serialize chart data back into script tags
    const win = iframeRef.current?.contentWindow as any;
    if (win?.Chart) {
      const instances = Object.values(win.Chart.instances || {}) as any[];
      instances.forEach((chart: any) => {
        const canvasId = chart.canvas?.id;
        if (!canvasId) return;
        
        // Find corresponding script or create one
        const config = {
          type: chart.config.type,
          data: JSON.parse(JSON.stringify(chart.data)),
          options: JSON.parse(JSON.stringify(chart.options)),
        };
        
        // Look for existing initialization script for this canvas
        const scripts = clone.querySelectorAll("script");
        let found = false;
        scripts.forEach(script => {
          if (script.textContent?.includes(canvasId) && script.textContent?.includes("new Chart")) {
            // Replace the chart initialization
            script.textContent = script.textContent.replace(
              /new Chart\([^)]+,\s*\{[\s\S]*?\}\s*\)/,
              `new Chart(document.getElementById('${canvasId}'), ${JSON.stringify(config)})`
            );
            found = true;
          }
        });
        
        if (!found) {
          // Append a new script
          const newScript = clone.ownerDocument.createElement("script");
          newScript.textContent = `
            document.addEventListener('DOMContentLoaded', function() {
              new Chart(document.getElementById('${canvasId}'), ${JSON.stringify(config)});
            });
          `;
          clone.querySelector("body")?.appendChild(newScript);
        }
      });
    }

    const html = "<!DOCTYPE html>" + clone.outerHTML;
    setEditedHtml(html);
    return html;
  }, [iframeRef]);

  const toggleEditMode = useCallback(() => {
    if (editMode) {
      extractHtml();
      disableEditing();
    } else {
      enableEditing();
    }
  }, [editMode, enableEditing, disableEditing, extractHtml]);

  return { editMode, editedHtml, toggleEditMode, extractHtml, setEditedHtml };
}
