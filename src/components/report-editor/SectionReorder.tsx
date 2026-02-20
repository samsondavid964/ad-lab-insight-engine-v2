import { useCallback, RefObject } from "react";

export function useSectionReorder(iframeRef: RefObject<HTMLIFrameElement>) {
  const detectSections = useCallback((): HTMLElement[] => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return [];

    // Look for top-level sections: <section>, or direct children of body with headings
    const body = doc.body;
    const sections: HTMLElement[] = [];

    const children = Array.from(body.children) as HTMLElement[];
    for (const child of children) {
      if (
        child.tagName === "SECTION" ||
        child.tagName === "DIV" ||
        child.tagName === "ARTICLE"
      ) {
        // Check if it has meaningful content (heading or substantial content)
        if (
          child.querySelector("h1, h2, h3, h4, h5, h6") ||
          child.children.length > 1
        ) {
          sections.push(child);
        }
      }
    }

    // Fallback: if no sections found, try immediate divs
    if (sections.length === 0) {
      children.forEach(child => {
        if (child.tagName !== "SCRIPT" && child.tagName !== "STYLE") {
          sections.push(child);
        }
      });
    }

    return sections;
  }, [iframeRef]);

  const addDragHandles = useCallback(() => {
    const sections = detectSections();
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;

    sections.forEach((section, index) => {
      // Ensure position relative for handle placement
      if (getComputedStyle(section).position === "static") {
        section.style.position = "relative";
      }

      // Add drag handle
      const handle = doc.createElement("div");
      handle.className = "section-drag-handle";
      handle.setAttribute("data-section-index", index.toString());
      handle.draggable = true;
      section.prepend(handle);

      // Make section a drop target
      section.setAttribute("data-section-index", index.toString());

      handle.addEventListener("dragstart", (e) => {
        e.dataTransfer!.setData("text/plain", index.toString());
        section.classList.add("dragging");
      });

      handle.addEventListener("dragend", () => {
        section.classList.remove("dragging");
        doc.querySelectorAll(".drag-over").forEach(el => el.classList.remove("drag-over"));
      });

      section.addEventListener("dragover", (e) => {
        e.preventDefault();
        section.classList.add("drag-over");
      });

      section.addEventListener("dragleave", () => {
        section.classList.remove("drag-over");
      });

      section.addEventListener("drop", (e) => {
        e.preventDefault();
        section.classList.remove("drag-over");
        const fromIndex = parseInt(e.dataTransfer!.getData("text/plain"));
        const toIndex = index;
        if (fromIndex === toIndex) return;

        const currentSections = detectSections();
        const fromSection = currentSections[fromIndex];
        const toSection = currentSections[toIndex];
        if (!fromSection || !toSection) return;

        const parent = fromSection.parentNode;
        if (!parent) return;

        if (fromIndex < toIndex) {
          parent.insertBefore(fromSection, toSection.nextSibling);
        } else {
          parent.insertBefore(fromSection, toSection);
        }

        // Re-index handles
        removeDragHandles();
        addDragHandles();
      });
    });
  }, [iframeRef, detectSections]);

  const removeDragHandles = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.querySelectorAll(".section-drag-handle").forEach(el => el.remove());
  }, [iframeRef]);

  return { detectSections, addDragHandles, removeDragHandles };
}
