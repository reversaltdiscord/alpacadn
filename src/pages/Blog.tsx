import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllBlogPosts, getAllTags } from '../integrations/supabase/blog';
import BlogPostCard from '../components/BlogPostCard';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function Blog() {
  const { user, loading: authLoading } = useAuth();

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: tags, isLoading: tagsLoading, error: tagsError } = useQuery({
    queryKey: ['allTags'],
    queryFn: getAllTags,
  });

  const { data: blogPosts, isLoading: postsLoading, error: postsError } = useQuery({
    queryKey: ['blogPosts', selectedTags],
    queryFn: () => getAllBlogPosts(selectedTags),
  });

  const isLoading = postsLoading || authLoading || tagsLoading;
  const error = postsError || tagsError;

  const handleTagClick = (tagName: string) => {
    setSelectedTags(prevSelectedTags => {
      if (prevSelectedTags.includes(tagName)) {
        return prevSelectedTags.filter(tag => tag !== tagName);
      } else {
        return [...prevSelectedTags, tagName];
      }
    });
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading data: {error.message}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        {user && (
          <Link to="/blog/new">
            <Button>Create New Post</Button>
          </Link>
        )}
      </div>
      
      {tags && tags.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Filter by Tags</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Badge
                key={tag.id}
                variant={selectedTags.includes(tag.name) ? 'default' : 'secondary'}
                className="cursor-pointer hover:opacity-80"
                onClick={() => handleTagClick(tag.name)}
              >
                {tag.name}
              </Badge>
            ))}
            {selectedTags.length > 0 && (
               <Button variant="outline" size="sm" onClick={handleClearFilters} className="ml-2">Clear Filters</Button>
            )}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts && blogPosts.length > 0 ? (
          blogPosts.map(post => (
            <BlogPostCard key={post.id} post={post} />
          ))
        ) : (selectedTags.length > 0 ? (
           <div>No blog posts found matching the selected tags.</div>
         ) : (
           <div>No blog posts found.</div>
         )
        )}
      </div>
    </div>
  );
}

export default Blog; 