'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from './button'
import { cn } from '@/lib/utils'
import {
    Bold,
    Italic,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
} from 'lucide-react'

interface TiptapEditorProps {
    value: string
    onChange: (value: string) => void
}

export function TiptapEditor({ value, onChange }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none min-h-[100px] w-full px-3 py-2',
            },
        },
    })

    if (!editor) {
        return null
    }

    return (
        <div className="rounded-lg border">
            <div className="flex flex-wrap gap-2 p-2 border-b bg-muted/50">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.preventDefault()
                        editor.chain().focus().toggleBold().run()
                    }}
                    className={cn(editor.isActive('bold') && 'bg-muted')}
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.preventDefault()
                        editor.chain().focus().toggleItalic().run()
                    }}
                    className={cn(editor.isActive('italic') && 'bg-muted')}
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.preventDefault()
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                    }}
                    className={cn(editor.isActive('heading', { level: 1 }) && 'bg-muted')}
                >
                    <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.preventDefault()
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }}
                    className={cn(editor.isActive('heading', { level: 2 }) && 'bg-muted')}
                >
                    <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.preventDefault()
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }}
                    className={cn(editor.isActive('heading', { level: 3 }) && 'bg-muted')}
                >
                    <Heading3 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.preventDefault()
                        editor.chain().focus().toggleBulletList().run()
                    }}
                    className={cn(editor.isActive('bulletList') && 'bg-muted')}
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.preventDefault()
                        editor.chain().focus().toggleOrderedList().run()
                    }}
                    className={cn(editor.isActive('orderedList') && 'bg-muted')}
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
            </div>
            <div className="prose prose-sm dark:prose-invert w-full max-w-none px-3 py-2">
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}
