// Comments Service for event comments

class CommentsService {
  constructor() {
    this.storageKey = 'beach_club_comments';
  }

  // Get comments for an event
  getEventComments(eventId) {
    try {
      const comments = localStorage.getItem(this.storageKey);
      if (comments) {
        const commentsData = JSON.parse(comments);
        return commentsData[eventId] || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting event comments:', error);
      return [];
    }
  }

  // Add a comment to an event
  addComment(eventId, userId, userName, comment) {
    try {
      const comments = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      
      if (!comments[eventId]) {
        comments[eventId] = [];
      }
      
      const newComment = {
        id: Date.now().toString(),
        userId,
        userName,
        comment,
        timestamp: new Date().toISOString()
      };
      
      comments[eventId].push(newComment);
      localStorage.setItem(this.storageKey, JSON.stringify(comments));
      
      return {
        success: true,
        comment: newComment
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete a comment
  deleteComment(eventId, commentId, userId) {
    try {
      const comments = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      
      if (comments[eventId]) {
        // Only allow user to delete their own comments
        comments[eventId] = comments[eventId].filter(
          comment => !(comment.id === commentId && comment.userId === userId)
        );
        
        localStorage.setItem(this.storageKey, JSON.stringify(comments));
        return { success: true };
      }
      
      return { success: false, error: 'Comment not found' };
    } catch (error) {
      console.error('Error deleting comment:', error);
      return { success: false, error: error.message };
    }
  }

  // Get comment count for event
  getCommentCount(eventId) {
    const comments = this.getEventComments(eventId);
    return comments.length;
  }
}

// Export singleton instance
export const commentsService = new CommentsService();
export default commentsService;