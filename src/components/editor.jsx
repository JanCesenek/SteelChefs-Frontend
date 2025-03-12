import { EditorContent, useEditor } from "@tiptap/react";
import React, { useRef } from "react";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaFileImage,
  FaYoutube,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaLink,
  FaUnlink,
  FaCompress,
  FaExpand,
  FaListUl,
  FaListOl,
} from "react-icons/fa";
import { TbH1, TbH2, TbH3 } from "react-icons/tb";
import { mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";

export const editorExtensions = [
  StarterKit.configure({
    bold: false,
    italic: false,
    heading: false,
    bulletList: false,
    orderedList: false,
    listItem: false,
  }),
  Bold,
  Italic,
  Underline,
  Heading.extend({
    levels: [1, 2, 3],
    renderHTML({ node, HTMLAttributes }) {
      const level = this.options.levels.includes(node.attrs.level)
        ? node.attrs.level
        : this.options.levels[0];
      const classes = {
        1: "heading-level-1",
        2: "heading-level-2",
        3: "heading-level-3",
      };
      return [
        `h${level}`,
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          class: `${classes[level]}`,
        }),
        0,
      ];
    },
  }).configure({ levels: [1, 2, 3] }),
  Image.configure({
    HTMLAttributes: { class: "image-limit" },
    inline: true,
    allowBase64: true,
  }),
  Youtube.configure({ HTMLAttributes: { class: "youtube-limit" }, inline: true }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Link.configure({ HTMLAttributes: { class: "link-class" } }),
  BulletList.configure({ HTMLAttributes: { class: "bullet-list" } }),
  OrderedList.configure({ HTMLAttributes: { class: "ordered-list" } }),
  ListItem,
];

const Editor = ({ content, setContent, fullScreen, toggleFullScreen }) => {
  const imageInputRef = useRef(null);

  const editor = useEditor({
    extensions: editorExtensions,
    content: content || `<p>What's on your mind?</p>`,
    onUpdate: ({ editor }) => {
      setContent(editor.getJSON());
    },
  });

  if (!editor) {
    return null;
  }

  const addImage = () => {
    imageInputRef.current.click();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        editor.chain().focus().setImage({ src: e.target.result }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  const addLink = () => {
    const url = prompt("Enter the URL");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const addYoutubeVideo = () => {
    const url = prompt("Enter the Youtube URL");
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && event.shiftKey) {
      return;
    } else if (event.key === "Enter") {
      event.preventDefault();
      editor.chain().focus().insertContent("<br /><p></p>").run();
    } else if (event.key === "Backspace") {
      const { state } = editor;
      const { from, to } = state.selection;
      const text = state.doc.textBetween(from - 1, to, " ");

      if (text === "\n") {
        editor
          .chain()
          .focus()
          .deleteRange({ from: from - 1, to })
          .run();
      }
    }
  };

  return (
    <div
      className={`border border-red-500/20 shadow-md shadow-red-800/50 focus:shadow-red-600 focus:outline-none rounded-md p-5 my-20 w-3/4 flex flex-col items-center`}>
      <div className="w-full flex flex-col items-center">
        <div className="w-full flex justify-around py-10 border-b border-red-500/20">
          <button title="Bold" onClick={() => editor.chain().focus().toggleBold().run()}>
            <FaBold />
          </button>
          <button title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()}>
            <FaItalic />
          </button>
          <button title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <FaUnderline />
          </button>
          <button
            title="Heading 1"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            <TbH1 />
          </button>
          <button
            title="Heading 2"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            <TbH2 />
          </button>
          <button
            title="Heading 3"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            <TbH3 />
          </button>
          <button
            title="Align left"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}>
            <FaAlignLeft />
          </button>
          <button
            title="Align center"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}>
            <FaAlignCenter />
          </button>
          <button
            title="Align right"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}>
            <FaAlignRight />
          </button>
        </div>
        <div className="w-full flex justify-around py-10 border-b border-red-500/20">
          <button
            title="Bullet list"
            onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <FaListUl />
          </button>
          <button
            title="Ordered list"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <FaListOl />
          </button>
          <button title="Add link" onClick={addLink}>
            <FaLink />
          </button>
          <button title="Remove link" onClick={removeLink}>
            <FaUnlink />
          </button>
          <button title="Add image" onClick={addImage}>
            <FaFileImage />
          </button>
          <button title="Add video" onClick={addYoutubeVideo}>
            <FaYoutube />
          </button>
          <button
            title={fullScreen ? "Exit Full Screen" : "Full Screen"}
            onClick={toggleFullScreen}>
            {fullScreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>

      <input
        type="file"
        name="image"
        id="image"
        ref={imageInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      <EditorContent editor={editor} className="resizable-editor" onKeyDown={handleKeyDown} />
    </div>
  );
};

export default Editor;
