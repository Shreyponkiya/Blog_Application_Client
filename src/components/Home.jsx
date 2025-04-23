import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
const Home = () => {
  const Backend_URL = import.meta.env.VITE_BACKEND_URL ; // Added quotes around the URL
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBlogs, setExpandedBlogs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [blogComments, setBlogComments] = useState({});
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser(jwtDecode(token));
    }

    fetchBlogs();
    fetchAllComments();
    fetchAllUsers();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
    }
    
    fetchAllComments();
    fetchAllUsers();
  }, []);
  
  // Add this separate effect
  useEffect(() => {
    if (user) {
      fetchBlogs();
    }
  }, [user]);
  
  // Ensure blogs are loaded even if no user is logged in
  useEffect(() => {
    if (!user) {
      fetchBlogs();
    }
  }, []);
  const fetchAllComments = async () => {
    try {
      const response = await axios.get(`${Backend_URL}/blog/comments`);

      // Organize comments by blog ID for easier access
      const commentsByBlog = {};
      response.data.forEach((comment) => {
        if (!commentsByBlog[comment.blogId]) {
          commentsByBlog[comment.blogId] = [];
        }
        commentsByBlog[comment.blogId].push(comment);
      });

      setBlogComments(commentsByBlog);
    } catch (error) {
      console.error("Error fetching all comments:", error);
    }
  };

  // Fetch comments for a specific blog
  const fetchCommentsForBlog = async (blogId) => {
    try {
      const response = await axios.get(`${Backend_URL}/blog/comments/${blogId}`);
      setBlogComments((prev) => ({
        ...prev,
        [blogId]: response.data,
      }));
    } catch (error) {
      console.error(`Error fetching comments for blog ${blogId}:`, error);
    }
  };

  // Fetch all users
  const fetchAllUsers = async () => {
    try {
      const response = await axios.get(`${Backend_URL}/user/getAllUser`);
      setAllUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Format timestamp to relative time
  const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Toggle read more/less for blog content
  const toggleReadMore = (blogId) => {
    setExpandedBlogs((prev) => ({ ...prev, [blogId]: !prev[blogId] }));
  };

  // Toggle comment section visibility and fetch comments if needed
  const toggleComments = async (blogId) => {
    const isCurrentlyExpanded = expandedComments[blogId];

    setExpandedComments((prev) => ({
      ...prev,
      [blogId]: !isCurrentlyExpanded,
    }));

    if (
      !isCurrentlyExpanded &&
      (!blogComments[blogId] || blogComments[blogId].length === 0)
    ) {
      await fetchCommentsForBlog(blogId);
    }
  };

  // Handle like/unlike functionality

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);

      // After fetching blogs, check which ones the user has liked
      if (decodedUser) {
        fetchUserLikedBlogs(decodedUser._id);
      }
    }

    fetchBlogs();
    fetchAllComments();
    fetchAllUsers();
  }, []);

  const fetchUserLikedBlogs = async (userId) => {
    try {
      const userResponse = await axios.get(`${Backend_URL}/user/profile/${userId}`);
      const userAllInfo = userResponse.data.user;

      if (userAllInfo && userAllInfo.likeBlogId) {
        // Update blogs with like status
        setBlogs((prevBlogs) =>
          prevBlogs.map((blog) => ({
            ...blog,
            isLikedByCurrentUser: userAllInfo.likeBlogId.includes(blog._id),
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching user liked blogs:", error);
    }
  };

  const handleLike = async (blogId) => {
    if (!user) return navigate("/login");
  
    try {
      const userID = user._id;
      
      // Find the current blog
      const blogIndex = blogs.findIndex(blog => blog._id === blogId);
      if (blogIndex === -1) return;
      
      // Get the current liked status
      const isCurrentlyLiked = blogs[blogIndex].isLikedByCurrentUser;
      
      // Create a copy of the blogs array
      const updatedBlogs = [...blogs];
      
      // Toggle the liked status
      updatedBlogs[blogIndex] = {
        ...updatedBlogs[blogIndex],
        isLikedByCurrentUser: !isCurrentlyLiked,
        likes: isCurrentlyLiked 
          ? Math.max(0, (updatedBlogs[blogIndex].likes || 0) - 1) 
          : (updatedBlogs[blogIndex].likes || 0) + 1
      };
      
      // Update state immediately for better UX
      setBlogs(updatedBlogs);
      
      // Send request to server
      await axios.post(`${Backend_URL}/blog/like`, {
        userId: userID,
        blogId: blogId,
      });
      
      // No need to refetch if successful
    } catch (err) {
      console.error("Error liking/unliking blog:", err);
      // If error, refetch to restore correct state
      fetchBlogs();
    }
  };
  // Handle comment submission
  const handleCommentSubmit = async (blogId) => {
    if (!user) return navigate("/login");

    const commentContent = commentInputs[blogId]?.trim();
    if (!commentContent) return;

    try {
      const response = await axios.post(`${Backend_URL}/blog/comment/${blogId}`, {
        userId: user._id,
        content: commentContent,
      });

      // Clear the input field
      setCommentInputs((prev) => ({ ...prev, [blogId]: "" }));

      // Update the comments state with the new comment
      const newComment = response.data;
      setBlogComments((prev) => {
        const updatedComments = prev[blogId]
          ? [...prev[blogId], newComment]
          : [newComment];
        return {
          ...prev,
          [blogId]: updatedComments,
        };
      });

      // Refresh all comments to ensure we have the latest data
      fetchAllComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Modify your fetchBlogs function in Home.js
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${Backend_URL}/blog/allBlog`);
      const sortedBlogs = response.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // If user is logged in, check which blogs they've liked
      if (user) {
        try {
          const userResponse = await axios.get(
            `${Backend_URL}/user/profile/${user._id}`
          );
          const userInfo = userResponse.data.user;

          if (userInfo && userInfo.likeBlogId) {
            // Create a set of liked blog IDs for efficient lookup
            const likedBlogIds = new Set(userInfo.likeBlogId);

            // Update each blog with the user's like status
            sortedBlogs.forEach((blog) => {
              blog.isLikedByCurrentUser = likedBlogIds.has(blog._id);
            });
          }
        } catch (err) {
          console.error("Error fetching user like status:", err);
        }
      }

      setBlogs(sortedBlogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get user info by ID
  const getUserInfo = (userId) => {
    return allUsers.find((user) => user._id === userId) || {};
  };

  // Count comments for a blog
  const getCommentCount = (blogId) => {
    return blogComments[blogId]?.length || 0;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-1/2 bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Welcome to BLoGify
        </h1>

        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          </div>
        ) : blogs.length === 0 ? (
          <p className="text-center text-gray-500">No blogs available</p>
        ) : (
          blogs.map((blog) => {
            const isExpanded = expandedBlogs[blog._id];
            const showComments = expandedComments[blog._id];
            const blogCommentsList = blogComments[blog._id] || [];

            return (
              <div key={blog._id} className="mb-8 p-6 border-b border-gray-300">
                {blog.createdBy && (
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={blog.createdBy.profileImage}
                      alt={blog.createdBy.fullname}
                      className="w-14 h-14 rounded-full border border-gray-300"
                    />
                    <h2 className="text-xl font-semibold">
                      {blog.createdBy.fullname}
                    </h2>
                    <p className="text-gray-500 text-lg">
                      • {timeAgo(blog.createdAt)}
                    </p>
                  </div>
                )}
                <img
                  src={blog.coverImageURL}
                  alt={blog.title}
                  className="w-full h-60 object-cover rounded-lg mb-4"
                />
                <h2 className="text-2xl font-bold my-5">{blog.title}</h2>

                <p className="text-gray-600">
                  {isExpanded ? blog.body : blog.body.slice(0, 200) + "..."}
                </p>

                <div className="flex justify-end mt-4">
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => toggleReadMore(blog._id)}
                  >
                    {isExpanded ? "Read Less" : "Read More"}
                  </button>
                </div>

                <div className="flex justify-between items-center mt-4">
                  {/* In your JSX, replace the like button rendering with: */}
                  <button
                    className="text-gray-600 hover:text-blue-500"
                    onClick={() => handleLike(blog._id)}
                  >
                    {blog.isLikedByCurrentUser ? (
                      <span>❤️ {blog.likes || 0} likes</span>
                    ) : (
                      <span>🤍 {blog.likes || 0} likes</span>
                    )}
                  </button>
                  <button
                    className="text-gray-600 hover:text-blue-500"
                    onClick={() => toggleComments(blog._id)}
                  >
                    💬 {getCommentCount(blog._id)} Comments
                  </button>
                </div>

                {showComments && (
                  <div className="mt-4">
                    {blogCommentsList.length > 0 ? (
                      blogCommentsList.map((comment) => {
                        const commentUser = getUserInfo(comment.createdBy);
                        return (
                          <div
                            key={comment._id}
                            className="bg-gray-100 p-2 rounded my-2"
                          >
                            <div className="flex items-center">
                              {commentUser.profileImage && (
                                <img
                                  src={commentUser.profileImage}
                                  alt={commentUser.fullname || "User"}
                                  className="w-12 h-12 rounded-full"
                                />
                              )}
                              <h1 className="font-semibold text-lg ml-2">
                                {commentUser.fullname || "Anonymous User"}
                              </h1>
                            </div>
                            <p className="text-gray-700 text-lg my-3 ml-4 font-sans capitalize">
                              {comment.content}
                            </p>
                            <small className="text-gray-500">
                              {timeAgo(comment.createdAt)}
                            </small>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-center py-2">
                        No comments yet. Be the first to comment!
                      </p>
                    )}

                    <input
                      type="text"
                      placeholder="Write a comment..."
                      className="border px-4 py-2 w-full mt-3 rounded-lg"
                      value={commentInputs[blog._id] || ""}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [blog._id]: e.target.value,
                        }))
                      }
                    />
                    <button
                      className="bg-blue-500 text-white px-4 py-2 mt-2 rounded-lg"
                      onClick={() => handleCommentSubmit(blog._id)}
                    >
                      Submit
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Home;
