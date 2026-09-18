// src/views/shared/TaskDetailModal/CommentsSection.js
import React, { useState } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { formatDistanceToNow } from 'date-fns';

export default function CommentsSection({ comments = [], onAddComment }) {
    const [newComment, setNewComment] = useState('');

    const handleAddComment = () => {
        if (newComment.trim()) {
            // In a real app, you'd get current user details
            const commentData = {
                userId: 'currentUser', // Replace with actual user ID
                userName: 'Current User', // Replace with actual user name
                avatarUrl: 'https://i.pravatar.cc/150?img=7', // Replace
                text: newComment.trim(),
            };
            onAddComment(commentData);
            setNewComment('');
        }
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Comments</Typography>
            <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                    fullWidth
                    multiline
                    rows={2}
                    variant="outlined"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    size="small"
                />
                <Button
                    variant="contained"
                    onClick={handleAddComment}
                    sx={{ ml: 1, height: 'fit-content', mt: 'auto', mb:'auto', py:1.5 }} // Align button with multiline textfield
                    disabled={!newComment.trim()}
                    startIcon={<SendIcon />}
                >
                    Post
                </Button>
            </Box>
            <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                {comments.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center', py: 2}}>
                        No comments yet.
                    </Typography>
                )}
                {comments.slice().reverse().map((comment, index) => ( // Show newest first
                    <React.Fragment key={comment.id || index}>
                        <ListItem alignItems="flex-start" sx={{px:0}}>
                            <ListItemAvatar sx={{mt:0.5}}>
                                <Avatar alt={comment.userName} src={comment.avatarUrl} sx={{width: 32, height: 32}} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Typography variant="subtitle2" component="span" fontWeight="600">
                                        {comment.userName}
                                    </Typography>
                                }
                                secondary={
                                    <>
                                        <Typography component="span" variant="body2" color="text.primary" sx={{display:'block', whiteSpace: 'pre-wrap'}}>
                                            {comment.text}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                                        </Typography>
                                    </>
                                }
                            />
                        </ListItem>
                        {index < comments.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
}