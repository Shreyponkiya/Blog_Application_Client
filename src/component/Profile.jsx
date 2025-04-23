import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const Profile = () => {
  const Backend_URL = import.meta.env.VITE_BACKEND_URL ; // Added quotes around the URL
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [expandedBlogs, setExpandedBlogs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [blogComments, setBlogComments] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const navigate = useNavigate();
  const Dtoken = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const decodedToken = jwtDecode(token);
        const response = await axios.get(`${Backend_URL}/user/getAllUser`);

        const foundUser = response.data.users.find(
          (u) => u._id === decodedToken._id
        );
        if (foundUser) setUser(foundUser);
        setAllUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

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

    fetchUser();
    fetchAllComments();
  }, [navigate, Backend_URL, Dtoken]);

  useEffect(() => {
    const getBlog = async () => {
      setLoadingBlogs(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decodedToken = jwtDecode(token);
        const response = await axios.get(`${Backend_URL}/blog/allBlog`);
        const userBlogs = response.data.filter(
          (blog) => blog.createdBy._id === decodedToken._id
        );
        
        // If user is logged in, check which blogs they've liked
        if (decodedToken) {
          try {
            const userResponse = await axios.get(
              `${Backend_URL}/user/profile/${decodedToken._id}`
            );
            const userInfo = userResponse.data.user;

            if (userInfo && userInfo.likeBlogId) {
              // Create a set of liked blog IDs for efficient lookup
              const likedBlogIds = new Set(userInfo.likeBlogId);

              // Update each blog with the user's like status
              userBlogs.forEach((blog) => {
                blog.isLikedByCurrentUser = likedBlogIds.has(blog._id);
              });
            }
          } catch (err) {
            console.error("Error fetching user like status:", err);
          }
        }
        
        setBlogs(userBlogs);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoadingBlogs(false);
      }
    };

    getBlog();
  }, [Backend_URL]);

  const handleEditClick = (blog) => {
    setSelectedBlog(blog);
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setSelectedBlog({ ...selectedBlog, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async () => {
    setLoadingAction(true);
    try {
      await axios.put(
        `${Backend_URL}/blog/updateBlog/${selectedBlog._id}`,
        selectedBlog
      );

      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog._id === selectedBlog._id ? selectedBlog : blog
        )
      );

      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating blog:", error);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

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
      
    } catch (err) {
      console.error("Error liking/unliking blog:", err);
      // If error, refetch blogs
      const getBlog = async () => {
        // Reimplement blog fetching logic here
      };
      getBlog();
    }
  };

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

      // Refresh all comments
      const fetchAllComments = async () => {
        try {
          const response = await axios.get(`${Backend_URL}/blog/comments`);
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
      fetchAllComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDelete = async (blogId) => {
    setLoadingAction(true);
    try {
      await axios.delete(`${Backend_URL}/blog/deleteBlog/${blogId}`);
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== blogId));
    } catch (error) {
      console.error("Error deleting blog:", error);
    } finally {
      setLoadingAction(false);
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-1/2 text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>

        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          </div>
        ) : user ? (
          <div className="flex flex-col items-center mb-10">
            <img
              src={user.profileImage}
              alt="Profile"
              className="w-32 h-32 rounded-full border-2 border-gray-300"
            />
            <h1 className="text-gray-900 text-3xl font-bold mt-4">
              {user.fullname}
            </h1>
            <p className="text-gray-600 text-xl">{user.email}</p>
          </div>
        ) : (
          <p className="text-red-500">User not found.</p>
        )}

        <div className="flex justify-end mb-6">
          <button
            className="bg-red-500 text-white rounded-xl py-2 px-6 text-lg hover:bg-red-600 transition"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <hr className="mb-8" />
        <h1 className="text-4xl font-bold mb-8 text-center">Your Blogs</h1>

        {loadingBlogs ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          </div>
        ) : blogs.length > 0 ? (
          blogs.map((blog) => {
            const isExpanded = expandedBlogs[blog._id];
            const showComments = expandedComments[blog._id];
            const blogCommentsList = blogComments[blog._id] || [];

            return (
              <div key={blog._id} className="mb-8 p-6 border-b border-gray-300">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={user?.profileImage}
                    alt={user?.fullname}
                    className="w-14 h-14 rounded-full border border-gray-300"
                  />
                  <h2 className="text-xl font-semibold">
                    {user?.fullname}
                  </h2>
                  <p className="text-gray-500 text-lg">
                    • {timeAgo(blog.createdAt)}
                  </p>
                </div>

                <img
                  src={blog.coverImageURL}
                  alt={blog.title}
                  className="w-full h-60 object-cover rounded-lg mb-4"
                />
                <h2 className="text-2xl font-bold my-5">{blog.title}</h2>

                <p className="text-gray-600 text-left">
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
                            className="bg-gray-100 p-3 rounded my-2 text-left"
                          >
                            <div className="flex items-center">
                              {commentUser.profileImage && (
                                <img
                                  src={commentUser.profileImage}
                                  alt={commentUser.fullname || "User"}
                                  className="w-10 h-10 rounded-full"
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

                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        className="border px-4 py-2 w-full rounded-lg"
                        value={commentInputs[blog._id] || ""}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [blog._id]: e.target.value,
                          }))
                        }
                      />
                      <button
                        className="bg-blue-500 text-white px-4 py-2 mt-2 rounded-lg hover:bg-blue-600 transition"
                        onClick={() => handleCommentSubmit(blog._id)}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-4 mt-5">
                  <button
                    className="text-white bg-blue-600 h-10 w-28 rounded-2xl hover:bg-blue-700 transition"
                    onClick={() => handleEditClick(blog)}
                    disabled={loadingAction}
                  >
                    {loadingAction ? "Processing..." : "Edit Blog"}
                  </button>
                  <button
                    className="text-white bg-red-600 h-10 w-28 rounded-2xl hover:bg-red-700 transition"
                    onClick={() => handleDelete(blog._id)}
                    disabled={loadingAction}
                  >
                    {loadingAction ? "Deleting..." : "Delete Blog"}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-center text-xl py-8">You haven't created any blogs yet.</p>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedBlog && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Edit Blog</h2>
            <div className="mb-4">
              <label
                htmlFor="title"
                className="block text-xl font-semibold mb-2"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={selectedBlog.title}
                onChange={handleEditChange}
                className="border px-3 py-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="body"
                className="block text-xl font-semibold mb-2"
              >
                Body
              </label>
              <textarea
                id="body"
                name="body"
                value={selectedBlog.body}
                onChange={handleEditChange}
                className="border px-3 py-2 w-full h-40 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-between mt-6">
              <button
                className="bg-gray-500 text-white py-2 px-6 rounded hover:bg-gray-600 transition"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition"
                onClick={handleEditSubmit}
                disabled={loadingAction}
              >
                {loadingAction ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;