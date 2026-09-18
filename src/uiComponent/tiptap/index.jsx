import React, { useEffect } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import {
    MenuButtonBold,
    MenuButtonItalic,
    MenuButtonUnderline,
    MenuButtonStrikethrough,
    MenuButtonTextColor,
    MenuButtonHighlightColor,
    MenuSelectTextAlign,
    MenuButtonBulletedList, // Assuming this is the correct export name
    MenuButtonOrderedList,  // Assuming this is the correct export name
    MenuButtonUndo,
    MenuButtonRedo,
    MenuControlsContainer,
    MenuDivider,
    MenuSelectHeading,
    RichTextEditorProvider,
    RichTextField,
} from "mui-tiptap";

import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
// For lists, StarterKit usually includes BulletList, OrderedList, and ListItem.
// If you've customized StarterKit to exclude them, you'd import them here:
// import BulletList from '@tiptap/extension-bullet-list';
// import OrderedList from '@tiptap/extension-ordered-list';
// import ListItem from '@tiptap/extension-list-item';

export default function TiptapEditorField({
    label = "Description",
    initialContent = "",
    onContentChange, // (html: string) => void
    minEditorHeight = '120px'
}) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4] },
                // Ensure StarterKit includes list functionality for MenuButtonBulletedList & MenuButtonOrderedList
                // By default it does. If not, add BulletList, OrderedList, ListItem extensions here.
            }),
            Underline,
            TextStyle, // Required for Color extension
            Color,    // For text color
            Highlight.configure({ multicolor: true }), // For background color
            TextAlign.configure({ types: ['heading', 'paragraph'] }), // For text alignment
        ],
        content: initialContent,
        onUpdate: ({ editor: updatedEditor }) => {
            if (onContentChange) {
                onContentChange(updatedEditor.getHTML());
            }
        },
    });

    // Effect to update editor content if initialContent prop changes from outside
    useEffect(() => {
        if (editor && !editor.isDestroyed && initialContent !== editor.getHTML()) {
            editor.commands.setContent(initialContent, false); // false to not emit update event
        }
    }, [initialContent, editor]);

    // Ensure editor is destroyed on component unmount
    useEffect(() => {
        return () => {
            if (editor && !editor.isDestroyed) {
                editor.destroy();
            }
        };
    }, [editor]);

    if (!editor) {
        return null; // Or a loading indicator
    }

    return (
        <Box>
            {label && <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 0.5 }}>{label}:</Typography>}
            <Box
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflow: 'hidden',
                    '& .ProseMirror-focused': {
                        outline: 'none',
                    }
                }}
            >
                <RichTextEditorProvider editor={editor}>
                    <RichTextField
                        sx={{
                            '& .MuiInputBase-root': { padding: 0, border: 'none' },
                            '.ProseMirror': {
                                minHeight: minEditorHeight,
                                padding: theme => theme.spacing(1, 1.5),
                                outline: 'none',
                                flexGrow: 1,
                            }
                        }}
                        controls={(
                            <MenuControlsContainer sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 0.5, py: 0.5, flexWrap: 'wrap' }}>
                                <MenuSelectHeading />
                                <MenuDivider orientation="vertical" flexItem sx={{ mx: 0.5, my: 'auto', height: '20px' }} />
                                <MenuButtonBold />
                                <MenuButtonItalic />
                                <MenuButtonUnderline />
                                <MenuButtonStrikethrough />
                                <MenuDivider orientation="vertical" flexItem sx={{ mx: 0.5, my: 'auto', height: '20px' }} />
                                <MenuButtonTextColor />
                                <MenuButtonHighlightColor />
                                <MenuDivider orientation="vertical" flexItem sx={{ mx: 0.5, my: 'auto', height: '20px' }} />
                                <MenuSelectTextAlign />
                                <MenuDivider orientation="vertical" flexItem sx={{ mx: 0.5, my: 'auto', height: '20px' }} />
                                <MenuButtonBulletedList />
                                <MenuButtonOrderedList />
                                <MenuDivider orientation="vertical" flexItem sx={{ mx: 0.5, my: 'auto', height: '20px' }} />
                                <MenuButtonUndo />
                                <MenuButtonRedo />
                            </MenuControlsContainer>
                        )}
                    />
                </RichTextEditorProvider>
            </Box>
        </Box>
    );
}