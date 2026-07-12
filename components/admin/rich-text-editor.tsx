"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading2,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps): JSX.Element {
  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension,
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[200px] px-3 py-2 focus:outline-none",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  async function handleImageUpload(): Promise<void> {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const payload = (await res.json()) as { url?: string };
      if (payload.url) {
        editor.chain().focus().setImage({ src: payload.url }).run();
      }
    };
    input.click();
  }

  if (!editor) return <div className="min-h-[240px] rounded-md border" />;

  const buttons = [
    {
      icon: Heading2,
      label: "Titre",
      isActive: editor.isActive("heading", { level: 2 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      icon: Bold,
      label: "Gras",
      isActive: editor.isActive("bold"),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      icon: Italic,
      label: "Italique",
      isActive: editor.isActive("italic"),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      icon: List,
      label: "Liste à puces",
      isActive: editor.isActive("bulletList"),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      icon: ListOrdered,
      label: "Liste numérotée",
      isActive: editor.isActive("orderedList"),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      icon: LinkIcon,
      label: "Lien",
      isActive: editor.isActive("link"),
      onClick: () => {
        const url = window.prompt("URL du lien :");
        if (url) editor.chain().focus().setLink({ href: url }).run();
      },
    },
    {
      icon: ImageIcon,
      label: "Image",
      isActive: false,
      onClick: handleImageUpload,
    },
    {
      icon: Undo,
      label: "Annuler",
      isActive: false,
      onClick: () => editor.chain().focus().undo().run(),
    },
    {
      icon: Redo,
      label: "Rétablir",
      isActive: false,
      onClick: () => editor.chain().focus().redo().run(),
    },
  ];

  return (
    <div className="rounded-md border">
      <div className="flex flex-wrap gap-1 border-b bg-muted/40 p-1">
        {buttons.map((button) => (
          <Button
            key={button.label}
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", button.isActive && "bg-accent")}
            onClick={button.onClick}
            aria-label={button.label}
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
