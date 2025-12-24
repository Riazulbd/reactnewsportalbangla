import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useState } from 'react';
import './RichTextEditor.css';

const MenuBar = ({ editor }) => {
    const [showHeadingMenu, setShowHeadingMenu] = useState(false);

    if (!editor) return null;

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const addImage = useCallback(() => {
        const url = window.prompt('Image URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const getCurrentHeading = () => {
        if (editor.isActive('heading', { level: 1 })) return 'H1';
        if (editor.isActive('heading', { level: 2 })) return 'H2';
        if (editor.isActive('heading', { level: 3 })) return 'H3';
        if (editor.isActive('heading', { level: 4 })) return 'H4';
        return 'H';
    };

    return (
        <div className="editor-menu-bar">
            {/* Undo/Redo */}
            <div className="menu-group">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="পূর্বাবস্থায় ফেরত"
                    className="menu-btn"
                >
                    ↩
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="পুনরায়"
                    className="menu-btn"
                >
                    ↪
                </button>
            </div>

            {/* Headings Dropdown */}
            <div className="menu-group heading-dropdown-wrapper">
                <button
                    type="button"
                    className={`menu-btn heading-btn ${showHeadingMenu ? 'active' : ''}`}
                    onClick={() => setShowHeadingMenu(!showHeadingMenu)}
                    title="শিরোনাম"
                >
                    {getCurrentHeading()} ▾
                </button>
                {showHeadingMenu && (
                    <div className="heading-dropdown">
                        <button type="button" onClick={() => { editor.chain().focus().setParagraph().run(); setShowHeadingMenu(false); }}>
                            প্যারাগ্রাফ
                        </button>
                        <button type="button" onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setShowHeadingMenu(false); }}>
                            শিরোনাম ১
                        </button>
                        <button type="button" onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setShowHeadingMenu(false); }}>
                            শিরোনাম ২
                        </button>
                        <button type="button" onClick={() => { editor.chain().focus().toggleHeading({ level: 3 }).run(); setShowHeadingMenu(false); }}>
                            শিরোনাম ৩
                        </button>
                        <button type="button" onClick={() => { editor.chain().focus().toggleHeading({ level: 4 }).run(); setShowHeadingMenu(false); }}>
                            শিরোনাম ৪
                        </button>
                    </div>
                )}
            </div>

            {/* Lists */}
            <div className="menu-group">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`menu-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
                    title="বুলেট লিস্ট"
                >
                    ☰
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`menu-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
                    title="নম্বর লিস্ট"
                >
                    ≡
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`menu-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`}
                    title="উদ্ধৃতি"
                >
                    ❝
                </button>
            </div>

            {/* Text Formatting */}
            <div className="menu-group">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`menu-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
                    title="বোল্ড"
                >
                    <strong>B</strong>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`menu-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
                    title="ইটালিক"
                >
                    <em>I</em>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`menu-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
                    title="স্ট্রাইকথ্রু"
                >
                    <s>S</s>
                </button>
            </div>

            {/* More Formatting */}
            <div className="menu-group">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={`menu-btn ${editor.isActive('code') ? 'is-active' : ''}`}
                    title="কোড"
                >
                    &lt;/&gt;
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`menu-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
                    title="আন্ডারলাইন"
                >
                    <u>U</u>
                </button>
            </div>

            {/* Link */}
            <div className="menu-group">
                <button
                    type="button"
                    onClick={setLink}
                    className={`menu-btn ${editor.isActive('link') ? 'is-active' : ''}`}
                    title="লিংক"
                >
                    🔗
                </button>
            </div>

            {/* Superscript/Subscript */}
            <div className="menu-group">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleSuperscript().run()}
                    className={`menu-btn ${editor.isActive('superscript') ? 'is-active' : ''}`}
                    title="সুপারস্ক্রিপ্ট"
                >
                    x²
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleSubscript().run()}
                    className={`menu-btn ${editor.isActive('subscript') ? 'is-active' : ''}`}
                    title="সাবস্ক্রিপ্ট"
                >
                    x₂
                </button>
            </div>

            {/* Text Alignment */}
            <div className="menu-group">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`menu-btn ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
                    title="বাম"
                >
                    ☰
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`menu-btn ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
                    title="মাঝে"
                >
                    ≡
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`menu-btn ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
                    title="ডান"
                >
                    ☰
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    className={`menu-btn ${editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}`}
                    title="জাস্টিফাই"
                >
                    ⊞
                </button>
            </div>

            {/* Add Image */}
            <div className="menu-group">
                <button
                    type="button"
                    onClick={addImage}
                    className="menu-btn add-btn"
                    title="ছবি যোগ করুন"
                >
                    🖼️ Add
                </button>
            </div>
        </div>
    );
};

function RichTextEditor({ content, onChange, placeholder = "এখানে লিখুন..." }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4],
                },
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Link.configure({
                openOnClick: false,
            }),
            Underline,
            Superscript,
            Subscript,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Placeholder.configure({
                placeholder: placeholder,
            }),
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'rich-text-content',
            },
            handlePaste: (view, event) => {
                const items = event.clipboardData?.items;
                if (!items) return false;

                for (const item of items) {
                    if (item.type.indexOf('image') === 0) {
                        event.preventDefault();
                        const file = item.getAsFile();
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                const base64 = e.target.result;
                                view.dispatch(
                                    view.state.tr.replaceSelectionWith(
                                        view.state.schema.nodes.image.create({ src: base64 })
                                    )
                                );
                            };
                            reader.readAsDataURL(file);
                        }
                        return true;
                    }
                }
                return false;
            },
            handleDrop: (view, event) => {
                const files = event.dataTransfer?.files;
                if (!files || files.length === 0) return false;

                for (const file of files) {
                    if (file.type.indexOf('image') === 0) {
                        event.preventDefault();
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const base64 = e.target.result;
                            const { state } = view;
                            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
                            if (pos) {
                                view.dispatch(
                                    state.tr.insert(pos.pos, state.schema.nodes.image.create({ src: base64 }))
                                );
                            }
                        };
                        reader.readAsDataURL(file);
                        return true;
                    }
                }
                return false;
            },
        },
    });

    return (
        <div className="rich-text-editor">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}

export default RichTextEditor;
